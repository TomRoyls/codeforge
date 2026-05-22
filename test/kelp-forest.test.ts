import { describe, expect, it } from 'vitest'

import {
  analyzeKelpFrond,
  buildKelpForestResult,
  classifyCondition,
  classifyMarineBiologistGrade,
  classifyRegionCondition,
  classifyRegionType,
  measureBladder,
  measureCanopy,
  measureGrowth,
  measureHealth,
  measureHoldfast,
  measureUnderstory,
} from '../src/commands/kelp-forest-helpers.js'
import {
  conditionColor,
  formatKelpForestJson,
  formatKelpForestTable,
  gradeColor,
  regionTypeColor,
  scoreColor,
} from '../src/commands/kelp-forest-format-helpers.js'

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

// ─── measureGrowth ──────────────────────────────────────────────────────────

describe('measureGrowth', () => {
  it('returns rate 70 for RICH content', () => {
    expect(measureGrowth(RICH).rate).toBe(70)
  })

  it('detects isGrowing for RICH content', () => {
    expect(measureGrowth(RICH).isGrowing).toBe(true)
  })

  it('returns stage adult for RICH content', () => {
    expect(measureGrowth(RICH).stage).toBe('adult')
  })

  it('returns hasProperMeristem true for RICH content', () => {
    expect(measureGrowth(RICH).hasProperMeristem).toBe(true)
  })

  it('returns hasStipeElongation true for RICH content', () => {
    expect(measureGrowth(RICH).hasStipeElongation).toBe(true)
  })

  it('returns hasNoStunting true for RICH content', () => {
    expect(measureGrowth(RICH).hasNoStunting).toBe(true)
  })

  it('returns hasProperBiomass true for RICH content', () => {
    expect(measureGrowth(RICH).hasProperBiomass).toBe(true)
  })
})

// ─── measureHoldfast ────────────────────────────────────────────────────────

describe('measureHoldfast', () => {
  it('returns strength 80 for RICH content', () => {
    expect(measureHoldfast(RICH).strength).toBe(80)
  })

  it('returns type bedrock for RICH content', () => {
    expect(measureHoldfast(RICH).type).toBe('bedrock')
  })

  it('detects isWellAnchored for RICH content', () => {
    expect(measureHoldfast(RICH).isWellAnchored).toBe(true)
  })

  it('returns hasRootHaptera true for RICH content', () => {
    expect(measureHoldfast(RICH).hasRootHaptera).toBe(true)
  })

  it('returns hasDeepAttachment true for RICH content', () => {
    expect(measureHoldfast(RICH).hasDeepAttachment).toBe(true)
  })

  it('returns hasNoScouring true for RICH content', () => {
    expect(measureHoldfast(RICH).hasNoScouring).toBe(true)
  })

  it('returns hasNoDrift true for RICH content', () => {
    expect(measureHoldfast(RICH).hasNoDrift).toBe(true)
  })
})

// ─── measureCanopy ──────────────────────────────────────────────────────────

describe('measureCanopy', () => {
  it('returns density 80 for RICH content', () => {
    expect(measureCanopy(RICH).density).toBe(80)
  })

  it('returns layer surface-canopy for RICH content', () => {
    expect(measureCanopy(RICH).layer).toBe('surface-canopy')
  })

  it('detects hasDenseCanopy for RICH content', () => {
    expect(measureCanopy(RICH).hasDenseCanopy).toBe(true)
  })

  it('returns hasProperStratification true for RICH content', () => {
    expect(measureCanopy(RICH).hasProperStratification).toBe(true)
  })

  it('returns hasProperShading true for RICH content', () => {
    expect(measureCanopy(RICH).hasProperShading).toBe(true)
  })

  it('returns hasWaveAttenuation true for RICH content', () => {
    expect(measureCanopy(RICH).hasWaveAttenuation).toBe(true)
  })

  it('returns hasLightCapture true for RICH content', () => {
    expect(measureCanopy(RICH).hasLightCapture).toBe(true)
  })
})

// ─── measureUnderstory ──────────────────────────────────────────────────────

describe('measureUnderstory', () => {
  it('returns richness 75 for RICH content', () => {
    expect(measureUnderstory(RICH).richness).toBe(75)
  })

  it('returns diversity moderate for RICH content', () => {
    expect(measureUnderstory(RICH).diversity).toBe('moderate')
  })

  it('returns hasEpiphytes true for RICH content', () => {
    expect(measureUnderstory(RICH).hasEpiphytes).toBe(true)
  })

  it('returns hasNursery true for RICH content', () => {
    expect(measureUnderstory(RICH).hasNursery).toBe(true)
  })

  it('returns hasRefugeHabitat true for RICH content', () => {
    expect(measureUnderstory(RICH).hasRefugeHabitat).toBe(true)
  })

  it('returns hasGrazers true for RICH content', () => {
    expect(measureUnderstory(RICH).hasGrazers).toBe(true)
  })

  it('returns hasNoBarren true for RICH content', () => {
    expect(measureUnderstory(RICH).hasNoBarren).toBe(true)
  })
})

// ─── measureBladder ─────────────────────────────────────────────────────────

describe('measureBladder', () => {
  it('returns buoyancy 70 for RICH content', () => {
    expect(measureBladder(RICH).buoyancy).toBe(70)
  })

  it('returns fill partially-filled for RICH content', () => {
    expect(measureBladder(RICH).fill).toBe('partially-filled')
  })

  it('returns hasProperLift true for RICH content', () => {
    expect(measureBladder(RICH).hasProperLift).toBe(true)
  })

  it('returns hasNeutralBuoyancy true for RICH content', () => {
    expect(measureBladder(RICH).hasNeutralBuoyancy).toBe(true)
  })

  it('returns hasUpwardReach true for RICH content', () => {
    expect(measureBladder(RICH).hasUpwardReach).toBe(true)
  })

  it('returns hasNoLeaking true for RICH content', () => {
    expect(measureBladder(RICH).hasNoLeaking).toBe(true)
  })

  it('returns hasProperPneumatocyst true for RICH content', () => {
    expect(measureBladder(RICH).hasProperPneumatocyst).toBe(true)
  })
})

// ─── measureHealth ──────────────────────────────────────────────────────────

describe('measureHealth', () => {
  it('returns score 70 for RICH content', () => {
    expect(measureHealth(RICH).score).toBe(70)
  })

  it('returns status healthy for RICH content', () => {
    expect(measureHealth(RICH).status).toBe('healthy')
  })

  it('detects isThriving for RICH content', () => {
    expect(measureHealth(RICH).isThriving).toBe(true)
  })

  it('returns hasGoodWaterQuality true for RICH content', () => {
    expect(measureHealth(RICH).hasGoodWaterQuality).toBe(true)
  })

  it('returns hasResilience true for RICH content', () => {
    expect(measureHealth(RICH).hasResilience).toBe(true)
  })

  it('returns hasCarbonSequestration true for RICH content', () => {
    expect(measureHealth(RICH).hasCarbonSequestration).toBe(true)
  })

  it('returns hasNoPollution true for RICH content', () => {
    expect(measureHealth(RICH).hasNoPollution).toBe(true)
  })
})

// ─── analyzeKelpFrond ───────────────────────────────────────────────────────

describe('analyzeKelpFrond', () => {
  it('returns qualityScore 74 for RICH', () => {
    expect(analyzeKelpFrond(RICH, 'src/rich.ts').qualityScore).toBe(74)
  })

  it('returns condition bull-kelp for RICH', () => {
    expect(analyzeKelpFrond(RICH, 'src/rich.ts').condition).toBe('bull-kelp')
  })

  it('returns frondGrowth 70 for RICH', () => {
    expect(analyzeKelpFrond(RICH, 'src/rich.ts').frondGrowth).toBe(70)
  })

  it('returns holdfastStrength 80 for RICH', () => {
    expect(analyzeKelpFrond(RICH, 'src/rich.ts').holdfastStrength).toBe(80)
  })

  it('returns canopyDensity 80 for RICH', () => {
    expect(analyzeKelpFrond(RICH, 'src/rich.ts').canopyDensity).toBe(80)
  })

  it('returns understoryRichness 75 for RICH', () => {
    expect(analyzeKelpFrond(RICH, 'src/rich.ts').understoryRichness).toBe(75)
  })

  it('returns gasBladderBuoyancy 70 for RICH', () => {
    expect(analyzeKelpFrond(RICH, 'src/rich.ts').gasBladderBuoyancy).toBe(70)
  })

  it('returns forestHealth 70 for RICH', () => {
    expect(analyzeKelpFrond(RICH, 'src/rich.ts').forestHealth).toBe(70)
  })

  it('returns qualityScore 29 for EMPTY', () => {
    expect(analyzeKelpFrond(EMPTY, 'src/empty.ts').qualityScore).toBe(29)
  })

  it('returns condition sea-lettuce for EMPTY', () => {
    expect(analyzeKelpFrond(EMPTY, 'src/empty.ts').condition).toBe('sea-lettuce')
  })

  it('returns qualityScore 67 for MEDIUM', () => {
    expect(analyzeKelpFrond(MEDIUM, 'src/medium.ts').qualityScore).toBe(67)
  })

  it('returns condition bull-kelp for MEDIUM', () => {
    expect(analyzeKelpFrond(MEDIUM, 'src/medium.ts').condition).toBe('bull-kelp')
  })

  it('returns correct file name', () => {
    expect(analyzeKelpFrond(RICH, 'src/rich.ts').file).toBe('src/rich.ts')
  })

  it('populates growth object', () => {
    const frond = analyzeKelpFrond(RICH, 'src/rich.ts')
    expect(frond.growth.rate).toBe(70)
    expect(frond.growth.stage).toBe('adult')
  })

  it('populates holdfast object', () => {
    const frond = analyzeKelpFrond(RICH, 'src/rich.ts')
    expect(frond.holdfast.strength).toBe(80)
    expect(frond.holdfast.type).toBe('bedrock')
  })

  it('populates canopy object', () => {
    const frond = analyzeKelpFrond(RICH, 'src/rich.ts')
    expect(frond.canopy.density).toBe(80)
    expect(frond.canopy.layer).toBe('surface-canopy')
  })

  it('populates understory object', () => {
    const frond = analyzeKelpFrond(RICH, 'src/rich.ts')
    expect(frond.understory.richness).toBe(75)
    expect(frond.understory.diversity).toBe('moderate')
  })

  it('populates bladder object', () => {
    const frond = analyzeKelpFrond(RICH, 'src/rich.ts')
    expect(frond.bladder.buoyancy).toBe(70)
    expect(frond.bladder.fill).toBe('partially-filled')
  })

  it('populates health object', () => {
    const frond = analyzeKelpFrond(RICH, 'src/rich.ts')
    expect(frond.health.score).toBe(70)
    expect(frond.health.status).toBe('healthy')
  })
})

// ─── classifiers ───────────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns giant-kelp for 85', () => {
    expect(classifyCondition(85)).toBe('giant-kelp')
  })
  it('returns bull-kelp for 70', () => {
    expect(classifyCondition(70)).toBe('bull-kelp')
  })
  it('returns laminaria for 55', () => {
    expect(classifyCondition(55)).toBe('laminaria')
  })
  it('returns rockweed for 40', () => {
    expect(classifyCondition(40)).toBe('rockweed')
  })
  it('returns sea-lettuce for 25', () => {
    expect(classifyCondition(25)).toBe('sea-lettuce')
  })
  it('returns drift-seaweed for 10', () => {
    expect(classifyCondition(10)).toBe('drift-seaweed')
  })
})

describe('classifyMarineBiologistGrade', () => {
  it('returns research-director for 85', () => {
    expect(classifyMarineBiologistGrade(85)).toBe('research-director')
  })
  it('returns senior-biologist for 70', () => {
    expect(classifyMarineBiologistGrade(70)).toBe('senior-biologist')
  })
  it('returns marine-biologist for 55', () => {
    expect(classifyMarineBiologistGrade(55)).toBe('marine-biologist')
  })
  it('returns diver for 40', () => {
    expect(classifyMarineBiologistGrade(40)).toBe('diver')
  })
  it('returns snorkeler for 25', () => {
    expect(classifyMarineBiologistGrade(25)).toBe('snorkeler')
  })
  it('returns beachcomber for 10', () => {
    expect(classifyMarineBiologistGrade(10)).toBe('beachcomber')
  })
})

describe('classifyRegionCondition', () => {
  it('returns marine-reserve for 85', () => {
    expect(classifyRegionCondition(85)).toBe('marine-reserve')
  })
  it('returns protected-area for 70', () => {
    expect(classifyRegionCondition(70)).toBe('protected-area')
  })
  it('returns harvest-zone for 55', () => {
    expect(classifyRegionCondition(55)).toBe('harvest-zone')
  })
  it('returns recreational for 40', () => {
    expect(classifyRegionCondition(40)).toBe('recreational')
  })
  it('returns degraded for 25', () => {
    expect(classifyRegionCondition(25)).toBe('degraded')
  })
  it('returns urchin-barren for 10', () => {
    expect(classifyRegionCondition(10)).toBe('urchin-barren')
  })
})

describe('classifyRegionType', () => {
  it('returns old-growth for high-quality fronds', () => {
    const frond = analyzeKelpFrond(RICH, 'src/rich.ts')
    expect(classifyRegionType([frond])).toBe('mature-forest')
  })
  it('returns barrens for empty fronds', () => {
    expect(classifyRegionType([])).toBe('barrens')
  })
  it('returns meadow for low-quality fronds', () => {
    const frond = analyzeKelpFrond(EMPTY, 'src/empty.ts')
    expect(classifyRegionType([frond])).toBe('meadow')
  })
})

// ─── buildKelpForestResult ──────────────────────────────────────────────────

describe('buildKelpForestResult', () => {
  it('returns overallHealth 57 for 3-file mix', () => {
    const result = buildKelpForestResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.overallHealth).toBe(57)
  })

  it('returns marineBiologistGrade marine-biologist for 3-file mix', () => {
    const result = buildKelpForestResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.marineBiologistGrade).toBe('marine-biologist')
  })

  it('returns bestFrond src/rich.ts for 3-file mix', () => {
    const result = buildKelpForestResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.bestFrond).toBe('src/rich.ts')
  })

  it('returns fastestGrowth src/rich.ts for 3-file mix', () => {
    const result = buildKelpForestResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.fastestGrowth).toBe('src/rich.ts')
  })

  it('returns bestAnchored src/rich.ts for 3-file mix', () => {
    const result = buildKelpForestResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.bestAnchored).toBe('src/rich.ts')
  })

  it('counts bullKelpCount 2 for 3-file mix', () => {
    const result = buildKelpForestResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.bullKelpCount).toBe(2)
  })

  it('counts seaLettuceCount 1 for 3-file mix', () => {
    const result = buildKelpForestResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.seaLettuceCount).toBe(1)
  })

  it('counts isGrowingCount 2 for 3-file mix', () => {
    const result = buildKelpForestResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.isGrowingCount).toBe(2)
  })

  it('counts isWellAnchoredCount 2 for 3-file mix', () => {
    const result = buildKelpForestResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.isWellAnchoredCount).toBe(2)
  })

  it('counts hasDenseCanopyCount 2 for 3-file mix', () => {
    const result = buildKelpForestResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.hasDenseCanopyCount).toBe(2)
  })

  it('counts isThrivingCount 2 for 3-file mix', () => {
    const result = buildKelpForestResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.isThrivingCount).toBe(2)
  })

  it('returns ocean.isThriving false for 3-file mix', () => {
    const result = buildKelpForestResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.ocean.isThriving).toBe(false)
  })

  it('returns ocean.overallHealth 57 for 3-file mix', () => {
    const result = buildKelpForestResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.ocean.overallHealth).toBe(57)
  })

  it('returns recommendations for 3-file mix', () => {
    const result = buildKelpForestResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns fronds array with 3 entries for 3-file mix', () => {
    const result = buildKelpForestResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.fronds).toHaveLength(3)
  })

  it('returns empty fronds for empty input', () => {
    const result = buildKelpForestResult([], [])
    expect(result.fronds).toHaveLength(0)
  })

  it('returns overallHealth 0 for empty input', () => {
    const result = buildKelpForestResult([], [])
    expect(result.stats.overallHealth).toBe(0)
  })

  it('returns marineBiologistGrade beachcomber for empty input', () => {
    const result = buildKelpForestResult([], [])
    expect(result.stats.marineBiologistGrade).toBe('beachcomber')
  })

  it('computes totalFiles correctly', () => {
    const result = buildKelpForestResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.totalFiles).toBe(3)
  })

  it('populates regions for files with directory structure', () => {
    const result = buildKelpForestResult(
      ['src/a.ts', 'src/b.ts'],
      [RICH, MEDIUM],
    )
    expect(result.regions.length).toBeGreaterThan(0)
  })
})

// ─── format helpers ────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('scoreColor returns a string', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })

  it('conditionColor returns a string', () => {
    expect(typeof conditionColor('giant-kelp')).toBe('string')
  })

  it('gradeColor returns a string', () => {
    expect(typeof gradeColor('research-director')).toBe('string')
  })

  it('regionTypeColor returns a string', () => {
    expect(typeof regionTypeColor('old-growth')).toBe('string')
  })

  it('formatKelpForestJson returns valid JSON', () => {
    const result = buildKelpForestResult(
      ['src/rich.ts', 'src/empty.ts'],
      [RICH, EMPTY],
    )
    const json = formatKelpForestJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('formatKelpForestTable returns string with header', () => {
    const result = buildKelpForestResult(
      ['src/rich.ts', 'src/empty.ts'],
      [RICH, EMPTY],
    )
    const table = formatKelpForestTable(result, false)
    expect(table).toContain('Kelp Forest Analysis')
  })

  it('formatKelpForestTable shows per-frond in verbose mode', () => {
    const result = buildKelpForestResult(
      ['src/rich.ts', 'src/empty.ts'],
      [RICH, EMPTY],
    )
    const table = formatKelpForestTable(result, true)
    expect(table).toContain('Per-Frond Breakdown')
  })

  it('formatKelpForestTable shows regions', () => {
    const result = buildKelpForestResult(
      ['src/rich.ts', 'src/empty.ts'],
      [RICH, EMPTY],
    )
    const table = formatKelpForestTable(result, false)
    expect(table).toContain('Regions')
  })

  it('formatKelpForestTable shows recommendations', () => {
    const result = buildKelpForestResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    const table = formatKelpForestTable(result, false)
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
