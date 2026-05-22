import { describe, expect, it } from 'vitest'

import {
  analyzeAmberSpecimen,
  buildAmberFossilResult,
  classifyCollectionCondition,
  classifyCollectionType,
  classifyCondition,
  classifyPaleontologistGrade,
  measureAge,
  measureClarity,
  measureHardness,
  measureInclusion,
  measurePreservation,
  measureValue,
} from '../src/commands/amber-fossil-helpers.js'
import {
  conditionColor,
  formatAmberFossilJson,
  formatAmberFossilTable,
  gradeColor,
  collectionTypeColor,
  scoreColor,
} from '../src/commands/amber-fossil-format-helpers.js'

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

// ─── measureClarity ──────────────────────────────────────────────────────────

describe('measureClarity', () => {
  it('returns level 80 for RICH content', () => {
    expect(measureClarity(RICH).level).toBe(80)
  })

  it('detects isClear for RICH content', () => {
    expect(measureClarity(RICH).isClear).toBe(true)
  })

  it('returns grade museum-grade for RICH content', () => {
    expect(measureClarity(RICH).grade).toBe('museum-grade')
  })

  it('returns hasTransparency true for RICH content', () => {
    expect(measureClarity(RICH).hasTransparency).toBe(true)
  })

  it('returns hasNoBubbles true for RICH content', () => {
    expect(measureClarity(RICH).hasNoBubbles).toBe(true)
  })

  it('returns hasFluorescence true for RICH content', () => {
    expect(measureClarity(RICH).hasFluorescence).toBe(true)
  })

  it('returns hasProperPolish true for RICH content', () => {
    expect(measureClarity(RICH).hasProperPolish).toBe(true)
  })
})

// ─── measureInclusion ────────────────────────────────────────────────────────

describe('measureInclusion', () => {
  it('returns quality 100 for RICH content', () => {
    expect(measureInclusion(RICH).quality).toBe(100)
  })

  it('returns type complete-organism for RICH content', () => {
    expect(measureInclusion(RICH).type).toBe('complete-organism')
  })

  it('detects hasCompleteDocumentation for RICH content', () => {
    expect(measureInclusion(RICH).hasCompleteDocumentation).toBe(true)
  })

  it('returns hasPreservedDetail true for RICH content', () => {
    expect(measureInclusion(RICH).hasPreservedDetail).toBe(true)
  })

  it('returns hasVisibleStructure true for RICH content', () => {
    expect(measureInclusion(RICH).hasVisibleStructure).toBe(true)
  })

  it('returns hasNoDecomposition true for RICH content', () => {
    expect(measureInclusion(RICH).hasNoDecomposition).toBe(true)
  })

  it('returns hasAirPocket true for RICH content', () => {
    expect(measureInclusion(RICH).hasAirPocket).toBe(true)
  })
})

// ─── measureHardness ─────────────────────────────────────────────────────────

describe('measureHardness', () => {
  it('returns level 75 for RICH content', () => {
    expect(measureHardness(RICH).level).toBe(75)
  })

  it('returns scale semi-fossilized for RICH content', () => {
    expect(measureHardness(RICH).scale).toBe('semi-fossilized')
  })

  it('detects isHard for RICH content', () => {
    expect(measureHardness(RICH).isHard).toBe(true)
  })

  it('returns hasScratchResistance true for RICH content', () => {
    expect(measureHardness(RICH).hasScratchResistance).toBe(true)
  })

  it('returns hasImpactResistance true for RICH content', () => {
    expect(measureHardness(RICH).hasImpactResistance).toBe(true)
  })

  it('returns hasProperPolymerization true for RICH content', () => {
    expect(measureHardness(RICH).hasProperPolymerization).toBe(true)
  })

  it('returns hasThermalStability true for RICH content', () => {
    expect(measureHardness(RICH).hasThermalStability).toBe(true)
  })
})

// ─── measureAge ──────────────────────────────────────────────────────────────

describe('measureAge', () => {
  it('returns depth 90 for RICH content', () => {
    expect(measureAge(RICH).depth).toBe(90)
  })

  it('returns era cretaceous for RICH content', () => {
    expect(measureAge(RICH).era).toBe('cretaceous')
  })

  it('detects isMature for RICH content', () => {
    expect(measureAge(RICH).isMature).toBe(true)
  })

  it('returns hasStratigraphicContext true for RICH content', () => {
    expect(measureAge(RICH).hasStratigraphicContext).toBe(true)
  })

  it('returns hasIndexFossils true for RICH content', () => {
    expect(measureAge(RICH).hasIndexFossils).toBe(true)
  })

  it('returns hasNoPseudoFossils true for RICH content', () => {
    expect(measureAge(RICH).hasNoPseudoFossils).toBe(true)
  })

  it('returns hasRadioactiveDating true for RICH content', () => {
    expect(measureAge(RICH).hasRadioactiveDating).toBe(true)
  })
})

// ─── measurePreservation ─────────────────────────────────────────────────────

describe('measurePreservation', () => {
  it('returns state 80 for RICH content', () => {
    expect(measurePreservation(RICH).state).toBe(80)
  })

  it('returns quality pristine for RICH content', () => {
    expect(measurePreservation(RICH).quality).toBe('pristine')
  })

  it('detects isWellPreserved for RICH content', () => {
    expect(measurePreservation(RICH).isWellPreserved).toBe(true)
  })

  it('returns hasProperConservation true for RICH content', () => {
    expect(measurePreservation(RICH).hasProperConservation).toBe(true)
  })

  it('returns hasNoDegradation true for RICH content', () => {
    expect(measurePreservation(RICH).hasNoDegradation).toBe(true)
  })

  it('returns hasUVProtection true for RICH content', () => {
    expect(measurePreservation(RICH).hasUVProtection).toBe(true)
  })

  it('returns hasConservationRecord true for RICH content', () => {
    expect(measurePreservation(RICH).hasConservationRecord).toBe(true)
  })
})

// ─── measureValue ────────────────────────────────────────────────────────────

describe('measureValue', () => {
  it('returns score 90 for RICH content', () => {
    expect(measureValue(RICH).score).toBe(90)
  })

  it('returns appraisal priceless for RICH content', () => {
    expect(measureValue(RICH).appraisal).toBe('priceless')
  })

  it('detects isValuable for RICH content', () => {
    expect(measureValue(RICH).isValuable).toBe(true)
  })

  it('returns hasRarity true for RICH content', () => {
    expect(measureValue(RICH).hasRarity).toBe(true)
  })

  it('returns hasScientificValue true for RICH content', () => {
    expect(measureValue(RICH).hasScientificValue).toBe(true)
  })

  it('returns hasNoDamage true for RICH content', () => {
    expect(measureValue(RICH).hasNoDamage).toBe(true)
  })

  it('returns hasHistoricalValue true for RICH content', () => {
    expect(measureValue(RICH).hasHistoricalValue).toBe(true)
  })
})

// ─── analyzeAmberSpecimen ────────────────────────────────────────────────────

describe('analyzeAmberSpecimen', () => {
  it('returns qualityScore 86 for RICH', () => {
    expect(analyzeAmberSpecimen(RICH, 'src/rich.ts').qualityScore).toBe(86)
  })

  it('returns condition baltic-gold for RICH', () => {
    expect(analyzeAmberSpecimen(RICH, 'src/rich.ts').condition).toBe('baltic-gold')
  })

  it('returns amberClarity 80 for RICH', () => {
    expect(analyzeAmberSpecimen(RICH, 'src/rich.ts').amberClarity).toBe(80)
  })

  it('returns inclusionQuality 100 for RICH', () => {
    expect(analyzeAmberSpecimen(RICH, 'src/rich.ts').inclusionQuality).toBe(100)
  })

  it('returns resinHardness 75 for RICH', () => {
    expect(analyzeAmberSpecimen(RICH, 'src/rich.ts').resinHardness).toBe(75)
  })

  it('returns fossilAge 90 for RICH', () => {
    expect(analyzeAmberSpecimen(RICH, 'src/rich.ts').fossilAge).toBe(90)
  })

  it('returns preservationState 80 for RICH', () => {
    expect(analyzeAmberSpecimen(RICH, 'src/rich.ts').preservationState).toBe(80)
  })

  it('returns specimenValue 90 for RICH', () => {
    expect(analyzeAmberSpecimen(RICH, 'src/rich.ts').specimenValue).toBe(90)
  })

  it('returns qualityScore 31 for EMPTY', () => {
    expect(analyzeAmberSpecimen(EMPTY, 'src/empty.ts').qualityScore).toBe(31)
  })

  it('returns condition jet-black for EMPTY', () => {
    expect(analyzeAmberSpecimen(EMPTY, 'src/empty.ts').condition).toBe('jet-black')
  })

  it('returns qualityScore 68 for MEDIUM', () => {
    expect(analyzeAmberSpecimen(MEDIUM, 'src/medium.ts').qualityScore).toBe(68)
  })

  it('returns condition dominican-blue for MEDIUM', () => {
    expect(analyzeAmberSpecimen(MEDIUM, 'src/medium.ts').condition).toBe('dominican-blue')
  })

  it('returns correct file name', () => {
    expect(analyzeAmberSpecimen(RICH, 'src/rich.ts').file).toBe('src/rich.ts')
  })

  it('populates clarity object', () => {
    const sp = analyzeAmberSpecimen(RICH, 'src/rich.ts')
    expect(sp.clarity.level).toBe(80)
    expect(sp.clarity.grade).toBe('museum-grade')
  })

  it('populates inclusion object', () => {
    const sp = analyzeAmberSpecimen(RICH, 'src/rich.ts')
    expect(sp.inclusion.quality).toBe(100)
    expect(sp.inclusion.type).toBe('complete-organism')
  })

  it('populates hardness object', () => {
    const sp = analyzeAmberSpecimen(RICH, 'src/rich.ts')
    expect(sp.hardness.level).toBe(75)
    expect(sp.hardness.scale).toBe('semi-fossilized')
  })

  it('populates age object', () => {
    const sp = analyzeAmberSpecimen(RICH, 'src/rich.ts')
    expect(sp.age.depth).toBe(90)
    expect(sp.age.era).toBe('cretaceous')
  })

  it('populates preservation object', () => {
    const sp = analyzeAmberSpecimen(RICH, 'src/rich.ts')
    expect(sp.preservation.state).toBe(80)
    expect(sp.preservation.quality).toBe('pristine')
  })

  it('populates value object', () => {
    const sp = analyzeAmberSpecimen(RICH, 'src/rich.ts')
    expect(sp.value.score).toBe(90)
    expect(sp.value.appraisal).toBe('priceless')
  })
})

// ─── classifiers ───────────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns baltic-gold for 85', () => {
    expect(classifyCondition(85)).toBe('baltic-gold')
  })
  it('returns dominican-blue for 70', () => {
    expect(classifyCondition(70)).toBe('dominican-blue')
  })
  it('returns burmite-royal for 55', () => {
    expect(classifyCondition(55)).toBe('burmite-royal')
  })
  it('returns copal-raw for 40', () => {
    expect(classifyCondition(40)).toBe('copal-raw')
  })
  it('returns jet-black for 25', () => {
    expect(classifyCondition(25)).toBe('jet-black')
  })
  it('returns sandstone for 10', () => {
    expect(classifyCondition(10)).toBe('sandstone')
  })
})

describe('classifyPaleontologistGrade', () => {
  it('returns curator for 85', () => {
    expect(classifyPaleontologistGrade(85)).toBe('curator')
  })
  it('returns paleontologist for 70', () => {
    expect(classifyPaleontologistGrade(70)).toBe('paleontologist')
  })
  it('returns collector for 55', () => {
    expect(classifyPaleontologistGrade(55)).toBe('collector')
  })
  it('returns enthusiast for 40', () => {
    expect(classifyPaleontologistGrade(40)).toBe('enthusiast')
  })
  it('returns tourist for 25', () => {
    expect(classifyPaleontologistGrade(25)).toBe('tourist')
  })
  it('returns beachcomber for 10', () => {
    expect(classifyPaleontologistGrade(10)).toBe('beachcomber')
  })
})

describe('classifyCollectionCondition', () => {
  it('returns world-heritage for 85', () => {
    expect(classifyCollectionCondition(85)).toBe('world-heritage')
  })
  it('returns university-museum for 55', () => {
    expect(classifyCollectionCondition(55)).toBe('university-museum')
  })
  it('returns sandbox for 10', () => {
    expect(classifyCollectionCondition(10)).toBe('sandbox')
  })
})

describe('classifyCollectionType', () => {
  it('returns private-collection for high-quality specimens', () => {
    const sp = analyzeAmberSpecimen(RICH, 'src/rich.ts')
    expect(classifyCollectionType([sp])).toBe('museum')
  })
  it('returns beach for empty specimens', () => {
    expect(classifyCollectionType([])).toBe('beach')
  })
  it('returns workshop for low-quality specimens', () => {
    const sp = analyzeAmberSpecimen(EMPTY, 'src/empty.ts')
    expect(classifyCollectionType([sp])).toBe('workshop')
  })
})

// ─── buildAmberFossilResult ──────────────────────────────────────────────────

describe('buildAmberFossilResult', () => {
  it('returns overallValue 62 for 3-file mix', () => {
    const result = buildAmberFossilResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.overallValue).toBe(62)
  })

  it('returns paleontologistGrade collector for 3-file mix', () => {
    const result = buildAmberFossilResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.paleontologistGrade).toBe('collector')
  })

  it('returns bestSpecimen src/rich.ts for 3-file mix', () => {
    const result = buildAmberFossilResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.bestSpecimen).toBe('src/rich.ts')
  })

  it('counts balticGoldCount 1 for 3-file mix', () => {
    const result = buildAmberFossilResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.balticGoldCount).toBe(1)
  })

  it('counts dominicanBlueCount 1 for 3-file mix', () => {
    const result = buildAmberFossilResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.dominicanBlueCount).toBe(1)
  })

  it('counts isClearCount 2 for 3-file mix', () => {
    const result = buildAmberFossilResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.isClearCount).toBe(2)
  })

  it('counts isHardCount 2 for 3-file mix', () => {
    const result = buildAmberFossilResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.isHardCount).toBe(2)
  })

  it('counts isMatureCount 2 for 3-file mix', () => {
    const result = buildAmberFossilResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.isMatureCount).toBe(2)
  })

  it('counts isWellPreservedCount 2 for 3-file mix', () => {
    const result = buildAmberFossilResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.isWellPreservedCount).toBe(2)
  })

  it('counts isValuableCount 2 for 3-file mix', () => {
    const result = buildAmberFossilResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.isValuableCount).toBe(2)
  })

  it('returns museum.isPriceless false for 3-file mix', () => {
    const result = buildAmberFossilResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.museum.isPriceless).toBe(false)
  })

  it('returns recommendations for 3-file mix', () => {
    const result = buildAmberFossilResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns specimens array with 3 entries', () => {
    const result = buildAmberFossilResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.specimens).toHaveLength(3)
  })

  it('returns empty specimens for empty input', () => {
    const result = buildAmberFossilResult([], [])
    expect(result.specimens).toHaveLength(0)
  })

  it('returns overallValue 0 for empty input', () => {
    const result = buildAmberFossilResult([], [])
    expect(result.stats.overallValue).toBe(0)
  })

  it('returns paleontologistGrade beachcomber for empty input', () => {
    const result = buildAmberFossilResult([], [])
    expect(result.stats.paleontologistGrade).toBe('beachcomber')
  })

  it('computes totalFiles correctly', () => {
    const result = buildAmberFossilResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.totalFiles).toBe(3)
  })

  it('populates collections for files with directory structure', () => {
    const result = buildAmberFossilResult(
      ['src/a.ts', 'src/b.ts'],
      [RICH, MEDIUM],
    )
    expect(result.collections.length).toBeGreaterThan(0)
  })

  it('counts hasCompleteDocumentationCount correctly', () => {
    const result = buildAmberFossilResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.hasCompleteDocumentationCount).toBe(1)
  })
})

// ─── format helpers ────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('scoreColor returns a string', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })

  it('conditionColor returns a string', () => {
    expect(typeof conditionColor('baltic-gold')).toBe('string')
  })

  it('gradeColor returns a string', () => {
    expect(typeof gradeColor('curator')).toBe('string')
  })

  it('collectionTypeColor returns a string', () => {
    expect(typeof collectionTypeColor('museum')).toBe('string')
  })

  it('formatAmberFossilJson returns valid JSON', () => {
    const result = buildAmberFossilResult(
      ['src/rich.ts', 'src/empty.ts'],
      [RICH, EMPTY],
    )
    const json = formatAmberFossilJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('formatAmberFossilTable returns string with header', () => {
    const result = buildAmberFossilResult(
      ['src/rich.ts', 'src/empty.ts'],
      [RICH, EMPTY],
    )
    const table = formatAmberFossilTable(result, false)
    expect(table).toContain('Amber Fossil Analysis')
  })

  it('formatAmberFossilTable shows per-specimen in verbose mode', () => {
    const result = buildAmberFossilResult(
      ['src/rich.ts', 'src/empty.ts'],
      [RICH, EMPTY],
    )
    const table = formatAmberFossilTable(result, true)
    expect(table).toContain('Per-Specimen Breakdown')
  })

  it('formatAmberFossilTable shows collections', () => {
    const result = buildAmberFossilResult(
      ['src/rich.ts', 'src/empty.ts'],
      [RICH, EMPTY],
    )
    const table = formatAmberFossilTable(result, false)
    expect(table).toContain('Collections')
  })

  it('formatAmberFossilTable shows recommendations', () => {
    const result = buildAmberFossilResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    const table = formatAmberFossilTable(result, false)
    expect(table).toContain('Recommendations')
  })

  it('conditionColor handles unknown condition', () => {
    expect(conditionColor('unknown')).toBe('unknown')
  })

  it('gradeColor handles unknown grade', () => {
    expect(gradeColor('unknown')).toBe('unknown')
  })

  it('collectionTypeColor handles unknown type', () => {
    expect(collectionTypeColor('unknown')).toBe('unknown')
  })
})
