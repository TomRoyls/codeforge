import { describe, expect, it } from 'vitest'
import {
  measureTransmuting,
  measurePhial,
  measureDistilling,
  measureBalancing,
  measurePhilosophic,
  measureGolden,
  analyzeAlchemicalPhial,
  classifyCondition,
  classifyWorkshopType,
  classifyWorkshopCondition,
  classifyAlchemistGrade,
  analyzeAlchemyWorkshop,
  generateRecommendations,
  buildAlchemyGlassResult,
} from '../src/commands/alchemy-glass-helpers.js'
import {
  scoreColor,
  gradeColor,
  vesselColor,
  purity2Color,
  harmonyColor,
  insightColor,
  proportionColor,
  conditionColor,
  alchemistGradeColor,
  formatAlchemyGlassJson,
  formatAlchemyGlassTable,
} from '../src/commands/alchemy-glass-format-helpers.js'

const RICH = `import chalk from 'chalk'

export interface Widget {
  id: string
  name: string
  count: number
}

export type WidgetStatus = 'active' | 'inactive'

export class WidgetService {
  private items: Map<string, Widget> = new Map()
  private readonly maxSize: number = 100

  async getWidget(id: string): Promise<Widget | undefined> {
    try {
      const item = this.items.get(id)
      if (!item) return undefined
      return { ...item }
    } catch (err) {
      return undefined
    }
  }

  addWidget(widget: Widget): void {
    if (this.items.size >= this.maxSize) {
      throw new Error('Capacity reached')
    }
    this.items.set(widget.id, widget)
  }
}

export function createDefault(): Widget {
  return { id: 'default', name: 'Default', count: 0 }
}

export const DEFAULT_WIDGET: Widget = { id: '0', name: 'root', count: 1 }
`

const SIMPLE = 'const x = 1\n'
const EMPTY = ''
const BAD = 'var x: any = {} as any\nvar y: any = {} as any\n'

describe('alchemy-glass measureTransmuting', () => {
  it('measures RICH content correctly', () => {
    const m = measureTransmuting(RICH)
    expect(m.purity).toBe(79)
    expect(m.grade).toBe('refined-silver')
    expect(m.hasHighPurity).toBe(true)
    expect(m.hasAccurate).toBe(false)
    expect(m.hasFaithful).toBe(true)
    expect(m.hasNoDistortion).toBe(true)
    expect(m.hasPure).toBe(true)
    expect(m.hasNoCorruption).toBe(true)
    expect(m.hasPrecise).toBe(false)
    expect(m.hasNoApproximation).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasNoPollution).toBe(true)
    expect(m.hasTrue).toBe(true)
    expect(m.distortionCount).toBe(0)
    expect(m.corruptionCount).toBe(0)
  })

  it('measures SIMPLE content correctly', () => {
    const m = measureTransmuting(SIMPLE)
    expect(m.purity).toBe(10)
    expect(m.grade).toBe('failed-alchemy')
    expect(m.hasHighPurity).toBe(false)
  })

  it('measures BAD content correctly', () => {
    const m = measureTransmuting(BAD)
    expect(m.purity).toBe(0)
    expect(m.hasNoDistortion).toBe(false)
    expect(m.distortionCount).toBe(2)
    expect(m.corruptionCount).toBe(4)
  })
})

describe('alchemy-glass measurePhial', () => {
  it('measures RICH content correctly', () => {
    const m = measurePhial(RICH)
    expect(m.quality).toBe(98)
    expect(m.vessel).toBe('crystal-phial')
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasWellContained).toBe(true)
    expect(m.hasProperScope).toBe(true)
    expect(m.hasNoLeaking).toBe(true)
    expect(m.hasEncapsulated).toBe(true)
    expect(m.hasSealed).toBe(true)
    expect(m.hasNoBleeding).toBe(true)
    expect(m.hasProperBoundaries).toBe(false)
    expect(m.hasClean).toBe(true)
  })

  it('measures BAD content correctly', () => {
    const m = measurePhial(BAD)
    expect(m.quality).toBe(0)
    expect(m.leakingCount).toBe(2)
    expect(m.bleedingCount).toBe(4)
  })
})

describe('alchemy-glass measureDistilling', () => {
  it('measures RICH content correctly', () => {
    const m = measureDistilling(RICH)
    expect(m.essence).toBe(85)
    expect(m.purity2).toBe('pure-essence')
    expect(m.hasHighEssence).toBe(true)
    expect(m.hasCore).toBe(true)
    expect(m.hasEssential).toBe(true)
    expect(m.hasNoFiller).toBe(true)
    expect(m.hasConcentrated).toBe(false)
    expect(m.hasRefined).toBe(false)
  })

  it('measures BAD content correctly', () => {
    const m = measureDistilling(BAD)
    expect(m.essence).toBe(0)
    expect(m.fillerCount).toBe(2)
    expect(m.wasteCount).toBe(4)
  })
})

describe('alchemy-glass measureBalancing', () => {
  it('measures RICH content correctly', () => {
    const m = measureBalancing(RICH)
    expect(m.elements).toBe(98)
    expect(m.harmony).toBe('perfect-equilibrium')
    expect(m.hasHighElements).toBe(true)
    expect(m.hasBalanced).toBe(true)
    expect(m.hasProportioned).toBe(true)
    expect(m.hasHarmonious).toBe(true)
    expect(m.hasEven).toBe(true)
    expect(m.hasStable).toBe(true)
  })

  it('measures BAD content correctly', () => {
    const m = measureBalancing(BAD)
    expect(m.elements).toBe(0)
    expect(m.overweightCount).toBe(2)
    expect(m.imbalanceCount).toBe(4)
  })
})

describe('alchemy-glass measurePhilosophic', () => {
  it('measures RICH content correctly', () => {
    const m = measurePhilosophic(RICH)
    expect(m.wisdom).toBe(64)
    expect(m.insight).toBe('learned')
    expect(m.hasHighWisdom).toBe(false)
    expect(m.hasMature).toBe(true)
    expect(m.hasProven).toBe(false)
    expect(m.hasTested).toBe(false)
    expect(m.hasRobust).toBe(false)
    expect(m.hasExperienced).toBe(true)
    expect(m.hasRefined).toBe(true)
  })

  it('measures BAD content correctly', () => {
    const m = measurePhilosophic(BAD)
    expect(m.wisdom).toBe(0)
    expect(m.naivetyCount).toBe(2)
    expect(m.fragilityCount).toBe(4)
  })
})

describe('alchemy-glass measureGolden', () => {
  it('measures RICH content correctly', () => {
    const m = measureGolden(RICH)
    expect(m.ratio).toBe(83)
    expect(m.proportion).toBe('proper-proportion')
    expect(m.hasHighRatio).toBe(true)
    expect(m.hasRightSized).toBe(true)
    expect(m.hasProportioned).toBe(true)
    expect(m.hasNoBloat).toBe(true)
    expect(m.hasLean).toBe(false)
    expect(m.hasElegant).toBe(false)
    expect(m.hasOptimal).toBe(true)
    expect(m.hasBeautiful).toBe(true)
  })

  it('measures BAD content correctly', () => {
    const m = measureGolden(BAD)
    expect(m.ratio).toBe(8)
    expect(m.bloatCount).toBe(2)
    expect(m.wasteCount).toBe(4)
  })
})

describe('alchemy-glass classifyCondition', () => {
  it('classifies philosopher-stone', () => expect(classifyCondition(90)).toBe('philosopher-stone'))
  it('classifies pure-gold', () => expect(classifyCondition(75)).toBe('pure-gold'))
  it('classifies silver-phial', () => expect(classifyCondition(60)).toBe('silver-phial'))
  it('classifies base-metal', () => expect(classifyCondition(45)).toBe('base-metal'))
  it('classifies lead-weight', () => expect(classifyCondition(30)).toBe('lead-weight'))
  it('classifies slag-heap', () => expect(classifyCondition(20)).toBe('slag-heap'))
  it('classifies boundaries', () => {
    expect(classifyCondition(85)).toBe('philosopher-stone')
    expect(classifyCondition(70)).toBe('pure-gold')
    expect(classifyCondition(55)).toBe('silver-phial')
    expect(classifyCondition(40)).toBe('base-metal')
    expect(classifyCondition(25)).toBe('lead-weight')
    expect(classifyCondition(0)).toBe('slag-heap')
  })
})

describe('alchemy-glass classifyAlchemistGrade', () => {
  it('classifies grand-master-alchemist', () => expect(classifyAlchemistGrade(85)).toBe('grand-master-alchemist'))
  it('classifies master-transmuter', () => expect(classifyAlchemistGrade(70)).toBe('master-transmuter'))
  it('classifies skilled-alchemist', () => expect(classifyAlchemistGrade(55)).toBe('skilled-alchemist'))
  it('classifies apprentice', () => expect(classifyAlchemistGrade(40)).toBe('apprentice'))
  it('classifies novice', () => expect(classifyAlchemistGrade(25)).toBe('novice'))
  it('classifies charlatan', () => expect(classifyAlchemistGrade(10)).toBe('charlatan'))
})

describe('alchemy-glass classifyWorkshopType', () => {
  it('returns empty-room for empty array', () => {
    expect(classifyWorkshopType([])).toBe('empty-room')
  })

  it('returns grand-laboratory for high quality', () => {
    const phials = [
      { qualityScore: 90, condition: 'philosopher-stone' } as any,
      { qualityScore: 88, condition: 'philosopher-stone' } as any,
    ]
    expect(classifyWorkshopType(phials)).toBe('grand-laboratory')
  })

  it('returns master-alchemist for medium quality', () => {
    const phials = [{ qualityScore: 65, condition: 'pure-gold' } as any]
    expect(classifyWorkshopType(phials)).toBe('master-alchemist')
  })
})

describe('alchemy-glass classifyWorkshopCondition', () => {
  it('classifies golden-laboratory', () => expect(classifyWorkshopCondition(80)).toBe('golden-laboratory'))
  it('classifies proper-workshop', () => expect(classifyWorkshopCondition(65)).toBe('proper-workshop'))
  it('classifies decent-lab', () => expect(classifyWorkshopCondition(50)).toBe('decent-lab'))
  it('classifies messy-bench', () => expect(classifyWorkshopCondition(35)).toBe('messy-bench'))
  it('classifies ruined-lab', () => expect(classifyWorkshopCondition(20)).toBe('ruined-lab'))
  it('classifies abandoned', () => expect(classifyWorkshopCondition(10)).toBe('abandoned'))
})

describe('alchemy-glass analyzeAlchemicalPhial', () => {
  it('analyzes RICH content correctly', () => {
    const p = analyzeAlchemicalPhial(RICH, 'src/widget.ts')
    expect(p.file).toBe('src/widget.ts')
    expect(p.qualityScore).toBe(84)
    expect(p.condition).toBe('pure-gold')
    expect(p.transmutationPurity).toBe(79)
    expect(p.phialQuality).toBe(98)
    expect(p.essenceDistillation).toBe(85)
    expect(p.elementalBalance).toBe(98)
    expect(p.philosopherQuality).toBe(64)
    expect(p.goldenRatio).toBe(83)
  })

  it('analyzes SIMPLE content correctly', () => {
    const p = analyzeAlchemicalPhial(SIMPLE, 'simple.ts')
    expect(p.qualityScore).toBe(10)
    expect(p.condition).toBe('slag-heap')
  })

  it('analyzes EMPTY content correctly', () => {
    const p = analyzeAlchemicalPhial(EMPTY, 'empty.ts')
    expect(p.qualityScore).toBe(0)
    expect(p.condition).toBe('slag-heap')
  })

  it('analyzes BAD content correctly', () => {
    const p = analyzeAlchemicalPhial(BAD, 'bad.ts')
    expect(p.qualityScore).toBe(2)
    expect(p.condition).toBe('slag-heap')
  })
})

describe('alchemy-glass analyzeAlchemyWorkshop', () => {
  it('handles empty phials', () => {
    const w = analyzeAlchemyWorkshop([], 'empty-dir')
    expect(w.directory).toBe('empty-dir')
    expect(w.phials).toEqual([])
    expect(w.avgPurity).toBe(0)
    expect(w.avgBalance).toBe(0)
    expect(w.avgGolden).toBe(0)
    expect(w.workshopType).toBe('empty-room')
    expect(w.condition).toBe('abandoned')
  })

  it('handles single RICH phial', () => {
    const phial = analyzeAlchemicalPhial(RICH, 'src/a.ts')
    const w = analyzeAlchemyWorkshop([phial], 'src')
    expect(w.avgPurity).toBe(79)
    expect(w.avgBalance).toBe(98)
    expect(w.avgGolden).toBe(83)
    expect(w.pureGoldCount).toBe(1)
  })
})

describe('alchemy-glass buildAlchemyGlassResult', () => {
  it('handles empty input', () => {
    const r = buildAlchemyGlassResult([], [])
    expect(r.phials).toEqual([])
    expect(r.workshops).toEqual([])
    expect(r.stats.totalFiles).toBe(0)
    expect(r.stats.overallPurity).toBe(0)
    expect(r.stats.alchemistGrade).toBe('charlatan')
    expect(r.stats.bestPhial).toBe('')
    expect(r.guild.isGolden).toBe(false)
  })

  it('handles single RICH file', () => {
    const r = buildAlchemyGlassResult(['src/widget.ts'], [RICH])
    expect(r.phials).toHaveLength(1)
    expect(r.workshops).toHaveLength(1)
    expect(r.stats.totalFiles).toBe(1)
    expect(r.stats.avgTransmutationPurity).toBe(79)
    expect(r.stats.avgPhialQuality).toBe(98)
    expect(r.stats.avgEssenceDistillation).toBe(85)
    expect(r.stats.avgElementalBalance).toBe(98)
    expect(r.stats.avgPhilosopherQuality).toBe(64)
    expect(r.stats.avgGoldenRatio).toBe(83)
    expect(r.stats.pureGoldCount).toBe(1)
    expect(r.stats.slagHeapCount).toBe(0)
    expect(r.stats.overallPurity).toBe(87)
    expect(r.stats.alchemistGrade).toBe('grand-master-alchemist')
    expect(r.stats.bestPhial).toBe('src/widget.ts')
    expect(r.stats.purest).toBe('src/widget.ts')
    expect(r.stats.bestContained).toBe('src/widget.ts')
    expect(r.stats.mostEssential).toBe('src/widget.ts')
    expect(r.stats.mostBalanced).toBe('src/widget.ts')
    expect(r.stats.wisest).toBe('src/widget.ts')
    expect(r.guild.isGolden).toBe(true)
    expect(r.guild.overallPurity).toBe(87)
  })

  it('handles RICH + SIMPLE files', () => {
    const r = buildAlchemyGlassResult(['src/widget.ts', 'simple.ts'], [RICH, SIMPLE])
    expect(r.phials).toHaveLength(2)
    expect(r.workshops).toHaveLength(2)
    expect(r.stats.avgTransmutationPurity).toBe(45)
    expect(r.stats.avgPhialQuality).toBe(53)
    expect(r.stats.avgEssenceDistillation).toBe(47)
    expect(r.stats.avgElementalBalance).toBe(53)
    expect(r.stats.avgPhilosopherQuality).toBe(36)
    expect(r.stats.avgGoldenRatio).toBe(51)
    expect(r.stats.pureGoldCount).toBe(1)
    expect(r.stats.slagHeapCount).toBe(1)
    expect(r.stats.overallPurity).toBe(50)
    expect(r.stats.alchemistGrade).toBe('skilled-alchemist')
    expect(r.guild.isGolden).toBe(false)
    expect(r.guild.overallPurity).toBe(50)
  })

  it('handles BAD file', () => {
    const r = buildAlchemyGlassResult(['bad.ts'], [BAD])
    expect(r.stats.slagHeapCount).toBe(1)
    expect(r.stats.overallPurity).toBe(3)
    expect(r.stats.alchemistGrade).toBe('charlatan')
  })

  it('groups files by directory in workshops', () => {
    const r = buildAlchemyGlassResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, SIMPLE, RICH],
    )
    expect(r.workshops).toHaveLength(2)
    const srcW = r.workshops.find((w) => w.directory === 'src')
    const libW = r.workshops.find((w) => w.directory === 'lib')
    expect(srcW).toBeDefined()
    expect(libW).toBeDefined()
    expect(srcW!.phials).toHaveLength(2)
    expect(libW!.phials).toHaveLength(1)
  })

  it('tracks hasHigh* counts correctly', () => {
    const r = buildAlchemyGlassResult(['src/widget.ts'], [RICH])
    expect(r.stats.hasHighPurityCount).toBe(1)
    expect(r.stats.hasHighQualityCount).toBe(1)
    expect(r.stats.hasHighEssenceCount).toBe(1)
    expect(r.stats.hasHighElementsCount).toBe(1)
    expect(r.stats.hasHighWisdomCount).toBe(0)
    expect(r.stats.hasHighRatioCount).toBe(1)
  })

  it('tracks condition counts correctly', () => {
    const r = buildAlchemyGlassResult(['src/widget.ts', 'simple.ts'], [RICH, SIMPLE])
    expect(r.stats.philosopherStoneCount).toBe(0)
    expect(r.stats.pureGoldCount).toBe(1)
    expect(r.stats.silverPhialCount).toBe(0)
    expect(r.stats.baseMetalCount).toBe(0)
    expect(r.stats.leadWeightCount).toBe(0)
    expect(r.stats.slagHeapCount).toBe(1)
  })

  it('computes overallPurity from avgPurity+avgBalance+avgGolden', () => {
    const r = buildAlchemyGlassResult(['src/widget.ts'], [RICH])
    expect(r.stats.overallPurity).toBe(Math.round((79 + 98 + 83) / 3))
  })
})

describe('alchemy-glass generateRecommendations', () => {
  it('returns positive message for high quality', () => {
    const r = buildAlchemyGlassResult(['good.ts'], [RICH])
    expect(r.recommendations).toContain("Your alchemy is pure gold! Every phial is a philosopher's stone")
  })

  it('recommends transmutation improvement', () => {
    const r = buildAlchemyGlassResult(['bad.ts'], [BAD])
    expect(r.recommendations).toContain('Purify transmutation with strict equality, type safety, and error handling')
  })

  it('recommends phial quality improvement', () => {
    const r = buildAlchemyGlassResult(['bad.ts'], [BAD])
    expect(r.recommendations).toContain('Improve phial quality with private fields, readonly, and proper encapsulation')
  })

  it('recommends essence distillation improvement', () => {
    const r = buildAlchemyGlassResult(['bad.ts'], [BAD])
    expect(r.recommendations).toContain('Distill essence with focused exports, strong typing, and essential patterns')
  })

  it('recommends elemental balance improvement', () => {
    const r = buildAlchemyGlassResult(['bad.ts'], [BAD])
    expect(r.recommendations).toContain('Balance elements with consistent imports/exports, interfaces, and harmonious design')
  })

  it('recommends philosopher quality improvement', () => {
    const r = buildAlchemyGlassResult(['bad.ts'], [BAD])
    expect(r.recommendations).toContain('Deepen philosopher quality with async patterns, optional chaining, and proven practices')
  })

  it('recommends golden ratio improvement', () => {
    const r = buildAlchemyGlassResult(['bad.ts'], [BAD])
    expect(r.recommendations).toContain('Refine golden ratio with lean types, generics, and well-proportioned code')
  })

  it('notifies about slag heaps', () => {
    const r = buildAlchemyGlassResult(['bad.ts'], [BAD])
    expect(r.recommendations).toContain('1 file(s) are slag heaps — consider significant refactoring')
  })

  it('rescues specific slag heaps', () => {
    const r = buildAlchemyGlassResult(['bad.ts'], [BAD])
    expect(r.recommendations).toContain('Rescue these slag heaps: bad.ts')
  })
})

describe('alchemy-glass format-helpers', () => {
  it('scoreColor returns string for all ranges', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(65)).toBe('string')
    expect(typeof scoreColor(45)).toBe('string')
    expect(typeof scoreColor(10)).toBe('string')
  })

  it('gradeColor handles all tiers', () => {
    expect(typeof gradeColor('pure-gold')).toBe('string')
    expect(typeof gradeColor('refined-silver')).toBe('string')
    expect(typeof gradeColor('proper-transmutation')).toBe('string')
    expect(typeof gradeColor('base-metal')).toBe('string')
    expect(typeof gradeColor('slag')).toBe('string')
    expect(typeof gradeColor('failed-alchemy')).toBe('string')
  })

  it('vesselColor handles all tiers', () => {
    expect(typeof vesselColor('crystal-phial')).toBe('string')
    expect(typeof vesselColor('pure-flask')).toBe('string')
    expect(typeof vesselColor('proper-vessel')).toBe('string')
    expect(typeof vesselColor('cracked-flask')).toBe('string')
    expect(typeof vesselColor('leaky-container')).toBe('string')
    expect(typeof vesselColor('broken-glass')).toBe('string')
  })

  it('purity2Color handles all tiers', () => {
    expect(typeof purity2Color('pure-essence')).toBe('string')
    expect(typeof purity2Color('concentrated')).toBe('string')
    expect(typeof purity2Color('proper-extract')).toBe('string')
    expect(typeof purity2Color('diluted')).toBe('string')
    expect(typeof purity2Color('watery')).toBe('string')
    expect(typeof purity2Color('impure')).toBe('string')
  })

  it('harmonyColor handles all tiers', () => {
    expect(typeof harmonyColor('perfect-equilibrium')).toBe('string')
    expect(typeof harmonyColor('well-balanced')).toBe('string')
    expect(typeof harmonyColor('proper-mix')).toBe('string')
    expect(typeof harmonyColor('uneven-elements')).toBe('string')
    expect(typeof harmonyColor('imbalanced')).toBe('string')
    expect(typeof harmonyColor('chaotic-mix')).toBe('string')
  })

  it('insightColor handles all tiers', () => {
    expect(typeof insightColor('enlightened')).toBe('string')
    expect(typeof insightColor('wise')).toBe('string')
    expect(typeof insightColor('learned')).toBe('string')
    expect(typeof insightColor('student')).toBe('string')
    expect(typeof insightColor('novice')).toBe('string')
    expect(typeof insightColor('ignorant')).toBe('string')
  })

  it('proportionColor handles all tiers', () => {
    expect(typeof proportionColor('golden-spiral')).toBe('string')
    expect(typeof proportionColor('proper-proportion')).toBe('string')
    expect(typeof proportionColor('well-sized')).toBe('string')
    expect(typeof proportionColor('adequate')).toBe('string')
    expect(typeof proportionColor('misproportioned')).toBe('string')
    expect(typeof proportionColor('grotesque')).toBe('string')
  })

  it('conditionColor handles all tiers', () => {
    expect(typeof conditionColor('philosopher-stone')).toBe('string')
    expect(typeof conditionColor('pure-gold')).toBe('string')
    expect(typeof conditionColor('silver-phial')).toBe('string')
    expect(typeof conditionColor('base-metal')).toBe('string')
    expect(typeof conditionColor('lead-weight')).toBe('string')
    expect(typeof conditionColor('slag-heap')).toBe('string')
  })

  it('alchemistGradeColor handles all tiers', () => {
    expect(typeof alchemistGradeColor('grand-master-alchemist')).toBe('string')
    expect(typeof alchemistGradeColor('master-transmuter')).toBe('string')
    expect(typeof alchemistGradeColor('skilled-alchemist')).toBe('string')
    expect(typeof alchemistGradeColor('apprentice')).toBe('string')
    expect(typeof alchemistGradeColor('novice')).toBe('string')
    expect(typeof alchemistGradeColor('charlatan')).toBe('string')
  })

  it('formatAlchemyGlassJson returns valid JSON', () => {
    const r = buildAlchemyGlassResult(['src/widget.ts'], [RICH])
    const json = formatAlchemyGlassJson(r)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })

  it('formatAlchemyGlassTable returns non-empty string', () => {
    const r = buildAlchemyGlassResult(['src/widget.ts'], [RICH])
    const table = formatAlchemyGlassTable(r, false)
    expect(typeof table).toBe('string')
    expect(table.length).toBeGreaterThan(0)
  })

  it('formatAlchemyGlassTable verbose shows per-file details', () => {
    const r = buildAlchemyGlassResult(['src/widget.ts'], [RICH])
    const table = formatAlchemyGlassTable(r, true)
    expect(table).toContain('widget.ts')
  })

  it('formatAlchemyGlassTable non-verbose omits per-file details', () => {
    const r = buildAlchemyGlassResult(['src/widget.ts'], [RICH])
    const table = formatAlchemyGlassTable(r, false)
    expect(table).not.toContain('Per-File Phials')
  })

  it('color functions handle unknown strings', () => {
    expect(typeof gradeColor('unknown')).toBe('string')
    expect(typeof vesselColor('unknown')).toBe('string')
    expect(typeof conditionColor('unknown')).toBe('string')
    expect(typeof alchemistGradeColor('unknown')).toBe('string')
  })
})
