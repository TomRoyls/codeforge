import { describe, expect, it } from 'vitest'

import {
  analyzeObsidianCache,
  analyzeObsidianShard,
  buildObsidianBladeResult,
  classifyArtisanGrade,
  classifyCacheCondition,
  classifyCacheType,
  classifyCondition,
  generateRecommendations,
  measureBeauty,
  measureEdge,
  measureFracture,
  measureMastery,
  measurePrecision,
  measurePurity,
} from '../src/commands/obsidian-blade-helpers.js'
import {
  cacheTypeColor,
  conditionColor,
  edgeGradeColor,
  formatObsidianBladeJson,
  formatObsidianBladeTable,
  gradeColor,
  scoreColor,
} from '../src/commands/obsidian-blade-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `/**
 * Complex module with full TypeScript features.
 * @example advanced usage
 */
export interface Animal {
  name: string
  age: number
}

export type Species = 'mammal' | 'bird' | 'reptile'

export enum Habitat {
  Forest = 'forest',
  Ocean = 'ocean',
  Desert = 'desert',
}

export class Creature {
  private readonly id: string
  protected name: string
  public species: Species

  static readonly MAX_AGE = 200

  constructor(id: string, name: string, species: Species) {
    this.id = id
    this.name = name
    this.species = species
  }

  async describe(): Promise<string> {
    try {
      return \`\${this.name} is a \${this.species}\`
    } catch {
      return 'unknown'
    }
  }
}

export function greet(name: string): string {
  return \`Hello \${name}\`
}

const arrow = (x: number) => x * 2

export { Creature }
export type { Animal } from './types.js'

`

const EMPTY = `// minimal file with nothing much
var x = 1
`

const MEDIUM = `export interface Config {
  name: string
}

export type Mode = 'dev' | 'prod'

export class AppConfig {
  private mode: Mode
  
  constructor(mode: Mode) {
    this.mode = mode
  }
}

export function init() {
  return new AppConfig('dev')
}

const setup = () => init()
`

// ─── measureEdge ───────────────────────────────────────────────────────────

describe('measureEdge', () => {
  it('returns sharpness 95 for RICH content', () => {
    const result = measureEdge(RICH)
    expect(result.sharpness).toBe(95)
  })

  it('returns monomolecular grade for RICH content', () => {
    const result = measureEdge(RICH)
    expect(result.grade).toBe('monomolecular')
  })

  it('detects isMonoSharp for RICH content', () => {
    const result = measureEdge(RICH)
    expect(result.isMonoSharp).toBe(true)
  })

  it('returns hasCleanEdge true for RICH content', () => {
    const result = measureEdge(RICH)
    expect(result.hasCleanEdge).toBe(true)
  })

  it('returns hasMirrorFinish true for RICH content', () => {
    const result = measureEdge(RICH)
    expect(result.hasMirrorFinish).toBe(true)
  })

  it('returns dull grade for EMPTY content', () => {
    const result = measureEdge(EMPTY)
    expect(result.grade).toBe('dull')
  })

  it('returns sharpness 30 for EMPTY content', () => {
    const result = measureEdge(EMPTY)
    expect(result.sharpness).toBe(30)
  })

  it('returns razor grade for MEDIUM content', () => {
    const result = measureEdge(MEDIUM)
    expect(result.grade).toBe('razor')
  })

  it('returns sharpness 77 for MEDIUM content', () => {
    const result = measureEdge(MEDIUM)
    expect(result.sharpness).toBe(77)
  })

  it('has microFractureCount >= 0', () => {
    const result = measureEdge(RICH)
    expect(result.microFractureCount).toBeGreaterThanOrEqual(0)
  })

  it('has chipCount >= 0', () => {
    const result = measureEdge(RICH)
    expect(result.chipCount).toBeGreaterThanOrEqual(0)
  })

  it('detects hasProperBevel false when no imports', () => {
    const result = measureEdge(RICH)
    expect(result.hasProperBevel).toBe(false)
  })

  it('detects hasKeenPoint for RICH content', () => {
    const result = measureEdge(RICH)
    expect(result.hasKeenPoint).toBe(true)
  })

  it('returns dull for empty string', () => {
    const result = measureEdge('')
    expect(result.grade).toBe('dull')
  })
})

// ─── measureFracture ───────────────────────────────────────────────────────

describe('measureFracture', () => {
  it('returns quality 77 for RICH content', () => {
    const result = measureFracture(RICH)
    expect(result.quality).toBe(77)
  })

  it('returns hackly type for RICH content', () => {
    const result = measureFracture(RICH)
    expect(result.type).toBe('hackly')
  })

  it('detects hasCleanBreak for RICH content', () => {
    const result = measureFracture(RICH)
    expect(result.hasCleanBreak).toBe(true)
  })

  it('detects hasConchoidalPattern for RICH content', () => {
    const result = measureFracture(RICH)
    expect(result.hasConchoidalPattern).toBe(true)
  })

  it('detects hasPercussionBulb for RICH content', () => {
    const result = measureFracture(RICH)
    expect(result.hasPercussionBulb).toBe(true)
  })

  it('returns earthy type for EMPTY content', () => {
    const result = measureFracture(EMPTY)
    expect(result.type).toBe('earthy')
  })

  it('returns quality 27 for EMPTY content', () => {
    const result = measureFracture(EMPTY)
    expect(result.quality).toBe(27)
  })

  it('returns splintery type for MEDIUM content', () => {
    const result = measureFracture(MEDIUM)
    expect(result.type).toBe('splintery')
  })

  it('returns quality 67 for MEDIUM content', () => {
    const result = measureFracture(MEDIUM)
    expect(result.quality).toBe(67)
  })

  it('detects hasProperFlake false when no imports', () => {
    const result = measureFracture(RICH)
    expect(result.hasProperFlake).toBe(false)
  })

  it('has shatterCount >= 0', () => {
    const result = measureFracture(RICH)
    expect(result.shatterCount).toBeGreaterThanOrEqual(0)
  })

  it('has hingeCount >= 0', () => {
    const result = measureFracture(RICH)
    expect(result.hingeCount).toBeGreaterThanOrEqual(0)
  })

  it('returns earthy type for empty string', () => {
    const result = measureFracture('')
    expect(result.type).toBe('earthy')
  })
})

// ─── measurePurity ─────────────────────────────────────────────────────────

describe('measurePurity', () => {
  it('returns level 95 for RICH content', () => {
    const result = measurePurity(RICH)
    expect(result.level).toBe(95)
  })

  it('returns rhyolitic source for RICH content', () => {
    const result = measurePurity(RICH)
    expect(result.source).toBe('rhyolitic')
  })

  it('detects isPure for RICH content', () => {
    const result = measurePurity(RICH)
    expect(result.isPure).toBe(true)
  })

  it('detects hasNoInclusions for RICH content', () => {
    const result = measurePurity(RICH)
    expect(result.hasNoInclusions).toBe(true)
  })

  it('detects hasHomogeneous for RICH content', () => {
    const result = measurePurity(RICH)
    expect(result.hasHomogeneous).toBe(true)
  })

  it('returns level 35 for EMPTY content', () => {
    const result = measurePurity(EMPTY)
    expect(result.level).toBe(35)
  })

  it('returns trachytic source for EMPTY content', () => {
    const result = measurePurity(EMPTY)
    expect(result.source).toBe('trachytic')
  })

  it('returns level 80 for MEDIUM content', () => {
    const result = measurePurity(MEDIUM)
    expect(result.level).toBe(80)
  })

  it('returns rhyolitic source for MEDIUM content', () => {
    const result = measurePurity(MEDIUM)
    expect(result.source).toBe('rhyolitic')
  })

  it('has inclusionCount >= 0', () => {
    const result = measurePurity(RICH)
    expect(result.inclusionCount).toBeGreaterThanOrEqual(0)
  })

  it('has xenolithCount >= 0', () => {
    const result = measurePurity(RICH)
    expect(result.xenolithCount).toBeGreaterThanOrEqual(0)
  })

  it('detects hasVitreous for RICH content', () => {
    const result = measurePurity(RICH)
    expect(result.hasVitreous).toBe(true)
  })
})

// ─── measureBeauty ─────────────────────────────────────────────────────────

describe('measureBeauty', () => {
  it('returns score 95 for RICH content', () => {
    const result = measureBeauty(RICH)
    expect(result.score).toBe(95)
  })

  it('returns midnight-black color for RICH content', () => {
    const result = measureBeauty(RICH)
    expect(result.color).toBe('midnight-black')
  })

  it('detects isBeautiful for RICH content', () => {
    const result = measureBeauty(RICH)
    expect(result.isBeautiful).toBe(true)
  })

  it('detects hasGemQuality for RICH content', () => {
    const result = measureBeauty(RICH)
    expect(result.hasGemQuality).toBe(true)
  })

  it('detects hasTranslucency for RICH content', () => {
    const result = measureBeauty(RICH)
    expect(result.hasTranslucency).toBe(true)
  })

  it('returns score 30 for EMPTY content', () => {
    const result = measureBeauty(EMPTY)
    expect(result.score).toBe(30)
  })

  it('returns dull-gray color for EMPTY content', () => {
    const result = measureBeauty(EMPTY)
    expect(result.color).toBe('dull-gray')
  })

  it('returns score 70 for MEDIUM content', () => {
    const result = measureBeauty(MEDIUM)
    expect(result.score).toBe(70)
  })

  it('returns gold-sheen color for MEDIUM content', () => {
    const result = measureBeauty(MEDIUM)
    expect(result.color).toBe('gold-sheen')
  })

  it('has imperfectionCount >= 0', () => {
    const result = measureBeauty(RICH)
    expect(result.imperfectionCount).toBeGreaterThanOrEqual(0)
  })

  it('has cloudingCount >= 0', () => {
    const result = measureBeauty(RICH)
    expect(result.cloudingCount).toBeGreaterThanOrEqual(0)
  })

  it('detects hasProperSheen for RICH content', () => {
    const result = measureBeauty(RICH)
    expect(result.hasProperSheen).toBe(true)
  })
})

// ─── measurePrecision ──────────────────────────────────────────────────────

describe('measurePrecision', () => {
  it('returns level 100 for RICH content', () => {
    const result = measurePrecision(RICH)
    expect(result.level).toBe(100)
  })

  it('returns surgeon craft for RICH content', () => {
    const result = measurePrecision(RICH)
    expect(result.craft).toBe('surgeon')
  })

  it('detects hasSurgicalPrecision for RICH content', () => {
    const result = measurePrecision(RICH)
    expect(result.hasSurgicalPrecision).toBe(true)
  })

  it('detects hasBifacialWork for RICH content', () => {
    const result = measurePrecision(RICH)
    expect(result.hasBifacialWork).toBe(true)
  })

  it('detects hasPressureFlaking for RICH content', () => {
    const result = measurePrecision(RICH)
    expect(result.hasPressureFlaking).toBe(true)
  })

  it('returns level 35 for EMPTY content', () => {
    const result = measurePrecision(EMPTY)
    expect(result.level).toBe(35)
  })

  it('returns careless craft for EMPTY content', () => {
    const result = measurePrecision(EMPTY)
    expect(result.craft).toBe('novice')
  })

  it('returns expert craft for MEDIUM content', () => {
    const result = measurePrecision(MEDIUM)
    expect(result.craft).toBe('expert')
  })

  it('returns level 72 for MEDIUM content', () => {
    const result = measurePrecision(MEDIUM)
    expect(result.level).toBe(72)
  })

  it('has hastyCount >= 0', () => {
    const result = measurePrecision(RICH)
    expect(result.hastyCount).toBeGreaterThanOrEqual(0)
  })

  it('has plowMarkCount >= 0', () => {
    const result = measurePrecision(RICH)
    expect(result.plowMarkCount).toBeGreaterThanOrEqual(0)
  })

  it('detects hasPlatformPreparation false when no imports', () => {
    const result = measurePrecision(RICH)
    expect(result.hasPlatformPreparation).toBe(false)
  })
})

// ─── measureMastery ────────────────────────────────────────────────────────

describe('measureMastery', () => {
  it('returns score 95 for RICH content', () => {
    const result = measureMastery(RICH)
    expect(result.score).toBe(95)
  })

  it('returns master-bladesmith rank for RICH content', () => {
    const result = measureMastery(RICH)
    expect(result.rank).toBe('master-bladesmith')
  })

  it('detects isMasterwork for RICH content', () => {
    const result = measureMastery(RICH)
    expect(result.isMasterwork).toBe(true)
  })

  it('detects hasCompleteTool for RICH content', () => {
    const result = measureMastery(RICH)
    expect(result.hasCompleteTool).toBe(true)
  })

  it('detects hasNoDefects for RICH content', () => {
    const result = measureMastery(RICH)
    expect(result.hasNoDefects).toBe(true)
  })

  it('returns score 25 for EMPTY content', () => {
    const result = measureMastery(EMPTY)
    expect(result.score).toBe(25)
  })

  it('returns beginner rank for EMPTY content', () => {
    const result = measureMastery(EMPTY)
    expect(result.rank).toBe('beginner')
  })

  it('returns score 67 for MEDIUM content', () => {
    const result = measureMastery(MEDIUM)
    expect(result.score).toBe(67)
  })

  it('returns skilled-artisan rank for MEDIUM content', () => {
    const result = measureMastery(MEDIUM)
    expect(result.rank).toBe('skilled-artisan')
  })

  it('has incompleteCount >= 0', () => {
    const result = measureMastery(RICH)
    expect(result.incompleteCount).toBeGreaterThanOrEqual(0)
  })

  it('has discardCount >= 0', () => {
    const result = measureMastery(RICH)
    expect(result.discardCount).toBeGreaterThanOrEqual(0)
  })

  it('detects hasBalanced for RICH content', () => {
    const result = measureMastery(RICH)
    expect(result.hasBalanced).toBe(true)
  })
})

// ─── analyzeObsidianShard ──────────────────────────────────────────────────

describe('analyzeObsidianShard', () => {
  it('returns macuahuitl condition for RICH content', () => {
    const shard = analyzeObsidianShard(RICH, 'src/rich.ts')
    expect(shard.condition).toBe('macuahuitl')
  })

  it('returns qualityScore 93 for RICH content', () => {
    const shard = analyzeObsidianShard(RICH, 'src/rich.ts')
    expect(shard.qualityScore).toBe(93)
  })

  it('returns edgeSharpness 95 for RICH content', () => {
    const shard = analyzeObsidianShard(RICH, 'src/rich.ts')
    expect(shard.edgeSharpness).toBe(95)
  })

  it('returns scraper condition for EMPTY content', () => {
    const shard = analyzeObsidianShard(EMPTY, 'src/empty.ts')
    expect(shard.condition).toBe('scraper')
  })

  it('returns qualityScore 30 for EMPTY content', () => {
    const shard = analyzeObsidianShard(EMPTY, 'src/empty.ts')
    expect(shard.qualityScore).toBe(30)
  })

  it('returns scalpel condition for MEDIUM content', () => {
    const shard = analyzeObsidianShard(MEDIUM, 'src/medium.ts')
    expect(shard.condition).toBe('scalpel')
  })

  it('returns qualityScore 72 for MEDIUM content', () => {
    const shard = analyzeObsidianShard(MEDIUM, 'src/medium.ts')
    expect(shard.qualityScore).toBe(72)
  })

  it('preserves filePath', () => {
    const shard = analyzeObsidianShard(RICH, 'src/test.ts')
    expect(shard.file).toBe('src/test.ts')
  })

  it('populates all measure objects', () => {
    const shard = analyzeObsidianShard(RICH, 'src/rich.ts')
    expect(shard.edge).toBeDefined()
    expect(shard.fracture).toBeDefined()
    expect(shard.purity).toBeDefined()
    expect(shard.beauty).toBeDefined()
    expect(shard.precision).toBeDefined()
    expect(shard.mastery).toBeDefined()
  })

  it('computes all numeric measures between 0 and 100', () => {
    const shard = analyzeObsidianShard(RICH, 'src/rich.ts')
    expect(shard.edgeSharpness).toBeGreaterThanOrEqual(0)
    expect(shard.edgeSharpness).toBeLessThanOrEqual(100)
    expect(shard.fractureQuality).toBeGreaterThanOrEqual(0)
    expect(shard.fractureQuality).toBeLessThanOrEqual(100)
    expect(shard.volcanicPurity).toBeGreaterThanOrEqual(0)
    expect(shard.volcanicPurity).toBeLessThanOrEqual(100)
    expect(shard.conchoidalBeauty).toBeGreaterThanOrEqual(0)
    expect(shard.conchoidalBeauty).toBeLessThanOrEqual(100)
    expect(shard.surgicalPrecision).toBeGreaterThanOrEqual(0)
    expect(shard.surgicalPrecision).toBeLessThanOrEqual(100)
    expect(shard.bladeMastery).toBeGreaterThanOrEqual(0)
    expect(shard.bladeMastery).toBeLessThanOrEqual(100)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns macuahuitl for quality >= 80', () => {
    const shard = analyzeObsidianShard(RICH, 'src/rich.ts')
    expect(classifyCondition(shard)).toBe('macuahuitl')
  })

  it('returns scraper for quality < 20', () => {
    const shard = analyzeObsidianShard('// nothing\n', 'x.ts')
    expect(shard.condition).toBe('scraper')
  })
})

// ─── classifyCacheType ─────────────────────────────────────────────────────

describe('classifyCacheType', () => {
  it('returns talus for empty shards', () => {
    expect(classifyCacheType([])).toBe('talus')
  })

  it('returns workshop for average quality mix', () => {
    const sp = analyzeObsidianShard(RICH, 'src/rich.ts')
    const em = analyzeObsidianShard(EMPTY, 'src/empty.ts')
    const md = analyzeObsidianShard(MEDIUM, 'src/medium.ts')
    expect(classifyCacheType([sp, em, md])).toBe('workshop')
  })
})

// ─── classifyCacheCondition ────────────────────────────────────────────────

describe('classifyCacheCondition', () => {
  it('returns armory for avgQuality >= 80', () => {
    expect(classifyCacheCondition(85)).toBe('armory')
  })

  it('returns toolkit for avgQuality >= 65', () => {
    expect(classifyCacheCondition(70)).toBe('toolkit')
  })

  it('returns rubble for avgQuality < 20', () => {
    expect(classifyCacheCondition(10)).toBe('rubble')
  })
})

// ─── classifyArtisanGrade ──────────────────────────────────────────────────

describe('classifyArtisanGrade', () => {
  it('returns master-artisan for avgQuality >= 80', () => {
    expect(classifyArtisanGrade(85)).toBe('master-artisan')
  })

  it('returns expert-flintknapper for avgQuality >= 65', () => {
    expect(classifyArtisanGrade(70)).toBe('expert-flintknapper')
  })

  it('returns clumsy for avgQuality < 20', () => {
    expect(classifyArtisanGrade(10)).toBe('clumsy')
  })
})

// ─── analyzeObsidianCache ──────────────────────────────────────────────────

describe('analyzeObsidianCache', () => {
  it('returns default cache for empty shards', () => {
    const cache = analyzeObsidianCache([], 'src')
    expect(cache.directory).toBe('src')
    expect(cache.shards).toHaveLength(0)
    expect(cache.avgSharpness).toBe(0)
    expect(cache.cacheType).toBe('talus')
    expect(cache.condition).toBe('rubble')
  })

  it('computes averages for multiple shards', () => {
    const sp = analyzeObsidianShard(RICH, 'src/rich.ts')
    const em = analyzeObsidianShard(EMPTY, 'src/empty.ts')
    const cache = analyzeObsidianCache([sp, em], 'src')
    expect(cache.avgSharpness).toBe(Math.round((95 + 30) / 2))
    expect(cache.macuahuitlCount).toBe(1)
    expect(cache.gravelCount).toBe(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive recommendation for high-quality code', () => {
    const shard = analyzeObsidianShard(RICH, 'src/rich.ts')
    const result = buildObsidianBladeResult(['src/rich.ts'], [RICH])
    const recs = generateRecommendations([shard], result.caches, result.quarry, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('returns recommendations for low-quality code', () => {
    const result = buildObsidianBladeResult(['src/empty.ts'], [EMPTY])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── buildObsidianBladeResult ──────────────────────────────────────────────

describe('buildObsidianBladeResult', () => {
  it('returns correct structure for RICH file', () => {
    const result = buildObsidianBladeResult(['src/rich.ts'], [RICH])
    expect(result.shards).toHaveLength(1)
    expect(result.shards[0].qualityScore).toBe(93)
    expect(result.shards[0].condition).toBe('macuahuitl')
    expect(result.caches).toHaveLength(1)
    expect(result.quarry.overallQuality).toBe(93)
    expect(result.quarry.isMasterwork).toBe(true)
  })

  it('returns correct structure for EMPTY file', () => {
    const result = buildObsidianBladeResult(['src/empty.ts'], [EMPTY])
    expect(result.shards).toHaveLength(1)
    expect(result.shards[0].qualityScore).toBe(30)
    expect(result.shards[0].condition).toBe('scraper')
    expect(result.quarry.overallQuality).toBe(30)
    expect(result.quarry.isMasterwork).toBe(false)
  })

  it('handles 3-file mix correctly', () => {
    const result = buildObsidianBladeResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.shards).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.quarry.overallQuality).toBe(65)
    expect(result.stats.artisanGrade).toBe('expert-flintknapper')
    expect(result.stats.macuahuitlCount).toBe(1)
    expect(result.stats.scalpelCount).toBe(1)
    expect(result.stats.scraperCount).toBe(1)
    expect(result.stats.isMonoSharpCount).toBe(1)
    expect(result.stats.isMasterworkCount).toBe(1)
    expect(result.stats.bestShard).toBe('src/rich.ts')
    expect(result.stats.sharpest).toBe('src/rich.ts')
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildObsidianBladeResult([], [])
    expect(result.shards).toHaveLength(0)
    expect(result.caches).toHaveLength(0)
    expect(result.quarry.overallQuality).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.bestShard).toBe('')
    expect(result.stats.sharpest).toBe('')
  })

  it('groups shards by directory', () => {
    const result = buildObsidianBladeResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.caches).toHaveLength(2)
  })

  it('populates stats counts correctly', () => {
    const result = buildObsidianBladeResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.hasCleanBreakCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isPureCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isBeautifulCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasSurgicalPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.gravelCount).toBe(0)
    expect(result.stats.knifeCount).toBe(0)
    expect(result.stats.spearPointCount).toBe(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('formatObsidianBladeJson', () => {
  it('returns valid JSON', () => {
    const result = buildObsidianBladeResult(['src/rich.ts'], [RICH])
    const json = formatObsidianBladeJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.shards).toHaveLength(1)
  })
})

describe('formatObsidianBladeTable', () => {
  it('returns string containing Obsidian Blade Analysis', () => {
    const result = buildObsidianBladeResult(['src/rich.ts'], [RICH])
    const output = formatObsidianBladeTable(result, false)
    expect(output).toContain('Obsidian Blade Analysis')
  })

  it('shows verbose output when requested', () => {
    const result = buildObsidianBladeResult(['src/rich.ts'], [RICH])
    const output = formatObsidianBladeTable(result, true)
    expect(output).toContain('Per-Shard Breakdown')
  })

  it('shows recommendations in table output', () => {
    const result = buildObsidianBladeResult(['src/rich.ts'], [RICH])
    const output = formatObsidianBladeTable(result, false)
    expect(output).toContain('Recommendations')
  })

  it('shows caches when present', () => {
    const result = buildObsidianBladeResult(['src/rich.ts'], [RICH])
    const output = formatObsidianBladeTable(result, false)
    expect(output).toContain('Caches')
  })
})

describe('scoreColor', () => {
  it('returns string for score 90', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })

  it('returns string for score 50', () => {
    expect(typeof scoreColor(50)).toBe('string')
  })

  it('returns string for score 10', () => {
    expect(typeof scoreColor(10)).toBe('string')
  })
})

describe('conditionColor', () => {
  it('returns colored string for macuahuitl', () => {
    expect(typeof conditionColor('macuahuitl')).toBe('string')
  })

  it('returns colored string for gravel', () => {
    expect(typeof conditionColor('gravel')).toBe('string')
  })

  it('returns input for unknown condition', () => {
    expect(conditionColor('unknown')).toBe('unknown')
  })
})

describe('gradeColor', () => {
  it('returns colored string for master-artisan', () => {
    expect(typeof gradeColor('master-artisan')).toBe('string')
  })

  it('returns input for unknown grade', () => {
    expect(gradeColor('unknown')).toBe('unknown')
  })
})

describe('cacheTypeColor', () => {
  it('returns colored string for temple-vault', () => {
    expect(typeof cacheTypeColor('temple-vault')).toBe('string')
  })

  it('returns input for unknown type', () => {
    expect(cacheTypeColor('unknown')).toBe('unknown')
  })
})

describe('edgeGradeColor', () => {
  it('returns colored string for monomolecular', () => {
    expect(typeof edgeGradeColor('monomolecular')).toBe('string')
  })

  it('returns input for unknown grade', () => {
    expect(edgeGradeColor('unknown')).toBe('unknown')
  })
})
