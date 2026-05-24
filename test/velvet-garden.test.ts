import { describe, expect, it } from 'vitest'
import {
  measureSoftening,
  measurePetal,
  measureRooting,
  measureFragrance,
  measureBlooming,
  classifyCondition,
  classifyBedType,
  classifyBedCondition,
  classifyGardenerGrade,
  analyzeGardenPetal,
  analyzeGardenBed,
  buildVelvetGardenResult,
  generateRecommendations,
} from '../src/commands/velvet-garden-helpers.js'
import {
  scoreColor,
  textureColor,
  bloomColor,
  systemColor,
  scentColor,
  stageColor,
  conditionColor,
  gardenerGradeColor,
  formatVelvetGardenJson,
  formatVelvetGardenTable,
} from '../src/commands/velvet-garden-format-helpers.js'
import type { GardenPetal } from '../src/commands/velvet-garden-helpers.js'

// ─── Fixtures ───────────────────────────────────────────────────────────────

const RICH = `import { Something } from 'module'
import type { TypeA } from 'types'

/** Doc comment */
export interface Config {
  readonly name: string
  readonly value: number
}

export type Result<T> = {
  readonly data: T
  readonly error?: string
}

export class Processor {
  private data: Config[]

  constructor() {
    this.data = []
  }

  async process(input: Config): Promise<Result<Config>> {
    try {
      const result = input?.value ?? 0
      if (result !== null) {
        return { data: input }
      }
      return { data: input, error: 'empty' }
    } catch (err) {
      return { data: input, error: String(err) }
    }
  }
}

export function helper(config: Config): void {
  const x = config?.name ?? 'default'
  console.log(x === 'test' ? 'yes' : 'no')
}`

const MINIMAL = `const x = 1`

const MODERATE = `export interface Item {
  name: string
}

export function process(item: Item): string {
  return item.name
}

const result = process({ name: 'test' })`

const POOR = `var x: any = 1
var y: any = 2
function bad(a: any): any {
  return a
}`

const EMPTY = ''

// ─── measureSoftening ───────────────────────────────────────────────────────

describe('measureSoftening', () => {
  it('scores RICH content with softness=100', () => {
    const result = measureSoftening(RICH)
    expect(result.softness).toBe(100)
    expect(result.texture).toBe('silken-velvet')
    expect(result.hasHighSoftness).toBe(true)
  })

  it('scores RICH content with all boolean flags true', () => {
    const result = measureSoftening(RICH)
    expect(result.hasGentle).toBe(true)
    expect(result.hasSmooth).toBe(true)
    expect(result.hasTender).toBe(true)
    expect(result.hasDelicate).toBe(true)
    expect(result.hasPliable).toBe(true)
    expect(result.hasSupple).toBe(true)
    expect(result.hasNoHarshness).toBe(true)
    expect(result.hasNoAbrasion).toBe(true)
    expect(result.hasNoRoughness).toBe(true)
    expect(result.hasNoRigidity).toBe(true)
  })

  it('scores MINIMAL content with softness=18', () => {
    const result = measureSoftening(MINIMAL)
    expect(result.softness).toBe(18)
    expect(result.texture).toBe('sandpaper')
    expect(result.hasHighSoftness).toBe(false)
  })

  it('scores MINIMAL content booleans', () => {
    const result = measureSoftening(MINIMAL)
    expect(result.hasGentle).toBe(false)
    expect(result.hasSmooth).toBe(false)
    expect(result.harshnessCount).toBe(0)
    expect(result.abrasionCount).toBe(0)
  })

  it('scores MODERATE content with softness=61', () => {
    const result = measureSoftening(MODERATE)
    expect(result.softness).toBe(61)
    expect(result.texture).toBe('gentle-touch')
    expect(result.hasGentle).toBe(true)
    expect(result.hasSmooth).toBe(true)
    expect(result.hasSupple).toBe(true)
  })

  it('detects var harshness in POOR content', () => {
    const result = measureSoftening(POOR)
    expect(result.harshnessCount).toBe(2)
    expect(result.abrasionCount).toBe(4)
    expect(result.hasNoHarshness).toBe(false)
    expect(result.hasNoAbrasion).toBe(false)
  })

  it('scores EMPTY content with softness=0', () => {
    const result = measureSoftening(EMPTY)
    expect(result.softness).toBe(0)
    expect(result.texture).toBe('sandpaper')
  })
})

// ─── measurePetal ───────────────────────────────────────────────────────────

describe('measurePetal', () => {
  it('scores RICH content with quality=100', () => {
    const result = measurePetal(RICH)
    expect(result.quality).toBe(100)
    expect(result.bloom).toBe('perfect-bloom')
    expect(result.hasHighQuality).toBe(true)
  })

  it('scores RICH content with all boolean flags true', () => {
    const result = measurePetal(RICH)
    expect(result.hasBeautiful).toBe(true)
    expect(result.hasElegant).toBe(true)
    expect(result.hasColorful).toBe(true)
    expect(result.hasVibrant).toBe(true)
    expect(result.hasRadiant).toBe(true)
    expect(result.hasLuminous).toBe(true)
  })

  it('scores MINIMAL content with quality=8', () => {
    const result = measurePetal(MINIMAL)
    expect(result.quality).toBe(8)
    expect(result.bloom).toBe('dead-bloom')
  })

  it('scores MODERATE content with quality=49', () => {
    const result = measurePetal(MODERATE)
    expect(result.quality).toBe(49)
    expect(result.bloom).toBe('fading-petal')
    expect(result.hasElegant).toBe(true)
  })

  it('detects var and any in POOR content', () => {
    const result = measurePetal(POOR)
    expect(result.uglinessCount).toBe(2)
    expect(result.drabCount).toBe(4)
    expect(result.hasNoUgliness).toBe(false)
    expect(result.hasNoDrab).toBe(false)
  })

  it('scores EMPTY content with quality=0', () => {
    const result = measurePetal(EMPTY)
    expect(result.quality).toBe(0)
    expect(result.bloom).toBe('dead-bloom')
  })
})

// ─── measureRooting ─────────────────────────────────────────────────────────

describe('measureRooting', () => {
  it('scores RICH content with depth=100', () => {
    const result = measureRooting(RICH)
    expect(result.depth).toBe(100)
    expect(result.system).toBe('deep-taproot')
    expect(result.hasHighDepth).toBe(true)
  })

  it('scores RICH content with all boolean flags true', () => {
    const result = measureRooting(RICH)
    expect(result.hasDeep).toBe(true)
    expect(result.hasAnchored).toBe(true)
    expect(result.hasGrounded).toBe(true)
    expect(result.hasStable).toBe(true)
    expect(result.hasSecure).toBe(true)
    expect(result.hasFirm).toBe(true)
  })

  it('scores MINIMAL content with depth=0', () => {
    const result = measureRooting(MINIMAL)
    expect(result.depth).toBe(0)
    expect(result.system).toBe('no-roots')
  })

  it('scores MODERATE content with depth=18', () => {
    const result = measureRooting(MODERATE)
    expect(result.depth).toBe(18)
    expect(result.system).toBe('no-roots')
  })

  it('detects var and any in POOR content', () => {
    const result = measureRooting(POOR)
    expect(result.shallowCount).toBe(2)
    expect(result.floatingCount).toBe(4)
    expect(result.hasNoShallow).toBe(false)
    expect(result.hasNoFloating).toBe(false)
  })

  it('scores EMPTY content with depth=0', () => {
    const result = measureRooting(EMPTY)
    expect(result.depth).toBe(0)
    expect(result.system).toBe('no-roots')
  })
})

// ─── measureFragrance ───────────────────────────────────────────────────────

describe('measureFragrance', () => {
  it('scores RICH content with level=100', () => {
    const result = measureFragrance(RICH)
    expect(result.level).toBe(100)
    expect(result.scent).toBe('intoxicating')
    expect(result.hasHighLevel).toBe(true)
  })

  it('scores RICH content with all boolean flags true', () => {
    const result = measureFragrance(RICH)
    expect(result.hasAromatic).toBe(true)
    expect(result.hasAppealing).toBe(true)
    expect(result.hasInviting).toBe(true)
    expect(result.hasAttractive).toBe(true)
    expect(result.hasPleasant).toBe(true)
    expect(result.hasSweet).toBe(true)
  })

  it('scores MINIMAL content with level=8', () => {
    const result = measureFragrance(MINIMAL)
    expect(result.level).toBe(8)
    expect(result.scent).toBe('foul-odor')
  })

  it('scores MODERATE content with level=26', () => {
    const result = measureFragrance(MODERATE)
    expect(result.level).toBe(26)
    expect(result.scent).toBe('no-fragrance')
  })

  it('detects var and any in POOR content', () => {
    const result = measureFragrance(POOR)
    expect(result.stenchCount).toBe(2)
    expect(result.repellentCount).toBe(4)
    expect(result.hasNoStench).toBe(false)
    expect(result.hasNoRepellent).toBe(false)
  })

  it('scores EMPTY content with level=0', () => {
    const result = measureFragrance(EMPTY)
    expect(result.level).toBe(0)
    expect(result.scent).toBe('foul-odor')
  })
})

// ─── measureBlooming ────────────────────────────────────────────────────────

describe('measureBlooming', () => {
  it('scores RICH content with potential=100', () => {
    const result = measureBlooming(RICH)
    expect(result.potential).toBe(100)
    expect(result.stage).toBe('full-bloom')
    expect(result.hasHighPotential).toBe(true)
  })

  it('scores RICH content with all boolean flags true', () => {
    const result = measureBlooming(RICH)
    expect(result.hasGrowing).toBe(true)
    expect(result.hasExpanding).toBe(true)
    expect(result.hasThriving).toBe(true)
    expect(result.hasVigorous).toBe(true)
    expect(result.hasFlourishing).toBe(true)
    expect(result.hasSprouting).toBe(true)
  })

  it('scores MINIMAL content with potential=18', () => {
    const result = measureBlooming(MINIMAL)
    expect(result.potential).toBe(18)
    expect(result.stage).toBe('dead-branch')
  })

  it('scores MODERATE content with potential=75', () => {
    const result = measureBlooming(MODERATE)
    expect(result.potential).toBe(75)
    expect(result.stage).toBe('opening-bud')
    expect(result.hasGrowing).toBe(true)
    expect(result.hasFlourishing).toBe(true)
    expect(result.hasSprouting).toBe(true)
  })

  it('detects var and any in POOR content', () => {
    const result = measureBlooming(POOR)
    expect(result.stagnantCount).toBe(2)
    expect(result.decliningCount).toBe(4)
    expect(result.hasNoStagnant).toBe(false)
    expect(result.hasNoDeclining).toBe(false)
  })

  it('scores EMPTY content with potential=0', () => {
    const result = measureBlooming(EMPTY)
    expect(result.potential).toBe(0)
    expect(result.stage).toBe('dead-branch')
  })
})

// ─── classifyCondition ──────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns master-garden for score >= 85', () => {
    expect(classifyCondition(90)).toBe('master-garden')
    expect(classifyCondition(85)).toBe('master-garden')
  })

  it('returns flourishing-bed for score >= 70', () => {
    expect(classifyCondition(75)).toBe('flourishing-bed')
    expect(classifyCondition(70)).toBe('flourishing-bed')
  })

  it('returns growing-garden for score >= 55', () => {
    expect(classifyCondition(60)).toBe('growing-garden')
    expect(classifyCondition(55)).toBe('growing-garden')
  })

  it('returns wild-patch for score >= 40', () => {
    expect(classifyCondition(45)).toBe('wild-patch')
    expect(classifyCondition(40)).toBe('wild-patch')
  })

  it('returns barren-soil for score >= 25', () => {
    expect(classifyCondition(30)).toBe('barren-soil')
    expect(classifyCondition(25)).toBe('barren-soil')
  })

  it('returns dead-zone for score < 25', () => {
    expect(classifyCondition(15)).toBe('dead-zone')
    expect(classifyCondition(0)).toBe('dead-zone')
  })
})

// ─── classifyBedType ────────────────────────────────────────────────────────

describe('classifyBedType', () => {
  it('returns concrete-slab for empty petals', () => {
    expect(classifyBedType([])).toBe('concrete-slab')
  })

  it('returns royal-garden for high quality with high master-garden ratio', () => {
    const petals: GardenPetal[] = [
      { qualityScore: 90, condition: 'master-garden' } as GardenPetal,
      { qualityScore: 80, condition: 'master-garden' } as GardenPetal,
    ]
    expect(classifyBedType(petals)).toBe('royal-garden')
  })

  it('returns cottage-garden for avgQs >= 60', () => {
    const petals: GardenPetal[] = [
      { qualityScore: 65, condition: 'growing-garden' } as GardenPetal,
    ]
    expect(classifyBedType(petals)).toBe('cottage-garden')
  })

  it('returns window-box for avgQs >= 45', () => {
    const petals: GardenPetal[] = [
      { qualityScore: 50, condition: 'wild-patch' } as GardenPetal,
    ]
    expect(classifyBedType(petals)).toBe('window-box')
  })

  it('returns plant-pot for avgQs >= 30', () => {
    const petals: GardenPetal[] = [
      { qualityScore: 35, condition: 'barren-soil' } as GardenPetal,
    ]
    expect(classifyBedType(petals)).toBe('plant-pot')
  })

  it('returns concrete-slab for very low avgQs', () => {
    const petals: GardenPetal[] = [
      { qualityScore: 5, condition: 'dead-zone' } as GardenPetal,
    ]
    expect(classifyBedType(petals)).toBe('concrete-slab')
  })
})

// ─── classifyGardenerGrade ──────────────────────────────────────────────────

describe('classifyGardenerGrade', () => {
  it('returns master-gardener for >= 80', () => {
    expect(classifyGardenerGrade(90)).toBe('master-gardener')
    expect(classifyGardenerGrade(80)).toBe('master-gardener')
  })

  it('returns expert-horticulturist for >= 65', () => {
    expect(classifyGardenerGrade(70)).toBe('expert-horticulturist')
    expect(classifyGardenerGrade(65)).toBe('expert-horticulturist')
  })

  it('returns skilled-gardener for >= 50', () => {
    expect(classifyGardenerGrade(55)).toBe('skilled-gardener')
    expect(classifyGardenerGrade(50)).toBe('skilled-gardener')
  })

  it('returns apprentice for >= 35', () => {
    expect(classifyGardenerGrade(40)).toBe('apprentice')
    expect(classifyGardenerGrade(35)).toBe('apprentice')
  })

  it('returns novice for >= 20', () => {
    expect(classifyGardenerGrade(25)).toBe('novice')
    expect(classifyGardenerGrade(20)).toBe('novice')
  })

  it('returns black-thumb for < 20', () => {
    expect(classifyGardenerGrade(10)).toBe('black-thumb')
    expect(classifyGardenerGrade(0)).toBe('black-thumb')
  })
})

// ─── analyzeGardenPetal ─────────────────────────────────────────────────────

describe('analyzeGardenPetal', () => {
  it('analyzes RICH content correctly', () => {
    const petal = analyzeGardenPetal(RICH, 'rich.ts')
    expect(petal.file).toBe('rich.ts')
    expect(petal.softness).toBe(100)
    expect(petal.petalQuality).toBe(100)
    expect(petal.rootDepth).toBe(100)
    expect(petal.fragranceLevel).toBe(100)
    expect(petal.bloomPotential).toBe(100)
    expect(petal.qualityScore).toBe(100)
    expect(petal.condition).toBe('master-garden')
  })

  it('analyzes MINIMAL content correctly', () => {
    const petal = analyzeGardenPetal(MINIMAL, 'minimal.ts')
    expect(petal.softness).toBe(18)
    expect(petal.petalQuality).toBe(8)
    expect(petal.rootDepth).toBe(0)
    expect(petal.fragranceLevel).toBe(8)
    expect(petal.bloomPotential).toBe(18)
    expect(petal.qualityScore).toBe(10)
    expect(petal.condition).toBe('dead-zone')
  })

  it('analyzes MODERATE content correctly', () => {
    const petal = analyzeGardenPetal(MODERATE, 'moderate.ts')
    expect(petal.softness).toBe(61)
    expect(petal.petalQuality).toBe(49)
    expect(petal.rootDepth).toBe(18)
    expect(petal.fragranceLevel).toBe(26)
    expect(petal.bloomPotential).toBe(75)
    expect(petal.qualityScore).toBe(46)
    expect(petal.condition).toBe('wild-patch')
  })

  it('analyzes POOR content correctly', () => {
    const petal = analyzeGardenPetal(POOR, 'poor.ts')
    expect(petal.softness).toBe(18)
    expect(petal.petalQuality).toBe(10)
    expect(petal.rootDepth).toBe(0)
    expect(petal.fragranceLevel).toBe(0)
    expect(petal.bloomPotential).toBe(18)
    expect(petal.qualityScore).toBe(9)
    expect(petal.condition).toBe('dead-zone')
  })

  it('analyzes EMPTY content correctly', () => {
    const petal = analyzeGardenPetal(EMPTY, 'empty.ts')
    expect(petal.qualityScore).toBe(0)
    expect(petal.condition).toBe('dead-zone')
  })
})

// ─── analyzeGardenBed ───────────────────────────────────────────────────────

describe('analyzeGardenBed', () => {
  it('returns default values for empty petals', () => {
    const bed = analyzeGardenBed([], 'empty-dir')
    expect(bed.directory).toBe('empty-dir')
    expect(bed.petals).toEqual([])
    expect(bed.avgSoftness).toBe(0)
    expect(bed.avgDepth).toBe(0)
    expect(bed.avgBloom).toBe(0)
    expect(bed.masterGardenCount).toBe(0)
    expect(bed.deadZoneCount).toBe(0)
    expect(bed.bedType).toBe('concrete-slab')
    expect(bed.condition).toBe('wasteland')
  })

  it('computes bed averages for RICH petals', () => {
    const petals = [analyzeGardenPetal(RICH, 'a.ts'), analyzeGardenPetal(RICH, 'b.ts')]
    const bed = analyzeGardenBed(petals, 'src')
    expect(bed.avgSoftness).toBe(100)
    expect(bed.avgDepth).toBe(100)
    expect(bed.avgBloom).toBe(100)
    expect(bed.masterGardenCount).toBe(2)
    expect(bed.deadZoneCount).toBe(0)
    expect(bed.bedType).toBe('royal-garden')
    expect(bed.condition).toBe('kew-gardens')
  })
})

// ─── buildVelvetGardenResult ────────────────────────────────────────────────

describe('buildVelvetGardenResult', () => {
  it('handles empty input', () => {
    const result = buildVelvetGardenResult([], [])
    expect(result.petals).toEqual([])
    expect(result.beds).toEqual([])
    expect(result.garden.avgSoftness).toBe(0)
    expect(result.garden.overallLushness).toBe(0)
    expect(result.garden.isFlourishing).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.gardenerGrade).toBe('black-thumb')
    expect(result.stats.bestPetal).toBe('')
  })

  it('handles single RICH file in subdir', () => {
    const result = buildVelvetGardenResult(['src/rich.ts'], [RICH])
    expect(result.petals).toHaveLength(1)
    expect(result.beds).toHaveLength(1)
    expect(result.beds[0].directory).toBe('src')
    expect(result.garden.avgSoftness).toBe(100)
    expect(result.garden.isFlourishing).toBe(true)
    expect(result.garden.overallLushness).toBe(100)
    expect(result.stats.gardenerGrade).toBe('master-gardener')
    expect(result.stats.bestPetal).toBe('src/rich.ts')
  })

  it('computes correct stats for mixed files', () => {
    const result = buildVelvetGardenResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(result.petals).toHaveLength(4)
    expect(result.stats.totalFiles).toBe(4)
    expect(result.stats.avgSoftness).toBe(49)
    expect(result.stats.avgPetalQuality).toBe(42)
    expect(result.stats.avgRootDepth).toBe(30)
    expect(result.stats.avgFragranceLevel).toBe(34)
    expect(result.stats.avgBloomPotential).toBe(53)
    expect(result.stats.masterGardenCount).toBe(1)
    expect(result.stats.deadZoneCount).toBe(2)
    expect(result.stats.wildPatchCount).toBe(1)
    expect(result.stats.overallLushness).toBe(44)
    expect(result.stats.gardenerGrade).toBe('apprentice')
    expect(result.stats.bestPetal).toBe('rich.ts')
    expect(result.stats.softest).toBe('rich.ts')
    expect(result.stats.mostBeautiful).toBe('rich.ts')
    expect(result.stats.deepestRooted).toBe('rich.ts')
    expect(result.stats.mostFragrant).toBe('rich.ts')
  })

  it('computes overallLushness as avg of softness, rootDepth, bloomPotential', () => {
    const result = buildVelvetGardenResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(result.garden.avgSoftness).toBe(49)
    expect(result.garden.avgDepth).toBe(30)
    expect(result.garden.avgBloom).toBe(53)
    expect(result.garden.overallLushness).toBe(44)
  })

  it('groups files into beds by directory', () => {
    const result = buildVelvetGardenResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, MINIMAL, MODERATE],
    )
    expect(result.beds).toHaveLength(2)
    const dirs = result.beds.map((b) => b.directory)
    expect(dirs).toContain('src')
    expect(dirs).toContain('lib')
  })

  it('counts high boolean flags correctly for mixed files', () => {
    const result = buildVelvetGardenResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(result.stats.hasHighSoftnessCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.hasHighDepthCount).toBe(1)
    expect(result.stats.hasHighLevelCount).toBe(1)
    expect(result.stats.hasHighPotentialCount).toBe(2)
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect message for high-quality code', () => {
    const result = buildVelvetGardenResult(['src/rich.ts'], [RICH])
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('full bloom')
  })

  it('returns recommendations for low-quality code', () => {
    const result = buildVelvetGardenResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
    const joined = result.recommendations.join(' ')
    expect(joined).toContain('Soften code')
    expect(joined).toContain('Beautify petals')
    expect(joined).toContain('Deepen roots')
    expect(joined).toContain('Enhance fragrance')
  })

  it('recommends revitalizing dead-zone files', () => {
    const result = buildVelvetGardenResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    const joined = result.recommendations.join(' ')
    expect(joined).toContain('dead zone')
  })

  it('returns recommendations for empty input', () => {
    const result = buildVelvetGardenResult([], [])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────

describe('format-helpers', () => {
  it('scoreColor returns a string', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(60)).toBe('string')
    expect(typeof scoreColor(40)).toBe('string')
    expect(typeof scoreColor(20)).toBe('string')
  })

  it('textureColor returns a string for each texture', () => {
    expect(typeof textureColor('silken-velvet')).toBe('string')
    expect(typeof textureColor('soft-petal')).toBe('string')
    expect(typeof textureColor('gentle-touch')).toBe('string')
    expect(typeof textureColor('rough-bark')).toBe('string')
    expect(typeof textureColor('thorny-stem')).toBe('string')
    expect(typeof textureColor('sandpaper')).toBe('string')
    expect(typeof textureColor('unknown')).toBe('string')
  })

  it('bloomColor returns a string for each bloom', () => {
    expect(typeof bloomColor('perfect-bloom')).toBe('string')
    expect(typeof bloomColor('lovely-petal')).toBe('string')
    expect(typeof bloomColor('pretty-flower')).toBe('string')
    expect(typeof bloomColor('fading-petal')).toBe('string')
    expect(typeof bloomColor('wilted-flower')).toBe('string')
    expect(typeof bloomColor('dead-bloom')).toBe('string')
    expect(typeof bloomColor('unknown')).toBe('string')
  })

  it('systemColor returns a string for each system', () => {
    expect(typeof systemColor('deep-taproot')).toBe('string')
    expect(typeof systemColor('strong-roots')).toBe('string')
    expect(typeof systemColor('proper-rootball')).toBe('string')
    expect(typeof systemColor('shallow-roots')).toBe('string')
    expect(typeof systemColor('surface-roots')).toBe('string')
    expect(typeof systemColor('no-roots')).toBe('string')
    expect(typeof systemColor('unknown')).toBe('string')
  })

  it('scentColor returns a string for each scent', () => {
    expect(typeof scentColor('intoxicating')).toBe('string')
    expect(typeof scentColor('heavenly-aroma')).toBe('string')
    expect(typeof scentColor('sweet-fragrance')).toBe('string')
    expect(typeof scentColor('faint-scent')).toBe('string')
    expect(typeof scentColor('no-fragrance')).toBe('string')
    expect(typeof scentColor('foul-odor')).toBe('string')
    expect(typeof scentColor('unknown')).toBe('string')
  })

  it('stageColor returns a string for each stage', () => {
    expect(typeof stageColor('full-bloom')).toBe('string')
    expect(typeof stageColor('opening-bud')).toBe('string')
    expect(typeof stageColor('growing-shoot')).toBe('string')
    expect(typeof stageColor('dormant-seed')).toBe('string')
    expect(typeof stageColor('wilted-stem')).toBe('string')
    expect(typeof stageColor('dead-branch')).toBe('string')
    expect(typeof stageColor('unknown')).toBe('string')
  })

  it('conditionColor returns a string for each condition', () => {
    expect(typeof conditionColor('master-garden')).toBe('string')
    expect(typeof conditionColor('flourishing-bed')).toBe('string')
    expect(typeof conditionColor('growing-garden')).toBe('string')
    expect(typeof conditionColor('wild-patch')).toBe('string')
    expect(typeof conditionColor('barren-soil')).toBe('string')
    expect(typeof conditionColor('dead-zone')).toBe('string')
    expect(typeof conditionColor('unknown')).toBe('string')
  })

  it('gardenerGradeColor returns a string for each grade', () => {
    expect(typeof gardenerGradeColor('master-gardener')).toBe('string')
    expect(typeof gardenerGradeColor('expert-horticulturist')).toBe('string')
    expect(typeof gardenerGradeColor('skilled-gardener')).toBe('string')
    expect(typeof gardenerGradeColor('apprentice')).toBe('string')
    expect(typeof gardenerGradeColor('novice')).toBe('string')
    expect(typeof gardenerGradeColor('black-thumb')).toBe('string')
    expect(typeof gardenerGradeColor('unknown')).toBe('string')
  })

  it('formatVelvetGardenJson returns valid JSON', () => {
    const result = buildVelvetGardenResult(['rich.ts'], [RICH])
    const json = formatVelvetGardenJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.petals).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })

  it('formatVelvetGardenTable returns string with section headers', () => {
    const result = buildVelvetGardenResult(['rich.ts'], [RICH])
    const table = formatVelvetGardenTable(result, false)
    expect(table).toContain('Velvet Garden Analysis')
    expect(table).toContain('Garden:')
    expect(table).toContain('Statistics:')
    expect(table).toContain('Highlights:')
    expect(typeof table).toBe('string')
  })

  it('formatVelvetGardenTable with verbose shows per-file petals', () => {
    const result = buildVelvetGardenResult(['rich.ts'], [RICH])
    const table = formatVelvetGardenTable(result, true)
    expect(table).toContain('Per-File Petals:')
    expect(table).toContain('rich.ts')
  })

  it('formatVelvetGardenTable shows recommendations', () => {
    const result = buildVelvetGardenResult(['rich.ts'], [RICH])
    const table = formatVelvetGardenTable(result, false)
    expect(table).toContain('Recommendations:')
  })

  it('formatVelvetGardenTable shows condition counts', () => {
    const result = buildVelvetGardenResult(
      ['rich.ts', 'minimal.ts'],
      [RICH, MINIMAL],
    )
    const table = formatVelvetGardenTable(result, false)
    expect(table).toContain('Condition Counts:')
    expect(table).toContain('Master Garden:')
    expect(table).toContain('Dead Zone:')
  })

  it('formatVelvetGardenTable handles empty result', () => {
    const result = buildVelvetGardenResult([], [])
    const table = formatVelvetGardenTable(result, false)
    expect(table).toContain('Velvet Garden Analysis')
    expect(table).toContain('Total Files:')
  })
})
