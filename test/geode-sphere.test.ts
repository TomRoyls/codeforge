import { describe, it, expect } from 'vitest'

import {
  measureExterior,
  measureInner,
  measureCrystal,
  measureGeological,
  measureCleavage,
  measureMineral,
  classifyCondition,
  analyzeGeodeSpecimen,
  analyzeMineralVein,
  classifyVeinType,
  classifyProspectorGrade,
  generateRecommendations,
  buildGeodeSphereResult,
} from '../src/commands/geode-sphere-helpers.js'

import {
  scoreColor,
  conditionColor,
  gradeColor,
  roughnessColor,
  treasureColor,
  crystalTypeColor,
  eraColor,
  planeColor,
  valueColor,
  veinTypeColor,
  formatGeodeSphereJson,
  formatGeodeSphereTable,
} from '../src/commands/geode-sphere-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────

const RICH = `
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

const EMPTY = ''

const MEDIUM = 'const x = 1\n'

// ─── measureExterior ───────────────────────────────────────────

describe('measureExterior', () => {
  it('measures rich content', () => {
    const result = measureExterior(RICH)
    expect(result.impression).toBe(88)
    expect(result.roughness).toBe('rough')
    expect(result.hasHighImpression).toBe(true)
    expect(result.hasCleanExterior).toBe(true)
    expect(result.hasNoCracks).toBe(false)
    expect(result.hasProperCoating).toBe(true)
    expect(result.hasNoWeathering).toBe(true)
    expect(result.hasUniform).toBe(true)
    expect(result.hasNoStaining).toBe(true)
    expect(result.hasPresentable).toBe(true)
    expect(result.hasNoErosion).toBe(true)
    expect(result.hasSolidShell).toBe(true)
    expect(result.crackCount).toBe(1)
    expect(result.stainingCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureExterior(EMPTY)
    expect(result.impression).toBe(75)
    expect(result.roughness).toBe('smooth')
    expect(result.hasHighImpression).toBe(true)
    expect(result.hasNoCracks).toBe(true)
    expect(result.hasPresentable).toBe(false)
    expect(result.hasSolidShell).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureExterior(MEDIUM)
    expect(result.impression).toBe(80)
    expect(result.roughness).toBe('smooth')
  })
})

// ─── measureInner ──────────────────────────────────────────────

describe('measureInner', () => {
  it('measures rich content', () => {
    const result = measureInner(RICH)
    expect(result.beauty).toBe(90)
    expect(result.treasure).toBe('amethyst-cathedral')
    expect(result.hasHighBeauty).toBe(true)
    expect(result.hasCrystalline).toBe(true)
    expect(result.hasProperCavity).toBe(true)
    expect(result.hasNoDebris).toBe(true)
    expect(result.hasRadiating).toBe(false)
    expect(result.hasNoHollow).toBe(true)
    expect(result.hasLuminescent).toBe(true)
    expect(result.hasNoInclusions).toBe(true)
    expect(result.hasDense).toBe(true)
    expect(result.hasNoFractures).toBe(true)
    expect(result.debrisCount).toBe(0)
    expect(result.fractureCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureInner(EMPTY)
    expect(result.beauty).toBe(31)
    expect(result.treasure).toBe('druzy')
    expect(result.hasHighBeauty).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureInner(MEDIUM)
    expect(result.beauty).toBe(36)
    expect(result.treasure).toBe('druzy')
  })
})

// ─── measureCrystal ────────────────────────────────────────────

describe('measureCrystal', () => {
  it('measures rich content', () => {
    const result = measureCrystal(RICH)
    expect(result.formation).toBe(79)
    expect(result.type).toBe('pristine-crystal')
    expect(result.hasHighFormation).toBe(true)
    expect(result.hasProperFacets).toBe(true)
    expect(result.hasTermination).toBe(true)
    expect(result.hasNoTwinning).toBe(true)
    expect(result.hasCleanFaces).toBe(true)
    expect(result.hasNoInclusions).toBe(true)
    expect(result.hasProperSymmetry).toBe(false)
    expect(result.hasNoStriations).toBe(true)
    expect(result.hasPristine).toBe(false)
    expect(result.hasNoImperfections).toBe(true)
    expect(result.twinningCount).toBe(0)
    expect(result.imperfectionCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureCrystal(EMPTY)
    expect(result.formation).toBe(52)
    expect(result.type).toBe('cryptocrystalline')
    expect(result.hasHighFormation).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureCrystal(MEDIUM)
    expect(result.formation).toBe(57)
    expect(result.type).toBe('cryptocrystalline')
  })
})

// ─── measureGeological ─────────────────────────────────────────

describe('measureGeological', () => {
  it('measures rich content', () => {
    const result = measureGeological(RICH)
    expect(result.pressure).toBe(78)
    expect(result.era).toBe('archean')
    expect(result.hasHighPressure).toBe(true)
    expect(result.hasSolidified).toBe(true)
    expect(result.hasProperStrata).toBe(false)
    expect(result.hasNoFaults).toBe(true)
    expect(result.hasMetamorphic).toBe(true)
    expect(result.hasNoErosion).toBe(true)
    expect(result.hasStable).toBe(false)
    expect(result.hasNoSubsidence).toBe(true)
    expect(result.hasWeathered).toBe(true)
    expect(result.hasNoVolcanic).toBe(true)
    expect(result.faultCount).toBe(0)
    expect(result.subsidenceCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureGeological(EMPTY)
    expect(result.pressure).toBe(40)
    expect(result.era).toBe('cenozoic')
    expect(result.hasHighPressure).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureGeological(MEDIUM)
    expect(result.pressure).toBe(45)
    expect(result.era).toBe('cenozoic')
  })
})

// ─── measureCleavage ───────────────────────────────────────────

describe('measureCleavage', () => {
  it('measures rich content', () => {
    const result = measureCleavage(RICH)
    expect(result.quality).toBe(100)
    expect(result.plane).toBe('perfect-cleavage')
    expect(result.hasHighQuality).toBe(true)
    expect(result.hasCleanBreak).toBe(true)
    expect(result.hasProperPlanes).toBe(true)
    expect(result.hasNoShattering).toBe(true)
    expect(result.hasConchoidal).toBe(true)
    expect(result.hasNoSplintering).toBe(true)
    expect(result.hasEvenFracture).toBe(true)
    expect(result.hasNoUnevenBreak).toBe(true)
    expect(result.hasModular).toBe(true)
    expect(result.hasNoMonolithic).toBe(true)
    expect(result.shatteringCount).toBe(0)
    expect(result.splinteringCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureCleavage(EMPTY)
    expect(result.quality).toBe(50)
    expect(result.plane).toBe('difficult')
    expect(result.hasHighQuality).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureCleavage(MEDIUM)
    expect(result.quality).toBe(45)
    expect(result.plane).toBe('difficult')
  })
})

// ─── measureMineral ────────────────────────────────────────────

describe('measureMineral', () => {
  it('measures rich content', () => {
    const result = measureMineral(RICH)
    expect(result.wealth).toBe(77)
    expect(result.value).toBe('industrial')
    expect(result.hasHighWealth).toBe(true)
    expect(result.hasRare).toBe(false)
    expect(result.hasValuable).toBe(true)
    expect(result.hasNoWaste).toBe(true)
    expect(result.hasConcentrated).toBe(true)
    expect(result.hasNoDilution).toBe(true)
    expect(result.hasExtractable).toBe(true)
    expect(result.hasNoContamination).toBe(true)
    expect(result.hasHighGrade).toBe(false)
    expect(result.hasNoTailings).toBe(true)
    expect(result.wasteCount).toBe(0)
    expect(result.contaminationCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureMineral(EMPTY)
    expect(result.wealth).toBe(40)
    expect(result.value).toBe('low-grade')
    expect(result.hasHighWealth).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureMineral(MEDIUM)
    expect(result.wealth).toBe(45)
    expect(result.value).toBe('low-grade')
  })
})

// ─── analyzeGeodeSpecimen ──────────────────────────────────────

describe('analyzeGeodeSpecimen', () => {
  it('analyzes rich content', () => {
    const result = analyzeGeodeSpecimen(RICH, 'rich.ts')
    expect(result.file).toBe('rich.ts')
    expect(result.exteriorImpression).toBe(88)
    expect(result.innerBeauty).toBe(90)
    expect(result.crystalFormation).toBe(79)
    expect(result.geologicalPressure).toBe(78)
    expect(result.cleavageQuality).toBe(100)
    expect(result.mineralWealth).toBe(77)
    expect(result.qualityScore).toBe(85)
    expect(result.condition).toBe('museum-specimen')
  })

  it('analyzes empty content', () => {
    const result = analyzeGeodeSpecimen(EMPTY, 'empty.ts')
    expect(result.exteriorImpression).toBe(75)
    expect(result.innerBeauty).toBe(31)
    expect(result.crystalFormation).toBe(52)
    expect(result.geologicalPressure).toBe(40)
    expect(result.cleavageQuality).toBe(50)
    expect(result.mineralWealth).toBe(40)
    expect(result.qualityScore).toBe(47)
    expect(result.condition).toBe('rough-specimen')
  })

  it('analyzes medium content', () => {
    const result = analyzeGeodeSpecimen(MEDIUM, 'medium.ts')
    expect(result.exteriorImpression).toBe(80)
    expect(result.innerBeauty).toBe(36)
    expect(result.crystalFormation).toBe(57)
    expect(result.geologicalPressure).toBe(45)
    expect(result.cleavageQuality).toBe(45)
    expect(result.mineralWealth).toBe(45)
    expect(result.qualityScore).toBe(50)
    expect(result.condition).toBe('display-quality')
  })

  it('returns consistent results on repeated calls', () => {
    const a = analyzeGeodeSpecimen(RICH, 'a.ts')
    const b = analyzeGeodeSpecimen(RICH, 'a.ts')
    expect(a.qualityScore).toBe(b.qualityScore)
    expect(a.exteriorImpression).toBe(b.exteriorImpression)
    expect(a.condition).toBe(b.condition)
  })
})

// ─── classifyCondition ─────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies museum-specimen', () => {
    const p = analyzeGeodeSpecimen(RICH, 'rich.ts')
    expect(classifyCondition(p)).toBe('museum-specimen')
  })

  it('classifies rough-specimen', () => {
    const e = analyzeGeodeSpecimen(EMPTY, 'empty.ts')
    expect(classifyCondition(e)).toBe('rough-specimen')
  })

  it('classifies display-quality', () => {
    const m = analyzeGeodeSpecimen(MEDIUM, 'medium.ts')
    expect(classifyCondition(m)).toBe('display-quality')
  })
})

// ─── classifyVeinType ──────────────────────────────────────────

describe('classifyVeinType', () => {
  it('classifies rich specimens as mother-lode', () => {
    const p = analyzeGeodeSpecimen(RICH, 'rich.ts')
    expect(classifyVeinType([p])).toBe('mother-lode')
  })

  it('classifies empty specimens as mineral-seam', () => {
    const e = analyzeGeodeSpecimen(EMPTY, 'empty.ts')
    expect(classifyVeinType([e])).toBe('mineral-seam')
  })

  it('classifies mixed specimens as rich-vein', () => {
    const p = analyzeGeodeSpecimen(RICH, 'rich.ts')
    const e = analyzeGeodeSpecimen(EMPTY, 'empty.ts')
    const m = analyzeGeodeSpecimen(MEDIUM, 'medium.ts')
    expect(classifyVeinType([p, e, m])).toBe('rich-vein')
  })
})

// ─── classifyProspectorGrade ───────────────────────────────────

describe('classifyProspectorGrade', () => {
  it('returns master-prospector for 80+', () => {
    expect(classifyProspectorGrade(90)).toBe('master-prospector')
  })
  it('returns gemologist for 65+', () => {
    expect(classifyProspectorGrade(75)).toBe('gemologist')
  })
  it('returns miner for 50+', () => {
    expect(classifyProspectorGrade(55)).toBe('miner')
  })
  it('returns rockhound for 35+', () => {
    expect(classifyProspectorGrade(35)).toBe('rockhound')
  })
  it('returns tourist for below 20', () => {
    expect(classifyProspectorGrade(15)).toBe('tourist')
  })
})

// ─── analyzeMineralVein ───────────────────────────────────────

describe('analyzeMineralVein', () => {
  it('analyzes a vein with multiple specimens', () => {
    const p = analyzeGeodeSpecimen(RICH, 'rich.ts')
    const m = analyzeGeodeSpecimen(MEDIUM, 'medium.ts')
    const vein = analyzeMineralVein([p, m], 'src')
    expect(vein.directory).toBe('src')
    expect(vein.specimens).toHaveLength(2)
    expect(vein.avgBeauty).toBe(63)
    expect(vein.avgCrystal).toBe(68)
    expect(vein.avgWealth).toBe(61)
    expect(vein.museumCount).toBe(1)
    expect(vein.dustCount).toBe(0)
    expect(vein.gemCount).toBe(1)
    expect(vein.crystallineCount).toBe(1)
    expect(vein.veinType).toBe('rich-vein')
    expect(vein.condition).toBe('productive-mine')
  })
})

// ─── generateRecommendations ──────────────────────────────────

describe('generateRecommendations', () => {
  it('returns empty array for rich content', () => {
    const p = analyzeGeodeSpecimen(RICH, 'rich.ts')
    const recs = generateRecommendations(
      [p],
      [{ directory: 'src', specimens: [p], avgBeauty: p.innerBeauty, avgCrystal: p.crystalFormation, avgWealth: p.mineralWealth, museumCount: 1, dustCount: 0, gemCount: 1, crystallineCount: 1, veinType: 'mother-lode', condition: 'treasure-trove' }],
      { avgBeauty: p.innerBeauty, avgCrystal: p.crystalFormation, avgWealth: p.mineralWealth, isGemQuality: true, overallQuality: p.qualityScore },
      { totalFiles: 1, hasHighBeautyCount: 1, hasHighFormationCount: 1, hasHighPressureCount: 1, hasHighQualityCount: 1, hasHighWealthCount: 1, hasHighImpressionCount: 1 },
    )
    expect(recs).toEqual([])
  })
})

// ─── buildGeodeSphereResult ───────────────────────────────────

describe('buildGeodeSphereResult', () => {
  it('builds result for rich content', () => {
    const result = buildGeodeSphereResult(['rich.ts'], [RICH])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalVeins).toBe(1)
    expect(result.stats.avgInnerBeauty).toBe(90)
    expect(result.stats.avgCrystalFormation).toBe(79)
    expect(result.stats.avgGeologicalPressure).toBe(78)
    expect(result.stats.avgCleavageQuality).toBe(100)
    expect(result.stats.avgMineralWealth).toBe(77)
    expect(result.stats.avgExteriorImpression).toBe(88)
    expect(result.stats.overallQuality).toBe(85)
    expect(result.stats.prospectorGrade).toBe('master-prospector')
    expect(result.stats.museumSpecimenCount).toBe(1)
    expect(result.stats.hasHighBeautyCount).toBe(1)
    expect(result.stats.bestSpecimen).toBe('rich.ts')
    expect(result.quarry.isGemQuality).toBe(true)
  })

  it('builds result for empty content', () => {
    const result = buildGeodeSphereResult(['empty.ts'], [EMPTY])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgInnerBeauty).toBe(31)
    expect(result.stats.avgCrystalFormation).toBe(52)
    expect(result.stats.avgGeologicalPressure).toBe(40)
    expect(result.stats.avgCleavageQuality).toBe(50)
    expect(result.stats.avgMineralWealth).toBe(40)
    expect(result.stats.avgExteriorImpression).toBe(75)
    expect(result.stats.overallQuality).toBe(47)
    expect(result.stats.prospectorGrade).toBe('rockhound')
    expect(result.stats.roughSpecimenCount).toBe(1)
    expect(result.stats.hasHighBeautyCount).toBe(0)
    expect(result.quarry.isGemQuality).toBe(false)
  })

  it('builds result for mixed content', () => {
    const result = buildGeodeSphereResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalVeins).toBe(1)
    expect(result.stats.avgInnerBeauty).toBe(63)
    expect(result.stats.avgCrystalFormation).toBe(68)
    expect(result.stats.avgGeologicalPressure).toBe(62)
    expect(result.stats.avgCleavageQuality).toBe(73)
    expect(result.stats.avgMineralWealth).toBe(61)
    expect(result.stats.avgExteriorImpression).toBe(84)
    expect(result.stats.overallQuality).toBe(68)
    expect(result.stats.prospectorGrade).toBe('gemologist')
    expect(result.stats.museumSpecimenCount).toBe(1)
    expect(result.stats.displayQualityCount).toBe(1)
    expect(result.stats.bestSpecimen).toBe('rich.ts')
    expect(result.quarry.overallQuality).toBe(68)
  })

  it('returns specimens and veins arrays', () => {
    const result = buildGeodeSphereResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.specimens).toHaveLength(2)
    expect(result.veins).toHaveLength(1)
    expect(result.specimens[0].file).toBe('rich.ts')
    expect(result.specimens[1].file).toBe('medium.ts')
  })
})

// ─── scoreColor ────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns string for high scores', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })
  it('returns string for medium scores', () => {
    expect(typeof scoreColor(70)).toBe('string')
  })
  it('returns string for low scores', () => {
    expect(typeof scoreColor(30)).toBe('string')
  })
})

// ─── conditionColor ────────────────────────────────────────────

describe('conditionColor', () => {
  it('returns string for museum-specimen', () => {
    expect(typeof conditionColor('museum-specimen')).toBe('string')
  })
  it('returns string for collector-piece', () => {
    expect(typeof conditionColor('collector-piece')).toBe('string')
  })
  it('returns string for display-quality', () => {
    expect(typeof conditionColor('display-quality')).toBe('string')
  })
  it('returns string for rough-specimen', () => {
    expect(typeof conditionColor('rough-specimen')).toBe('string')
  })
  it('returns string for fragment', () => {
    expect(typeof conditionColor('fragment')).toBe('string')
  })
  it('returns string for dust', () => {
    expect(typeof conditionColor('dust')).toBe('string')
  })
  it('returns string for unknown', () => {
    expect(typeof conditionColor('unknown')).toBe('string')
  })
})

// ─── gradeColor ────────────────────────────────────────────────

describe('gradeColor', () => {
  it('returns string for master-prospector', () => {
    expect(typeof gradeColor('master-prospector')).toBe('string')
  })
  it('returns string for gemologist', () => {
    expect(typeof gradeColor('gemologist')).toBe('string')
  })
  it('returns string for tourist', () => {
    expect(typeof gradeColor('tourist')).toBe('string')
  })
})

// ─── roughnessColor ────────────────────────────────────────────

describe('roughnessColor', () => {
  it('returns string for polished', () => {
    expect(typeof roughnessColor('polished')).toBe('string')
  })
  it('returns string for dust', () => {
    expect(typeof roughnessColor('dust')).toBe('string')
  })
})

// ─── treasureColor ─────────────────────────────────────────────

describe('treasureColor', () => {
  it('returns string for amethyst-cathedral', () => {
    expect(typeof treasureColor('amethyst-cathedral')).toBe('string')
  })
  it('returns string for hollow', () => {
    expect(typeof treasureColor('hollow')).toBe('string')
  })
})

// ─── crystalTypeColor ──────────────────────────────────────────

describe('crystalTypeColor', () => {
  it('returns string for pristine-crystal', () => {
    expect(typeof crystalTypeColor('pristine-crystal')).toBe('string')
  })
  it('returns string for amorphous', () => {
    expect(typeof crystalTypeColor('amorphous')).toBe('string')
  })
})

// ─── eraColor ──────────────────────────────────────────────────

describe('eraColor', () => {
  it('returns string for archean', () => {
    expect(typeof eraColor('archean')).toBe('string')
  })
  it('returns string for holocene', () => {
    expect(typeof eraColor('holocene')).toBe('string')
  })
})

// ─── planeColor ────────────────────────────────────────────────

describe('planeColor', () => {
  it('returns string for perfect-cleavage', () => {
    expect(typeof planeColor('perfect-cleavage')).toBe('string')
  })
  it('returns string for none', () => {
    expect(typeof planeColor('none')).toBe('string')
  })
})

// ─── valueColor ────────────────────────────────────────────────

describe('valueColor', () => {
  it('returns string for precious-gem', () => {
    expect(typeof valueColor('precious-gem')).toBe('string')
  })
  it('returns string for barren', () => {
    expect(typeof valueColor('barren')).toBe('string')
  })
})

// ─── veinTypeColor ─────────────────────────────────────────────

describe('veinTypeColor', () => {
  it('returns string for mother-lode', () => {
    expect(typeof veinTypeColor('mother-lode')).toBe('string')
  })
  it('returns string for void', () => {
    expect(typeof veinTypeColor('void')).toBe('string')
  })
})

// ─── formatGeodeSphereJson ─────────────────────────────────────

describe('formatGeodeSphereJson', () => {
  it('returns valid JSON string', () => {
    const result = buildGeodeSphereResult(['rich.ts'], [RICH])
    const json = formatGeodeSphereJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.stats.overallQuality).toBe(85)
    expect(parsed.specimens).toHaveLength(1)
  })
})

// ─── formatGeodeSphereTable ────────────────────────────────────

describe('formatGeodeSphereTable', () => {
  it('returns a non-empty string', () => {
    const result = buildGeodeSphereResult(['rich.ts'], [RICH])
    const table = formatGeodeSphereTable(result, false)
    expect(typeof table).toBe('string')
    expect(table.length).toBeGreaterThan(0)
  })

  it('returns verbose table with more content', () => {
    const result = buildGeodeSphereResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    const brief = formatGeodeSphereTable(result, false)
    const verbose = formatGeodeSphereTable(result, true)
    expect(verbose.length).toBeGreaterThan(brief.length)
  })
})
