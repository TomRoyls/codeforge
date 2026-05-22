import { describe, expect, it } from 'vitest'

import {
  analyzeMesaLayer,
  buildMesaPlateauResult,
  classifyCondition,
  classifyGeologistGrade,
  classifyRegionCondition,
  classifyRegionType,
  measureCaprock,
  measureCliff,
  measureElevation,
  measureErosion,
  measureHealth,
  measureLayering,
} from '../src/commands/mesa-plateau-helpers.js'
import {
  conditionColor,
  formatMesaPlateauJson,
  formatMesaPlateauTable,
  gradeColor,
  regionTypeColor,
  scoreColor,
} from '../src/commands/mesa-plateau-format-helpers.js'

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

// ─── measureElevation ──────────────────────────────────────────────────────

describe('measureElevation', () => {
  it('returns height 90 for RICH content', () => {
    const result = measureElevation(RICH)
    expect(result.height).toBe(90)
  })

  it('detects isHigh for RICH content', () => {
    expect(measureElevation(RICH).isHigh).toBe(true)
  })

  it('returns grade summit for RICH content', () => {
    expect(measureElevation(RICH).grade).toBe('summit')
  })

  it('returns hasProperAltitude true for RICH content', () => {
    expect(measureElevation(RICH).hasProperAltitude).toBe(true)
  })

  it('returns hasTrigPoint true for RICH content', () => {
    expect(measureElevation(RICH).hasTrigPoint).toBe(true)
  })

  it('returns hasPanoramicView true for RICH content', () => {
    expect(measureElevation(RICH).hasPanoramicView).toBe(true)
  })

  it('returns hasContourLines true for RICH content', () => {
    expect(measureElevation(RICH).hasContourLines).toBe(true)
  })

  it('returns hasPlateauTop true for RICH content', () => {
    expect(measureElevation(RICH).hasPlateauTop).toBe(true)
  })
})

// ─── measureLayering ───────────────────────────────────────────────────────

describe('measureLayering', () => {
  it('returns quality 70 for RICH content', () => {
    expect(measureLayering(RICH).quality).toBe(70)
  })

  it('detects isWellLayered for RICH content', () => {
    expect(measureLayering(RICH).isWellLayered).toBe(true)
  })

  it('returns type metamorphic for RICH content', () => {
    expect(measureLayering(RICH).type).toBe('metamorphic')
  })

  it('returns hasClearStrata true for RICH content', () => {
    expect(measureLayering(RICH).hasClearStrata).toBe(true)
  })

  it('returns hasProperBedding true for RICH content', () => {
    expect(measureLayering(RICH).hasProperBedding).toBe(true)
  })

  it('returns hasCrossBedding true for RICH content', () => {
    expect(measureLayering(RICH).hasCrossBedding).toBe(true)
  })

  it('returns hasFossilBeds true for RICH content', () => {
    expect(measureLayering(RICH).hasFossilBeds).toBe(true)
  })
})

// ─── measureErosion ────────────────────────────────────────────────────────

describe('measureErosion', () => {
  it('returns resistance 75 for RICH content', () => {
    expect(measureErosion(RICH).resistance).toBe(75)
  })

  it('returns rate slow for RICH content', () => {
    expect(measureErosion(RICH).rate).toBe('slow')
  })

  it('returns hasHardRock true for RICH content', () => {
    expect(measureErosion(RICH).hasHardRock).toBe(true)
  })

  it('returns hasWeatheringResistance true for RICH content', () => {
    expect(measureErosion(RICH).hasWeatheringResistance).toBe(true)
  })

  it('returns hasVegetation true for RICH content', () => {
    expect(measureErosion(RICH).hasVegetation).toBe(true)
  })

  it('returns hasProperDrainage true for RICH content', () => {
    expect(measureErosion(RICH).hasProperDrainage).toBe(true)
  })

  it('returns isErosionResistant false for RICH (gully)', () => {
    expect(measureErosion(RICH).isErosionResistant).toBe(false)
  })
})

// ─── measureCliff ──────────────────────────────────────────────────────────

describe('measureCliff', () => {
  it('returns quality 90 for RICH content', () => {
    expect(measureCliff(RICH).quality).toBe(90)
  })

  it('returns face vertical for RICH content', () => {
    expect(measureCliff(RICH).face).toBe('vertical')
  })

  it('returns hasCleanInterface true for RICH content', () => {
    expect(measureCliff(RICH).hasCleanInterface).toBe(true)
  })

  it('returns hasAnchorPoints true for RICH content', () => {
    expect(measureCliff(RICH).hasAnchorPoints).toBe(true)
  })

  it('returns hasVerticalFace true for RICH content', () => {
    expect(measureCliff(RICH).hasVerticalFace).toBe(true)
  })

  it('returns hasProperHandholds true for RICH content', () => {
    expect(measureCliff(RICH).hasProperHandholds).toBe(true)
  })

  it('returns hasNaturalTerrace true for RICH content', () => {
    expect(measureCliff(RICH).hasNaturalTerrace).toBe(true)
  })
})

// ─── measureCaprock ────────────────────────────────────────────────────────

describe('measureCaprock', () => {
  it('returns strength 90 for RICH content', () => {
    expect(measureCaprock(RICH).strength).toBe(90)
  })

  it('returns material basalt for RICH content', () => {
    expect(measureCaprock(RICH).material).toBe('basalt')
  })

  it('returns isStrong true for RICH content', () => {
    expect(measureCaprock(RICH).isStrong).toBe(true)
  })

  it('returns hasProtectiveLayer true for RICH content', () => {
    expect(measureCaprock(RICH).hasProtectiveLayer).toBe(true)
  })

  it('returns hasUniformHardness true for RICH content', () => {
    expect(measureCaprock(RICH).hasUniformHardness).toBe(true)
  })

  it('returns hasJointPattern true for RICH content', () => {
    expect(measureCaprock(RICH).hasJointPattern).toBe(true)
  })

  it('returns hasDesertVarnish true for RICH content', () => {
    expect(measureCaprock(RICH).hasDesertVarnish).toBe(true)
  })
})

// ─── measureHealth ─────────────────────────────────────────────────────────

describe('measureHealth', () => {
  it('returns score 70 for RICH content', () => {
    expect(measureHealth(RICH).score).toBe(70)
  })

  it('returns status stable for RICH content', () => {
    expect(measureHealth(RICH).status).toBe('stable')
  })

  it('returns isStable true for RICH content', () => {
    expect(measureHealth(RICH).isStable).toBe(true)
  })

  it('returns hasLongevity true for RICH content', () => {
    expect(measureHealth(RICH).hasLongevity).toBe(true)
  })

  it('returns hasNaturalBeauty true for RICH content', () => {
    expect(measureHealth(RICH).hasNaturalBeauty).toBe(true)
  })

  it('returns hasProperSealing true for RICH content', () => {
    expect(measureHealth(RICH).hasProperSealing).toBe(true)
  })

  it('returns hasArchaeological true for RICH content', () => {
    expect(measureHealth(RICH).hasArchaeological).toBe(true)
  })
})

// ─── analyzeMesaLayer ──────────────────────────────────────────────────────

describe('analyzeMesaLayer', () => {
  it('returns qualityScore 81 for RICH', () => {
    expect(analyzeMesaLayer(RICH, 'src/rich.ts').qualityScore).toBe(81)
  })

  it('returns condition monument-valley for RICH', () => {
    expect(analyzeMesaLayer(RICH, 'src/rich.ts').condition).toBe('monument-valley')
  })

  it('returns elevation 90 for RICH', () => {
    expect(analyzeMesaLayer(RICH, 'src/rich.ts').elevation).toBe(90)
  })

  it('returns layering 70 for RICH', () => {
    expect(analyzeMesaLayer(RICH, 'src/rich.ts').layering).toBe(70)
  })

  it('returns erosionResistance 75 for RICH', () => {
    expect(analyzeMesaLayer(RICH, 'src/rich.ts').erosionResistance).toBe(75)
  })

  it('returns cliffFace 90 for RICH', () => {
    expect(analyzeMesaLayer(RICH, 'src/rich.ts').cliffFace).toBe(90)
  })

  it('returns caprockStrength 90 for RICH', () => {
    expect(analyzeMesaLayer(RICH, 'src/rich.ts').caprockStrength).toBe(90)
  })

  it('returns plateauHealth 70 for RICH', () => {
    expect(analyzeMesaLayer(RICH, 'src/rich.ts').plateauHealth).toBe(70)
  })

  it('returns qualityScore 33 for EMPTY', () => {
    expect(analyzeMesaLayer(EMPTY, 'src/empty.ts').qualityScore).toBe(33)
  })

  it('returns condition hoodoo for EMPTY', () => {
    expect(analyzeMesaLayer(EMPTY, 'src/empty.ts').condition).toBe('hoodoo')
  })

  it('returns elevation 30 for EMPTY', () => {
    expect(analyzeMesaLayer(EMPTY, 'src/empty.ts').elevation).toBe(30)
  })

  it('returns qualityScore 75 for MEDIUM', () => {
    expect(analyzeMesaLayer(MEDIUM, 'src/medium.ts').qualityScore).toBe(75)
  })

  it('returns condition table-mountain for MEDIUM', () => {
    expect(analyzeMesaLayer(MEDIUM, 'src/medium.ts').condition).toBe('table-mountain')
  })

  it('returns elevation 100 for MEDIUM', () => {
    expect(analyzeMesaLayer(MEDIUM, 'src/medium.ts').elevation).toBe(100)
  })

  it('returns correct file name', () => {
    expect(analyzeMesaLayer(RICH, 'src/rich.ts').file).toBe('src/rich.ts')
  })

  it('populates elev object', () => {
    const layer = analyzeMesaLayer(RICH, 'src/rich.ts')
    expect(layer.elev.height).toBe(90)
    expect(layer.elev.grade).toBe('summit')
  })

  it('populates layer object', () => {
    const layer = analyzeMesaLayer(RICH, 'src/rich.ts')
    expect(layer.layer.quality).toBe(70)
    expect(layer.layer.type).toBe('metamorphic')
  })

  it('populates erosion object', () => {
    const layer = analyzeMesaLayer(RICH, 'src/rich.ts')
    expect(layer.erosion.resistance).toBe(75)
    expect(layer.erosion.rate).toBe('slow')
  })

  it('populates cliff object', () => {
    const layer = analyzeMesaLayer(RICH, 'src/rich.ts')
    expect(layer.cliff.quality).toBe(90)
    expect(layer.cliff.face).toBe('vertical')
  })

  it('populates caprock object', () => {
    const layer = analyzeMesaLayer(RICH, 'src/rich.ts')
    expect(layer.caprock.strength).toBe(90)
    expect(layer.caprock.material).toBe('basalt')
  })

  it('populates health object', () => {
    const layer = analyzeMesaLayer(RICH, 'src/rich.ts')
    expect(layer.health.score).toBe(70)
    expect(layer.health.status).toBe('stable')
  })
})

// ─── classifiers ───────────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns monument-valley for 85', () => {
    expect(classifyCondition(85)).toBe('monument-valley')
  })
  it('returns table-mountain for 70', () => {
    expect(classifyCondition(70)).toBe('table-mountain')
  })
  it('returns mesa-verde for 55', () => {
    expect(classifyCondition(55)).toBe('mesa-verde')
  })
  it('returns butte for 40', () => {
    expect(classifyCondition(40)).toBe('butte')
  })
  it('returns hoodoo for 25', () => {
    expect(classifyCondition(25)).toBe('hoodoo')
  })
  it('returns dust for 10', () => {
    expect(classifyCondition(10)).toBe('dust')
  })
})

describe('classifyGeologistGrade', () => {
  it('returns field-geologist for 85', () => {
    expect(classifyGeologistGrade(85)).toBe('field-geologist')
  })
  it('returns stratigrapher for 70', () => {
    expect(classifyGeologistGrade(70)).toBe('stratigrapher')
  })
  it('returns geomorphologist for 55', () => {
    expect(classifyGeologistGrade(55)).toBe('geomorphologist')
  })
  it('returns geologist for 40', () => {
    expect(classifyGeologistGrade(40)).toBe('geologist')
  })
  it('returns rockhound for 25', () => {
    expect(classifyGeologistGrade(25)).toBe('rockhound')
  })
  it('returns tourist for 10', () => {
    expect(classifyGeologistGrade(10)).toBe('tourist')
  })
})

describe('classifyRegionCondition', () => {
  it('returns world-heritage for 85', () => {
    expect(classifyRegionCondition(85)).toBe('world-heritage')
  })
  it('returns protected for 70', () => {
    expect(classifyRegionCondition(70)).toBe('protected')
  })
  it('returns monument for 55', () => {
    expect(classifyRegionCondition(55)).toBe('monument')
  })
  it('returns recreational for 40', () => {
    expect(classifyRegionCondition(40)).toBe('recreational')
  })
  it('returns abandoned for 25', () => {
    expect(classifyRegionCondition(25)).toBe('abandoned')
  })
  it('returns quarry for 10', () => {
    expect(classifyRegionCondition(10)).toBe('quarry')
  })
})

describe('classifyRegionType', () => {
  it('returns national-park for high-quality layers', () => {
    const layer = analyzeMesaLayer(RICH, 'src/rich.ts')
    expect(classifyRegionType([layer])).toBe('national-park')
  })
  it('returns wasteland for empty layers', () => {
    expect(classifyRegionType([])).toBe('wasteland')
  })
  it('returns canyon for low-quality layers', () => {
    const layer = analyzeMesaLayer(EMPTY, 'src/empty.ts')
    expect(classifyRegionType([layer])).toBe('canyon')
  })
  it('returns wilderness for medium-quality layers', () => {
    const layer = analyzeMesaLayer(MEDIUM, 'src/medium.ts')
    expect(classifyRegionType([layer])).toBe('wilderness')
  })
  it('returns badlands for mixed layers', () => {
    const rich = analyzeMesaLayer(RICH, 'src/rich.ts')
    const empty = analyzeMesaLayer(EMPTY, 'src/empty.ts')
    expect(classifyRegionType([rich, empty])).toBe('badlands')
  })
  it('returns canyon for below-average layers', () => {
    const empty = analyzeMesaLayer(EMPTY, 'src/empty.ts')
    const empty2 = analyzeMesaLayer(EMPTY, 'src/empty2.ts')
    expect(classifyRegionType([empty, empty2])).toBe('canyon')
  })
})

// ─── buildMesaPlateauResult ────────────────────────────────────────────────

describe('buildMesaPlateauResult', () => {
  it('returns overallStability 63 for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.overallStability).toBe(63)
  })

  it('returns geologistGrade geomorphologist for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.geologistGrade).toBe('geomorphologist')
  })

  it('returns bestLayer src/rich.ts for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.bestLayer).toBe('src/rich.ts')
  })

  it('returns highest src/medium.ts for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.highest).toBe('src/medium.ts')
  })

  it('returns bestLayered src/rich.ts for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.bestLayered).toBe('src/rich.ts')
  })

  it('returns mostResistant src/rich.ts for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.mostResistant).toBe('src/rich.ts')
  })

  it('returns bestCliff src/rich.ts for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.bestCliff).toBe('src/rich.ts')
  })

  it('returns strongestCaprock src/rich.ts for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.strongestCaprock).toBe('src/rich.ts')
  })

  it('counts monumentValleyCount 1 for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.monumentValleyCount).toBe(1)
  })

  it('counts tableMountainCount 1 for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.tableMountainCount).toBe(1)
  })

  it('counts hoodooCount 1 for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.hoodooCount).toBe(1)
  })

  it('counts isHighCount 2 for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.isHighCount).toBe(2)
  })

  it('counts isWellLayeredCount 2 for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.isWellLayeredCount).toBe(2)
  })

  it('counts hasCleanInterfaceCount 2 for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.hasCleanInterfaceCount).toBe(2)
  })

  it('counts isStrongCount 2 for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.isStrongCount).toBe(2)
  })

  it('counts isStableCount 2 for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.isStableCount).toBe(2)
  })

  it('returns range.overallStability 63 for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.range.overallStability).toBe(63)
  })

  it('returns range.isMajestic false for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.range.isMajestic).toBe(false)
  })

  it('returns range.avgElevation 73 for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.range.avgElevation).toBe(73)
  })

  it('returns range.avgLayering 57 for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.range.avgLayering).toBe(57)
  })

  it('returns range.avgHealth 57 for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.range.avgHealth).toBe(57)
  })

  it('returns recommendations for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns layers array with 3 entries for 3-file mix', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.layers).toHaveLength(3)
  })

  it('returns empty layers for empty input', () => {
    const result = buildMesaPlateauResult([], [])
    expect(result.layers).toHaveLength(0)
  })

  it('returns overallStability 0 for empty input', () => {
    const result = buildMesaPlateauResult([], [])
    expect(result.stats.overallStability).toBe(0)
  })

  it('returns geologistGrade tourist for empty input', () => {
    const result = buildMesaPlateauResult([], [])
    expect(result.stats.geologistGrade).toBe('tourist')
  })

  it('returns range.isMajestic false for empty input', () => {
    const result = buildMesaPlateauResult([], [])
    expect(result.range.isMajestic).toBe(false)
  })

  it('populates regions for files with directory structure', () => {
    const result = buildMesaPlateauResult(
      ['src/a.ts', 'src/b.ts'],
      [RICH, MEDIUM],
    )
    expect(result.regions.length).toBeGreaterThan(0)
  })

  it('computes totalFiles correctly', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.totalFiles).toBe(3)
  })
})

// ─── format helpers ────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('scoreColor returns a string', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })

  it('conditionColor returns a string', () => {
    expect(typeof conditionColor('monument-valley')).toBe('string')
  })

  it('gradeColor returns a string', () => {
    expect(typeof gradeColor('field-geologist')).toBe('string')
  })

  it('regionTypeColor returns a string', () => {
    expect(typeof regionTypeColor('national-park')).toBe('string')
  })

  it('formatMesaPlateauJson returns valid JSON', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts'],
      [RICH, EMPTY],
    )
    const json = formatMesaPlateauJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('formatMesaPlateauTable returns string with header', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts'],
      [RICH, EMPTY],
    )
    const table = formatMesaPlateauTable(result, false)
    expect(table).toContain('Mesa Plateau Analysis')
  })

  it('formatMesaPlateauTable shows per-layer in verbose mode', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts'],
      [RICH, EMPTY],
    )
    const table = formatMesaPlateauTable(result, true)
    expect(table).toContain('Per-Layer Breakdown')
  })

  it('formatMesaPlateauTable shows regions', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts'],
      [RICH, EMPTY],
    )
    const table = formatMesaPlateauTable(result, false)
    expect(table).toContain('Regions')
  })

  it('formatMesaPlateauTable shows recommendations', () => {
    const result = buildMesaPlateauResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    const table = formatMesaPlateauTable(result, false)
    expect(table).toContain('Recommendations')
  })

  it('conditionColor handles unknown condition', () => {
    expect(conditionColor('unknown')).toBe('unknown')
  })

  it('gradeColor handles unknown grade', () => {
    expect(gradeColor('unknown')).toBe('unknown')
  })

  it('regionTypeColor handles unknown type', () => {
    expect(regionTypeColor('unknown')).toBe('unknown')
  })
})
