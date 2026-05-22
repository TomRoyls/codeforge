import { describe, expect, it } from 'vitest'

import {
  analyzeForgedWork,
  analyzeForgeWorkshop,
  buildVulcanAnvilResult,
  classifyCondition,
  classifySmithGrade,
  classifyWorkshopCondition,
  classifyWorkshopType,
  generateRecommendations,
  measureAnvil,
  measureCraft,
  measureHammer,
  measureHeat,
  measureQuench,
  measureTemper,
} from '../src/commands/vulcan-anvil-helpers.js'
import {
  conditionColor,
  formatVulcanAnvilJson,
  formatVulcanAnvilTable,
  gradeColor,
  scoreColor,
  workshopTypeColor,
} from '../src/commands/vulcan-anvil-format-helpers.js'

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

// ─── measureHeat ───────────────────────────────────────────────────────────

describe('measureHeat', () => {
  it('returns intensity 95 for RICH content', () => {
    const result = measureHeat(RICH)
    expect(result.intensity).toBe(95)
  })

  it('returns forge-fire source for RICH content', () => {
    const result = measureHeat(RICH)
    expect(result.source).toBe('forge-fire')
  })

  it('detects hasProperHeat for RICH content', () => {
    const result = measureHeat(RICH)
    expect(result.hasProperHeat).toBe(true)
  })

  it('detects hasForgingTemperature for RICH content', () => {
    const result = measureHeat(RICH)
    expect(result.hasForgingTemperature).toBe(true)
  })

  it('detects hasNoScale for RICH content', () => {
    const result = measureHeat(RICH)
    expect(result.hasNoScale).toBe(true)
  })

  it('returns embers source for EMPTY content', () => {
    const result = measureHeat(EMPTY)
    expect(result.source).toBe('embers')
  })

  it('returns intensity 32 for EMPTY content', () => {
    const result = measureHeat(EMPTY)
    expect(result.intensity).toBe(32)
  })

  it('returns forge-fire source for MEDIUM content', () => {
    const result = measureHeat(MEDIUM)
    expect(result.source).toBe('forge-fire')
  })

  it('returns intensity 77 for MEDIUM content', () => {
    const result = measureHeat(MEDIUM)
    expect(result.intensity).toBe(77)
  })

  it('has scaleCount >= 0', () => {
    const result = measureHeat(RICH)
    expect(result.scaleCount).toBeGreaterThanOrEqual(0)
  })

  it('has burnoffCount >= 0', () => {
    const result = measureHeat(RICH)
    expect(result.burnoffCount).toBeGreaterThanOrEqual(0)
  })

  it('returns embers for empty string', () => {
    const result = measureHeat('')
    expect(result.source).toBe('embers')
  })
})

// ─── measureHammer ─────────────────────────────────────────────────────────

describe('measureHammer', () => {
  it('returns blows 95 for RICH content', () => {
    const result = measureHammer(RICH)
    expect(result.blows).toBe(95)
  })

  it('returns power-hammer technique for RICH content', () => {
    const result = measureHammer(RICH)
    expect(result.technique).toBe('power-hammer')
  })

  it('detects hasProperRefinement for RICH content', () => {
    const result = measureHammer(RICH)
    expect(result.hasProperRefinement).toBe(true)
  })

  it('detects hasDrawing for RICH content', () => {
    const result = measureHammer(RICH)
    expect(result.hasDrawing).toBe(true)
  })

  it('detects hasUpsetting for RICH content', () => {
    const result = measureHammer(RICH)
    expect(result.hasUpsetting).toBe(true)
  })

  it('returns no-striking for EMPTY content', () => {
    const result = measureHammer(EMPTY)
    expect(result.technique).toBe('no-striking')
  })

  it('returns blows 30 for EMPTY content', () => {
    const result = measureHammer(EMPTY)
    expect(result.blows).toBe(30)
  })

  it('returns planishing for MEDIUM content', () => {
    const result = measureHammer(MEDIUM)
    expect(result.technique).toBe('planishing')
  })

  it('returns blows 72 for MEDIUM content', () => {
    const result = measureHammer(MEDIUM)
    expect(result.blows).toBe(72)
  })

  it('has coldShutCount >= 0', () => {
    const result = measureHammer(RICH)
    expect(result.coldShutCount).toBeGreaterThanOrEqual(0)
  })

  it('has lapCount >= 0', () => {
    const result = measureHammer(RICH)
    expect(result.lapCount).toBeGreaterThanOrEqual(0)
  })

  it('detects hasProperSet for RICH content', () => {
    const result = measureHammer(RICH)
    expect(result.hasProperSet).toBe(true)
  })
})

// ─── measureAnvil ──────────────────────────────────────────────────────────

describe('measureAnvil', () => {
  it('returns stability 95 for RICH content', () => {
    const result = measureAnvil(RICH)
    expect(result.stability).toBe(95)
  })

  it('returns steel-face material for RICH content', () => {
    const result = measureAnvil(RICH)
    expect(result.material).toBe('steel-face')
  })

  it('detects isStable for RICH content', () => {
    const result = measureAnvil(RICH)
    expect(result.isStable).toBe(true)
  })

  it('detects hasHardie for RICH content', () => {
    const result = measureAnvil(RICH)
    expect(result.hasHardie).toBe(true)
  })

  it('detects hasFlatFace for RICH content', () => {
    const result = measureAnvil(RICH)
    expect(result.hasFlatFace).toBe(true)
  })

  it('returns ground material for EMPTY content', () => {
    const result = measureAnvil(EMPTY)
    expect(result.material).toBe('ground')
  })

  it('returns stability 28 for EMPTY content', () => {
    const result = measureAnvil(EMPTY)
    expect(result.stability).toBe(28)
  })

  it('returns cast-iron material for MEDIUM content', () => {
    const result = measureAnvil(MEDIUM)
    expect(result.material).toBe('cast-iron')
  })

  it('returns stability 76 for MEDIUM content', () => {
    const result = measureAnvil(MEDIUM)
    expect(result.stability).toBe(76)
  })

  it('has deadRingCount >= 0', () => {
    const result = measureAnvil(RICH)
    expect(result.deadRingCount).toBeGreaterThanOrEqual(0)
  })

  it('has deflectionCount >= 0', () => {
    const result = measureAnvil(RICH)
    expect(result.deflectionCount).toBeGreaterThanOrEqual(0)
  })

  it('detects hasPritchel false when no throws', () => {
    const result = measureAnvil(RICH)
    expect(result.hasPritchel).toBe(false)
  })
})

// ─── measureQuench ─────────────────────────────────────────────────────────

describe('measureQuench', () => {
  it('returns quality 95 for RICH content', () => {
    const result = measureQuench(RICH)
    expect(result.quality).toBe(95)
  })

  it('returns brine medium for RICH content', () => {
    const result = measureQuench(RICH)
    expect(result.medium).toBe('brine')
  })

  it('detects hasProperHardening for RICH content', () => {
    const result = measureQuench(RICH)
    expect(result.hasProperHardening).toBe(true)
  })

  it('detects hasProperTransformation false when no imports', () => {
    const result = measureQuench(RICH)
    expect(result.hasProperTransformation).toBe(false)
  })

  it('returns none medium for EMPTY content', () => {
    const result = measureQuench(EMPTY)
    expect(result.medium).toBe('none')
  })

  it('returns quality 30 for EMPTY content', () => {
    const result = measureQuench(EMPTY)
    expect(result.quality).toBe(30)
  })

  it('returns polymer medium for MEDIUM content', () => {
    const result = measureQuench(MEDIUM)
    expect(result.medium).toBe('polymer')
  })

  it('returns quality 69 for MEDIUM content', () => {
    const result = measureQuench(MEDIUM)
    expect(result.quality).toBe(69)
  })

  it('has crackCount >= 0', () => {
    const result = measureQuench(RICH)
    expect(result.crackCount).toBeGreaterThanOrEqual(0)
  })

  it('has warpCount >= 0', () => {
    const result = measureQuench(RICH)
    expect(result.warpCount).toBeGreaterThanOrEqual(0)
  })

  it('detects hasRapidSetting for RICH content', () => {
    const result = measureQuench(RICH)
    expect(result.hasRapidSetting).toBe(true)
  })
})

// ─── measureTemper ─────────────────────────────────────────────────────────

describe('measureTemper', () => {
  it('returns balance 95 for RICH content', () => {
    const result = measureTemper(RICH)
    expect(result.balance).toBe(95)
  })

  it('returns single-temper method for RICH content', () => {
    const result = measureTemper(RICH)
    expect(result.method).toBe('single-temper')
  })

  it('detects isBalanced for RICH content', () => {
    const result = measureTemper(RICH)
    expect(result.isBalanced).toBe(true)
  })

  it('detects hasHardnessAndToughness for RICH content', () => {
    const result = measureTemper(RICH)
    expect(result.hasHardnessAndToughness).toBe(true)
  })

  it('detects hasProperSpring for RICH content', () => {
    const result = measureTemper(RICH)
    expect(result.hasProperSpring).toBe(true)
  })

  it('returns balance 25 for EMPTY content', () => {
    const result = measureTemper(EMPTY)
    expect(result.balance).toBe(25)
  })

  it('returns raw method for EMPTY content', () => {
    const result = measureTemper(EMPTY)
    expect(result.method).toBe('raw')
  })

  it('returns flash method for MEDIUM content', () => {
    const result = measureTemper(MEDIUM)
    expect(result.method).toBe('flash')
  })

  it('returns balance 67 for MEDIUM content', () => {
    const result = measureTemper(MEDIUM)
    expect(result.balance).toBe(67)
  })

  it('has embrittlementCount >= 0', () => {
    const result = measureTemper(RICH)
    expect(result.embrittlementCount).toBeGreaterThanOrEqual(0)
  })

  it('has fragilityCount >= 0', () => {
    const result = measureTemper(RICH)
    expect(result.fragilityCount).toBeGreaterThanOrEqual(0)
  })

  it('detects hasStableStructure for RICH content', () => {
    const result = measureTemper(RICH)
    expect(result.hasStableStructure).toBe(true)
  })
})

// ─── measureCraft ──────────────────────────────────────────────────────────

describe('measureCraft', () => {
  it('returns score 100 for RICH content', () => {
    const result = measureCraft(RICH)
    expect(result.score).toBe(100)
  })

  it('returns journeyman level for RICH content', () => {
    const result = measureCraft(RICH)
    expect(result.level).toBe('journeyman')
  })

  it('detects hasArtistry for RICH content', () => {
    const result = measureCraft(RICH)
    expect(result.hasArtistry).toBe(true)
  })

  it('detects hasPrecision for RICH content', () => {
    const result = measureCraft(RICH)
    expect(result.hasPrecision).toBe(true)
  })

  it('detects hasFunction for RICH content', () => {
    const result = measureCraft(RICH)
    expect(result.hasFunction).toBe(true)
  })

  it('returns score 26 for EMPTY content', () => {
    const result = measureCraft(EMPTY)
    expect(result.score).toBe(26)
  })

  it('returns novice level for EMPTY content', () => {
    const result = measureCraft(EMPTY)
    expect(result.level).toBe('novice')
  })

  it('returns score 68 for MEDIUM content', () => {
    const result = measureCraft(MEDIUM)
    expect(result.score).toBe(68)
  })

  it('returns journeyman level for MEDIUM content', () => {
    const result = measureCraft(MEDIUM)
    expect(result.level).toBe('journeyman')
  })

  it('has defectCount >= 0', () => {
    const result = measureCraft(RICH)
    expect(result.defectCount).toBeGreaterThanOrEqual(0)
  })

  it('has shortcutCount >= 0', () => {
    const result = measureCraft(RICH)
    expect(result.shortcutCount).toBeGreaterThanOrEqual(0)
  })

  it('detects hasDurability for RICH content', () => {
    const result = measureCraft(RICH)
    expect(result.hasDurability).toBe(true)
  })
})

// ─── analyzeForgedWork ─────────────────────────────────────────────────────

describe('analyzeForgedWork', () => {
  it('returns aegis-shield condition for RICH content', () => {
    const work = analyzeForgedWork(RICH, 'src/rich.ts')
    expect(work.condition).toBe('aegis-shield')
  })

  it('returns qualityScore 96 for RICH content', () => {
    const work = analyzeForgedWork(RICH, 'src/rich.ts')
    expect(work.qualityScore).toBe(96)
  })

  it('returns forgeHeat 95 for RICH content', () => {
    const work = analyzeForgedWork(RICH, 'src/rich.ts')
    expect(work.forgeHeat).toBe(95)
  })

  it('returns pig-iron condition for EMPTY content', () => {
    const work = analyzeForgedWork(EMPTY, 'src/empty.ts')
    expect(work.condition).toBe('pig-iron')
  })

  it('returns qualityScore 28 for EMPTY content', () => {
    const work = analyzeForgedWork(EMPTY, 'src/empty.ts')
    expect(work.qualityScore).toBe(28)
  })

  it('returns thunderbolt condition for MEDIUM content', () => {
    const work = analyzeForgedWork(MEDIUM, 'src/medium.ts')
    expect(work.condition).toBe('thunderbolt')
  })

  it('returns qualityScore 72 for MEDIUM content', () => {
    const work = analyzeForgedWork(MEDIUM, 'src/medium.ts')
    expect(work.qualityScore).toBe(72)
  })

  it('preserves filePath', () => {
    const work = analyzeForgedWork(RICH, 'src/test.ts')
    expect(work.file).toBe('src/test.ts')
  })

  it('populates all measure objects', () => {
    const work = analyzeForgedWork(RICH, 'src/rich.ts')
    expect(work.heat).toBeDefined()
    expect(work.hammer).toBeDefined()
    expect(work.anvil).toBeDefined()
    expect(work.quench).toBeDefined()
    expect(work.temper).toBeDefined()
    expect(work.craft).toBeDefined()
  })

  it('computes all numeric measures between 0 and 100', () => {
    const work = analyzeForgedWork(RICH, 'src/rich.ts')
    expect(work.forgeHeat).toBeGreaterThanOrEqual(0)
    expect(work.forgeHeat).toBeLessThanOrEqual(100)
    expect(work.hammerWork).toBeGreaterThanOrEqual(0)
    expect(work.hammerWork).toBeLessThanOrEqual(100)
    expect(work.anvilStability).toBeGreaterThanOrEqual(0)
    expect(work.anvilStability).toBeLessThanOrEqual(100)
    expect(work.quenchQuality).toBeGreaterThanOrEqual(0)
    expect(work.quenchQuality).toBeLessThanOrEqual(100)
    expect(work.temperBalance).toBeGreaterThanOrEqual(0)
    expect(work.temperBalance).toBeLessThanOrEqual(100)
    expect(work.divineCraft).toBeGreaterThanOrEqual(0)
    expect(work.divineCraft).toBeLessThanOrEqual(100)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns aegis-shield for quality >= 80', () => {
    const work = analyzeForgedWork(RICH, 'src/rich.ts')
    expect(classifyCondition(work)).toBe('aegis-shield')
  })

  it('returns pig-iron for quality < 20', () => {
    const work = analyzeForgedWork('// nothing\n', 'x.ts')
    expect(classifyCondition(work)).toBe('pig-iron')
  })
})

// ─── classifyWorkshopType ──────────────────────────────────────────────────

describe('classifyWorkshopType', () => {
  it('returns ruins for empty works', () => {
    expect(classifyWorkshopType([])).toBe('ruins')
  })

  it('returns master-workshop for average quality mix', () => {
    const sp = analyzeForgedWork(RICH, 'src/rich.ts')
    const em = analyzeForgedWork(EMPTY, 'src/empty.ts')
    const md = analyzeForgedWork(MEDIUM, 'src/medium.ts')
    expect(classifyWorkshopType([sp, em, md])).toBe('master-workshop')
  })
})

// ─── classifyWorkshopCondition ─────────────────────────────────────────────

describe('classifyWorkshopCondition', () => {
  it('returns olympus for avgQuality >= 80', () => {
    expect(classifyWorkshopCondition(85)).toBe('olympus')
  })

  it('returns renowned for avgQuality >= 65', () => {
    expect(classifyWorkshopCondition(70)).toBe('renowned')
  })

  it('returns abandoned for avgQuality < 20', () => {
    expect(classifyWorkshopCondition(10)).toBe('abandoned')
  })
})

// ─── classifySmithGrade ────────────────────────────────────────────────────

describe('classifySmithGrade', () => {
  it('returns god-of-forge for avgQuality >= 80', () => {
    expect(classifySmithGrade(85)).toBe('god-of-forge')
  })

  it('returns master-smith for avgQuality >= 65', () => {
    expect(classifySmithGrade(70)).toBe('master-smith')
  })

  it('returns scrap-collector for avgQuality < 20', () => {
    expect(classifySmithGrade(10)).toBe('scrap-collector')
  })
})

// ─── analyzeForgeWorkshop ──────────────────────────────────────────────────

describe('analyzeForgeWorkshop', () => {
  it('returns default workshop for empty works', () => {
    const ws = analyzeForgeWorkshop([], 'src')
    expect(ws.directory).toBe('src')
    expect(ws.works).toHaveLength(0)
    expect(ws.avgHeat).toBe(0)
    expect(ws.workshopType).toBe('ruins')
    expect(ws.condition).toBe('abandoned')
  })

  it('computes averages for multiple works', () => {
    const sp = analyzeForgedWork(RICH, 'src/rich.ts')
    const em = analyzeForgedWork(EMPTY, 'src/empty.ts')
    const ws = analyzeForgeWorkshop([sp, em], 'src')
    expect(ws.avgHeat).toBe(Math.round((95 + 32) / 2))
    expect(ws.aegisCount).toBe(1)
    expect(ws.slagCount).toBe(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns recommendations for low-quality code', () => {
    const result = buildVulcanAnvilResult(['src/empty.ts'], [EMPTY])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns positive recommendation for high-quality code', () => {
    const result = buildVulcanAnvilResult(['src/rich.ts'], [RICH])
    const recs = generateRecommendations(result.works, result.workshops, result.pantheon, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── buildVulcanAnvilResult ────────────────────────────────────────────────

describe('buildVulcanAnvilResult', () => {
  it('returns correct structure for RICH file', () => {
    const result = buildVulcanAnvilResult(['src/rich.ts'], [RICH])
    expect(result.works).toHaveLength(1)
    expect(result.works[0].qualityScore).toBe(96)
    expect(result.works[0].condition).toBe('aegis-shield')
    expect(result.workshops).toHaveLength(1)
    expect(result.pantheon.overallQuality).toBe(96)
    expect(result.pantheon.isDivine).toBe(true)
  })

  it('returns correct structure for EMPTY file', () => {
    const result = buildVulcanAnvilResult(['src/empty.ts'], [EMPTY])
    expect(result.works).toHaveLength(1)
    expect(result.works[0].qualityScore).toBe(28)
    expect(result.works[0].condition).toBe('pig-iron')
    expect(result.pantheon.overallQuality).toBe(28)
    expect(result.pantheon.isDivine).toBe(false)
  })

  it('handles 3-file mix correctly', () => {
    const result = buildVulcanAnvilResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.works).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.pantheon.overallQuality).toBe(65)
    expect(result.stats.smithGrade).toBe('master-smith')
    expect(result.stats.aegisShieldCount).toBe(1)
    expect(result.stats.thunderboltCount).toBe(1)
    expect(result.stats.pigIronCount).toBe(1)
    expect(result.stats.isDivineCount).toBe(0)
    expect(result.stats.bestWork).toBe('src/rich.ts')
    expect(result.stats.hottest).toBe('src/rich.ts')
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildVulcanAnvilResult([], [])
    expect(result.works).toHaveLength(0)
    expect(result.workshops).toHaveLength(0)
    expect(result.pantheon.overallQuality).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.bestWork).toBe('')
    expect(result.stats.hottest).toBe('')
  })

  it('groups works by directory', () => {
    const result = buildVulcanAnvilResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.workshops).toHaveLength(2)
  })

  it('populates stats counts correctly', () => {
    const result = buildVulcanAnvilResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.hasProperHeatCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasProperRefinementCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isStableCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasProperHardeningCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isBalancedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.masterworkSwordCount).toBe(0)
    expect(result.stats.goodSteelCount).toBe(0)
    expect(result.stats.slagCount).toBe(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('formatVulcanAnvilJson', () => {
  it('returns valid JSON', () => {
    const result = buildVulcanAnvilResult(['src/rich.ts'], [RICH])
    const json = formatVulcanAnvilJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.works).toHaveLength(1)
  })
})

describe('formatVulcanAnvilTable', () => {
  it('returns string containing Vulcan Anvil Analysis', () => {
    const result = buildVulcanAnvilResult(['src/rich.ts'], [RICH])
    const output = formatVulcanAnvilTable(result, false)
    expect(output).toContain('Vulcan Anvil Analysis')
  })

  it('shows verbose output when requested', () => {
    const result = buildVulcanAnvilResult(['src/rich.ts'], [RICH])
    const output = formatVulcanAnvilTable(result, true)
    expect(output).toContain('Per-Work Breakdown')
  })

  it('shows recommendations in table output', () => {
    const result = buildVulcanAnvilResult(['src/rich.ts'], [RICH])
    const output = formatVulcanAnvilTable(result, false)
    expect(output).toContain('Recommendations')
  })

  it('shows workshops when present', () => {
    const result = buildVulcanAnvilResult(['src/rich.ts'], [RICH])
    const output = formatVulcanAnvilTable(result, false)
    expect(output).toContain('Workshops')
  })
})

describe('scoreColor', () => {
  it('returns string for score 90', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })
  it('returns string for score 10', () => {
    expect(typeof scoreColor(10)).toBe('string')
  })
})

describe('conditionColor', () => {
  it('returns colored string for aegis-shield', () => {
    expect(typeof conditionColor('aegis-shield')).toBe('string')
  })
  it('returns input for unknown', () => {
    expect(conditionColor('unknown')).toBe('unknown')
  })
})

describe('gradeColor', () => {
  it('returns colored string for god-of-forge', () => {
    expect(typeof gradeColor('god-of-forge')).toBe('string')
  })
  it('returns input for unknown', () => {
    expect(gradeColor('unknown')).toBe('unknown')
  })
})

describe('workshopTypeColor', () => {
  it('returns colored string for divine-forge', () => {
    expect(typeof workshopTypeColor('divine-forge')).toBe('string')
  })
  it('returns input for unknown', () => {
    expect(workshopTypeColor('unknown')).toBe('unknown')
  })
})
