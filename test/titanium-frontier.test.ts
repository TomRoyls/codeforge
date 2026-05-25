import { describe, it, expect } from 'vitest'
import {
  measureForging,
  measureExploring,
  measureShielding,
  measureOptimizing,
  measureNavigating,
  classifyCondition,
  classifyModuleType,
  classifyModuleCondition,
  classifyCommanderGrade,
  analyzeTitaniumPanel,
  analyzeTitaniumModule,
  buildTitaniumFrontierResult,
  generateRecommendations,
} from '../src/commands/titanium-frontier-helpers.js'
import {
  colorScore,
  colorCondition,
  colorModuleCondition,
  formatPanelTable,
  formatPanelsTable,
  formatModuleTable,
  formatModulesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/titanium-frontier-format-helpers.js'

// ─── Test Fixtures ──────────────────────────────────────────────────

const minimalContent = 'const x = 1'

const richContent = `import { readFileSync } from 'node:fs'
import type { Result } from './types.js'

/** Documentation */
export interface Config {
  readonly name: string
  private?: boolean
}

export type Options = Record<string, unknown>

export class Analyzer<T> {
  async analyze(input: string): Promise<Result> {
    try {
      const result = readFileSync(input, 'utf8')
      if (result === 'test') {
        return JSON.parse(result) as Result
      }
      return {} as Result
    } catch (err) {
      throw new Error('fail')
    }
  }
}

export const defaultConfig: Options = { name: 'test' }
`

// ─── measureForging ──────────────────────────────────────────

describe('measureForging', () => {
  it('returns 0 for empty content', () => {
    const m = measureForging('')
    expect(m.strength).toBe(0)
    expect(m.alloy).toBe('no-strength')
    expect(m.hasHighStrength).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureForging(richContent)
    expect(m.strength).toBe(100)
    expect(m.alloy).toBe('titanium-carbide')
    expect(m.hasHighStrength).toBe(true)
    expect(m.hasWellStructured).toBe(true)
    expect(m.hasModular).toBe(true)
    expect(m.hasCleanPipelines).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasDefensive).toBe(true)
    expect(m.hasResilient).toBe(true)
    expect(m.hasEnduring).toBe(true)
  })

  it('detects chaotic patterns', () => {
    const m = measureForging('// chaotic mess tangle')
    expect(m.chaoticCount).toBe(3)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects monolithic patterns', () => {
    const m = measureForging('// monolithic giant massive')
    expect(m.hasNoMonolithic).toBe(false)
  })

  it('detects tangled patterns', () => {
    const m = measureForging('// tangled spaghetti woven')
    expect(m.tangledCount).toBe(3)
    expect(m.hasNoTangled).toBe(false)
  })

  it('detects fragile var usage', () => {
    const m = measureForging('var x = 1')
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects bare crash eval usage', () => {
    const m = measureForging('eval("code")')
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('detects naive patterns', () => {
    const m = measureForging('// trust assume hope')
    expect(m.hasNoNaive).toBe(false)
  })

  it('detects untested var usage', () => {
    const m = measureForging('var x = 1')
    expect(m.hasNoUntested).toBe(false)
  })
})

// ─── measureExploring ──────────────────────────────────────────

describe('measureExploring', () => {
  it('returns 0 for empty content', () => {
    const m = measureExploring('')
    expect(m.vision).toBe(0)
    expect(m.frontier).toBe('no-vision')
    expect(m.hasHighVision).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureExploring(richContent)
    expect(m.vision).toBe(100)
    expect(m.frontier).toBe('deep-space')
    expect(m.hasHighVision).toBe(true)
    expect(m.hasExtensible).toBe(true)
    expect(m.hasFutureProof).toBe(true)
    expect(m.hasInnovative).toBe(true)
    expect(m.hasScalable).toBe(true)
    expect(m.hasAdaptive).toBe(true)
    expect(m.hasAbstracted).toBe(true)
    expect(m.hasVisionary).toBe(true)
    expect(m.hasExploratory).toBe(true)
  })

  it('detects rigid patterns', () => {
    const m = measureExploring('// rigid inflexible hardcoded')
    expect(m.rigidCount).toBe(3)
    expect(m.hasNoRigid).toBe(false)
  })

  it('detects legacy patterns', () => {
    const m = measureExploring('// legacy deprecated obsolete')
    expect(m.hasNoLegacy).toBe(false)
  })

  it('detects stagnant patterns', () => {
    const m = measureExploring('// stagnant stale outdated')
    expect(m.hasNoStagnant).toBe(false)
  })

  it('detects bottlenecked patterns', () => {
    const m = measureExploring('// bottleneck block stall')
    expect(m.hasNoBottlenecked).toBe(false)
  })

  it('detects static patterns', () => {
    const m = measureExploring('// static fixed unchanging')
    expect(m.hasNoStatic).toBe(false)
  })

  it('detects hardcoded patterns', () => {
    const m = measureExploring('// hardcoded magic.number literal')
    expect(m.hardcodedCount).toBe(3)
    expect(m.hasNoHardcoded).toBe(false)
  })

  it('detects short-sighted patterns', () => {
    const m = measureExploring('// shortsighted myopic narrow')
    expect(m.hasNoShortSighted).toBe(false)
  })
})

// ─── measureShielding ──────────────────────────────────────────

describe('measureShielding', () => {
  it('returns a score for empty content', () => {
    const m = measureShielding('')
    expect(m.resistance).toBeGreaterThanOrEqual(0)
    expect(typeof m.shield).toBe('string')
    expect(m.hasHighResistance).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureShielding(richContent)
    expect(m.resistance).toBe(100)
    expect(m.shield).toBe('titanium-oxide')
    expect(m.hasHighResistance).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasNoUnsafe).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasNoUntested).toBe(true)
    expect(m.hasMaintained).toBe(true)
    expect(m.hasNoAbandoned).toBe(true)
    expect(m.hasStable).toBe(true)
    expect(m.hasNoVolatile).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasNoExperimental).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasEnduring).toBe(true)
  })

  it('detects unsafe any usage', () => {
    const m = measureShielding('const x: any = 1')
    expect(m.unsafeCount).toBe(1)
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('detects untested var usage', () => {
    const m = measureShielding('var x = 1')
    expect(m.untestedCount).toBe(1)
    expect(m.hasNoUntested).toBe(false)
  })

  it('detects abandoned patterns', () => {
    const m = measureShielding('// abandoned forgotten neglected')
    expect(m.hasNoAbandoned).toBe(false)
  })

  it('detects volatile patterns', () => {
    const m = measureShielding('// volatile unstable changing')
    expect(m.hasNoVolatile).toBe(false)
  })

  it('detects experimental patterns', () => {
    const m = measureShielding('// experimental beta alpha')
    expect(m.hasNoExperimental).toBe(false)
  })

  it('detects naive patterns', () => {
    const m = measureShielding('// naive simple basic')
    expect(m.hasNoNaive).toBe(false)
  })

  it('detects dirty ts-ignore', () => {
    const m = measureShielding('// @ts-ignore')
    expect(m.hasClean).toBe(false)
  })

  it('detects dirty ts-expect-error', () => {
    const m = measureShielding('// @ts-expect-error')
    expect(m.hasClean).toBe(false)
  })

  it('detects dirty patterns', () => {
    const m = measureShielding('// dirty hack workaround')
    expect(m.hasNoDirty).toBe(false)
  })
})

// ─── measureOptimizing ──────────────────────────────────────────

describe('measureOptimizing', () => {
  it('returns a score for empty content', () => {
    const m = measureOptimizing('')
    expect(m.efficiency).toBeGreaterThanOrEqual(0)
    expect(typeof m.ratio).toBe('string')
    expect(m.hasHighEfficiency).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureOptimizing(richContent)
    expect(m.efficiency).toBe(100)
    expect(m.ratio).toBe('perfect-ratio')
    expect(m.hasHighEfficiency).toBe(true)
    expect(m.hasEfficient).toBe(true)
    expect(m.hasStreamlined).toBe(true)
    expect(m.hasDirect).toBe(true)
    expect(m.hasOptimized).toBe(true)
    expect(m.hasConcurrent).toBe(true)
    expect(m.hasMinimal).toBe(true)
    expect(m.hasFocused).toBe(true)
    expect(m.hasLean).toBe(true)
  })

  it('detects wasteful patterns', () => {
    const m = measureOptimizing('// wasteful bloated inefficient')
    expect(m.wastefulCount).toBe(3)
    expect(m.hasNoWasteful).toBe(false)
  })

  it('detects bloat patterns', () => {
    const m = measureOptimizing('// bloated overweight heavy')
    expect(m.hasNoBloat).toBe(false)
  })

  it('detects circuit patterns', () => {
    const m = measureOptimizing('// circuit spaghetti tangle')
    expect(m.hasNoCircuits).toBe(false)
  })

  it('detects naive patterns', () => {
    const m = measureOptimizing('// naive brute force')
    expect(m.hasNoNaive).toBe(false)
  })

  it('detects sequential patterns', () => {
    const m = measureOptimizing('// sequential blocking sync')
    expect(m.hasNoSequential).toBe(false)
  })

  it('detects redundant patterns', () => {
    const m = measureOptimizing('// redundant duplicate repeat')
    expect(m.redundantCount).toBe(3)
    expect(m.hasNoRedundant).toBe(false)
  })

  it('detects scattered patterns', () => {
    const m = measureOptimizing('// scattered fragmented dispersed')
    expect(m.hasNoScattered).toBe(false)
  })

  it('detects non-minimal ts-ignore', () => {
    const m = measureOptimizing('// @ts-ignore')
    expect(m.hasMinimal).toBe(false)
  })
})

// ─── measureNavigating ──────────────────────────────────────────

describe('measureNavigating', () => {
  it('returns 0 for empty content', () => {
    const m = measureNavigating('')
    expect(m.wisdom).toBe(0)
    expect(m.cosmos).toBe('no-wisdom')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureNavigating(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.cosmos).toBe('deep-space-sage')
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasWellArchitected).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasDeep).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasPatterned).toBe(true)
    expect(m.hasStrategic).toBe(true)
    expect(m.hasInsightful).toBe(true)
    expect(m.hasVisionary).toBe(true)
  })

  it('detects hacked patterns', () => {
    const m = measureNavigating('// hack workaround monkey')
    expect(m.hackedCount).toBe(3)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects ad-hoc any usage', () => {
    const m = measureNavigating('const x: any = 1')
    expect(m.adHocCount).toBe(1)
    expect(m.hasNoAdHoc).toBe(false)
  })

  it('detects experimental patterns', () => {
    const m = measureNavigating('// experimental beta alpha')
    expect(m.hasNoExperimental).toBe(false)
  })

  it('detects shallow ts-ignore', () => {
    const m = measureNavigating('// @ts-ignore')
    expect(m.hasNoShallow).toBe(false)
  })

  it('detects naive patterns', () => {
    const m = measureNavigating('// naive simple basic')
    expect(m.hasNoNaive).toBe(false)
  })

  it('detects reinvented patterns', () => {
    const m = measureNavigating('// reinvent rewrote redone')
    expect(m.hasNoReinvented).toBe(false)
  })
})

// ─── Classifiers ──────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies titanium-masterpiece at 90+', () => {
    expect(classifyCondition(90)).toBe('titanium-masterpiece')
    expect(classifyCondition(100)).toBe('titanium-masterpiece')
  })

  it('classifies space-grade at 75-89', () => {
    expect(classifyCondition(75)).toBe('space-grade')
    expect(classifyCondition(89)).toBe('space-grade')
  })

  it('classifies proper-alloy at 60-74', () => {
    expect(classifyCondition(60)).toBe('proper-alloy')
    expect(classifyCondition(74)).toBe('proper-alloy')
  })

  it('classifies earth-bound at 40-59', () => {
    expect(classifyCondition(40)).toBe('earth-bound')
    expect(classifyCondition(59)).toBe('earth-bound')
  })

  it('classifies rusted-hull at 20-39', () => {
    expect(classifyCondition(20)).toBe('rusted-hull')
    expect(classifyCondition(39)).toBe('rusted-hull')
  })

  it('classifies void below 20', () => {
    expect(classifyCondition(0)).toBe('void')
    expect(classifyCondition(19)).toBe('void')
  })
})

describe('classifyModuleType', () => {
  it('returns no-module for empty panels', () => {
    expect(classifyModuleType([])).toBe('no-module')
  })

  it('classifies space-station at avg 90+', () => {
    const panels = [{ qualityScore: 90 }, { qualityScore: 95 }].map((q) =>
      ({ ...q, file: '', alloyStrength: 0, frontierVision: 0, corrosionResistance: 0, weightEfficiency: 0, spaceWisdom: 0, forging: {} as any, exploring: {} as any, shielding: {} as any, optimizing: {} as any, navigating: {} as any, condition: 'void' as const }),
    )
    expect(classifyModuleType(panels)).toBe('space-station')
  })

  it('classifies no-module at avg below 20', () => {
    const panels = [{ qualityScore: 0 }, { qualityScore: 5 }].map((q) =>
      ({ ...q, file: '', alloyStrength: 0, frontierVision: 0, corrosionResistance: 0, weightEfficiency: 0, spaceWisdom: 0, forging: {} as any, exploring: {} as any, shielding: {} as any, optimizing: {} as any, navigating: {} as any, condition: 'void' as const }),
    )
    expect(classifyModuleType(panels)).toBe('no-module')
  })
})

describe('classifyModuleCondition', () => {
  it('classifies deep-space-station at 85+', () => {
    expect(classifyModuleCondition(85)).toBe('deep-space-station')
    expect(classifyModuleCondition(100)).toBe('deep-space-station')
  })

  it('classifies orbital-platform at 70-84', () => {
    expect(classifyModuleCondition(70)).toBe('orbital-platform')
    expect(classifyModuleCondition(84)).toBe('orbital-platform')
  })

  it('classifies void below 15', () => {
    expect(classifyModuleCondition(0)).toBe('void')
    expect(classifyModuleCondition(14)).toBe('void')
  })
})

describe('classifyCommanderGrade', () => {
  it('classifies space-commander at 80+', () => {
    expect(classifyCommanderGrade(80)).toBe('space-commander')
    expect(classifyCommanderGrade(100)).toBe('space-commander')
  })

  it('classifies station-captain at 65-79', () => {
    expect(classifyCommanderGrade(65)).toBe('station-captain')
    expect(classifyCommanderGrade(79)).toBe('station-captain')
  })

  it('classifies module-engineer at 50-64', () => {
    expect(classifyCommanderGrade(50)).toBe('module-engineer')
    expect(classifyCommanderGrade(64)).toBe('module-engineer')
  })

  it('classifies apprentice at 35-49', () => {
    expect(classifyCommanderGrade(35)).toBe('apprentice')
    expect(classifyCommanderGrade(49)).toBe('apprentice')
  })

  it('classifies novice at 20-34', () => {
    expect(classifyCommanderGrade(20)).toBe('novice')
    expect(classifyCommanderGrade(34)).toBe('novice')
  })

  it('classifies grounded below 20', () => {
    expect(classifyCommanderGrade(0)).toBe('grounded')
    expect(classifyCommanderGrade(19)).toBe('grounded')
  })
})

// ─── analyzeTitaniumPanel ──────────────────────────────────────────

describe('analyzeTitaniumPanel', () => {
  it('analyzes minimal content', () => {
    const panel = analyzeTitaniumPanel(minimalContent, 'test.ts')
    expect(panel.file).toBe('test.ts')
    expect(panel.qualityScore).toBeGreaterThanOrEqual(0)
    expect(typeof panel.condition).toBe('string')
  })

  it('analyzes rich content with high scores', () => {
    const panel = analyzeTitaniumPanel(richContent, 'rich.ts')
    expect(panel.file).toBe('rich.ts')
    expect(panel.alloyStrength).toBe(100)
    expect(panel.frontierVision).toBe(100)
    expect(panel.corrosionResistance).toBe(100)
    expect(panel.weightEfficiency).toBe(100)
    expect(panel.spaceWisdom).toBe(100)
    expect(panel.qualityScore).toBe(100)
    expect(panel.condition).toBe('titanium-masterpiece')
  })

  it('computes qualityScore as weighted average', () => {
    const panel = analyzeTitaniumPanel('export function test(): string { return "a" }', 'mid.ts')
    expect(panel.qualityScore).toBeGreaterThanOrEqual(0)
    expect(panel.qualityScore).toBeLessThanOrEqual(100)
  })

  it('preserves all measure data', () => {
    const panel = analyzeTitaniumPanel(richContent, 'full.ts')
    expect(panel.forging).toBeDefined()
    expect(panel.exploring).toBeDefined()
    expect(panel.shielding).toBeDefined()
    expect(panel.optimizing).toBeDefined()
    expect(panel.navigating).toBeDefined()
  })
})

// ─── analyzeTitaniumModule ──────────────────────────────────────────

describe('analyzeTitaniumModule', () => {
  it('returns empty module for no panels', () => {
    const mod = analyzeTitaniumModule([], 'src')
    expect(mod.directory).toBe('src')
    expect(mod.panels).toHaveLength(0)
    expect(mod.avgStrength).toBe(0)
    expect(mod.avgVision).toBe(0)
    expect(mod.avgWisdom).toBe(0)
    expect(mod.titaniumMasterpieceCount).toBe(0)
    expect(mod.voidCount).toBe(0)
    expect(mod.moduleType).toBe('no-module')
    expect(mod.condition).toBe('void')
  })

  it('computes module stats from panels', () => {
    const panels = [
      analyzeTitaniumPanel(richContent, 'src/a.ts'),
      analyzeTitaniumPanel(richContent, 'src/b.ts'),
    ]
    const mod = analyzeTitaniumModule(panels, 'src')
    expect(mod.panels).toHaveLength(2)
    expect(mod.avgStrength).toBe(100)
    expect(mod.avgVision).toBe(100)
    expect(mod.avgWisdom).toBe(100)
    expect(mod.titaniumMasterpieceCount).toBe(2)
    expect(mod.moduleType).toBe('space-station')
    expect(mod.condition).toBe('deep-space-station')
  })

  it('counts void panels', () => {
    const panels = [analyzeTitaniumPanel('', 'empty.ts')]
    const mod = analyzeTitaniumModule(panels, '.')
    expect(mod.voidCount).toBe(1)
  })
})

// ─── buildTitaniumFrontierResult ──────────────────────────────────────────

describe('buildTitaniumFrontierResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildTitaniumFrontierResult([], [])
    expect(result.panels).toHaveLength(0)
    expect(result.modules).toHaveLength(0)
    expect(result.space.avgStrength).toBe(0)
    expect(result.space.isTitanium).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.commanderGrade).toBe('grounded')
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('analyzes single file', async () => {
    const result = await buildTitaniumFrontierResult(['test.ts'], [richContent])
    expect(result.panels).toHaveLength(1)
    expect(result.panels[0].file).toBe('test.ts')
    expect(result.modules).toHaveLength(1)
    expect(result.modules[0].directory).toBe('.')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory into modules', async () => {
    const result = await buildTitaniumFrontierResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.panels).toHaveLength(3)
    expect(result.modules).toHaveLength(2)
    expect(result.stats.totalModules).toBe(2)
  })

  it('computes space overview', async () => {
    const result = await buildTitaniumFrontierResult(['app.ts'], [richContent])
    expect(result.space.avgStrength).toBeGreaterThan(0)
    expect(result.space.avgVision).toBeGreaterThan(0)
    expect(result.space.avgWisdom).toBeGreaterThan(0)
    expect(result.space.overallGrade).toBeGreaterThan(0)
    expect(result.space.isTitanium).toBe(true)
  })

  it('computes stats correctly', async () => {
    const result = await buildTitaniumFrontierResult(
      ['good.ts', 'bad.ts'],
      [richContent, ''],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.titaniumMasterpieceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.voidCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.bestPanel).toBeTruthy()
    expect(result.stats.strongest).toBeTruthy()
    expect(result.stats.mostVisionary).toBeTruthy()
    expect(result.stats.mostResistant).toBeTruthy()
    expect(result.stats.mostEfficient).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('tracks high counts', async () => {
    const result = await buildTitaniumFrontierResult(['rich.ts'], [richContent])
    expect(result.stats.hasHighStrengthCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighVisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResistanceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighEfficiencyCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('handles missing content gracefully', async () => {
    const result = await buildTitaniumFrontierResult(['missing.ts'], [])
    expect(result.panels).toHaveLength(1)
    expect(result.panels[0].file).toBe('missing.ts')
  })
})

// ─── generateRecommendations ──────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect recommendation for all 90+', () => {
    const panels = [analyzeTitaniumPanel(richContent, 'perfect.ts')]
    const modules = [analyzeTitaniumModule(panels, 'src')]
    const space = { avgStrength: 95, avgVision: 95, avgWisdom: 95, isTitanium: true, overallGrade: 95 }
    const stats = {
      totalFiles: 1, totalModules: 1,
      avgAlloyStrength: 95, avgFrontierVision: 95, avgCorrosionResistance: 95,
      avgWeightEfficiency: 95, avgSpaceWisdom: 95,
      titaniumMasterpieceCount: 1, spaceGradeCount: 0, properAlloyCount: 0,
      earthBoundCount: 0, rustedHullCount: 0, voidCount: 0,
      hasHighStrengthCount: 1, hasHighVisionCount: 1, hasHighResistanceCount: 1,
      hasHighEfficiencyCount: 1, hasHighWisdomCount: 1,
      overallGrade: 95, commanderGrade: 'space-commander' as const,
      bestPanel: 'perfect.ts', strongest: 'perfect.ts', mostVisionary: 'perfect.ts',
      mostResistant: 'perfect.ts', mostEfficient: 'perfect.ts', wisest: 'perfect.ts',
    }
    const recs = generateRecommendations(panels, modules, space, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('space-grade perfection')
  })

  it('recommends improving low alloy strength', () => {
    const panels = [analyzeTitaniumPanel('', 'empty.ts')]
    const modules = [analyzeTitaniumModule(panels, '.')]
    const space = { avgStrength: 0, avgVision: 0, avgWisdom: 0, isTitanium: false, overallGrade: 0 }
    const stats = {
      totalFiles: 1, totalModules: 1,
      avgAlloyStrength: 0, avgFrontierVision: 0, avgCorrosionResistance: 0,
      avgWeightEfficiency: 0, avgSpaceWisdom: 0,
      titaniumMasterpieceCount: 0, spaceGradeCount: 0, properAlloyCount: 0,
      earthBoundCount: 0, rustedHullCount: 0, voidCount: 1,
      hasHighStrengthCount: 0, hasHighVisionCount: 0, hasHighResistanceCount: 0,
      hasHighEfficiencyCount: 0, hasHighWisdomCount: 0,
      overallGrade: 0, commanderGrade: 'grounded' as const,
      bestPanel: 'empty.ts', strongest: 'empty.ts', mostVisionary: 'empty.ts',
      mostResistant: 'empty.ts', mostEfficient: 'empty.ts', wisest: 'empty.ts',
    }
    const recs = generateRecommendations(panels, modules, space, stats)
    expect(recs.length).toBeGreaterThan(0)
    expect(recs.some((r) => r.includes('alloy'))).toBe(true)
  })

  it('recommends improving low frontier vision', () => {
    const space = { avgStrength: 70, avgVision: 50, avgWisdom: 70, isTitanium: false, overallGrade: 50 }
    const stats = {
      totalFiles: 1, totalModules: 1,
      avgAlloyStrength: 70, avgFrontierVision: 50, avgCorrosionResistance: 70,
      avgWeightEfficiency: 70, avgSpaceWisdom: 70,
      titaniumMasterpieceCount: 0, spaceGradeCount: 0, properAlloyCount: 0,
      earthBoundCount: 0, rustedHullCount: 0, voidCount: 0,
      hasHighStrengthCount: 0, hasHighVisionCount: 0, hasHighResistanceCount: 0,
      hasHighEfficiencyCount: 0, hasHighWisdomCount: 0,
      overallGrade: 50, commanderGrade: 'module-engineer' as const,
      bestPanel: '', strongest: '', mostVisionary: '', mostResistant: '', mostEfficient: '', wisest: '',
    }
    const recs = generateRecommendations([], [], space, stats)
    expect(recs.some((r) => r.includes('frontier vision') || r.includes('Expand'))).toBe(true)
  })

  it('recommends improving low corrosion resistance', () => {
    const space = { avgStrength: 70, avgVision: 70, avgWisdom: 70, isTitanium: false, overallGrade: 50 }
    const stats = {
      totalFiles: 1, totalModules: 1,
      avgAlloyStrength: 70, avgFrontierVision: 70, avgCorrosionResistance: 50,
      avgWeightEfficiency: 70, avgSpaceWisdom: 70,
      titaniumMasterpieceCount: 0, spaceGradeCount: 0, properAlloyCount: 0,
      earthBoundCount: 0, rustedHullCount: 0, voidCount: 0,
      hasHighStrengthCount: 0, hasHighVisionCount: 0, hasHighResistanceCount: 0,
      hasHighEfficiencyCount: 0, hasHighWisdomCount: 0,
      overallGrade: 50, commanderGrade: 'module-engineer' as const,
      bestPanel: '', strongest: '', mostVisionary: '', mostResistant: '', mostEfficient: '', wisest: '',
    }
    const recs = generateRecommendations([], [], space, stats)
    expect(recs.some((r) => r.includes('corrosion') || r.includes('resistance'))).toBe(true)
  })

  it('recommends improving low weight efficiency', () => {
    const space = { avgStrength: 70, avgVision: 70, avgWisdom: 70, isTitanium: false, overallGrade: 50 }
    const stats = {
      totalFiles: 1, totalModules: 1,
      avgAlloyStrength: 70, avgFrontierVision: 70, avgCorrosionResistance: 70,
      avgWeightEfficiency: 50, avgSpaceWisdom: 70,
      titaniumMasterpieceCount: 0, spaceGradeCount: 0, properAlloyCount: 0,
      earthBoundCount: 0, rustedHullCount: 0, voidCount: 0,
      hasHighStrengthCount: 0, hasHighVisionCount: 0, hasHighResistanceCount: 0,
      hasHighEfficiencyCount: 0, hasHighWisdomCount: 0,
      overallGrade: 50, commanderGrade: 'module-engineer' as const,
      bestPanel: '', strongest: '', mostVisionary: '', mostResistant: '', mostEfficient: '', wisest: '',
    }
    const recs = generateRecommendations([], [], space, stats)
    expect(recs.some((r) => r.includes('weight') || r.includes('efficiency'))).toBe(true)
  })

  it('recommends improving low space wisdom', () => {
    const space = { avgStrength: 70, avgVision: 70, avgWisdom: 50, isTitanium: false, overallGrade: 50 }
    const stats = {
      totalFiles: 1, totalModules: 1,
      avgAlloyStrength: 70, avgFrontierVision: 70, avgCorrosionResistance: 70,
      avgWeightEfficiency: 70, avgSpaceWisdom: 50,
      titaniumMasterpieceCount: 0, spaceGradeCount: 0, properAlloyCount: 0,
      earthBoundCount: 0, rustedHullCount: 0, voidCount: 0,
      hasHighStrengthCount: 0, hasHighVisionCount: 0, hasHighResistanceCount: 0,
      hasHighEfficiencyCount: 0, hasHighWisdomCount: 0,
      overallGrade: 50, commanderGrade: 'module-engineer' as const,
      bestPanel: '', strongest: '', mostVisionary: '', mostResistant: '', mostEfficient: '', wisest: '',
    }
    const recs = generateRecommendations([], [], space, stats)
    expect(recs.some((r) => r.includes('space wisdom') || r.includes('Deepen'))).toBe(true)
  })

  it('warns about compromised panels', () => {
    const panels = Array.from({ length: 6 }, (_, i) => analyzeTitaniumPanel('', `empty${i}.ts`))
    const modules = [analyzeTitaniumModule(panels, '.')]
    const space = { avgStrength: 0, avgVision: 0, avgWisdom: 0, isTitanium: false, overallGrade: 0 }
    const stats = {
      totalFiles: 6, totalModules: 1,
      avgAlloyStrength: 0, avgFrontierVision: 0, avgCorrosionResistance: 0,
      avgWeightEfficiency: 0, avgSpaceWisdom: 0,
      titaniumMasterpieceCount: 0, spaceGradeCount: 0, properAlloyCount: 0,
      earthBoundCount: 0, rustedHullCount: 0, voidCount: 6,
      hasHighStrengthCount: 0, hasHighVisionCount: 0, hasHighResistanceCount: 0,
      hasHighEfficiencyCount: 0, hasHighWisdomCount: 0,
      overallGrade: 0, commanderGrade: 'grounded' as const,
      bestPanel: 'empty0.ts', strongest: 'empty0.ts', mostVisionary: 'empty0.ts',
      mostResistant: 'empty0.ts', mostEfficient: 'empty0.ts', wisest: 'empty0.ts',
    }
    const recs = generateRecommendations(panels, modules, space, stats)
    expect(recs.some((r) => r.includes('compromised panels'))).toBe(true)
  })

  it('warns when all modules are poor', () => {
    const panels = [analyzeTitaniumPanel('', 'bad.ts')]
    const modules = [analyzeTitaniumModule(panels, 'src')]
    const space = { avgStrength: 0, avgVision: 0, avgWisdom: 0, isTitanium: false, overallGrade: 0 }
    const stats = {
      totalFiles: 1, totalModules: 1,
      avgAlloyStrength: 0, avgFrontierVision: 0, avgCorrosionResistance: 0,
      avgWeightEfficiency: 0, avgSpaceWisdom: 0,
      titaniumMasterpieceCount: 0, spaceGradeCount: 0, properAlloyCount: 0,
      earthBoundCount: 0, rustedHullCount: 0, voidCount: 1,
      hasHighStrengthCount: 0, hasHighVisionCount: 0, hasHighResistanceCount: 0,
      hasHighEfficiencyCount: 0, hasHighWisdomCount: 0,
      overallGrade: 0, commanderGrade: 'grounded' as const,
      bestPanel: 'bad.ts', strongest: 'bad.ts', mostVisionary: 'bad.ts',
      mostResistant: 'bad.ts', mostEfficient: 'bad.ts', wisest: 'bad.ts',
    }
    const recs = generateRecommendations(panels, modules, space, stats)
    expect(recs.some((r) => r.includes('complete redesign'))).toBe(true)
  })

  it('gives positive recommendation when all measures pass', () => {
    const panels = [analyzeTitaniumPanel(richContent, 'good.ts')]
    const modules = [analyzeTitaniumModule(panels, 'src')]
    const space = { avgStrength: 85, avgVision: 85, avgWisdom: 85, isTitanium: true, overallGrade: 85 }
    const stats = {
      totalFiles: 1, totalModules: 1,
      avgAlloyStrength: 85, avgFrontierVision: 85, avgCorrosionResistance: 85,
      avgWeightEfficiency: 85, avgSpaceWisdom: 85,
      titaniumMasterpieceCount: 0, spaceGradeCount: 1, properAlloyCount: 0,
      earthBoundCount: 0, rustedHullCount: 0, voidCount: 0,
      hasHighStrengthCount: 1, hasHighVisionCount: 1, hasHighResistanceCount: 1,
      hasHighEfficiencyCount: 1, hasHighWisdomCount: 1,
      overallGrade: 85, commanderGrade: 'space-commander' as const,
      bestPanel: 'good.ts', strongest: 'good.ts', mostVisionary: 'good.ts',
      mostResistant: 'good.ts', mostEfficient: 'good.ts', wisest: 'good.ts',
    }
    const recs = generateRecommendations(panels, modules, space, stats)
    expect(recs.some((r) => r.includes('titanium frontier') || r.includes('space-grade'))).toBe(true)
  })

  it('warns about hull compromise at low overall grade', () => {
    const space = { avgStrength: 30, avgVision: 30, avgWisdom: 30, isTitanium: false, overallGrade: 30 }
    const stats = {
      totalFiles: 1, totalModules: 1,
      avgAlloyStrength: 30, avgFrontierVision: 30, avgCorrosionResistance: 30,
      avgWeightEfficiency: 30, avgSpaceWisdom: 30,
      titaniumMasterpieceCount: 0, spaceGradeCount: 0, properAlloyCount: 0,
      earthBoundCount: 0, rustedHullCount: 0, voidCount: 0,
      hasHighStrengthCount: 0, hasHighVisionCount: 0, hasHighResistanceCount: 0,
      hasHighEfficiencyCount: 0, hasHighWisdomCount: 0,
      overallGrade: 30, commanderGrade: 'novice' as const,
      bestPanel: '', strongest: '', mostVisionary: '', mostResistant: '', mostEfficient: '', wisest: '',
    }
    const recs = generateRecommendations([], [], space, stats)
    expect(recs.some((r) => r.includes('hull') || r.includes('compromised'))).toBe(true)
  })

  it('lists specific compromised panels when <= 5', () => {
    const panels = [analyzeTitaniumPanel('', 'a.ts'), analyzeTitaniumPanel('', 'b.ts')]
    const modules = [analyzeTitaniumModule(panels, '.')]
    const space = { avgStrength: 0, avgVision: 0, avgWisdom: 0, isTitanium: false, overallGrade: 0 }
    const stats = {
      totalFiles: 2, totalModules: 1,
      avgAlloyStrength: 0, avgFrontierVision: 0, avgCorrosionResistance: 0,
      avgWeightEfficiency: 0, avgSpaceWisdom: 0,
      titaniumMasterpieceCount: 0, spaceGradeCount: 0, properAlloyCount: 0,
      earthBoundCount: 0, rustedHullCount: 0, voidCount: 2,
      hasHighStrengthCount: 0, hasHighVisionCount: 0, hasHighResistanceCount: 0,
      hasHighEfficiencyCount: 0, hasHighWisdomCount: 0,
      overallGrade: 0, commanderGrade: 'grounded' as const,
      bestPanel: 'a.ts', strongest: 'a.ts', mostVisionary: 'a.ts',
      mostResistant: 'a.ts', mostEfficient: 'a.ts', wisest: 'a.ts',
    }
    const recs = generateRecommendations(panels, modules, space, stats)
    expect(recs.some((r) => r.includes('Repair these compromised panels'))).toBe(true)
  })
})

// ─── Format Helpers ──────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorCondition', () => {
  it('returns a string for known conditions', () => {
    expect(typeof colorCondition('titanium-masterpiece')).toBe('string')
    expect(typeof colorCondition('space-grade')).toBe('string')
    expect(typeof colorCondition('proper-alloy')).toBe('string')
    expect(typeof colorCondition('earth-bound')).toBe('string')
    expect(typeof colorCondition('rusted-hull')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
  })

  it('returns a string for unknown conditions', () => {
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('colorModuleCondition', () => {
  it('returns a string for known module conditions', () => {
    expect(typeof colorModuleCondition('deep-space-station')).toBe('string')
    expect(typeof colorModuleCondition('orbital-platform')).toBe('string')
    expect(typeof colorModuleCondition('proper-module')).toBe('string')
    expect(typeof colorModuleCondition('ground-facility')).toBe('string')
    expect(typeof colorModuleCondition('crashed-pod')).toBe('string')
    expect(typeof colorModuleCondition('void')).toBe('string')
  })

  it('returns a string for unknown conditions', () => {
    expect(typeof colorModuleCondition('unknown')).toBe('string')
  })
})

describe('formatPanelTable', () => {
  it('formats a panel', () => {
    const panel = analyzeTitaniumPanel(richContent, 'app.ts')
    const output = formatPanelTable(panel)
    expect(output).toContain('app.ts')
    expect(output).toContain('Alloy Strength')
    expect(output).toContain('Frontier Vision')
    expect(output).toContain('Corrosion Resistance')
    expect(output).toContain('Weight Efficiency')
    expect(output).toContain('Space Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatPanelsTable', () => {
  it('formats empty panels', () => {
    const output = formatPanelsTable([])
    expect(output).toContain('No titanium panels found')
  })

  it('formats panels table', () => {
    const panels = [analyzeTitaniumPanel(richContent, 'app.ts')]
    const output = formatPanelsTable(panels)
    expect(output).toContain('app.ts')
    expect(output).toContain('Titanium Panels')
  })
})

describe('formatModuleTable', () => {
  it('formats a module', () => {
    const panels = [analyzeTitaniumPanel(richContent, 'src/app.ts')]
    const mod = analyzeTitaniumModule(panels, 'src')
    const output = formatModuleTable(mod)
    expect(output).toContain('src')
    expect(output).toContain('Panels')
    expect(output).toContain('Avg Strength')
  })
})

describe('formatModulesTable', () => {
  it('formats empty modules', () => {
    const output = formatModulesTable([])
    expect(output).toContain('No titanium modules found')
  })

  it('formats modules table', () => {
    const panels = [analyzeTitaniumPanel(richContent, 'src/app.ts')]
    const modules = [analyzeTitaniumModule(panels, 'src')]
    const output = formatModulesTable(modules)
    expect(output).toContain('src')
    expect(output).toContain('Titanium Modules')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildTitaniumFrontierResult(['app.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Titanium Frontier Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Overall Grade')
    expect(output).toContain('Commander Grade')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => {
    const output = formatRecommendations([])
    expect(output).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Improve Y'])
    expect(output).toContain('Recommendations')
    expect(output).toContain('Fix X')
    expect(output).toContain('Improve Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildTitaniumFrontierResult(['app.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Titanium Frontier Analysis')
    expect(output).toContain('Space Overview')
  })
})

describe('formatResultJson', () => {
  it('formats result as JSON', async () => {
    const result = await buildTitaniumFrontierResult(['app.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.panels).toHaveLength(1)
    expect(parsed.modules).toBeDefined()
    expect(parsed.space).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})
