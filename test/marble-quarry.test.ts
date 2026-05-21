import { describe, expect, it } from 'vitest'

import {
  analyzeQuarryBlock,
  analyzeQuarryGallery,
  buildMarbleQuarryResult,
  classifyBlockCondition,
  classifyGalleryCondition,
  classifyGalleryType,
  classifySculptorGrade,
  generateRecommendations,
  measureDepth,
  measureExtraction,
  measureGrain,
  measureSculpting,
  measureStone,
  measureVein,
  type StoneMeasure,
  type GrainMeasure,
  type VeinMeasure,
  type DepthMeasure,
  type ExtractionMeasure,
  type SculptingMeasure,
  type QuarryBlock,
} from '../src/commands/marble-quarry-helpers.js'

import {
  conditionColor,
  scoreColor,
  stoneTypeColor,
  grainPatternColor,
  extractionMethodColor,
  malleabilityColor,
  sculptorGradeColor,
  galleryCondColor,
  formatBlock,
  formatGallery,
  formatStats,
  formatMarbleQuarryTable,
  formatMarbleQuarryJson,
} from '../src/commands/marble-quarry-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const EMPTY_CONTENT = ''

const MINIMAL_CONTENT = 'export function add(a: number, b: number): number { return a + b; }'

const RICH_CONTENT = `/**
 * Represents a user in the system.
 * @example new User('Alice')
 */
export interface User {
  name: string
  age: number
}

export class UserService {
  private users: User[] = []

  add(user: User): void {
    if (!user.name) throw new Error('Name required')
    this.users.push(user)
  }

  find(name: string): User | undefined {
    return this.users.find(u => u.name === name)
  }
}
`

// ─── measureStone ──────────────────────────────────────────────────────────

describe('measureStone', () => {
  it('returns concrete for empty content', () => {
    const s = measureStone(EMPTY_CONTENT)
    expect(s.purity).toBe(10)
    expect(s.type).toBe('concrete')
    expect(s.isPure).toBe(false)
    expect(s.hasNoInclusions).toBe(true)
    expect(s.hasNoFractures).toBe(true)
    expect(s.hasNoStains).toBe(true)
    expect(s.hasProperCrystallization).toBe(false)
    expect(s.hasUniformColor).toBe(false)
    expect(s.hasTranslucency).toBe(false)
    expect(s.hasDensity).toBe(false)
    expect(s.hasPorosity).toBe(true)
    expect(s.hasWeathering).toBe(false)
    expect(s.inclusionCount).toBe(0)
    expect(s.fractureCount).toBe(0)
  })

  it('detects type annotations in minimal content', () => {
    const s = measureStone(MINIMAL_CONTENT)
    expect(s.hasProperCrystallization).toBe(true)
    expect(s.hasNoFractures).toBe(true)
    expect(s.inclusionCount).toBe(0)
    expect(s.type).toBe('concrete')
  })

  it('returns travertine for rich content', () => {
    const s = measureStone(RICH_CONTENT)
    expect(s.type).toBe('travertine')
    expect(s.isPure).toBe(false)
    expect(s.hasDensity).toBe(true)
    expect(s.hasProperCrystallization).toBe(true)
    expect(s.hasUniformColor).toBe(true)
    expect(s.hasTranslucency).toBe(true)
    expect(s.hasPorosity).toBe(false)
  })

  it('counts TODOs as inclusions', () => {
    const s = measureStone('// TODO: fix this\nexport function foo(): void {}')
    expect(s.inclusionCount).toBe(1)
    expect(s.hasNoInclusions).toBe(false)
  })

  it('counts console calls as fractures', () => {
    const s = measureStone('console.log("debug");\nexport function foo(): void {}')
    expect(s.fractureCount).toBe(1)
    expect(s.hasNoFractures).toBe(false)
  })

  it('counts deprecated markers', () => {
    const s = measureStone('/** @deprecated */\nexport function old(): void {}')
    expect(s.inclusionCount).toBe(1)
    expect(s.hasWeathering).toBe(true)
  })
})

// ─── measureGrain ──────────────────────────────────────────────────────────

describe('measureGrain', () => {
  it('returns fine pattern for empty content', () => {
    const g = measureGrain(EMPTY_CONTENT)
    expect(g.consistency).toBe(10)
    expect(g.pattern).toBe('fine')
    expect(g.isConsistent).toBe(false)
    expect(g.hasEvenGrain).toBe(false)
    expect(g.hasProperBedding).toBe(false)
    expect(g.hasDirectionalGrain).toBe(false)
    expect(g.hasCrossBedding).toBe(false)
    expect(g.hasRippleMarks).toBe(false)
    expect(g.hasNoFissures).toBe(true)
    expect(g.hasNoCleavage).toBe(true)
    expect(g.hasInterlockingGrain).toBe(false)
    expect(g.hasGrainBoundary).toBe(false)
    expect(g.fissureCount).toBe(0)
    expect(g.cleavageCount).toBe(0)
  })

  it('detects proper bedding in minimal content', () => {
    const g = measureGrain(MINIMAL_CONTENT)
    expect(g.hasProperBedding).toBe(true)
    expect(g.hasEvenGrain).toBe(true)
    expect(g.hasNoFissures).toBe(true)
    expect(g.pattern).toBe('fine')
  })

  it('returns medium pattern for rich content', () => {
    const g = measureGrain(RICH_CONTENT)
    expect(g.pattern).toBe('medium')
    expect(g.hasDirectionalGrain).toBe(true)
    expect(g.hasCrossBedding).toBe(true)
    expect(g.hasNoFissures).toBe(true)
  })

  it('detects chaotic grain with high complexity', () => {
    let content = ''
    for (let i = 0; i < 15; i++) {
      content += `if (x${i}) { for (let j = 0; j < 10; j++) { } }\n`
    }
    const g = measureGrain(content)
    expect(['chaotic', 'brecciated', 'mixed']).toContain(g.pattern)
  })
})

// ─── measureVein ───────────────────────────────────────────────────────────

describe('measureVein', () => {
  it('returns absent pattern for empty content', () => {
    const v = measureVein(EMPTY_CONTENT)
    expect(v.quality).toBe(10)
    expect(v.pattern).toBe('absent')
    expect(v.hasStrongVeining).toBe(false)
    expect(v.hasConsistentDirection).toBe(false)
    expect(v.hasNoDeadEnds).toBe(true)
    expect(v.deadEndCount).toBe(0)
    expect(v.hasCentralVein).toBe(false)
    expect(v.hasSecondaryVeins).toBe(false)
  })

  it('detects central vein for exports in minimal', () => {
    const v = measureVein(MINIMAL_CONTENT)
    expect(v.hasCentralVein).toBe(true)
    expect(v.hasConsistentDirection).toBe(true)
    expect(v.pattern).toBe('linear')
    expect(v.hasNoDeadEnds).toBe(true)
  })

  it('returns branching for rich content', () => {
    const v = measureVein(RICH_CONTENT)
    expect(v.pattern).toBe('branching')
    expect(v.hasProperBranching).toBe(true)
    expect(v.hasConsistentDirection).toBe(true)
    expect(v.hasCentralVein).toBe(true)
  })

  it('golden vein requires very high quality', () => {
    const content = 'export async function process(): Promise<void> { if (err) throw new Error("fail"); return; }'
    const v = measureVein(content)
    expect(v.hasGoldenVein).toBe(false)
    expect(v.quality).toBe(51)
  })
})

// ─── measureDepth ──────────────────────────────────────────────────────────

describe('measureDepth', () => {
  it('returns surface for empty content', () => {
    const d = measureDepth(EMPTY_CONTENT)
    expect(d.level).toBe(10)
    expect(d.strata).toBe('surface')
    expect(d.isProperlySeated).toBe(false)
    expect(d.hasSolidFoundation).toBe(false)
    expect(d.hasGeologicalLayers).toBe(false)
    expect(d.hasFaultLine).toBe(false)
    expect(d.hasStratification).toBe(false)
    expect(d.hasSeam).toBe(false)
    expect(d.hasOverburden).toBe(false)
    expect(d.hasUndercutting).toBe(false)
    expect(d.layerCount).toBe(0)
    expect(d.faultCount).toBe(0)
  })

  it('detects proper seating for minimal content', () => {
    const d = measureDepth(MINIMAL_CONTENT)
    expect(d.isProperlySeated).toBe(true)
    expect(d.strata).toBe('surface')
    expect(d.layerCount).toBe(1)
  })

  it('returns deep for rich content', () => {
    const d = measureDepth(RICH_CONTENT)
    expect(d.strata).toBe('deep')
    expect(d.hasSolidFoundation).toBe(true)
    expect(d.hasGeologicalLayers).toBe(true)
  })
})

// ─── measureExtraction ─────────────────────────────────────────────────────

describe('measureExtraction', () => {
  it('returns bare-hands for empty content', () => {
    const e = measureExtraction(EMPTY_CONTENT)
    expect(e.quality).toBe(10)
    expect(e.method).toBe('bare-hands')
    expect(e.isCleanlyExtracted).toBe(false)
    expect(e.hasProperShape).toBe(false)
    expect(e.hasConsistentSize).toBe(false)
    expect(e.hasCleanEdges).toBe(false)
    expect(e.hasNoDamage).toBe(true)
    expect(e.hasQuarryMarks).toBe(false)
    expect(e.hasWasteMaterial).toBe(false)
    expect(e.hasSalvageable).toBe(false)
    expect(e.hasFinishedFaces).toBe(false)
    expect(e.hasRoughFaces).toBe(false)
    expect(e.wastePercent).toBe(0)
    expect(e.salvageableCount).toBe(0)
  })

  it('detects clean extraction in minimal content', () => {
    const e = measureExtraction(MINIMAL_CONTENT)
    expect(e.isCleanlyExtracted).toBe(true)
    expect(e.hasProperShape).toBe(true)
    expect(e.hasCleanEdges).toBe(true)
    expect(e.hasSalvageable).toBe(true)
    expect(e.salvageableCount).toBe(1)
  })

  it('returns blasting for rich content', () => {
    const e = measureExtraction(RICH_CONTENT)
    expect(e.method).toBe('blasting')
    expect(e.hasFinishedFaces).toBe(true)
    expect(e.hasQuarryMarks).toBe(true)
  })

  it('detects waste material with TODOs', () => {
    const e = measureExtraction('// TODO: refactor\nexport function foo(): void {}')
    expect(e.hasWasteMaterial).toBe(true)
    expect(e.wastePercent).toBeGreaterThan(0)
  })
})

// ─── measureSculpting ──────────────────────────────────────────────────────

describe('measureSculpting', () => {
  it('returns brittle for empty content', () => {
    const s = measureSculpting(EMPTY_CONTENT)
    expect(s.potential).toBe(10)
    expect(s.malleability).toBe('brittle')
    expect(s.isWorkable).toBe(false)
    expect(s.hasMichelangeloPotential).toBe(false)
    expect(s.hasProperBlocking).toBe(false)
    expect(s.hasRefinementPotential).toBe(false)
    expect(s.hasStructuralIntegrity).toBe(true)
    expect(s.hasNoHiddenFlaws).toBe(true)
    expect(s.hasChiselMarks).toBe(false)
    expect(s.hasDust).toBe(false)
    expect(s.flawCount).toBe(0)
    expect(s.chiselMarkCount).toBe(0)
  })

  it('detects proper blocking in minimal content', () => {
    const s = measureSculpting(MINIMAL_CONTENT)
    expect(s.hasProperBlocking).toBe(true)
    expect(s.hasGoodProportions).toBe(true)
    expect(s.hasPolishingPotential).toBe(true)
    expect(s.hasStructuralIntegrity).toBe(true)
  })

  it('returns hard for rich content', () => {
    const s = measureSculpting(RICH_CONTENT)
    expect(s.malleability).toBe('hard')
    expect(s.isWorkable).toBe(true)
    expect(s.hasRefinementPotential).toBe(true)
    expect(s.hasChiselMarks).toBe(true)
    expect(s.chiselMarkCount).toBe(1)
  })

  it('detects dust with TODOs', () => {
    const s = measureSculpting('// TODO: fix\nexport function foo(): void {}')
    expect(s.hasDust).toBe(true)
    expect(s.flawCount).toBeGreaterThan(0)
  })
})

// ─── classifyBlockCondition ────────────────────────────────────────────────

describe('classifyBlockCondition', () => {
  it('returns carrara-masterpiece for 80+', () => { expect(classifyBlockCondition(80)).toBe('carrara-masterpiece') })
  it('returns premium-block for 65-79', () => { expect(classifyBlockCondition(65)).toBe('premium-block') })
  it('returns quality-stone for 50-64', () => { expect(classifyBlockCondition(50)).toBe('quality-stone') })
  it('returns building-marble for 35-49', () => { expect(classifyBlockCondition(35)).toBe('building-marble') })
  it('returns rough-block for 20-34', () => { expect(classifyBlockCondition(20)).toBe('rough-block') })
  it('returns rubble for 0-19', () => { expect(classifyBlockCondition(10)).toBe('rubble') })
})

// ─── classifySculptorGrade ─────────────────────────────────────────────────

describe('classifySculptorGrade', () => {
  it('returns master-sculptor for 80+', () => { expect(classifySculptorGrade(80)).toBe('master-sculptor') })
  it('returns sculptor for 65-79', () => { expect(classifySculptorGrade(65)).toBe('sculptor') })
  it('returns stone-mason for 50-64', () => { expect(classifySculptorGrade(50)).toBe('stone-mason') })
  it('returns quarryman for 35-49', () => { expect(classifySculptorGrade(35)).toBe('quarryman') })
  it('returns apprentice for 20-34', () => { expect(classifySculptorGrade(20)).toBe('apprentice') })
  it('returns tourist-with-hammer for 0-19', () => { expect(classifySculptorGrade(10)).toBe('tourist-with-hammer') })
})

// ─── classifyGalleryType ───────────────────────────────────────────────────

describe('classifyGalleryType', () => {
  it('returns mine-tailings for empty blocks', () => {
    expect(classifyGalleryType([])).toBe('mine-tailings')
  })

  it('returns master-gallery for high scores', () => {
    const block = { qualityScore: 85, condition: 'carrara-masterpiece' } as Partial<QuarryBlock> as QuarryBlock
    expect(classifyGalleryType([block, block])).toBe('master-gallery')
  })
})

// ─── classifyGalleryCondition ──────────────────────────────────────────────

describe('classifyGalleryCondition', () => {
  it('returns sculptors-paradise for 75+', () => { expect(classifyGalleryCondition(75)).toBe('sculptors-paradise') })
  it('returns quality-quarry for 60-74', () => { expect(classifyGalleryCondition(60)).toBe('quality-quarry') })
  it('returns working-quarry for 45-59', () => { expect(classifyGalleryCondition(45)).toBe('working-quarry') })
  it('returns stripped-mine for 30-44', () => { expect(classifyGalleryCondition(30)).toBe('stripped-mine') })
  it('returns salvage for 15-29', () => { expect(classifyGalleryCondition(15)).toBe('salvage') })
  it('returns rubble-heap for 0-14', () => { expect(classifyGalleryCondition(5)).toBe('rubble-heap') })
})

// ─── analyzeQuarryBlock ────────────────────────────────────────────────────

describe('analyzeQuarryBlock', () => {
  it('returns rubble for empty content', () => {
    const b = analyzeQuarryBlock(EMPTY_CONTENT, 'e.ts')
    expect(b.file).toBe('e.ts')
    expect(b.stonePurity).toBe(10)
    expect(b.grainConsistency).toBe(10)
    expect(b.veinQuality).toBe(10)
    expect(b.quarryDepth).toBe(10)
    expect(b.extractionQuality).toBe(10)
    expect(b.sculptingPotential).toBe(10)
    expect(b.qualityScore).toBe(10)
    expect(b.condition).toBe('rubble')
  })

  it('returns rubble for minimal content', () => {
    const b = analyzeQuarryBlock(MINIMAL_CONTENT, 'm.ts')
    expect(b.stonePurity).toBe(2)
    expect(b.grainConsistency).toBe(26)
    expect(b.veinQuality).toBe(36)
    expect(b.quarryDepth).toBe(2)
    expect(b.extractionQuality).toBe(16)
    expect(b.sculptingPotential).toBe(20)
    expect(b.qualityScore).toBe(17)
    expect(b.condition).toBe('rubble')
  })

  it('returns building-marble for rich content', () => {
    const b = analyzeQuarryBlock(RICH_CONTENT, 'r.ts')
    expect(b.stonePurity).toBe(36)
    expect(b.grainConsistency).toBe(48)
    expect(b.veinQuality).toBe(48)
    expect(b.quarryDepth).toBe(56)
    expect(b.extractionQuality).toBe(48)
    expect(b.sculptingPotential).toBe(50)
    expect(b.qualityScore).toBe(48)
    expect(b.condition).toBe('building-marble')
  })
})

// ─── analyzeQuarryGallery ──────────────────────────────────────────────────

describe('analyzeQuarryGallery', () => {
  it('returns empty gallery for no blocks', () => {
    const g = analyzeQuarryGallery([], 'empty')
    expect(g.directory).toBe('empty')
    expect(g.blocks).toHaveLength(0)
    expect(g.avgPurity).toBe(0)
    expect(g.avgConsistency).toBe(0)
    expect(g.avgSculptingPotential).toBe(0)
    expect(g.carraraCount).toBe(0)
    expect(g.rubbleCount).toBe(0)
    expect(g.workableCount).toBe(0)
    expect(g.reusableCount).toBe(0)
    expect(g.galleryType).toBe('mine-tailings')
    expect(g.condition).toBe('rubble-heap')
  })

  it('aggregates multiple blocks', () => {
    const b1 = analyzeQuarryBlock(EMPTY_CONTENT, 'a.ts')
    const b2 = analyzeQuarryBlock(MINIMAL_CONTENT, 'b.ts')
    const g = analyzeQuarryGallery([b1, b2], 'src')
    expect(g.directory).toBe('src')
    expect(g.blocks).toHaveLength(2)
    expect(g.rubbleCount).toBe(2)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns pristine message for clean blocks', () => {
    const block = analyzeQuarryBlock(RICH_CONTENT, 'clean.ts')
    const gallery = analyzeQuarryGallery([block], 'src')
    const quarry = { avgPurity: 50, avgConsistency: 50, avgSculptingPotential: 50, isHighGrade: true, overallGrade: 50 }
    const stats = { overallGrade: 50, sculptorGrade: 'stone-mason' as const, totalFiles: 1, totalGalleries: 1, avgStonePurity: 50, avgGrainConsistency: 50, avgVeinQuality: 50, avgQuarryDepth: 50, avgExtractionQuality: 50, avgSculptingPotential: 50, carraraMasterpieceCount: 0, premiumBlockCount: 0, qualityStoneCount: 0, buildingMarbleCount: 1, roughBlockCount: 0, rubbleCount: 0, isPureCount: 0, hasNoInclusionsCount: 1, hasNoFracturesCount: 1, isConsistentCount: 0, hasEvenGrainCount: 1, hasStrongVeiningCount: 0, hasNoDeadEndsCount: 1, hasSolidFoundationCount: 1, isCleanlyExtractedCount: 1, hasFinishedFacesCount: 1, isWorkableCount: 1, hasMichelangeloPotentialCount: 0, bestBlock: 'clean.ts', purestStone: 'clean.ts', mostConsistent: 'clean.ts', bestVeins: 'clean.ts', deepestFoundation: 'clean.ts' }
    const recs = generateRecommendations([block], [gallery], quarry, stats)
    expect(recs).toContain('Marble quarry is in pristine condition — all blocks are Carrara-grade quality')
  })

  it('returns multiple recommendations for dirty blocks', () => {
    const dirty = '// TODO: fix\nconsole.log("x");\nexport function foo(): any { return null; }'
    const block = analyzeQuarryBlock(dirty, 'messy.ts')
    const gallery = analyzeQuarryGallery([block], 'src')
    const quarry = { avgPurity: 10, avgConsistency: 10, avgSculptingPotential: 10, isHighGrade: false, overallGrade: 10 }
    const stats = { overallGrade: 10, sculptorGrade: 'tourist-with-hammer' as const, totalFiles: 1, totalGalleries: 1, avgStonePurity: 10, avgGrainConsistency: 10, avgVeinQuality: 10, avgQuarryDepth: 10, avgExtractionQuality: 10, avgSculptingPotential: 10, carraraMasterpieceCount: 0, premiumBlockCount: 0, qualityStoneCount: 0, buildingMarbleCount: 0, roughBlockCount: 0, rubbleCount: 1, isPureCount: 0, hasNoInclusionsCount: 0, hasNoFracturesCount: 0, isConsistentCount: 0, hasEvenGrainCount: 0, hasStrongVeiningCount: 0, hasNoDeadEndsCount: 1, hasSolidFoundationCount: 0, isCleanlyExtractedCount: 0, hasFinishedFacesCount: 0, isWorkableCount: 0, hasMichelangeloPotentialCount: 0, bestBlock: 'messy.ts', purestStone: 'messy.ts', mostConsistent: 'messy.ts', bestVeins: 'messy.ts', deepestFoundation: 'messy.ts' }
    const recs = generateRecommendations([block], [gallery], quarry, stats)
    expect(recs.length).toBeGreaterThan(1)
  })
})

// ─── buildMarbleQuarryResult ───────────────────────────────────────────────

describe('buildMarbleQuarryResult', () => {
  it('returns empty result for no files', () => {
    const r = buildMarbleQuarryResult([], [])
    expect(r.blocks).toHaveLength(0)
    expect(r.galleries).toHaveLength(0)
    expect(r.quarry.avgPurity).toBe(0)
    expect(r.quarry.overallGrade).toBe(0)
    expect(r.stats.totalFiles).toBe(0)
    expect(r.stats.sculptorGrade).toBe('tourist-with-hammer')
  })

  it('computes correct stats for mixed content', () => {
    const r = buildMarbleQuarryResult(['a.ts', 'b.ts'], [EMPTY_CONTENT, MINIMAL_CONTENT])
    expect(r.blocks).toHaveLength(2)
    expect(r.quarry.avgPurity).toBe(6)
    expect(r.quarry.overallGrade).toBe(14)
    expect(r.stats.sculptorGrade).toBe('tourist-with-hammer')
    expect(r.stats.avgStonePurity).toBe(6)
    expect(r.stats.avgGrainConsistency).toBe(18)
    expect(r.stats.avgVeinQuality).toBe(23)
    expect(r.stats.avgQuarryDepth).toBe(6)
    expect(r.stats.avgExtractionQuality).toBe(13)
    expect(r.stats.avgSculptingPotential).toBe(15)
    expect(r.stats.isPureCount).toBe(0)
    expect(r.stats.hasNoInclusionsCount).toBe(2)
    expect(r.stats.hasNoFracturesCount).toBe(2)
    expect(r.stats.isWorkableCount).toBe(0)
    expect(r.stats.bestBlock).toBe('b.ts')
  })

  it('groups files by directory', () => {
    const r = buildMarbleQuarryResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [MINIMAL_CONTENT, MINIMAL_CONTENT, MINIMAL_CONTENT],
    )
    expect(r.galleries).toHaveLength(2)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('scoreColor returns string', () => {
    expect(typeof scoreColor(50)).toBe('string')
  })

  it('conditionColor returns string for all conditions', () => {
    for (const c of ['carrara-masterpiece', 'premium-block', 'quality-stone', 'building-marble', 'rough-block', 'rubble'] as const) {
      expect(typeof conditionColor(c)).toBe('string')
    }
  })

  it('stoneTypeColor returns string for all types', () => {
    for (const t of ['carrara', 'calacatta', 'statuario', 'thassos', 'travertine', 'concrete'] as const) {
      expect(typeof stoneTypeColor(t)).toBe('string')
    }
  })

  it('grainPatternColor returns string for all patterns', () => {
    for (const p of ['fine', 'medium', 'coarse', 'mixed', 'brecciated', 'chaotic'] as const) {
      expect(typeof grainPatternColor(p)).toBe('string')
    }
  })

  it('extractionMethodColor returns string for all methods', () => {
    for (const m of ['block-cutting', 'diamond-wire', 'chain-saw', 'blasting', 'pickaxe', 'bare-hands'] as const) {
      expect(typeof extractionMethodColor(m)).toBe('string')
    }
  })

  it('malleabilityColor returns string for all malleabilities', () => {
    for (const m of ['soft', 'medium', 'hard', 'very-hard', 'brittle', 'shattered'] as const) {
      expect(typeof malleabilityColor(m)).toBe('string')
    }
  })

  it('sculptorGradeColor returns string for all grades', () => {
    for (const g of ['master-sculptor', 'sculptor', 'stone-mason', 'quarryman', 'apprentice', 'tourist-with-hammer'] as const) {
      expect(typeof sculptorGradeColor(g)).toBe('string')
    }
  })

  it('galleryCondColor returns string for all conditions', () => {
    for (const c of ['sculptors-paradise', 'quality-quarry', 'working-quarry', 'stripped-mine', 'salvage', 'rubble-heap'] as const) {
      expect(typeof galleryCondColor(c)).toBe('string')
    }
  })
})

// ─── Format Block ──────────────────────────────────────────────────────────

describe('formatBlock', () => {
  it('formats a block non-verbose', () => {
    const b = analyzeQuarryBlock(MINIMAL_CONTENT, 'm.ts')
    const out = formatBlock(b, false)
    expect(out).toContain('m.ts')
    expect(out).toContain('rubble')
  })

  it('includes warnings in verbose mode', () => {
    const dirty = '// TODO: fix\nconsole.log("x");\nexport function foo(): void {}'
    const b = analyzeQuarryBlock(dirty, 'messy.ts')
    const out = formatBlock(b, true)
    expect(out).toContain('messy.ts')
  })
})

// ─── Format Gallery ────────────────────────────────────────────────────────

describe('formatGallery', () => {
  it('formats a gallery non-verbose', () => {
    const b = analyzeQuarryBlock(RICH_CONTENT, 'r.ts')
    const g = analyzeQuarryGallery([b], 'src')
    const out = formatGallery(g, false)
    expect(out).toContain('src')
    expect(out).toContain('Avg Purity')
  })

  it('includes blocks in verbose mode', () => {
    const b = analyzeQuarryBlock(RICH_CONTENT, 'r.ts')
    const g = analyzeQuarryGallery([b], 'src')
    const out = formatGallery(g, true)
    expect(out).toContain('r.ts')
  })
})

// ─── Format Stats ──────────────────────────────────────────────────────────

describe('formatStats', () => {
  it('formats stats with key metrics', () => {
    const r = buildMarbleQuarryResult(['a.ts'], [MINIMAL_CONTENT])
    const out = formatStats(r.stats)
    expect(out).toContain('Marble Quarry Statistics')
    expect(out).toContain('Overall Grade')
    expect(out).toContain('Sculptor')
  })
})

// ─── Format Table ──────────────────────────────────────────────────────────

describe('formatMarbleQuarryTable', () => {
  it('formats full table', () => {
    const r = buildMarbleQuarryResult(['a.ts'], [RICH_CONTENT])
    const out = formatMarbleQuarryTable(r, false)
    expect(out).toContain('Marble Quarry Analysis')
    expect(out).toContain('Quarry Blocks')
  })

  it('includes recommendations', () => {
    const r = buildMarbleQuarryResult(['a.ts'], [RICH_CONTENT])
    const out = formatMarbleQuarryTable(r, false)
    expect(out).toContain('Recommendations')
  })
})

// ─── Format JSON ───────────────────────────────────────────────────────────

describe('formatMarbleQuarryJson', () => {
  it('returns valid JSON', () => {
    const r = buildMarbleQuarryResult(['a.ts'], [MINIMAL_CONTENT])
    const out = formatMarbleQuarryJson(r)
    const parsed = JSON.parse(out)
    expect(parsed.blocks).toHaveLength(1)
    expect(parsed.quarry).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})
