import { describe, expect, it } from 'vitest'

import {
  analyzeCopperPanel,
  analyzeCopperSpire,
  buildCopperCathedralResult,
  classifyArchitectGrade,
  classifyPanelCondition,
  classifySpireCondition,
  classifySpireType,
  generateRecommendations,
  measureAging,
  measureFlowing,
  measureMastering,
  measureShaping,
  measureWarming,
} from '../src/commands/copper-cathedral-helpers.js'
import type { CopperCathedralResult, CopperPanel } from '../src/commands/copper-cathedral-helpers.js'
import {
  colorArchitectGrade,
  colorPanelCondition,
  colorScore,
  colorSpireCondition,
  colorSpireType,
  formatPanelsTable,
  formatPanelTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatSpiresTable,
  formatSpireTable,
  formatStatsTable,
} from '../src/commands/copper-cathedral-format-helpers.js'

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

const richAging = measureAging(richContent).patina
const richFlowing = measureFlowing(richContent).grace
const richShaping = measureShaping(richContent).precision
const richWarming = measureWarming(richContent).endurance
const richMastering = measureMastering(richContent).mastery

function makeStats(overrides: Partial<CopperCathedralResult['stats']> = {}): CopperCathedralResult['stats'] {
  return {
    totalFiles: 1,
    totalSpires: 1,
    avgPatinaWisdom: 50,
    avgConductiveGrace: 50,
    avgForgePrecision: 50,
    avgWarmthEndurance: 50,
    avgAgedMastery: 50,
    copperMasterpieceCount: 0,
    verdigrisGemCount: 0,
    properCopperCount: 0,
    tarnishedMetalCount: 0,
    rawOreCount: 0,
    voidCount: 0,
    hasHighPatinaCount: 1,
    hasHighGraceCount: 1,
    hasHighPrecisionCount: 1,
    hasHighEnduranceCount: 1,
    hasHighMasteryCount: 1,
    overallWarmth: 50,
    architectGrade: 'proper-mason',
    bestPanel: 'a.ts',
    wisest: 'a.ts',
    mostGraceful: 'a.ts',
    mostPrecise: 'a.ts',
    mostEnduring: 'a.ts',
    mostMasterful: 'a.ts',
    ...overrides,
  }
}

// ─── measureAging ───────────────────────────────────────

describe('measureAging', () => {
  it('scores rich content highly', () => {
    const result = measureAging(richContent)
    expect(result.patina).toBeGreaterThan(60)
    expect(result.hasHighPatina).toBe(true)
  })

  it('scores empty content below rich', () => {
    const result = measureAging(emptyContent)
    expect(result.patina).toBeLessThan(richAging)
  })

  it('scores minimal content moderately', () => {
    const result = measureAging(minimalContent)
    expect(result.patina).toBeGreaterThan(0)
  })

  it('detects mature patterns', () => {
    const result = measureAging(richContent)
    expect(result.hasMature).toBe(true)
  })

  it('detects no immature content in clean code', () => {
    const result = measureAging(richContent)
    expect(result.hasNoImmature).toBe(true)
    expect(result.immatureCount).toBe(0)
  })

  it('counts immature keywords', () => {
    const content = 'const immature = 1; const unripe = 2; const greenhorn = 3'
    const result = measureAging(content)
    expect(result.immatureCount).toBe(3)
    expect(result.hasNoImmature).toBe(false)
  })

  it('detects proven patterns', () => {
    const result = measureAging(richContent)
    expect(result.hasProven).toBe(true)
  })

  it('detects stable patterns', () => {
    const result = measureAging(richContent)
    expect(result.hasStable).toBe(true)
  })

  it('counts volatile keywords', () => {
    const content = 'const volatile = 1; const unstable = 2'
    const result = measureAging(content)
    expect(result.volatileCount).toBe(2)
    expect(result.hasNoVolatile).toBe(false)
  })

  it('classifies verdigris correctly for high scores', () => {
    const result = measureAging(richContent)
    expect(['noble-patina', 'aged-beauty', 'proper-weathering']).toContain(result.verdigris)
  })

  it('classifies verdigris correctly for low scores', () => {
    const result = measureAging(emptyContent)
    expect(result.verdigris).not.toBe('noble-patina')
  })
})

// ─── measureFlowing ─────────────────────────────────────

describe('measureFlowing', () => {
  it('scores rich content highly', () => {
    const result = measureFlowing(richContent)
    expect(result.grace).toBeGreaterThan(60)
    expect(result.hasHighGrace).toBe(true)
  })

  it('scores empty content below rich', () => {
    const result = measureFlowing(emptyContent)
    expect(result.grace).toBeLessThan(richFlowing)
  })

  it('detects well structured patterns', () => {
    const result = measureFlowing(richContent)
    expect(result.hasWellStructured).toBe(true)
  })

  it('counts spaghetti keywords', () => {
    const content = 'const spaghetti = 1; const tangled = 2; const messy = 3'
    const result = measureFlowing(content)
    expect(result.spaghettiCount).toBe(3)
    expect(result.hasNoSpaghetti).toBe(false)
  })

  it('detects connected patterns', () => {
    const result = measureFlowing(richContent)
    expect(result.hasConnected).toBe(true)
  })

  it('counts isolated keywords', () => {
    const content = 'const isolated = 1; const orphan = 2'
    const result = measureFlowing(content)
    expect(result.isolatedCount).toBe(2)
    expect(result.hasNoIsolated).toBe(false)
  })

  it('detects seamless code (no any)', () => {
    const result = measureFlowing(richContent)
    expect(result.hasSeamless).toBe(true)
  })

  it('detects fluid patterns', () => {
    const result = measureFlowing(richContent)
    expect(result.hasFluid).toBe(true)
  })

  it('classifies current correctly for high scores', () => {
    const result = measureFlowing(richContent)
    expect(['superconductor', 'excellent-conductor', 'proper-flow']).toContain(result.current)
  })

  it('classifies current correctly for low scores', () => {
    const result = measureFlowing(emptyContent)
    expect(result.current).not.toBe('superconductor')
  })
})

// ─── measureShaping ─────────────────────────────────────

describe('measureShaping', () => {
  it('scores rich content highly', () => {
    const result = measureShaping(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    const result = measureShaping(emptyContent)
    expect(result.precision).toBeLessThan(richShaping)
  })

  it('detects type safety', () => {
    const result = measureShaping(richContent)
    expect(result.hasTypeSafe).toBe(true)
  })

  it('counts unsafe patterns', () => {
    const content = 'var x = 1; eval("test"); var y = 2'
    const result = measureShaping(content)
    expect(result.unsafeCount).toBe(3)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('detects no unsafe in clean code', () => {
    const result = measureShaping(richContent)
    expect(result.hasNoUnsafe).toBe(true)
    expect(result.unsafeCount).toBe(0)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const vague = 3'
    const result = measureShaping(content)
    expect(result.approximateCount).toBe(3)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects exact patterns', () => {
    const result = measureShaping(richContent)
    expect(result.hasExact).toBe(true)
  })

  it('classifies craft correctly for high scores', () => {
    const result = measureShaping(richContent)
    expect(['master-smith', 'skilled-forge', 'proper-hammer']).toContain(result.craft)
  })

  it('classifies craft correctly for low scores', () => {
    const result = measureShaping(emptyContent)
    expect(result.craft).not.toBe('master-smith')
  })
})

// ─── measureWarming ─────────────────────────────────────

describe('measureWarming', () => {
  it('scores rich content highly', () => {
    const result = measureWarming(richContent)
    expect(result.endurance).toBeGreaterThan(50)
  })

  it('scores empty content below rich', () => {
    const result = measureWarming(emptyContent)
    expect(result.endurance).toBeLessThan(richWarming)
  })

  it('detects error handling', () => {
    const result = measureWarming(richContent)
    expect(result.hasErrorHandled).toBe(true)
  })

  it('counts unhandled patterns', () => {
    const content = 'const unsafe = 1; const unchecked = 2; const risky = 3'
    const result = measureWarming(content)
    expect(result.unhandledCount).toBe(3)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('detects no unhandled in clean code', () => {
    const result = measureWarming(richContent)
    expect(result.hasNoUnhandled).toBe(true)
  })

  it('counts untested patterns', () => {
    const content = 'eval("test"); new Function("x", "return x")'
    const result = measureWarming(content)
    expect(result.untestedCount).toBe(2)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects durable patterns', () => {
    const result = measureWarming(richContent)
    expect(result.hasDurable).toBe(true)
  })

  it('classifies heat correctly for high scores', () => {
    const result = measureWarming(richContent)
    expect(['eternal-flame', 'steady-furnace', 'proper-warmth', 'cooling-ember']).toContain(result.heat)
  })

  it('classifies heat correctly for low scores', () => {
    const result = measureWarming(emptyContent)
    expect(result.heat).not.toBe('eternal-flame')
  })
})

// ─── measureMastering ───────────────────────────────────

describe('measureMastering', () => {
  it('scores rich content highly', () => {
    const result = measureMastering(richContent)
    expect(result.mastery).toBeGreaterThan(60)
    expect(result.hasHighMastery).toBe(true)
  })

  it('scores empty content below rich', () => {
    const result = measureMastering(emptyContent)
    expect(result.mastery).toBeLessThan(richMastering)
  })

  it('counts hacked keywords', () => {
    const content = 'const hack = 1; const workaround = 2; const kludge = 3'
    const result = measureMastering(content)
    expect(result.hackedCount).toBe(3)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects no hacked in clean code', () => {
    const result = measureMastering(richContent)
    expect(result.hasNoHacked).toBe(true)
    expect(result.hackedCount).toBe(0)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3'
    const result = measureMastering(content)
    expect(result.shallowCount).toBe(3)
  })

  it('detects well architected patterns', () => {
    const result = measureMastering(richContent)
    expect(result.hasWellArchitected).toBe(true)
  })

  it('detects principled code (no any)', () => {
    const result = measureMastering(richContent)
    expect(result.hasPrincipled).toBe(true)
  })

  it('classifies skill correctly for high scores', () => {
    const result = measureMastering(richContent)
    expect(['ancient-master', 'veteran-craftsman', 'proper-artisan']).toContain(result.skill)
  })

  it('classifies skill correctly for low scores', () => {
    const result = measureMastering(emptyContent)
    expect(result.skill).not.toBe('ancient-master')
  })
})

// ─── analyzeCopperPanel ─────────────────────────────────

describe('analyzeCopperPanel', () => {
  it('analyzes a file correctly', () => {
    const panel = analyzeCopperPanel(richContent, 'test.ts')
    expect(panel.file).toBe('test.ts')
    expect(panel.patinaWisdom).toBeGreaterThan(0)
    expect(panel.conductiveGrace).toBeGreaterThan(0)
    expect(panel.forgePrecision).toBeGreaterThan(0)
    expect(panel.warmthEndurance).toBeGreaterThan(0)
    expect(panel.agedMastery).toBeGreaterThan(0)
    expect(panel.qualityScore).toBeGreaterThan(0)
    expect(panel.condition).toBeDefined()
  })

  it('computes quality score as weighted average', () => {
    const panel = analyzeCopperPanel(richContent, 'test.ts')
    const expected = Math.round(
      panel.patinaWisdom * 0.2 +
      panel.conductiveGrace * 0.2 +
      panel.forgePrecision * 0.2 +
      panel.warmthEndurance * 0.2 +
      panel.agedMastery * 0.2,
    )
    expect(panel.qualityScore).toBe(expected)
  })

  it('includes all measure objects', () => {
    const panel = analyzeCopperPanel(richContent, 'test.ts')
    expect(panel.aging).toBeDefined()
    expect(panel.flowing).toBeDefined()
    expect(panel.shaping).toBeDefined()
    expect(panel.warming).toBeDefined()
    expect(panel.mastering).toBeDefined()
  })

  it('classifies empty content as non-masterpiece', () => {
    const panel = analyzeCopperPanel(emptyContent, 'empty.ts')
    expect(panel.qualityScore).toBeLessThan(60)
    expect(panel.condition).not.toBe('copper-masterpiece')
  })
})

// ─── analyzeCopperSpire ─────────────────────────────────

describe('analyzeCopperSpire', () => {
  it('handles empty panels', () => {
    const spire = analyzeCopperSpire([], 'empty-dir')
    expect(spire.panels).toHaveLength(0)
    expect(spire.spireType).toBe('no-spire')
    expect(spire.condition).toBe('void')
  })

  it('analyzes a spire with panels', () => {
    const panel = analyzeCopperPanel(richContent, 'src/test.ts')
    const spire = analyzeCopperSpire([panel], 'src')
    expect(spire.directory).toBe('src')
    expect(spire.panels).toHaveLength(1)
    expect(spire.avgPatina).toBeGreaterThan(0)
  })

  it('counts copper masterpieces', () => {
    const panel: CopperPanel = {
      file: 'a.ts',
      patinaWisdom: 95, conductiveGrace: 95, forgePrecision: 95, warmthEndurance: 95, agedMastery: 95,
      aging: {} as CopperPanel['aging'],
      flowing: {} as CopperPanel['flowing'],
      shaping: {} as CopperPanel['shaping'],
      warming: {} as CopperPanel['warming'],
      mastering: {} as CopperPanel['mastering'],
      condition: 'copper-masterpiece',
      qualityScore: 95,
    }
    const spire = analyzeCopperSpire([panel], 'src')
    expect(spire.copperMasterpieceCount).toBe(1)
  })

  it('counts void panels', () => {
    const panel: CopperPanel = {
      file: 'a.ts',
      patinaWisdom: 0, conductiveGrace: 0, forgePrecision: 0, warmthEndurance: 0, agedMastery: 0,
      aging: {} as CopperPanel['aging'],
      flowing: {} as CopperPanel['flowing'],
      shaping: {} as CopperPanel['shaping'],
      warming: {} as CopperPanel['warming'],
      mastering: {} as CopperPanel['mastering'],
      condition: 'void',
      qualityScore: 0,
    }
    const spire = analyzeCopperSpire([panel], 'src')
    expect(spire.voidCount).toBe(1)
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyPanelCondition', () => {
  it('classifies copper-masterpiece at 90+', () => {
    expect(classifyPanelCondition(90)).toBe('copper-masterpiece')
    expect(classifyPanelCondition(100)).toBe('copper-masterpiece')
  })

  it('classifies verdigris-gem at 75-89', () => {
    expect(classifyPanelCondition(75)).toBe('verdigris-gem')
    expect(classifyPanelCondition(89)).toBe('verdigris-gem')
  })

  it('classifies proper-copper at 60-74', () => {
    expect(classifyPanelCondition(60)).toBe('proper-copper')
    expect(classifyPanelCondition(74)).toBe('proper-copper')
  })

  it('classifies tarnished-metal at 40-59', () => {
    expect(classifyPanelCondition(40)).toBe('tarnished-metal')
    expect(classifyPanelCondition(59)).toBe('tarnished-metal')
  })

  it('classifies raw-ore at 20-39', () => {
    expect(classifyPanelCondition(20)).toBe('raw-ore')
    expect(classifyPanelCondition(39)).toBe('raw-ore')
  })

  it('classifies void below 20', () => {
    expect(classifyPanelCondition(0)).toBe('void')
    expect(classifyPanelCondition(19)).toBe('void')
  })
})

describe('classifySpireType', () => {
  it('returns no-spire for empty panels', () => {
    expect(classifySpireType([])).toBe('no-spire')
  })

  it('classifies grand-cathedral for high avg', () => {
    const panels = [{ qualityScore: 90 } as CopperPanel]
    expect(classifySpireType(panels)).toBe('grand-cathedral')
  })

  it('classifies proper-church for 70-84 avg', () => {
    const panels = [{ qualityScore: 75 } as CopperPanel]
    expect(classifySpireType(panels)).toBe('proper-church')
  })

  it('classifies chapel for 55-69 avg', () => {
    const panels = [{ qualityScore: 60 } as CopperPanel]
    expect(classifySpireType(panels)).toBe('chapel')
  })

  it('classifies shrine for 35-54 avg', () => {
    const panels = [{ qualityScore: 40 } as CopperPanel]
    expect(classifySpireType(panels)).toBe('shrine')
  })

  it('classifies ruin for low avg', () => {
    const panels = [{ qualityScore: 10 } as CopperPanel]
    expect(classifySpireType(panels)).toBe('ruin')
  })
})

describe('classifySpireCondition', () => {
  it('classifies copper-palace at 85+', () => {
    expect(classifySpireCondition(85)).toBe('copper-palace')
    expect(classifySpireCondition(100)).toBe('copper-palace')
  })

  it('classifies green-dome at 70-84', () => {
    expect(classifySpireCondition(70)).toBe('green-dome')
    expect(classifySpireCondition(84)).toBe('green-dome')
  })

  it('classifies proper-temple at 55-69', () => {
    expect(classifySpireCondition(55)).toBe('proper-temple')
    expect(classifySpireCondition(69)).toBe('proper-temple')
  })

  it('classifies tin-roof at 35-54', () => {
    expect(classifySpireCondition(35)).toBe('tin-roof')
    expect(classifySpireCondition(54)).toBe('tin-roof')
  })

  it('classifies empty-lot at 15-34', () => {
    expect(classifySpireCondition(15)).toBe('empty-lot')
    expect(classifySpireCondition(34)).toBe('empty-lot')
  })

  it('classifies void below 15', () => {
    expect(classifySpireCondition(0)).toBe('void')
    expect(classifySpireCondition(14)).toBe('void')
  })
})

describe('classifyArchitectGrade', () => {
  it('classifies master-architect at 80+', () => {
    expect(classifyArchitectGrade(80)).toBe('master-architect')
    expect(classifyArchitectGrade(100)).toBe('master-architect')
  })

  it('classifies cathedral-builder at 65-79', () => {
    expect(classifyArchitectGrade(65)).toBe('cathedral-builder')
    expect(classifyArchitectGrade(79)).toBe('cathedral-builder')
  })

  it('classifies proper-mason at 50-64', () => {
    expect(classifyArchitectGrade(50)).toBe('proper-mason')
    expect(classifyArchitectGrade(64)).toBe('proper-mason')
  })

  it('classifies apprentice at 35-49', () => {
    expect(classifyArchitectGrade(35)).toBe('apprentice')
    expect(classifyArchitectGrade(49)).toBe('apprentice')
  })

  it('classifies novice at 20-34', () => {
    expect(classifyArchitectGrade(20)).toBe('novice')
    expect(classifyArchitectGrade(34)).toBe('novice')
  })

  it('classifies stone-carrier below 20', () => {
    expect(classifyArchitectGrade(0)).toBe('stone-carrier')
    expect(classifyArchitectGrade(19)).toBe('stone-carrier')
  })
})

// ─── buildCopperCathedralResult ──────────────────────────

describe('buildCopperCathedralResult', () => {
  it('handles empty input', async () => {
    const result = await buildCopperCathedralResult([], [])
    expect(result.panels).toHaveLength(0)
    expect(result.spires).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallWarmth).toBe(0)
    expect(result.stats.bestPanel).toBe('')
  })

  it('analyzes single file', async () => {
    const result = await buildCopperCathedralResult(['test.ts'], [richContent])
    expect(result.panels).toHaveLength(1)
    expect(result.panels[0].file).toBe('test.ts')
    expect(result.spires).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory', async () => {
    const result = await buildCopperCathedralResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.spires).toHaveLength(2)
  })

  it('computes average scores correctly', async () => {
    const result = await buildCopperCathedralResult(['a.ts'], [richContent])
    expect(result.stats.avgPatinaWisdom).toBe(result.panels[0].patinaWisdom)
    expect(result.stats.avgConductiveGrace).toBe(result.panels[0].conductiveGrace)
    expect(result.stats.avgForgePrecision).toBe(result.panels[0].forgePrecision)
    expect(result.stats.avgWarmthEndurance).toBe(result.panels[0].warmthEndurance)
    expect(result.stats.avgAgedMastery).toBe(result.panels[0].agedMastery)
  })

  it('identifies best panel', async () => {
    const result = await buildCopperCathedralResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestPanel).toBe('high.ts')
  })

  it('computes nave overview', async () => {
    const result = await buildCopperCathedralResult(['a.ts'], [richContent])
    expect(result.nave.avgPatina).toBe(result.panels[0].patinaWisdom)
    expect(result.nave.avgPrecision).toBe(result.panels[0].forgePrecision)
    expect(result.nave.avgMastery).toBe(result.panels[0].agedMastery)
    expect(result.nave.overallWarmth).toBe(result.stats.overallWarmth)
  })

  it('sets isCopper when overallWarmth >= 60', async () => {
    const result = await buildCopperCathedralResult(['a.ts'], [richContent])
    if (result.stats.overallWarmth >= 60) {
      expect(result.nave.isCopper).toBe(true)
    }
  })

  it('finds wisest, most graceful, most precise, most enduring, most masterful', async () => {
    const result = await buildCopperCathedralResult(['a.ts'], [richContent])
    expect(result.stats.wisest).toBe('a.ts')
    expect(result.stats.mostGraceful).toBe('a.ts')
    expect(result.stats.mostPrecise).toBe('a.ts')
    expect(result.stats.mostEnduring).toBe('a.ts')
    expect(result.stats.mostMasterful).toBe('a.ts')
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all scores >= 90', () => {
    const stats = makeStats({
      avgPatinaWisdom: 90, avgConductiveGrace: 90, avgForgePrecision: 90,
      avgWarmthEndurance: 90, avgAgedMastery: 90, overallWarmth: 90,
    })
    const recs = generateRecommendations([], [], { avgPatina: 90, avgPrecision: 90, avgMastery: 90, isCopper: true, overallWarmth: 90 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('copper cathedral stands eternal')
  })

  it('recommends developing patina when below 60', () => {
    const stats = makeStats({ avgPatinaWisdom: 40, avgConductiveGrace: 90, avgForgePrecision: 90, avgWarmthEndurance: 90, avgAgedMastery: 90 })
    const recs = generateRecommendations([], [], { avgPatina: 40, avgPrecision: 90, avgMastery: 90, isCopper: true, overallWarmth: 70 }, stats)
    expect(recs.some((r) => r.includes('Develop patina wisdom'))).toBe(true)
  })

  it('recommends improving grace when below 60', () => {
    const stats = makeStats({ avgPatinaWisdom: 90, avgConductiveGrace: 40, avgForgePrecision: 90, avgWarmthEndurance: 90, avgAgedMastery: 90 })
    const recs = generateRecommendations([], [], { avgPatina: 90, avgPrecision: 90, avgMastery: 90, isCopper: true, overallWarmth: 70 }, stats)
    expect(recs.some((r) => r.includes('Improve conductive grace'))).toBe(true)
  })

  it('recommends refining forge when below 60', () => {
    const stats = makeStats({ avgPatinaWisdom: 90, avgConductiveGrace: 90, avgForgePrecision: 40, avgWarmthEndurance: 90, avgAgedMastery: 90 })
    const recs = generateRecommendations([], [], { avgPatina: 90, avgPrecision: 40, avgMastery: 90, isCopper: true, overallWarmth: 70 }, stats)
    expect(recs.some((r) => r.includes('Refine forge precision'))).toBe(true)
  })

  it('recommends strengthening warmth when below 60', () => {
    const stats = makeStats({ avgPatinaWisdom: 90, avgConductiveGrace: 90, avgForgePrecision: 90, avgWarmthEndurance: 40, avgAgedMastery: 90 })
    const recs = generateRecommendations([], [], { avgPatina: 90, avgPrecision: 90, avgMastery: 90, isCopper: false, overallWarmth: 70 }, stats)
    expect(recs.some((r) => r.includes('Strengthen warmth endurance'))).toBe(true)
  })

  it('recommends deepening mastery when below 60', () => {
    const stats = makeStats({ avgPatinaWisdom: 90, avgConductiveGrace: 90, avgForgePrecision: 90, avgWarmthEndurance: 90, avgAgedMastery: 40 })
    const recs = generateRecommendations([], [], { avgPatina: 90, avgPrecision: 90, avgMastery: 40, isCopper: true, overallWarmth: 70 }, stats)
    expect(recs.some((r) => r.includes('Deepen aged mastery'))).toBe(true)
  })

  it('recommends cathedral crumbles when warmth < 40', () => {
    const stats = makeStats({ overallWarmth: 30, avgPatinaWisdom: 30, avgConductiveGrace: 30, avgForgePrecision: 30, avgWarmthEndurance: 30, avgAgedMastery: 30 })
    const recs = generateRecommendations([], [], { avgPatina: 30, avgPrecision: 30, avgMastery: 30, isCopper: false, overallWarmth: 30 }, stats)
    expect(recs.some((r) => r.includes('cathedral crumbles'))).toBe(true)
  })

  it('lists void panels by name when <= 5', () => {
    const stats = makeStats({ avgPatinaWisdom: 70, avgConductiveGrace: 70, avgForgePrecision: 70, avgWarmthEndurance: 70, avgAgedMastery: 70 })
    const panels = [
      { file: 'a.ts', condition: 'void' } as CopperPanel,
      { file: 'b.ts', condition: 'void' } as CopperPanel,
    ]
    const recs = generateRecommendations(panels, [], { avgPatina: 70, avgPrecision: 70, avgMastery: 70, isCopper: true, overallWarmth: 70 }, stats)
    expect(recs.some((r) => r.includes('a.ts') && r.includes('b.ts'))).toBe(true)
  })

  it('summarizes void panels when > 5', () => {
    const stats = makeStats({ avgPatinaWisdom: 70, avgConductiveGrace: 70, avgForgePrecision: 70, avgWarmthEndurance: 70, avgAgedMastery: 70 })
    const panels = Array.from({ length: 6 }, (_, i) => ({ file: `${i}.ts`, condition: 'void' } as CopperPanel))
    const recs = generateRecommendations(panels, [], { avgPatina: 70, avgPrecision: 70, avgMastery: 70, isCopper: true, overallWarmth: 70 }, stats)
    expect(recs.some((r) => r.includes('6 damaged panels'))).toBe(true)
  })

  it('reports all spires are tin roofs', () => {
    const stats = makeStats({ avgPatinaWisdom: 70, avgConductiveGrace: 70, avgForgePrecision: 70, avgWarmthEndurance: 70, avgAgedMastery: 70 })
    const spires = [{ condition: 'tin-roof', directory: 'src' } as import('../src/commands/copper-cathedral-helpers.js').CopperSpire]
    const recs = generateRecommendations([], spires, { avgPatina: 70, avgPrecision: 70, avgMastery: 70, isCopper: true, overallWarmth: 70 }, stats)
    expect(recs.some((r) => r.includes('tin roofs'))).toBe(true)
  })

  it('returns default praise when all is well', () => {
    const stats = makeStats({ avgPatinaWisdom: 90, avgConductiveGrace: 90, avgForgePrecision: 90, avgWarmthEndurance: 90, avgAgedMastery: 90, overallWarmth: 90 })
    const recs = generateRecommendations([], [], { avgPatina: 90, avgPrecision: 90, avgMastery: 90, isCopper: true, overallWarmth: 90 }, stats)
    expect(recs[0]).toContain('copper cathedral stands eternal')
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for all ranges', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(25)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(75)).toBe('string')
    expect(typeof colorScore(95)).toBe('string')
  })
})

describe('colorPanelCondition', () => {
  it('returns colored string for all conditions', () => {
    const conditions = ['copper-masterpiece', 'verdigris-gem', 'proper-copper', 'tarnished-metal', 'raw-ore', 'void']
    for (const c of conditions) {
      expect(typeof colorPanelCondition(c)).toBe('string')
    }
  })

  it('handles unknown condition', () => {
    expect(typeof colorPanelCondition('unknown')).toBe('string')
  })
})

describe('colorSpireType', () => {
  it('returns colored string for all spire types', () => {
    const types = ['grand-cathedral', 'proper-church', 'chapel', 'shrine', 'ruin', 'no-spire']
    for (const t of types) {
      expect(typeof colorSpireType(t)).toBe('string')
    }
  })
})

describe('colorSpireCondition', () => {
  it('returns colored string for all spire conditions', () => {
    const conditions = ['copper-palace', 'green-dome', 'proper-temple', 'tin-roof', 'empty-lot', 'void']
    for (const c of conditions) {
      expect(typeof colorSpireCondition(c)).toBe('string')
    }
  })
})

describe('colorArchitectGrade', () => {
  it('returns colored string for all grades', () => {
    const grades = ['master-architect', 'cathedral-builder', 'proper-mason', 'apprentice', 'novice', 'stone-carrier']
    for (const g of grades) {
      expect(typeof colorArchitectGrade(g)).toBe('string')
    }
  })
})

describe('formatPanelTable', () => {
  it('formats a panel table', () => {
    const panel = analyzeCopperPanel(richContent, 'test.ts')
    const output = formatPanelTable(panel)
    expect(output).toContain('Copper Panel: test.ts')
    expect(output).toContain('Patina Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatPanelsTable', () => {
  it('formats empty panels message', () => {
    expect(formatPanelsTable([])).toContain('No copper panels found')
  })

  it('formats panels list', () => {
    const panels = [analyzeCopperPanel(richContent, 'a.ts'), analyzeCopperPanel(richContent, 'b.ts')]
    const output = formatPanelsTable(panels)
    expect(output).toContain('Copper Panels')
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatSpireTable', () => {
  it('formats a spire table', () => {
    const spire = analyzeCopperSpire([analyzeCopperPanel(richContent, 'test.ts')], 'src')
    const output = formatSpireTable(spire)
    expect(output).toContain('Copper Spire: src')
    expect(output).toContain('Panels')
  })
})

describe('formatSpiresTable', () => {
  it('formats empty spires message', () => {
    expect(formatSpiresTable([])).toContain('No copper spires found')
  })

  it('formats spires list', () => {
    const spire = analyzeCopperSpire([analyzeCopperPanel(richContent, 'test.ts')], 'src')
    const output = formatSpiresTable([spire])
    expect(output).toContain('Copper Spires')
  })
})

describe('formatStatsTable', () => {
  it('formats stats table', () => {
    const stats = makeStats()
    const output = formatStatsTable(stats)
    expect(output).toContain('Copper Cathedral Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Architect Grade')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations list', () => {
    const output = formatRecommendations(['Fix X', 'Improve Y'])
    expect(output).toContain('Recommendations')
    expect(output).toContain('Fix X')
    expect(output).toContain('Improve Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result table', async () => {
    const result = await buildCopperCathedralResult(['test.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Copper Cathedral Analysis')
    expect(output).toContain('Nave Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as JSON', async () => {
    const result = await buildCopperCathedralResult(['test.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.panels).toHaveLength(1)
    expect(parsed.nave).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
