import { describe, expect, it } from 'vitest'

import {
  analyzeTitaniumAlloy,
  analyzeTitaniumStation,
  buildTitaniumFrontierResult,
  classifyAlloyCondition,
  classifyCommanderGrade,
  classifyStationCondition,
  classifyStationType,
  generateRecommendations,
  measureExploring,
  measureNavigating,
  measureOptimizing,
  measureResisting,
  measureStrengthening,
} from '../src/commands/titanium-edge-helpers.js'
import type { TitaniumAlloy, TitaniumFrontierResult } from '../src/commands/titanium-edge-helpers.js'
import {
  colorAlloyCondition,
  colorCommanderGrade,
  colorScore,
  colorStationCondition,
  colorStationType,
  formatAlloysTable,
  formatAlloyTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStationsTable,
  formatStationTable,
  formatStatsTable,
} from '../src/commands/titanium-edge-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

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

const emptyContent = ''
const minimalContent = 'const x = 1'

const richStr = measureStrengthening(richContent).strength
const richVis = measureExploring(richContent).vision
const richRes = measureResisting(richContent).resistance
const richEff = measureOptimizing(richContent).efficiency
const richNav = measureNavigating(richContent).wisdom

function makeStats(overrides: Partial<TitaniumFrontierResult['stats']> = {}): TitaniumFrontierResult['stats'] {
  return {
    totalFiles: 1,
    totalStations: 1,
    avgAlloyStrength: 50,
    avgFrontierVision: 50,
    avgCorrosionResistance: 50,
    avgWeightEfficiency: 50,
    avgSpaceWisdom: 50,
    titaniumMasterpieceCount: 0,
    aerospaceGradeCount: 0,
    properAlloyCount: 0,
    baseMetalCount: 0,
    scrapTitaniumCount: 0,
    voidCount: 0,
    hasHighStrengthCount: 1,
    hasHighVisionCount: 1,
    hasHighResistanceCount: 1,
    hasHighEfficiencyCount: 1,
    hasHighWisdomCount: 1,
    overallReadiness: 50,
    commanderGrade: 'proper-officer',
    bestAlloy: 'a.ts',
    strongest: 'a.ts',
    mostVisionary: 'a.ts',
    mostResistant: 'a.ts',
    mostEfficient: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureStrengthening ───────────────────────────────

describe('measureStrengthening', () => {
  it('scores rich content highly', () => {
    const result = measureStrengthening(richContent)
    expect(result.strength).toBeGreaterThan(60)
    expect(result.hasHighStrength).toBe(true)
  })

  it('scores empty content below rich', () => {
    const result = measureStrengthening(emptyContent)
    expect(result.strength).toBeLessThan(richStr)
  })

  it('detects well structured patterns', () => {
    expect(measureStrengthening(richContent).hasWellStructured).toBe(true)
  })

  it('counts chaotic keywords', () => {
    const content = 'const chaotic = 1; const messy = 2; const tangled = 3'
    const result = measureStrengthening(content)
    expect(result.chaoticCount).toBe(3)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects type safety', () => {
    expect(measureStrengthening(richContent).hasTypeSafe).toBe(true)
  })

  it('detects no unsafe in clean code', () => {
    expect(measureStrengthening(richContent).hasNoUnsafe).toBe(true)
  })

  it('detects unyielding patterns', () => {
    expect(measureStrengthening(richContent).hasUnyielding).toBe(true)
  })

  it('classifies grade correctly for high scores', () => {
    const result = measureStrengthening(richContent)
    expect(['aerospace-grade', 'medical-grade', 'industrial-grade']).toContain(result.grade)
  })

  it('classifies grade correctly for low scores', () => {
    expect(measureStrengthening(emptyContent).grade).not.toBe('aerospace-grade')
  })
})

// ─── measureExploring ───────────────────────────────────

describe('measureExploring', () => {
  it('scores rich content highly', () => {
    const result = measureExploring(richContent)
    expect(result.vision).toBeGreaterThan(60)
    expect(result.hasHighVision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureExploring(emptyContent).vision).toBeLessThan(richVis)
  })

  it('counts legacy-bound keywords', () => {
    const content = 'const legacy = 1; const deprecated = 2; const outdated = 3'
    const result = measureExploring(content)
    expect(result.legacyBoundCount).toBe(3)
    expect(result.hasNoLegacyBound).toBe(false)
  })

  it('counts stagnant keywords', () => {
    const content = 'const stagnant = 1; const stale = 2'
    const result = measureExploring(content)
    expect(result.stagnantCount).toBe(2)
    expect(result.hasNoStagnant).toBe(false)
  })

  it('detects modern patterns (no any)', () => {
    expect(measureExploring(richContent).hasModern).toBe(true)
  })

  it('detects adaptive patterns (async/await)', () => {
    expect(measureExploring(richContent).hasAdaptive).toBe(true)
  })

  it('classifies horizon correctly for high scores', () => {
    const result = measureExploring(richContent)
    expect(['starship-class', 'orbital-station', 'proper-satellite']).toContain(result.horizon)
  })

  it('classifies horizon correctly for low scores', () => {
    expect(measureExploring(emptyContent).horizon).not.toBe('starship-class')
  })
})

// ─── measureResisting ───────────────────────────────────

describe('measureResisting', () => {
  it('scores rich content highly', () => {
    const result = measureResisting(richContent)
    expect(result.resistance).toBeGreaterThan(50)
  })

  it('scores empty content below rich', () => {
    expect(measureResisting(emptyContent).resistance).toBeLessThan(richRes)
  })

  it('detects error handling', () => {
    expect(measureResisting(richContent).hasErrorHandled).toBe(true)
  })

  it('counts unhandled patterns', () => {
    const content = 'const unsafe = 1; const unchecked = 2; const risky = 3'
    const result = measureResisting(content)
    expect(result.unhandledCount).toBe(3)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('counts vulnerable patterns', () => {
    const content = 'const vulnerable = 1; const exposed = 2'
    const result = measureResisting(content)
    expect(result.vulnerableCount).toBe(2)
    expect(result.hasNoVulnerable).toBe(false)
  })

  it('detects secure patterns (no any)', () => {
    expect(measureResisting(richContent).hasSecure).toBe(true)
  })

  it('classifies shield correctly for high scores', () => {
    const result = measureResisting(richContent)
    expect(['indestructible-hull', 'corrosion-proof', 'proper-coating']).toContain(result.shield)
  })

  it('classifies shield correctly for low scores', () => {
    expect(measureResisting(emptyContent).shield).not.toBe('indestructible-hull')
  })
})

// ─── measureOptimizing ──────────────────────────────────

describe('measureOptimizing', () => {
  it('scores rich content highly', () => {
    const result = measureOptimizing(richContent)
    expect(result.efficiency).toBeGreaterThan(60)
    expect(result.hasHighEfficiency).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureOptimizing(emptyContent).efficiency).toBeLessThan(richEff)
  })

  it('counts verbose keywords', () => {
    const content = 'const verbose = 1; const wordy = 2; const bloated = 3'
    const result = measureOptimizing(content)
    expect(result.verboseCount).toBe(3)
    expect(result.hasNoVerbose).toBe(false)
  })

  it('counts redundant keywords', () => {
    const content = 'const redundant = 1; const duplicate = 2'
    const result = measureOptimizing(content)
    expect(result.redundantCount).toBe(2)
    expect(result.hasNoRedundant).toBe(false)
  })

  it('detects lean patterns (no any)', () => {
    expect(measureOptimizing(richContent).hasLean).toBe(true)
  })

  it('detects concise patterns', () => {
    expect(measureOptimizing(richContent).hasConcise).toBe(true)
  })

  it('classifies ratio correctly for high scores', () => {
    const result = measureOptimizing(richContent)
    expect(['perfect-balance', 'excellent-ratio', 'proper-efficiency']).toContain(result.ratio)
  })

  it('classifies ratio correctly for low scores', () => {
    expect(measureOptimizing(emptyContent).ratio).not.toBe('perfect-balance')
  })
})

// ─── measureNavigating ──────────────────────────────────

describe('measureNavigating', () => {
  it('scores rich content highly', () => {
    const result = measureNavigating(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureNavigating(emptyContent).wisdom).toBeLessThan(richNav)
  })

  it('counts hacked keywords', () => {
    const content = 'const hack = 1; const workaround = 2; const kludge = 3'
    const result = measureNavigating(content)
    expect(result.hackedCount).toBe(3)
    expect(result.hasNoHacked).toBe(false)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3'
    const result = measureNavigating(content)
    expect(result.shallowCount).toBe(3)
  })

  it('detects well architected patterns', () => {
    expect(measureNavigating(richContent).hasWellArchitected).toBe(true)
  })

  it('detects principled code', () => {
    expect(measureNavigating(richContent).hasPrincipled).toBe(true)
  })

  it('classifies orbit correctly for high scores', () => {
    const result = measureNavigating(richContent)
    expect(['mission-control', 'veteran-pilot', 'proper-navigator']).toContain(result.orbit)
  })

  it('classifies orbit correctly for low scores', () => {
    expect(measureNavigating(emptyContent).orbit).not.toBe('mission-control')
  })
})

// ─── analyzeTitaniumAlloy ───────────────────────────────

describe('analyzeTitaniumAlloy', () => {
  it('analyzes a file correctly', () => {
    const alloy = analyzeTitaniumAlloy(richContent, 'test.ts')
    expect(alloy.file).toBe('test.ts')
    expect(alloy.alloyStrength).toBeGreaterThan(0)
    expect(alloy.frontierVision).toBeGreaterThan(0)
    expect(alloy.corrosionResistance).toBeGreaterThan(0)
    expect(alloy.weightEfficiency).toBeGreaterThan(0)
    expect(alloy.spaceWisdom).toBeGreaterThan(0)
    expect(alloy.qualityScore).toBeGreaterThan(0)
    expect(alloy.condition).toBeDefined()
  })

  it('computes quality score as weighted average', () => {
    const alloy = analyzeTitaniumAlloy(richContent, 'test.ts')
    const expected = Math.round(
      alloy.alloyStrength * 0.2 +
      alloy.frontierVision * 0.2 +
      alloy.corrosionResistance * 0.2 +
      alloy.weightEfficiency * 0.2 +
      alloy.spaceWisdom * 0.2,
    )
    expect(alloy.qualityScore).toBe(expected)
  })

  it('includes all measure objects', () => {
    const alloy = analyzeTitaniumAlloy(richContent, 'test.ts')
    expect(alloy.strengthening).toBeDefined()
    expect(alloy.exploring).toBeDefined()
    expect(alloy.resisting).toBeDefined()
    expect(alloy.optimizing).toBeDefined()
    expect(alloy.navigating).toBeDefined()
  })

  it('classifies empty content as non-masterpiece', () => {
    const alloy = analyzeTitaniumAlloy(emptyContent, 'empty.ts')
    expect(alloy.qualityScore).toBeLessThan(60)
    expect(alloy.condition).not.toBe('titanium-masterpiece')
  })
})

// ─── analyzeTitaniumStation ─────────────────────────────

describe('analyzeTitaniumStation', () => {
  it('handles empty alloys', () => {
    const station = analyzeTitaniumStation([], 'empty-dir')
    expect(station.alloys).toHaveLength(0)
    expect(station.stationType).toBe('no-station')
    expect(station.condition).toBe('void')
  })

  it('analyzes a station with alloys', () => {
    const alloy = analyzeTitaniumAlloy(richContent, 'src/test.ts')
    const station = analyzeTitaniumStation([alloy], 'src')
    expect(station.directory).toBe('src')
    expect(station.alloys).toHaveLength(1)
    expect(station.avgStrength).toBeGreaterThan(0)
  })

  it('counts titanium masterpieces', () => {
    const alloy: TitaniumAlloy = {
      file: 'a.ts', alloyStrength: 95, frontierVision: 95, corrosionResistance: 95, weightEfficiency: 95, spaceWisdom: 95,
      strengthening: {} as TitaniumAlloy['strengthening'],
      exploring: {} as TitaniumAlloy['exploring'],
      resisting: {} as TitaniumAlloy['resisting'],
      optimizing: {} as TitaniumAlloy['optimizing'],
      navigating: {} as TitaniumAlloy['navigating'],
      condition: 'titanium-masterpiece', qualityScore: 95,
    }
    expect(analyzeTitaniumStation([alloy], 'src').titaniumMasterpieceCount).toBe(1)
  })

  it('counts void alloys', () => {
    const alloy: TitaniumAlloy = {
      file: 'a.ts', alloyStrength: 0, frontierVision: 0, corrosionResistance: 0, weightEfficiency: 0, spaceWisdom: 0,
      strengthening: {} as TitaniumAlloy['strengthening'],
      exploring: {} as TitaniumAlloy['exploring'],
      resisting: {} as TitaniumAlloy['resisting'],
      optimizing: {} as TitaniumAlloy['optimizing'],
      navigating: {} as TitaniumAlloy['navigating'],
      condition: 'void', qualityScore: 0,
    }
    expect(analyzeTitaniumStation([alloy], 'src').voidCount).toBe(1)
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyAlloyCondition', () => {
  it('classifies titanium-masterpiece at 90+', () => { expect(classifyAlloyCondition(90)).toBe('titanium-masterpiece') })
  it('classifies aerospace-grade at 75-89', () => { expect(classifyAlloyCondition(75)).toBe('aerospace-grade') })
  it('classifies proper-alloy at 60-74', () => { expect(classifyAlloyCondition(60)).toBe('proper-alloy') })
  it('classifies base-metal at 40-59', () => { expect(classifyAlloyCondition(40)).toBe('base-metal') })
  it('classifies scrap-titanium at 20-39', () => { expect(classifyAlloyCondition(20)).toBe('scrap-titanium') })
  it('classifies void below 20', () => { expect(classifyAlloyCondition(0)).toBe('void') })
})

describe('classifyStationType', () => {
  it('returns no-station for empty alloys', () => { expect(classifyStationType([])).toBe('no-station') })
  it('classifies space-station at 85+', () => { expect(classifyStationType([{ qualityScore: 90 } as TitaniumAlloy])).toBe('space-station') })
  it('classifies orbital-lab at 70-84', () => { expect(classifyStationType([{ qualityScore: 75 } as TitaniumAlloy])).toBe('orbital-lab') })
  it('classifies proper-habitat at 55-69', () => { expect(classifyStationType([{ qualityScore: 60 } as TitaniumAlloy])).toBe('proper-habitat') })
  it('classifies launch-pad at 35-54', () => { expect(classifyStationType([{ qualityScore: 40 } as TitaniumAlloy])).toBe('launch-pad') })
  it('classifies empty-silo below 35', () => { expect(classifyStationType([{ qualityScore: 10 } as TitaniumAlloy])).toBe('empty-silo') })
})

describe('classifyStationCondition', () => {
  it('classifies titanium-palace at 85+', () => { expect(classifyStationCondition(85)).toBe('titanium-palace') })
  it('classifies space-fortress at 70-84', () => { expect(classifyStationCondition(70)).toBe('space-fortress') })
  it('classifies proper-station at 55-69', () => { expect(classifyStationCondition(55)).toBe('proper-station') })
  it('classifies metal-shed at 35-54', () => { expect(classifyStationCondition(35)).toBe('metal-shed') })
  it('classifies cardboard-box at 15-34', () => { expect(classifyStationCondition(15)).toBe('cardboard-box') })
  it('classifies void below 15', () => { expect(classifyStationCondition(0)).toBe('void') })
})

describe('classifyCommanderGrade', () => {
  it('classifies mission-commander at 80+', () => { expect(classifyCommanderGrade(80)).toBe('mission-commander') })
  it('classifies veteran-pilot at 65-79', () => { expect(classifyCommanderGrade(65)).toBe('veteran-pilot') })
  it('classifies proper-officer at 50-64', () => { expect(classifyCommanderGrade(50)).toBe('proper-officer') })
  it('classifies cadet at 35-49', () => { expect(classifyCommanderGrade(35)).toBe('cadet') })
  it('classifies recruit at 20-34', () => { expect(classifyCommanderGrade(20)).toBe('recruit') })
  it('classifies ground-crew below 20', () => { expect(classifyCommanderGrade(0)).toBe('ground-crew') })
})

// ─── buildTitaniumFrontierResult ─────────────────────────

describe('buildTitaniumFrontierResult', () => {
  it('handles empty input', async () => {
    const result = await buildTitaniumFrontierResult([], [])
    expect(result.alloys).toHaveLength(0)
    expect(result.stations).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallReadiness).toBe(0)
    expect(result.stats.bestAlloy).toBe('')
  })

  it('analyzes single file', async () => {
    const result = await buildTitaniumFrontierResult(['test.ts'], [richContent])
    expect(result.alloys).toHaveLength(1)
    expect(result.alloys[0].file).toBe('test.ts')
    expect(result.stations).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory', async () => {
    const result = await buildTitaniumFrontierResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.stations).toHaveLength(2)
  })

  it('computes average scores correctly', async () => {
    const result = await buildTitaniumFrontierResult(['a.ts'], [richContent])
    expect(result.stats.avgAlloyStrength).toBe(result.alloys[0].alloyStrength)
    expect(result.stats.avgFrontierVision).toBe(result.alloys[0].frontierVision)
    expect(result.stats.avgCorrosionResistance).toBe(result.alloys[0].corrosionResistance)
    expect(result.stats.avgWeightEfficiency).toBe(result.alloys[0].weightEfficiency)
    expect(result.stats.avgSpaceWisdom).toBe(result.alloys[0].spaceWisdom)
  })

  it('identifies best alloy', async () => {
    const result = await buildTitaniumFrontierResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestAlloy).toBe('high.ts')
  })

  it('computes mission overview', async () => {
    const result = await buildTitaniumFrontierResult(['a.ts'], [richContent])
    expect(result.mission.avgStrength).toBe(result.alloys[0].alloyStrength)
    expect(result.mission.avgEfficiency).toBe(result.alloys[0].weightEfficiency)
    expect(result.mission.avgWisdom).toBe(result.alloys[0].spaceWisdom)
    expect(result.mission.overallReadiness).toBe(result.stats.overallReadiness)
  })

  it('sets isTitanium when overallReadiness >= 60', async () => {
    const result = await buildTitaniumFrontierResult(['a.ts'], [richContent])
    if (result.stats.overallReadiness >= 60) {
      expect(result.mission.isTitanium).toBe(true)
    }
  })

  it('finds strongest, most visionary, most resistant, most efficient, wisest', async () => {
    const result = await buildTitaniumFrontierResult(['a.ts'], [richContent])
    expect(result.stats.strongest).toBe('a.ts')
    expect(result.stats.mostVisionary).toBe('a.ts')
    expect(result.stats.mostResistant).toBe('a.ts')
    expect(result.stats.mostEfficient).toBe('a.ts')
    expect(result.stats.wisest).toBe('a.ts')
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all scores >= 90', () => {
    const stats = makeStats({
      avgAlloyStrength: 90, avgFrontierVision: 90, avgCorrosionResistance: 90,
      avgWeightEfficiency: 90, avgSpaceWisdom: 90, overallReadiness: 90,
    })
    const recs = generateRecommendations([], [], { avgStrength: 90, avgEfficiency: 90, avgWisdom: 90, isTitanium: true, overallReadiness: 90 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('titanium frontier is limitless')
  })

  it('recommends strengthening alloy when below 60', () => {
    const stats = makeStats({ avgAlloyStrength: 40, avgFrontierVision: 90, avgCorrosionResistance: 90, avgWeightEfficiency: 90, avgSpaceWisdom: 90 })
    const recs = generateRecommendations([], [], { avgStrength: 40, avgEfficiency: 90, avgWisdom: 90, isTitanium: true, overallReadiness: 70 }, stats)
    expect(recs.some((r) => r.includes('Strengthen titanium alloy'))).toBe(true)
  })

  it('recommends expanding vision when below 60', () => {
    const stats = makeStats({ avgAlloyStrength: 90, avgFrontierVision: 40, avgCorrosionResistance: 90, avgWeightEfficiency: 90, avgSpaceWisdom: 90 })
    const recs = generateRecommendations([], [], { avgStrength: 90, avgEfficiency: 90, avgWisdom: 90, isTitanium: true, overallReadiness: 70 }, stats)
    expect(recs.some((r) => r.includes('Expand frontier vision'))).toBe(true)
  })

  it('recommends improving corrosion when below 60', () => {
    const stats = makeStats({ avgAlloyStrength: 90, avgFrontierVision: 90, avgCorrosionResistance: 40, avgWeightEfficiency: 90, avgSpaceWisdom: 90 })
    const recs = generateRecommendations([], [], { avgStrength: 90, avgEfficiency: 90, avgWisdom: 90, isTitanium: false, overallReadiness: 70 }, stats)
    expect(recs.some((r) => r.includes('Improve corrosion resistance'))).toBe(true)
  })

  it('recommends optimizing weight when below 60', () => {
    const stats = makeStats({ avgAlloyStrength: 90, avgFrontierVision: 90, avgCorrosionResistance: 90, avgWeightEfficiency: 40, avgSpaceWisdom: 90 })
    const recs = generateRecommendations([], [], { avgStrength: 90, avgEfficiency: 40, avgWisdom: 90, isTitanium: true, overallReadiness: 70 }, stats)
    expect(recs.some((r) => r.includes('Optimize weight efficiency'))).toBe(true)
  })

  it('recommends deepening wisdom when below 60', () => {
    const stats = makeStats({ avgAlloyStrength: 90, avgFrontierVision: 90, avgCorrosionResistance: 90, avgWeightEfficiency: 90, avgSpaceWisdom: 40 })
    const recs = generateRecommendations([], [], { avgStrength: 90, avgEfficiency: 90, avgWisdom: 40, isTitanium: true, overallReadiness: 70 }, stats)
    expect(recs.some((r) => r.includes('Deepen space wisdom'))).toBe(true)
  })

  it('recommends mission scrubbed when readiness < 40', () => {
    const stats = makeStats({ overallReadiness: 30, avgAlloyStrength: 30, avgFrontierVision: 30, avgCorrosionResistance: 30, avgWeightEfficiency: 30, avgSpaceWisdom: 30 })
    const recs = generateRecommendations([], [], { avgStrength: 30, avgEfficiency: 30, avgWisdom: 30, isTitanium: false, overallReadiness: 30 }, stats)
    expect(recs.some((r) => r.includes('mission is scrubbed'))).toBe(true)
  })

  it('lists void alloys by name when <= 5', () => {
    const stats = makeStats({ avgAlloyStrength: 70, avgFrontierVision: 70, avgCorrosionResistance: 70, avgWeightEfficiency: 70, avgSpaceWisdom: 70 })
    const alloys = [{ file: 'a.ts', condition: 'void' } as TitaniumAlloy, { file: 'b.ts', condition: 'void' } as TitaniumAlloy]
    const recs = generateRecommendations(alloys, [], { avgStrength: 70, avgEfficiency: 70, avgWisdom: 70, isTitanium: true, overallReadiness: 70 }, stats)
    expect(recs.some((r) => r.includes('a.ts') && r.includes('b.ts'))).toBe(true)
  })

  it('summarizes void alloys when > 5', () => {
    const stats = makeStats({ avgAlloyStrength: 70, avgFrontierVision: 70, avgCorrosionResistance: 70, avgWeightEfficiency: 70, avgSpaceWisdom: 70 })
    const alloys = Array.from({ length: 6 }, (_, i) => ({ file: `${i}.ts`, condition: 'void' } as TitaniumAlloy))
    const recs = generateRecommendations(alloys, [], { avgStrength: 70, avgEfficiency: 70, avgWisdom: 70, isTitanium: true, overallReadiness: 70 }, stats)
    expect(recs.some((r) => r.includes('6 scrap alloys'))).toBe(true)
  })

  it('reports all stations are cardboard boxes', () => {
    const stats = makeStats({ avgAlloyStrength: 70, avgFrontierVision: 70, avgCorrosionResistance: 70, avgWeightEfficiency: 70, avgSpaceWisdom: 70 })
    const stations = [{ condition: 'cardboard-box', directory: 'src' } as import('../src/commands/titanium-edge-helpers.js').TitaniumStation]
    const recs = generateRecommendations([], stations, { avgStrength: 70, avgEfficiency: 70, avgWisdom: 70, isTitanium: true, overallReadiness: 70 }, stats)
    expect(recs.some((r) => r.includes('cardboard boxes'))).toBe(true)
  })

  it('returns default praise when all is well', () => {
    const stats = makeStats({ avgAlloyStrength: 90, avgFrontierVision: 90, avgCorrosionResistance: 90, avgWeightEfficiency: 90, avgSpaceWisdom: 90, overallReadiness: 90 })
    const recs = generateRecommendations([], [], { avgStrength: 90, avgEfficiency: 90, avgWisdom: 90, isTitanium: true, overallReadiness: 90 }, stats)
    expect(recs[0]).toContain('titanium frontier is limitless')
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for all ranges', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(95)).toBe('string')
  })
})

describe('colorAlloyCondition', () => {
  it('handles all conditions', () => {
    for (const c of ['titanium-masterpiece', 'aerospace-grade', 'proper-alloy', 'base-metal', 'scrap-titanium', 'void', 'unknown']) {
      expect(typeof colorAlloyCondition(c)).toBe('string')
    }
  })
})

describe('colorStationType', () => {
  it('handles all types', () => {
    for (const t of ['space-station', 'orbital-lab', 'proper-habitat', 'launch-pad', 'empty-silo', 'no-station']) {
      expect(typeof colorStationType(t)).toBe('string')
    }
  })
})

describe('colorStationCondition', () => {
  it('handles all conditions', () => {
    for (const c of ['titanium-palace', 'space-fortress', 'proper-station', 'metal-shed', 'cardboard-box', 'void']) {
      expect(typeof colorStationCondition(c)).toBe('string')
    }
  })
})

describe('colorCommanderGrade', () => {
  it('handles all grades', () => {
    for (const g of ['mission-commander', 'veteran-pilot', 'proper-officer', 'cadet', 'recruit', 'ground-crew']) {
      expect(typeof colorCommanderGrade(g)).toBe('string')
    }
  })
})

describe('formatAlloyTable', () => {
  it('formats an alloy table', () => {
    const alloy = analyzeTitaniumAlloy(richContent, 'test.ts')
    const output = formatAlloyTable(alloy)
    expect(output).toContain('Titanium Alloy: test.ts')
    expect(output).toContain('Alloy Strength')
    expect(output).toContain('Quality Score')
  })
})

describe('formatAlloysTable', () => {
  it('formats empty alloys message', () => { expect(formatAlloysTable([])).toContain('No titanium alloys found') })
  it('formats alloys list', () => {
    const output = formatAlloysTable([analyzeTitaniumAlloy(richContent, 'a.ts'), analyzeTitaniumAlloy(richContent, 'b.ts')])
    expect(output).toContain('Titanium Alloys')
    expect(output).toContain('a.ts')
  })
})

describe('formatStationTable', () => {
  it('formats a station table', () => {
    const station = analyzeTitaniumStation([analyzeTitaniumAlloy(richContent, 'test.ts')], 'src')
    const output = formatStationTable(station)
    expect(output).toContain('Titanium Station: src')
  })
})

describe('formatStationsTable', () => {
  it('formats empty message', () => { expect(formatStationsTable([])).toContain('No titanium stations found') })
  it('formats stations list', () => {
    const station = analyzeTitaniumStation([analyzeTitaniumAlloy(richContent, 'test.ts')], 'src')
    expect(formatStationsTable([station])).toContain('Titanium Stations')
  })
})

describe('formatStatsTable', () => {
  it('formats stats table', () => {
    expect(formatStatsTable(makeStats())).toContain('Titanium Frontier Statistics')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => { expect(formatRecommendations([])).toContain('No recommendations') })
  it('formats recommendations list', () => {
    expect(formatRecommendations(['Fix X', 'Improve Y'])).toContain('Fix X')
  })
})

describe('formatResultTable', () => {
  it('formats full result table', async () => {
    const result = await buildTitaniumFrontierResult(['test.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Titanium Frontier Analysis')
    expect(output).toContain('Mission Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as JSON', async () => {
    const result = await buildTitaniumFrontierResult(['test.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.alloys).toHaveLength(1)
    expect(parsed.mission).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
