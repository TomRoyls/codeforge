import { describe, expect, it } from 'vitest'

import {
  analyzeCaveChamber,
  analyzeCrystalFormation,
  buildCrystalCaveResult,
  classifyChamberCondition,
  classifyChamberType,
  classifyCondition,
  classifySpelunkerGrade,
  generateRecommendations,
  measureClarity,
  measureFormation,
  measureGeode,
  measureLuminescence,
  measurePurity,
  measureWonder,
} from '../src/commands/crystal-cave-helpers.js'

import {
  chamberColor,
  clarityColor,
  conditionColor,
  formationColor,
  formatCrystalCaveJson,
  formatCrystalCaveTable,
  geodeColor,
  gradeColor,
  luminescenceColor,
  purityColor,
  scoreColor,
  wonderColor,
} from '../src/commands/crystal-cave-format-helpers.js'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const RICH_CONTENT = `
export interface Foo { x: number }
export type Bar = Foo | null
export class Baz implements Foo {
  private x: number = 0
  constructor(x: number) { this.x = x }
  /** Docs */
  async getValue(): Promise<number> {
    try { return this.x } catch { return 0 }
  }
}
export function add<T>(a: T, b: T): T { return a }
export const mul = (a: number, b: number) => a * b
export enum Color { Red, Green, Blue }
export { Foo } from './foo'
// TODO: fix later
`

const EMPTY_CONTENT = ''

const MEDIUM_CONTENT = 'const x = 1\n'

// ─── measureClarity ──────────────────────────────────────────────────────────

describe('measureClarity', () => {
  it('returns high clarity for rich content', () => {
    const result = measureClarity(RICH_CONTENT)
    expect(result.level).toBe(92)
    expect(result.grade).toBe('quartz-clear')
    expect(result.hasHighClarity).toBe(true)
    expect(result.hasTransparency).toBe(true)
    expect(result.hasNoInclusions).toBe(true)
    expect(result.hasProperRefraction).toBe(true)
    expect(result.hasNoFractures).toBe(false)
    expect(result.hasDispersion).toBe(true)
    expect(result.hasNoInternalReflections).toBe(true)
    expect(result.hasScintillation).toBe(true)
    expect(result.hasPerfectTermination).toBe(true)
    expect(result.inclusionCount).toBe(0)
    expect(result.fractureCount).toBe(1)
  })

  it('returns low clarity for empty content', () => {
    const result = measureClarity(EMPTY_CONTENT)
    expect(result.level).toBe(38)
    expect(result.grade).toBe('opaque')
    expect(result.hasHighClarity).toBe(false)
    expect(result.hasTransparency).toBe(false)
    expect(result.hasNoInclusions).toBe(true)
    expect(result.hasNoFractures).toBe(true)
    expect(result.inclusionCount).toBe(0)
  })

  it('returns opaque grade for medium content', () => {
    const result = measureClarity(MEDIUM_CONTENT)
    expect(result.level).toBe(38)
    expect(result.grade).toBe('opaque')
    expect(result.hasHighClarity).toBe(false)
  })
})

// ─── measureFormation ────────────────────────────────────────────────────────

describe('measureFormation', () => {
  it('returns high quality for rich content', () => {
    const result = measureFormation(RICH_CONTENT)
    expect(result.quality).toBe(90)
    expect(result.type).toBe('calcite')
    expect(result.hasProperStructure).toBe(true)
    expect(result.hasCrystalHabits).toBe(true)
    expect(result.hasProperGrowth).toBe(true)
    expect(result.hasNoMalformation).toBe(false)
    expect(result.hasGeometricPrecision).toBe(true)
    expect(result.hasNoTwinning).toBe(true)
    expect(result.hasPerfectSymmetry).toBe(true)
    expect(result.malformationCount).toBe(1)
    expect(result.twinningCount).toBe(0)
  })

  it('returns low quality for empty content', () => {
    const result = measureFormation(EMPTY_CONTENT)
    expect(result.quality).toBe(40)
    expect(result.type).toBe('flowstone')
    expect(result.hasProperStructure).toBe(false)
    expect(result.hasNoMalformation).toBe(true)
  })

  it('returns flowstone for medium content', () => {
    const result = measureFormation(MEDIUM_CONTENT)
    expect(result.quality).toBe(40)
    expect(result.type).toBe('flowstone')
  })
})

// ─── measureLuminescence ─────────────────────────────────────────────────────

describe('measureLuminescence', () => {
  it('returns high luminescence for rich content', () => {
    const result = measureLuminescence(RICH_CONTENT)
    expect(result.level).toBe(95)
    expect(result.type).toBe('fluorescent')
    expect(result.hasHighLuminescence).toBe(true)
    expect(result.hasProperGlow).toBe(true)
    expect(result.hasNoDarkZones).toBe(true)
    expect(result.hasProperExcitation).toBe(true)
    expect(result.hasNoShadow).toBe(true)
    expect(result.hasAfterglow).toBe(true)
    expect(result.hasProperWavelength).toBe(true)
    expect(result.darkZoneCount).toBe(0)
    expect(result.quenchingCount).toBe(0)
  })

  it('returns low luminescence for empty content', () => {
    const result = measureLuminescence(EMPTY_CONTENT)
    expect(result.level).toBe(37)
    expect(result.type).toBe('dim')
    expect(result.hasHighLuminescence).toBe(false)
    expect(result.hasProperGlow).toBe(false)
  })

  it('returns dim for medium content', () => {
    const result = measureLuminescence(MEDIUM_CONTENT)
    expect(result.level).toBe(37)
    expect(result.type).toBe('dim')
  })
})

// ─── measureGeode ────────────────────────────────────────────────────────────

describe('measureGeode', () => {
  it('returns high depth for rich content', () => {
    const result = measureGeode(RICH_CONTENT)
    expect(result.depth).toBe(95)
    expect(result.interior).toBe('hollow')
    expect(result.hasDeepContent).toBe(true)
    expect(result.hasHiddenBeauty).toBe(true)
    expect(result.hasProperCavity).toBe(true)
    expect(result.hasInnerCrystals).toBe(true)
    expect(result.hasNoDeadSpace).toBe(false)
    expect(result.hasProperFormation).toBe(true)
    expect(result.hasNoCollapse).toBe(true)
    expect(result.hasNoFalseExterior).toBe(true)
    expect(result.hasTreasure).toBe(true)
    expect(result.deadSpaceCount).toBe(1)
    expect(result.collapseCount).toBe(0)
  })

  it('returns low depth for empty content', () => {
    const result = measureGeode(EMPTY_CONTENT)
    expect(result.depth).toBe(30)
    expect(result.interior).toBe('empty')
    expect(result.hasDeepContent).toBe(false)
  })

  it('returns empty for medium content', () => {
    const result = measureGeode(MEDIUM_CONTENT)
    expect(result.depth).toBe(30)
    expect(result.interior).toBe('empty')
  })
})

// ─── measurePurity ───────────────────────────────────────────────────────────

describe('measurePurity', () => {
  it('returns high purity for rich content', () => {
    const result = measurePurity(RICH_CONTENT)
    expect(result.level).toBe(90)
    expect(result.state).toBe('pure')
    expect(result.hasHighPurity).toBe(true)
    expect(result.hasProperComposition).toBe(true)
    expect(result.hasNoForeignMatter).toBe(true)
    expect(result.hasChemicalStability).toBe(true)
    expect(result.hasNoOxidation).toBe(true)
    expect(result.hasProperCrystallization).toBe(true)
    expect(result.contaminationCount).toBe(1)
    expect(result.segregationCount).toBe(1)
  })

  it('returns low purity for empty content', () => {
    const result = measurePurity(EMPTY_CONTENT)
    expect(result.level).toBe(40)
    expect(result.state).toBe('contaminated')
    expect(result.hasHighPurity).toBe(false)
  })

  it('returns contaminated for medium content', () => {
    const result = measurePurity(MEDIUM_CONTENT)
    expect(result.level).toBe(40)
    expect(result.state).toBe('contaminated')
  })
})

// ─── measureWonder ───────────────────────────────────────────────────────────

describe('measureWonder', () => {
  it('returns high wonder for rich content', () => {
    const result = measureWonder(RICH_CONTENT)
    expect(result.score).toBe(90)
    expect(result.impact).toBe('beautiful')
    expect(result.hasHighWonder).toBe(true)
    expect(result.hasAwe).toBe(true)
    expect(result.hasBeauty).toBe(true)
    expect(result.hasNoMediocrity).toBe(false)
    expect(result.hasNaturalWonder).toBe(true)
    expect(result.hasNoArtificiality).toBe(true)
    expect(result.hasInspiring).toBe(true)
    expect(result.hasNoDullness).toBe(true)
    expect(result.hasSpectacular).toBe(true)
    expect(result.hasNoBoredom).toBe(true)
    expect(result.hasMemorable).toBe(true)
    expect(result.mediocrityCount).toBe(1)
    expect(result.dullnessCount).toBe(0)
  })

  it('returns low wonder for empty content', () => {
    const result = measureWonder(EMPTY_CONTENT)
    expect(result.score).toBe(40)
    expect(result.impact).toBe('ordinary')
    expect(result.hasHighWonder).toBe(false)
  })

  it('returns ordinary for medium content', () => {
    const result = measureWonder(MEDIUM_CONTENT)
    expect(result.score).toBe(40)
    expect(result.impact).toBe('ordinary')
  })
})

// ─── analyzeCrystalFormation ─────────────────────────────────────────────────

describe('analyzeCrystalFormation', () => {
  it('returns naica-mine for rich content', () => {
    const result = analyzeCrystalFormation(RICH_CONTENT, 'rich.ts')
    expect(result.crystalClarity).toBe(92)
    expect(result.formationQuality).toBe(90)
    expect(result.luminescence.level).toBe(95)
    expect(result.luminescence.type).toBe('fluorescent')
    expect(result.geodeDepth).toBe(95)
    expect(result.mineralPurity).toBe(90)
    expect(result.caveWonder).toBe(90)
    expect(result.qualityScore).toBe(92)
    expect(result.condition).toBe('naica-mine')
    expect(result.file).toBe('rich.ts')
  })

  it('returns geode-collection for empty content', () => {
    const result = analyzeCrystalFormation(EMPTY_CONTENT, 'empty.ts')
    expect(result.crystalClarity).toBe(38)
    expect(result.formationQuality).toBe(40)
    expect(result.luminescence.level).toBe(37)
    expect(result.geodeDepth).toBe(30)
    expect(result.mineralPurity).toBe(40)
    expect(result.caveWonder).toBe(40)
    expect(result.qualityScore).toBe(37)
    expect(result.condition).toBe('geode-collection')
  })

  it('returns geode-collection for medium content', () => {
    const result = analyzeCrystalFormation(MEDIUM_CONTENT, 'medium.ts')
    expect(result.qualityScore).toBe(37)
    expect(result.condition).toBe('geode-collection')
  })
})

// ─── classifyCondition ───────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies naica-mine for 80+', () => {
    const f = { qualityScore: 80 } as any
    expect(classifyCondition(f)).toBe('naica-mine')
  })

  it('classifies crystal-cathedral for 65-79', () => {
    const f = { qualityScore: 65 } as any
    expect(classifyCondition(f)).toBe('crystal-cathedral')
  })

  it('classifies amethyst-cave for 50-64', () => {
    const f = { qualityScore: 50 } as any
    expect(classifyCondition(f)).toBe('amethyst-cave')
  })

  it('classifies geode-collection for 35-49', () => {
    const f = { qualityScore: 35 } as any
    expect(classifyCondition(f)).toBe('geode-collection')
  })

  it('classifies rock-shop for 20-34', () => {
    const f = { qualityScore: 20 } as any
    expect(classifyCondition(f)).toBe('rock-shop')
  })

  it('classifies gravel-pit for <20', () => {
    const f = { qualityScore: 10 } as any
    expect(classifyCondition(f)).toBe('gravel-pit')
  })
})

// ─── classifyChamberType ─────────────────────────────────────────────────────

describe('classifyChamberType', () => {
  it('returns mud-cave for empty formations', () => {
    expect(classifyChamberType([])).toBe('mud-cave')
  })

  it('returns grand-cathedral for high avg with naica count', () => {
    const formations = Array.from({ length: 5 }, () => ({
      qualityScore: 90, condition: 'naica-mine',
    }) as any)
    expect(classifyChamberType(formations)).toBe('grand-cathedral')
  })

  it('returns crystal-gallery for avg >= 60', () => {
    const formations = [{ qualityScore: 60, condition: 'geode-collection' } as any]
    expect(classifyChamberType(formations)).toBe('crystal-gallery')
  })

  it('returns geode-room for avg >= 45', () => {
    const formations = [{ qualityScore: 45, condition: 'geode-collection' } as any]
    expect(classifyChamberType(formations)).toBe('geode-room')
  })

  it('returns flowstone-chamber for avg >= 30', () => {
    const formations = [{ qualityScore: 30, condition: 'gravel-pit' } as any]
    expect(classifyChamberType(formations)).toBe('flowstone-chamber')
  })

  it('returns dripping-cave for avg >= 15', () => {
    const formations = [{ qualityScore: 15, condition: 'gravel-pit' } as any]
    expect(classifyChamberType(formations)).toBe('dripping-cave')
  })

  it('returns mud-cave for avg < 15', () => {
    const formations = [{ qualityScore: 5, condition: 'gravel-pit' } as any]
    expect(classifyChamberType(formations)).toBe('mud-cave')
  })
})

// ─── classifyChamberCondition ────────────────────────────────────────────────

describe('classifyChamberCondition', () => {
  it('classifies natural-wonder for 80+', () => {
    expect(classifyChamberCondition(80)).toBe('natural-wonder')
  })
  it('classifies show-cave for 65-79', () => {
    expect(classifyChamberCondition(65)).toBe('show-cave')
  })
  it('classifies wild-cave for 50-64', () => {
    expect(classifyChamberCondition(50)).toBe('wild-cave')
  })
  it('classifies mine-tunnel for 35-49', () => {
    expect(classifyChamberCondition(35)).toBe('mine-tunnel')
  })
  it('classifies basement for 20-34', () => {
    expect(classifyChamberCondition(20)).toBe('basement')
  })
  it('classifies pothole for <20', () => {
    expect(classifyChamberCondition(10)).toBe('pothole')
  })
})

// ─── classifySpelunkerGrade ──────────────────────────────────────────────────

describe('classifySpelunkerGrade', () => {
  it('returns master-spelunker for 80+', () => {
    expect(classifySpelunkerGrade(80)).toBe('master-spelunker')
  })
  it('returns geologist for 65-79', () => {
    expect(classifySpelunkerGrade(65)).toBe('geologist')
  })
  it('returns crystallographer for 50-64', () => {
    expect(classifySpelunkerGrade(50)).toBe('crystallographer')
  })
  it('returns collector for 35-49', () => {
    expect(classifySpelunkerGrade(35)).toBe('collector')
  })
  it('returns tourist for 20-34', () => {
    expect(classifySpelunkerGrade(20)).toBe('tourist')
  })
  it('returns surface-dweller for <20', () => {
    expect(classifySpelunkerGrade(10)).toBe('surface-dweller')
  })
})

// ─── analyzeCaveChamber ──────────────────────────────────────────────────────

describe('analyzeCaveChamber', () => {
  it('returns mud-cave for empty formations', () => {
    const result = analyzeCaveChamber([], 'empty-dir')
    expect(result.directory).toBe('empty-dir')
    expect(result.formations).toEqual([])
    expect(result.avgClarity).toBe(0)
    expect(result.avgFormation).toBe(0)
    expect(result.avgWonder).toBe(0)
    expect(result.naicaCount).toBe(0)
    expect(result.gravelCount).toBe(0)
    expect(result.clearCount).toBe(0)
    expect(result.wonderCount).toBe(0)
    expect(result.chamberType).toBe('mud-cave')
    expect(result.condition).toBe('pothole')
  })

  it('analyzes chamber with formations', () => {
    const f1 = analyzeCrystalFormation(RICH_CONTENT, 'rich.ts')
    const result = analyzeCaveChamber([f1], 'src')
    expect(result.avgClarity).toBe(92)
    expect(result.avgFormation).toBe(90)
    expect(result.avgWonder).toBe(90)
    expect(result.naicaCount).toBe(1)
    expect(result.gravelCount).toBe(0)
    expect(result.clearCount).toBe(1)
    expect(result.wonderCount).toBe(1)
  })
})

// ─── buildCrystalCaveResult ──────────────────────────────────────────────────

describe('buildCrystalCaveResult', () => {
  it('returns empty result for no files', () => {
    const result = buildCrystalCaveResult([], [])
    expect(result.formations).toEqual([])
    expect(result.chambers).toEqual([])
    expect(result.cavern.overallWonder).toBe(0)
    expect(result.cavern.isMagnificent).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalChambers).toBe(0)
    expect(result.stats.spelunkerGrade).toBe('surface-dweller')
  })

  it('returns correct stats for rich + medium files', () => {
    const result = buildCrystalCaveResult(
      ['rich.ts', 'medium.ts'],
      [RICH_CONTENT, MEDIUM_CONTENT],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalChambers).toBe(1)
    expect(result.stats.avgCrystalClarity).toBe(65)
    expect(result.stats.avgFormationQuality).toBe(65)
    expect(result.stats.avgLuminescence).toBe(66)
    expect(result.stats.avgGeodeDepth).toBe(63)
    expect(result.stats.avgMineralPurity).toBe(65)
    expect(result.stats.avgCaveWonder).toBe(65)
    expect(result.stats.overallWonder).toBe(65)
    expect(result.stats.spelunkerGrade).toBe('geologist')
    expect(result.stats.naicaMineCount).toBe(1)
    expect(result.stats.geodeCollectionCount).toBe(1)
    expect(result.stats.bestFormation).toBe('rich.ts')
    expect(result.stats.clearest).toBe('rich.ts')
    expect(result.stats.bestFormed).toBe('rich.ts')
    expect(result.stats.mostLuminous).toBe('rich.ts')
    expect(result.stats.deepest).toBe('rich.ts')
    expect(result.stats.mostWonderful).toBe('rich.ts')
    expect(result.cavern.overallWonder).toBe(65)
    expect(result.cavern.isMagnificent).toBe(true)
  })

  it('returns magnificent recommendation for high scores', () => {
    const result = buildCrystalCaveResult(['rich.ts'], [RICH_CONTENT])
    expect(result.recommendations).toContain('Magnificent crystal cave achieved — your formations are a natural wonder')
  })

  it('computes chambers by directory', () => {
    const result = buildCrystalCaveResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH_CONTENT, MEDIUM_CONTENT, MEDIUM_CONTENT],
    )
    expect(result.chambers.length).toBe(2)
  })
})

// ─── generateRecommendations ─────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends improving clarity when low', () => {
    const formations = [analyzeCrystalFormation(EMPTY_CONTENT, 'empty.ts')]
    const chambers: any[] = []
    const cavern = { avgClarity: 30, avgFormation: 50, avgWonder: 50, isMagnificent: false, overallWonder: 40 }
    const stats = {
      totalFiles: 1, totalChambers: 0, avgCrystalClarity: 30, avgFormationQuality: 50,
      avgLuminescence: 50, avgGeodeDepth: 50, avgMineralPurity: 50, avgCaveWonder: 50,
      naicaMineCount: 0, crystalCathedralCount: 0, amethystCaveCount: 0,
      geodeCollectionCount: 1, rockShopCount: 0, gravelPitCount: 0,
      hasHighClarityCount: 0, hasProperStructureCount: 0, hasHighLuminescenceCount: 0,
      hasDeepContentCount: 0, hasHighPurityCount: 0, hasHighWonderCount: 0,
      overallWonder: 40, spelunkerGrade: 'collector' as const,
      bestFormation: 'empty.ts', clearest: 'empty.ts', bestFormed: 'empty.ts',
      mostLuminous: 'empty.ts', deepest: 'empty.ts', mostWonderful: 'empty.ts',
    }
    const recs = generateRecommendations(formations, chambers, cavern, stats)
    expect(recs).toContain('Improve crystal clarity — make your code more transparent')
  })

  it('recommends magnificent when all scores are high', () => {
    const formations = [analyzeCrystalFormation(RICH_CONTENT, 'rich.ts')]
    const result = buildCrystalCaveResult(['rich.ts'], [RICH_CONTENT])
    const recs = generateRecommendations(formations, result.chambers, result.cavern, result.stats)
    expect(recs).toContain('Magnificent crystal cave achieved — your formations are a natural wonder')
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns green for high score', () => {
    const result = scoreColor(90)
    expect(result).toContain('90')
  })
  it('returns yellow for medium score', () => {
    const result = scoreColor(70)
    expect(result).toContain('70')
  })
  it('returns orange for low score', () => {
    const result = scoreColor(45)
    expect(result).toContain('45')
  })
  it('returns red for very low score', () => {
    const result = scoreColor(20)
    expect(result).toContain('20')
  })
})

describe('conditionColor', () => {
  it('colors naica-mine', () => {
    expect(conditionColor('naica-mine')).toContain('naica-mine')
  })
  it('colors gravel-pit', () => {
    expect(conditionColor('gravel-pit')).toContain('gravel-pit')
  })
  it('passes through unknown conditions', () => {
    expect(conditionColor('unknown')).toBe('unknown')
  })
})

describe('gradeColor', () => {
  it('colors master-spelunker', () => {
    expect(gradeColor('master-spelunker')).toContain('master-spelunker')
  })
  it('colors surface-dweller', () => {
    expect(gradeColor('surface-dweller')).toContain('surface-dweller')
  })
  it('passes through unknown grades', () => {
    expect(gradeColor('unknown')).toBe('unknown')
  })
})

describe('clarityColor', () => {
  it('colors diamond-grade', () => {
    expect(clarityColor('diamond-grade')).toContain('diamond-grade')
  })
  it('colors muddy', () => {
    expect(clarityColor('muddy')).toContain('muddy')
  })
})

describe('formationColor', () => {
  it('colors selenite', () => {
    expect(formationColor('selenite')).toContain('selenite')
  })
  it('colors mud', () => {
    expect(formationColor('mud')).toContain('mud')
  })
})

describe('luminescenceColor', () => {
  it('colors fluorescent', () => {
    expect(luminescenceColor('fluorescent')).toContain('fluorescent')
  })
  it('colors dark', () => {
    expect(luminescenceColor('dark')).toContain('dark')
  })
})

describe('geodeColor', () => {
  it('colors crystal-filled', () => {
    expect(geodeColor('crystal-filled')).toContain('crystal-filled')
  })
  it('colors empty', () => {
    expect(geodeColor('empty')).toContain('empty')
  })
})

describe('purityColor', () => {
  it('colors ultra-pure', () => {
    expect(purityColor('ultra-pure')).toContain('ultra-pure')
  })
  it('colors polluted', () => {
    expect(purityColor('polluted')).toContain('polluted')
  })
})

describe('wonderColor', () => {
  it('colors breathtaking', () => {
    expect(wonderColor('breathtaking')).toContain('breathtaking')
  })
  it('colors none', () => {
    expect(wonderColor('none')).toContain('none')
  })
})

describe('chamberColor', () => {
  it('colors grand-cathedral', () => {
    expect(chamberColor('grand-cathedral')).toContain('grand-cathedral')
  })
  it('colors mud-cave', () => {
    expect(chamberColor('mud-cave')).toContain('mud-cave')
  })
})

// ─── JSON Formatter ──────────────────────────────────────────────────────────

describe('formatCrystalCaveJson', () => {
  it('returns valid JSON', () => {
    const result = buildCrystalCaveResult([], [])
    const json = formatCrystalCaveJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.formations).toEqual([])
    expect(parsed.cavern.overallWonder).toBe(0)
  })
})

// ─── Table Formatter ─────────────────────────────────────────────────────────

describe('formatCrystalCaveTable', () => {
  it('includes Crystal Cave Analysis header', () => {
    const result = buildCrystalCaveResult([], [])
    const table = formatCrystalCaveTable(result, false)
    expect(table).toContain('Crystal Cave Analysis')
  })

  it('includes statistics in table output', () => {
    const result = buildCrystalCaveResult(['rich.ts'], [RICH_CONTENT])
    const table = formatCrystalCaveTable(result, false)
    expect(table).toContain('Total Files')
    expect(table).toContain('Spelunker Grade')
  })

  it('shows per-file details in verbose mode', () => {
    const result = buildCrystalCaveResult(['rich.ts'], [RICH_CONTENT])
    const table = formatCrystalCaveTable(result, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('rich.ts')
  })

  it('includes recommendations', () => {
    const result = buildCrystalCaveResult(['rich.ts'], [RICH_CONTENT])
    const table = formatCrystalCaveTable(result, false)
    expect(table).toContain('Recommendations')
  })
})
