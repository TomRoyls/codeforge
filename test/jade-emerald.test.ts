import { describe, expect, it } from 'vitest'

import {
  measurePrecious,
  measureDurable,
  measureLustrous,
  measureFaceted,
  measureClarity,
  measureCarving,
  analyzeGemstone,
  classifyGemstoneCondition,
  classifyCollectionType,
  analyzeGemstoneCollection,
  classifyLapidaryGrade,
  generateRecommendations,
  buildJadeEmeraldResult,
} from '../src/commands/jade-emerald-helpers.js'
import {
  scoreColor,
  gradeColor,
  hardnessColor,
  shineColor,
  cutColor,
  clarityGradeColor,
  skillColor,
  conditionColor,
  lapidaryGradeColor,
  collectionTypeColor,
  collectionConditionColor,
  formatJadeEmeraldJson,
  formatJadeEmeraldTable,
} from '../src/commands/jade-emerald-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH_CONTENT = `export interface User { id: number; name: string }
export type UserRole = 'admin' | 'user'
export class UserService {
  private users: Map<number, User> = new Map()
  async getUser(id: number): Promise<User | null> {
    try {
      const user = this.users.get(id)
      return user ?? null
    } catch (error) {
      return null
    }
  }
}
import { injectable } from 'tsyringe'
/** Documentation */
export async function processUser(user: User): Promise<void> {
  await Promise.resolve(user)
}
`

const MEDIUM_CONTENT = `function hello(name) {
  console.log('hello', name)
  return name
}
`

const EMPTY_CONTENT = ''

// ─── measurePrecious ────────────────────────────────────────────────────────

describe('measurePrecious', () => {
  it('returns high value for rich content', () => {
    const result = measurePrecious(RICH_CONTENT)
    expect(result.value).toBe(75)
    expect(result.grade).toBe('gem-quality')
  })

  it('returns low value for simple content', () => {
    const result = measurePrecious(MEDIUM_CONTENT)
    expect(result.value).toBe(33)
    expect(result.grade).toBe('industrial')
  })

  it('returns zero for empty content', () => {
    const result = measurePrecious(EMPTY_CONTENT)
    expect(result.value).toBe(0)
    expect(result.grade).toBe('aggregate')
  })

  it('detects types', () => {
    const result = measurePrecious('export type Config = { debug: boolean }')
    expect(result.value).toBeGreaterThanOrEqual(35)
  })

  it('counts flaws from any/eval', () => {
    const result = measurePrecious('const x: any = eval("1")')
    expect(result.flawCount).toBeGreaterThanOrEqual(1)
  })

  it('counts cracks from console.log/debugger', () => {
    const result = measurePrecious('console.log("x"); debugger;')
    expect(result.crackCount).toBeGreaterThanOrEqual(1)
  })

  it('sets hasImperial for interfaces+types+classes', () => {
    const result = measurePrecious(RICH_CONTENT)
    expect(result.hasImperial).toBe(true)
  })
})

// ─── measureDurable ─────────────────────────────────────────────────────────

describe('measureDurable', () => {
  it('returns strength for rich content', () => {
    const result = measureDurable(RICH_CONTENT)
    expect(result.strength).toBe(49)
    expect(result.hardness).toBe('quartz-steady')
  })

  it('returns low strength for simple content', () => {
    const result = measureDurable(MEDIUM_CONTENT)
    expect(result.strength).toBe(19)
    expect(result.hardness).toBe('talc-fragile')
  })

  it('returns zero for empty content', () => {
    const result = measureDurable(EMPTY_CONTENT)
    expect(result.strength).toBe(0)
    expect(result.hardness).toBe('talc-fragile')
  })

  it('detects try/catch for resistance', () => {
    const result = measureDurable('try { x() } catch(e) {}')
    expect(result.hasResistant).toBe(true)
  })

  it('detects nullish coalescing for solid', () => {
    const result = measureDurable('const x = a ?? b')
    expect(result.hasSolid).toBe(true)
  })
})

// ─── measureLustrous ────────────────────────────────────────────────────────

describe('measureLustrous', () => {
  it('returns high quality for rich content', () => {
    const result = measureLustrous(RICH_CONTENT)
    expect(result.quality).toBe(88)
    expect(result.shine).toBe('vitreous-shine')
  })

  it('returns low quality for simple content', () => {
    const result = measureLustrous(MEDIUM_CONTENT)
    expect(result.quality).toBe(27)
    expect(result.shine).toBe('earthy')
  })

  it('returns near zero for empty content', () => {
    const result = measureLustrous(EMPTY_CONTENT)
    expect(result.quality).toBe(3)
    expect(result.shine).toBe('earthy')
  })

  it('detects JSDoc comments', () => {
    const result = measureLustrous('/** docs */\nexport function x() {}')
    expect(result.quality).toBeGreaterThanOrEqual(40)
  })

  it('counts cloudiness from missing docs', () => {
    const result = measureLustrous(MEDIUM_CONTENT)
    expect(result.cloudinessCount).toBe(2)
  })

  it('sets hasShimmering for proper functions + no any', () => {
    const result = measureLustrous(RICH_CONTENT)
    expect(result.hasShimmering).toBe(true)
  })
})

// ─── measureFaceted ─────────────────────────────────────────────────────────

describe('measureFaceted', () => {
  it('returns high complexity for rich content', () => {
    const result = measureFaceted(RICH_CONTENT)
    expect(result.complexity).toBe(76)
    expect(result.cut).toBe('emerald-cut')
  })

  it('returns medium complexity for simple content', () => {
    const result = measureFaceted(MEDIUM_CONTENT)
    expect(result.complexity).toBe(45)
    expect(result.cut).toBe('cabochon')
  })

  it('returns low for empty content', () => {
    const result = measureFaceted(EMPTY_CONTENT)
    expect(result.complexity).toBe(24)
    expect(result.cut).toBe('uncut')
  })

  it('detects exports and imports', () => {
    const result = measureFaceted("import { x } from 'y'\nexport const z = x")
    expect(result.complexity).toBeGreaterThanOrEqual(55)
  })

  it('sets hasSymmetrical for named exports + imports', () => {
    const result = measureFaceted("import { x } from 'y'\nexport const z = x")
    expect(result.hasSymmetrical).toBe(true)
  })
})

// ─── measureClarity ─────────────────────────────────────────────────────────

describe('measureClarity', () => {
  it('returns high value for rich content', () => {
    const result = measureClarity(RICH_CONTENT)
    expect(result.value).toBe(70)
    expect(result.grade).toBe('vs')
  })

  it('returns low value for simple content', () => {
    const result = measureClarity(MEDIUM_CONTENT)
    expect(result.value).toBe(13)
    expect(result.grade).toBe('opaque')
  })

  it('returns zero for empty content', () => {
    const result = measureClarity(EMPTY_CONTENT)
    expect(result.value).toBe(0)
    expect(result.grade).toBe('opaque')
  })

  it('detects imports for transparency', () => {
    const result = measureClarity("import { x } from 'y'\nexport interface I {}")
    expect(result.hasTransparent).toBe(true)
  })

  it('detects error handling for clean', () => {
    const result = measureClarity('try { x() } catch(e) {}')
    expect(result.hasClean).toBe(true)
  })
})

// ─── measureCarving ─────────────────────────────────────────────────────────

describe('measureCarving', () => {
  it('returns high quality for rich content', () => {
    const result = measureCarving(RICH_CONTENT)
    expect(result.quality).toBe(83)
    expect(result.skill).toBe('expert-artisan')
  })

  it('returns low quality for simple content', () => {
    const result = measureCarving(MEDIUM_CONTENT)
    expect(result.quality).toBe(20)
    expect(result.skill).toBe('machine-cut')
  })

  it('returns near zero for empty content', () => {
    const result = measureCarving(EMPTY_CONTENT)
    expect(result.quality).toBe(5)
    expect(result.skill).toBe('machine-cut')
  })

  it('detects exports for intricate', () => {
    const result = measureCarving('export interface X {} export function x() {}')
    expect(result.hasIntricate).toBe(true)
  })

  it('flags tool marks from missing try/catch + any', () => {
    const result = measureCarving('function x(): any { return 1 }')
    expect(result.toolMarkCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── classifyGemstoneCondition ──────────────────────────────────────────────

describe('classifyGemstoneCondition', () => {
  it('classifies masterpiece for 90+', () => { expect(classifyGemstoneCondition(95)).toBe('masterpiece') })
  it('classifies fine-gem for 75-89', () => { expect(classifyGemstoneCondition(80)).toBe('fine-gem') })
  it('classifies quality-stone for 60-74', () => { expect(classifyGemstoneCondition(65)).toBe('quality-stone') })
  it('classifies commercial for 45-59', () => { expect(classifyGemstoneCondition(50)).toBe('commercial') })
  it('classifies industrial-grade for 30-44', () => { expect(classifyGemstoneCondition(35)).toBe('industrial-grade') })
  it('classifies raw-stone for low', () => { expect(classifyGemstoneCondition(10)).toBe('raw-stone') })
})

// ─── analyzeGemstone ────────────────────────────────────────────────────────

describe('analyzeGemstone', () => {
  it('returns correct values for rich content', () => {
    const result = analyzeGemstone(RICH_CONTENT, 'rich.ts')
    expect(result.file).toBe('rich.ts')
    expect(result.qualityScore).toBe(74)
    expect(result.condition).toBe('quality-stone')
    expect(result.preciousness).toBe(75)
    expect(result.durability).toBe(49)
    expect(result.luster).toBe(88)
    expect(result.facetCount).toBe(76)
    expect(result.clarityValue).toBe(70)
    expect(result.carvingQuality).toBe(83)
  })

  it('returns correct values for medium content', () => {
    const result = analyzeGemstone(MEDIUM_CONTENT, 'medium.ts')
    expect(result.file).toBe('medium.ts')
    expect(result.qualityScore).toBe(26)
    expect(result.condition).toBe('raw-stone')
    expect(result.preciousness).toBe(33)
    expect(result.durability).toBe(19)
    expect(result.luster).toBe(27)
    expect(result.facetCount).toBe(45)
    expect(result.clarityValue).toBe(13)
    expect(result.carvingQuality).toBe(20)
  })

  it('returns correct values for empty content', () => {
    const result = analyzeGemstone(EMPTY_CONTENT, 'empty.ts')
    expect(result.file).toBe('empty.ts')
    expect(result.qualityScore).toBe(5)
    expect(result.condition).toBe('raw-stone')
    expect(result.preciousness).toBe(0)
    expect(result.durability).toBe(0)
    expect(result.luster).toBe(3)
    expect(result.facetCount).toBe(24)
    expect(result.clarityValue).toBe(0)
    expect(result.carvingQuality).toBe(5)
  })

  it('qualityScore is weighted sum', () => {
    const result = analyzeGemstone(RICH_CONTENT, 'r.ts')
    const expected = Math.round(
      result.preciousness * 0.2 +
      result.durability * 0.15 +
      result.luster * 0.15 +
      result.facetCount * 0.15 +
      result.clarityValue * 0.15 +
      result.carvingQuality * 0.2,
    )
    expect(result.qualityScore).toBe(expected)
  })
})

// ─── classifyCollectionType ─────────────────────────────────────────────────

describe('classifyCollectionType', () => {
  it('returns gravel for empty array', () => {
    expect(classifyCollectionType([])).toBe('gravel')
  })

  it('returns imperial-collection for high avg + 50% masterpieces', () => {
    const g = analyzeGemstone(RICH_CONTENT, 'a.ts')
    g.qualityScore = 95
    g.condition = 'masterpiece'
    expect(classifyCollectionType([g])).toBe('imperial-collection')
  })

  it('returns gem-pouch for mixed content', () => {
    const r = analyzeGemstone(RICH_CONTENT, 'a.ts')
    const m = analyzeGemstone(MEDIUM_CONTENT, 'b.ts')
    expect(classifyCollectionType([r, m])).toBe('gem-pouch')
  })
})

// ─── analyzeGemstoneCollection ──────────────────────────────────────────────

describe('analyzeGemstoneCollection', () => {
  it('returns rubble collection for no gemstones', () => {
    const coll = analyzeGemstoneCollection([], 'src')
    expect(coll.directory).toBe('src')
    expect(coll.collectionType).toBe('gravel')
    expect(coll.condition).toBe('rubble')
  })

  it('returns collection with correct averages', () => {
    const gs = [analyzeGemstone(RICH_CONTENT, 'a.ts')]
    const coll = analyzeGemstoneCollection(gs, '.')
    expect(coll.avgPreciousness).toBe(gs[0].preciousness)
    expect(coll.gemstones).toHaveLength(1)
  })
})

// ─── classifyLapidaryGrade ──────────────────────────────────────────────────

describe('classifyLapidaryGrade', () => {
  it('returns grand-lapidary for 80+', () => { expect(classifyLapidaryGrade(85)).toBe('grand-lapidary') })
  it('returns grand-lapidary for exactly 80', () => { expect(classifyLapidaryGrade(80)).toBe('grand-lapidary') })
  it('returns master-gemcutter for 65-79', () => { expect(classifyLapidaryGrade(72)).toBe('master-gemcutter') })
  it('returns expert-cutter for 50-64', () => { expect(classifyLapidaryGrade(55)).toBe('expert-cutter') })
  it('returns expert-cutter for exactly 50', () => { expect(classifyLapidaryGrade(50)).toBe('expert-cutter') })
  it('returns skilled-artisan for 35-49', () => { expect(classifyLapidaryGrade(43)).toBe('skilled-artisan') })
  it('returns apprentice-cutter for 20-34', () => { expect(classifyLapidaryGrade(25)).toBe('apprentice-cutter') })
  it('returns rock-tumbler for below 20', () => { expect(classifyLapidaryGrade(10)).toBe('rock-tumbler') })
  it('returns rock-tumbler for 0', () => { expect(classifyLapidaryGrade(0)).toBe('rock-tumbler') })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns recommendations for rich content', () => {
    const result = buildJadeEmeraldResult(['a.ts'], [RICH_CONTENT])
    const recs = generateRecommendations(result.gemstones, result.collections, result.treasure, result.stats)
    expect(Array.isArray(recs)).toBe(true)
  })

  it('returns recommendations for empty content', () => {
    const result = buildJadeEmeraldResult(['a.ts'], [EMPTY_CONTENT])
    const recs = generateRecommendations(result.gemstones, result.collections, result.treasure, result.stats)
    expect(Array.isArray(recs)).toBe(true)
  })
})

// ─── buildJadeEmeraldResult (integration) ───────────────────────────────────

describe('buildJadeEmeraldResult', () => {
  it('handles RICH+MEDIUM correctly', () => {
    const result = buildJadeEmeraldResult(
      ['rich.ts', 'medium.ts'],
      [RICH_CONTENT, MEDIUM_CONTENT],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalCollections).toBe(1)
    expect(result.stats.avgPreciousness).toBe(54)
    expect(result.stats.avgDurability).toBe(34)
    expect(result.stats.avgLuster).toBe(58)
    expect(result.stats.avgFacetCount).toBe(61)
    expect(result.stats.avgClarityValue).toBe(42)
    expect(result.stats.avgCarvingQuality).toBe(52)
    expect(result.stats.rawStoneCount).toBe(1)
    expect(result.stats.qualityStoneCount).toBe(1)
    expect(result.stats.overallTreasureValue).toBe(50)
    expect(result.stats.lapidaryGrade).toBe('expert-cutter')
    expect(result.stats.bestGemstone).toBe('rich.ts')
    expect(result.stats.mostPrecious).toBe('rich.ts')
    expect(result.stats.mostDurable).toBe('rich.ts')
    expect(result.stats.mostLustrous).toBe('rich.ts')
    expect(result.stats.mostFaceted).toBe('rich.ts')
    expect(result.stats.clearest).toBe('rich.ts')
    expect(result.stats.bestCarved).toBe('rich.ts')
    expect(result.treasure.overallTreasureValue).toBe(50)
    expect(result.treasure.isPrecious).toBe(false)
    expect(result.treasure.avgPreciousness).toBe(54)
    expect(result.treasure.avgDurability).toBe(34)
    expect(result.treasure.avgCarvingQuality).toBe(52)
    expect(result.gemstones).toHaveLength(2)
    expect(result.collections).toHaveLength(1)
    expect(result.collections[0].collectionType).toBe('gem-pouch')
    expect(result.collections[0].condition).toBe('valuable-hoard')
  })

  it('handles all EMPTY correctly', () => {
    const result = buildJadeEmeraldResult(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
      [EMPTY_CONTENT, EMPTY_CONTENT, EMPTY_CONTENT, EMPTY_CONTENT],
    )
    expect(result.stats.totalFiles).toBe(4)
    expect(result.stats.avgPreciousness).toBe(0)
    expect(result.stats.avgDurability).toBe(0)
    expect(result.stats.avgLuster).toBe(3)
    expect(result.stats.avgFacetCount).toBe(24)
    expect(result.stats.avgClarityValue).toBe(0)
    expect(result.stats.avgCarvingQuality).toBe(5)
    expect(result.stats.rawStoneCount).toBe(4)
    expect(result.stats.overallTreasureValue).toBe(5)
    expect(result.stats.lapidaryGrade).toBe('rock-tumbler')
    expect(result.treasure.isPrecious).toBe(false)
  })

  it('handles single rich file', () => {
    const result = buildJadeEmeraldResult(['rich.ts'], [RICH_CONTENT])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.gemstones).toHaveLength(1)
    expect(result.gemstones[0].qualityScore).toBe(74)
    expect(result.collections).toHaveLength(1)
  })

  it('handles empty files array', () => {
    const result = buildJadeEmeraldResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.gemstones).toHaveLength(0)
    expect(result.collections).toHaveLength(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns string for high score', () => { expect(typeof scoreColor(90)).toBe('string') })
  it('returns string for medium score', () => { expect(typeof scoreColor(65)).toBe('string') })
  it('returns string for low score', () => { expect(typeof scoreColor(30)).toBe('string') })
  it('returns string for very low score', () => { expect(typeof scoreColor(10)).toBe('string') })
})

describe('gradeColor', () => {
  it('colors all grades', () => {
    for (const g of ['imperial-jade', 'gem-quality', 'fine-stone', 'commercial-grade', 'industrial', 'aggregate']) {
      expect(typeof gradeColor(g)).toBe('string')
    }
  })
  it('passes through unknown', () => { expect(gradeColor('unknown')).toBe('unknown') })
})

describe('hardnessColor', () => {
  it('colors all hardnesses', () => {
    for (const h of ['diamond-hard', 'corundum-tough', 'jade-resilient', 'quartz-steady', 'calcite-soft', 'talc-fragile']) {
      expect(typeof hardnessColor(h)).toBe('string')
    }
  })
})

describe('shineColor', () => {
  it('colors all shines', () => {
    for (const s of ['brilliant-luster', 'vitreous-shine', 'pearly-glow', 'silky-sheen', 'dull', 'earthy']) {
      expect(typeof shineColor(s)).toBe('string')
    }
  })
})

describe('cutColor', () => {
  it('colors all cuts', () => {
    for (const c of ['brilliant-cut', 'emerald-cut', 'princess-cut', 'cabochon', 'rough', 'uncut']) {
      expect(typeof cutColor(c)).toBe('string')
    }
  })
})

describe('clarityGradeColor', () => {
  it('colors all grades', () => {
    for (const g of ['flawless', 'vvs', 'vs', 'si', 'i', 'opaque']) {
      expect(typeof clarityGradeColor(g)).toBe('string')
    }
  })
})

describe('skillColor', () => {
  it('colors all skills', () => {
    for (const s of ['master-carver', 'expert-artisan', 'skilled-craftsman', 'apprentice', 'novice', 'machine-cut']) {
      expect(typeof skillColor(s)).toBe('string')
    }
  })
})

describe('conditionColor', () => {
  it('colors all conditions', () => {
    for (const c of ['masterpiece', 'fine-gem', 'quality-stone', 'commercial', 'industrial-grade', 'raw-stone']) {
      expect(typeof conditionColor(c)).toBe('string')
    }
  })
})

describe('lapidaryGradeColor', () => {
  it('colors all grades', () => {
    for (const g of ['grand-lapidary', 'master-gemcutter', 'expert-cutter', 'skilled-artisan', 'apprentice-cutter', 'rock-tumbler']) {
      expect(typeof lapidaryGradeColor(g)).toBe('string')
    }
  })
})

describe('collectionTypeColor', () => {
  it('colors all types', () => {
    for (const t of ['imperial-collection', 'treasure-vault', 'jewelry-box', 'gem-pouch', 'quarry-tailings', 'gravel']) {
      expect(typeof collectionTypeColor(t)).toBe('string')
    }
  })
})

describe('collectionConditionColor', () => {
  it('colors all conditions', () => {
    for (const c of ['crown-jewels', 'precious-collection', 'valuable-hoard', 'modest-collection', 'scattered-stones', 'rubble']) {
      expect(typeof collectionConditionColor(c)).toBe('string')
    }
  })
})

// ─── JSON Formatter ────────────────────────────────────────────────────────

describe('formatJadeEmeraldJson', () => {
  it('returns valid JSON string', () => {
    const result = buildJadeEmeraldResult(['a.ts'], [RICH_CONTENT])
    const json = formatJadeEmeraldJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

// ─── Table Formatter ───────────────────────────────────────────────────────

describe('formatJadeEmeraldTable', () => {
  it('includes header', () => {
    const result = buildJadeEmeraldResult(['a.ts'], [RICH_CONTENT])
    const table = formatJadeEmeraldTable(result, false)
    expect(table).toContain('Jade Emerald Analysis')
  })

  it('includes treasure overview section', () => {
    const result = buildJadeEmeraldResult(['a.ts'], [RICH_CONTENT])
    const table = formatJadeEmeraldTable(result, false)
    expect(table).toContain('Treasure Overview')
    expect(table).toContain('Is Precious')
  })

  it('includes statistics section', () => {
    const result = buildJadeEmeraldResult(['a.ts'], [RICH_CONTENT])
    const table = formatJadeEmeraldTable(result, false)
    expect(table).toContain('Statistics')
    expect(table).toContain('Lapidary Grade')
  })

  it('includes condition counts section', () => {
    const result = buildJadeEmeraldResult(['a.ts'], [RICH_CONTENT])
    const table = formatJadeEmeraldTable(result, false)
    expect(table).toContain('Condition Counts')
    expect(table).toContain('Raw Stone')
  })

  it('shows highlights for best gemstone', () => {
    const result = buildJadeEmeraldResult(
      ['a.ts', 'b.ts'],
      [RICH_CONTENT, MEDIUM_CONTENT],
    )
    const table = formatJadeEmeraldTable(result, false)
    expect(table).toContain('Highlights')
    expect(table).toContain('Best Gemstone')
    expect(table).toContain('Most Precious')
    expect(table).toContain('Most Durable')
    expect(table).toContain('Most Lustrous')
    expect(table).toContain('Most Faceted')
    expect(table).toContain('Clearest')
    expect(table).toContain('Best Carved')
  })

  it('shows per-file details in verbose mode', () => {
    const result = buildJadeEmeraldResult(['a.ts'], [RICH_CONTENT])
    const table = formatJadeEmeraldTable(result, true)
    expect(table).toContain('Per-File Gemstones')
  })

  it('hides per-file details without verbose', () => {
    const result = buildJadeEmeraldResult(['a.ts'], [RICH_CONTENT])
    const table = formatJadeEmeraldTable(result, false)
    expect(table).not.toContain('Per-File Gemstones')
  })

  it('shows recommendations when present', () => {
    const result = buildJadeEmeraldResult(['a.ts'], [MEDIUM_CONTENT])
    if (result.recommendations.length > 0) {
      const table = formatJadeEmeraldTable(result, false)
      expect(table).toContain('Recommendations')
    }
  })
})
