import { describe, expect, it } from 'vitest'
import {
  measureArchitect,
  measureConstellation,
  measureStellar,
  measureNebula,
  measureGravity,
  measureHarmony,
  analyzeStarSystem,
  classifyCondition,
  classifyClusterType,
  classifyClusterCondition,
  classifyAstronomerGrade,
  analyzeGalaxyCluster,
  generateRecommendations,
  buildStarryVaultResult,
} from '../src/commands/starry-vault-helpers.js'
import {
  scoreColor,
  scaleColor,
  patternColor,
  magnitudeColor,
  depthColor,
  pullColor,
  resonanceColor,
  conditionColor,
  astronomerGradeColor,
  formatStarryVaultJson,
  formatStarryVaultTable,
} from '../src/commands/starry-vault-format-helpers.js'

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

describe('starry-vault measureArchitect', () => {
  it('measures RICH content correctly', () => {
    const m = measureArchitect(RICH)
    expect(m.design).toBe(85)
    expect(m.scale).toBe('cosmos-spanning')
    expect(m.hasHighDesign).toBe(true)
    expect(m.hasWellDesigned).toBe(true)
    expect(m.hasProperScale).toBe(true)
    expect(m.hasNoBloat).toBe(true)
    expect(m.hasScalable).toBe(false)
    expect(m.hasNoOversized).toBe(true)
    expect(m.hasProportioned).toBe(true)
    expect(m.hasNoMisSized).toBe(true)
    expect(m.hasElegant).toBe(false)
    expect(m.hasNoClumsy).toBe(true)
    expect(m.bloatCount).toBe(0)
    expect(m.oversizedCount).toBe(0)
  })

  it('measures SIMPLE content correctly', () => {
    const m = measureArchitect(SIMPLE)
    expect(m.design).toBe(8)
    expect(m.scale).toBe('grounded')
    expect(m.hasHighDesign).toBe(false)
  })

  it('measures EMPTY content correctly', () => {
    const m = measureArchitect(EMPTY)
    expect(m.design).toBe(0)
    expect(m.scale).toBe('grounded')
  })

  it('measures BAD content correctly', () => {
    const m = measureArchitect(BAD)
    expect(m.design).toBe(0)
    expect(m.hasNoBloat).toBe(false)
    expect(m.hasNoOversized).toBe(false)
    expect(m.bloatCount).toBe(2)
    expect(m.oversizedCount).toBe(4)
  })
})

describe('starry-vault measureConstellation', () => {
  it('measures RICH content correctly', () => {
    const m = measureConstellation(RICH)
    expect(m.quality).toBe(98)
    expect(m.pattern).toBe('perfect-constellation')
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasOrganized).toBe(true)
    expect(m.hasPatterned).toBe(true)
    expect(m.hasNoChaos).toBe(true)
    expect(m.hasStructured).toBe(true)
    expect(m.hasNoRandomness).toBe(true)
    expect(m.hasClear).toBe(false)
    expect(m.hasNoConfusion).toBe(true)
    expect(m.hasMapped).toBe(true)
    expect(m.hasNoTangle).toBe(true)
    expect(m.chaosCount).toBe(0)
    expect(m.randomnessCount).toBe(0)
  })

  it('measures EMPTY content correctly', () => {
    const m = measureConstellation(EMPTY)
    expect(m.quality).toBe(0)
    expect(m.pattern).toBe('void')
    expect(m.hasNoChaos).toBe(true)
  })

  it('measures BAD content correctly', () => {
    const m = measureConstellation(BAD)
    expect(m.quality).toBe(0)
    expect(m.pattern).toBe('void')
    expect(m.hasNoChaos).toBe(false)
    expect(m.chaosCount).toBe(2)
    expect(m.randomnessCount).toBe(4)
  })
})

describe('starry-vault measureStellar', () => {
  it('measures RICH content correctly', () => {
    const m = measureStellar(RICH)
    expect(m.brightness).toBe(77)
    expect(m.magnitude).toBe('bright-star')
    expect(m.hasHighBrightness).toBe(true)
    expect(m.hasExcellent).toBe(false)
    expect(m.hasBrilliant).toBe(false)
    expect(m.hasNoDullness).toBe(true)
    expect(m.hasOutstanding).toBe(true)
    expect(m.hasNoMediocrity).toBe(true)
    expect(m.hasShining).toBe(true)
    expect(m.hasNoDarkness).toBe(true)
    expect(m.hasLuminous).toBe(true)
    expect(m.hasNoObscurity).toBe(true)
  })

  it('measures EMPTY content correctly', () => {
    const m = measureStellar(EMPTY)
    expect(m.brightness).toBe(0)
    expect(m.magnitude).toBe('black-hole')
  })

  it('measures BAD content correctly', () => {
    const m = measureStellar(BAD)
    expect(m.brightness).toBe(8)
    expect(m.dullnessCount).toBe(2)
    expect(m.mediocrityCount).toBe(4)
  })
})

describe('starry-vault measureNebula', () => {
  it('measures RICH content correctly', () => {
    const m = measureNebula(RICH)
    expect(m.richness).toBe(55)
    expect(m.depth).toBe('stellar-nursery')
    expect(m.hasHighRichness).toBe(false)
    expect(m.hasCreative).toBe(false)
    expect(m.hasInnovative).toBe(false)
    expect(m.hasNoSterility).toBe(true)
    expect(m.hasRich).toBe(true)
    expect(m.hasNoBarrenness).toBe(true)
    expect(m.hasDeep).toBe(false)
    expect(m.hasNoShallowness).toBe(true)
    expect(m.hasExpressive).toBe(false)
    expect(m.hasNoFlatness).toBe(true)
    expect(m.hasImaginative).toBe(true)
  })

  it('measures EMPTY content correctly', () => {
    const m = measureNebula(EMPTY)
    expect(m.richness).toBe(0)
    expect(m.depth).toBe('dark-matter')
  })

  it('measures BAD content correctly', () => {
    const m = measureNebula(BAD)
    expect(m.richness).toBe(0)
    expect(m.hasNoSterility).toBe(false)
    expect(m.sterilityCount).toBe(2)
    expect(m.barrennessCount).toBe(4)
  })
})

describe('starry-vault measureGravity', () => {
  it('measures RICH content correctly', () => {
    const m = measureGravity(RICH)
    expect(m.stability).toBe(85)
    expect(m.pull).toBe('stable-orbit')
    expect(m.hasHighStability).toBe(true)
    expect(m.hasStable).toBe(false)
    expect(m.hasWellManaged).toBe(true)
    expect(m.hasNoBreakage).toBe(true)
    expect(m.hasPinned).toBe(true)
    expect(m.hasNoDrifting).toBe(true)
    expect(m.hasControlled).toBe(true)
    expect(m.hasNoChaotic).toBe(true)
    expect(m.hasSecure).toBe(false)
    expect(m.hasNoVulnerable).toBe(true)
  })

  it('measures EMPTY content correctly', () => {
    const m = measureGravity(EMPTY)
    expect(m.stability).toBe(0)
    expect(m.pull).toBe('collapsed')
  })

  it('measures BAD content correctly', () => {
    const m = measureGravity(BAD)
    expect(m.stability).toBe(8)
    expect(m.hasNoBreakage).toBe(false)
    expect(m.breakageCount).toBe(2)
    expect(m.driftingCount).toBe(4)
  })
})

describe('starry-vault measureHarmony', () => {
  it('measures RICH content correctly', () => {
    const m = measureHarmony(RICH)
    expect(m.coherence).toBe(98)
    expect(m.resonance).toBe('cosmic-harmony')
    expect(m.hasHighCoherence).toBe(true)
    expect(m.hasCoherent).toBe(true)
    expect(m.hasHarmonious).toBe(true)
    expect(m.hasNoConflict).toBe(true)
    expect(m.hasAligned).toBe(true)
    expect(m.hasNoContradiction).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasNoClash).toBe(true)
    expect(m.hasUnified).toBe(false)
    expect(m.hasNoFragmentation).toBe(true)
    expect(m.hasBalanced).toBe(true)
  })

  it('measures EMPTY content correctly', () => {
    const m = measureHarmony(EMPTY)
    expect(m.coherence).toBe(0)
    expect(m.resonance).toBe('chaos')
  })

  it('measures BAD content correctly', () => {
    const m = measureHarmony(BAD)
    expect(m.coherence).toBe(0)
    expect(m.hasNoConflict).toBe(false)
    expect(m.conflictCount).toBe(2)
    expect(m.contradictionCount).toBe(4)
  })
})

describe('starry-vault classifyCondition', () => {
  it('classifies cosmic-masterpiece', () => expect(classifyCondition(90)).toBe('cosmic-masterpiece'))
  it('classifies brilliant-galaxy', () => expect(classifyCondition(75)).toBe('brilliant-galaxy'))
  it('classifies stellar-system', () => expect(classifyCondition(60)).toBe('stellar-system'))
  it('classifies dim-nebula', () => expect(classifyCondition(45)).toBe('dim-nebula'))
  it('classifies dark-void', () => expect(classifyCondition(30)).toBe('dark-void'))
  it('classifies black-hole', () => expect(classifyCondition(20)).toBe('black-hole'))
  it('classifies cosmic-masterpiece at boundary', () => expect(classifyCondition(85)).toBe('cosmic-masterpiece'))
  it('classifies brilliant-galaxy at boundary', () => expect(classifyCondition(70)).toBe('brilliant-galaxy'))
  it('classifies stellar-system at boundary', () => expect(classifyCondition(55)).toBe('stellar-system'))
  it('classifies dim-nebula at boundary', () => expect(classifyCondition(40)).toBe('dim-nebula'))
  it('classifies dark-void at boundary', () => expect(classifyCondition(25)).toBe('dark-void'))
  it('classifies black-hole at 0', () => expect(classifyCondition(0)).toBe('black-hole'))
})

describe('starry-vault classifyAstronomerGrade', () => {
  it('classifies cosmic-architect', () => expect(classifyAstronomerGrade(85)).toBe('cosmic-architect'))
  it('classifies master-astronomer', () => expect(classifyAstronomerGrade(70)).toBe('master-astronomer'))
  it('classifies expert-stargazer', () => expect(classifyAstronomerGrade(55)).toBe('expert-stargazer'))
  it('classifies amateur-observer', () => expect(classifyAstronomerGrade(40)).toBe('amateur-observer'))
  it('classifies cloudy-night', () => expect(classifyAstronomerGrade(25)).toBe('cloudy-night'))
  it('classifies blind', () => expect(classifyAstronomerGrade(10)).toBe('blind'))
  it('classifies cosmic-architect at boundary', () => expect(classifyAstronomerGrade(80)).toBe('cosmic-architect'))
  it('classifies master-astronomer at boundary', () => expect(classifyAstronomerGrade(65)).toBe('master-astronomer'))
  it('classifies expert-stargazer at boundary', () => expect(classifyAstronomerGrade(50)).toBe('expert-stargazer'))
  it('classifies amateur-observer at boundary', () => expect(classifyAstronomerGrade(35)).toBe('amateur-observer'))
  it('classifies cloudy-night at boundary', () => expect(classifyAstronomerGrade(20)).toBe('cloudy-night'))
})

describe('starry-vault classifyClusterType', () => {
  it('returns void for empty array', () => {
    expect(classifyClusterType([])).toBe('void')
  })

  it('returns galactic-filament for high quality systems', () => {
    const systems = [
      { qualityScore: 90, condition: 'cosmic-masterpiece' } as any,
      { qualityScore: 88, condition: 'cosmic-masterpiece' } as any,
    ]
    expect(classifyClusterType(systems)).toBe('galactic-filament')
  })

  it('returns galaxy-cluster for medium quality', () => {
    const systems = [
      { qualityScore: 65, condition: 'brilliant-galaxy' } as any,
    ]
    expect(classifyClusterType(systems)).toBe('galaxy-cluster')
  })

  it('returns star-cluster for below average', () => {
    const systems = [
      { qualityScore: 48, condition: 'stellar-system' } as any,
    ]
    expect(classifyClusterType(systems)).toBe('star-cluster')
  })
})

describe('starry-vault classifyClusterCondition', () => {
  it('classifies universe-marvel', () => expect(classifyClusterCondition(80)).toBe('universe-marvel'))
  it('classifies galactic-wonder', () => expect(classifyClusterCondition(65)).toBe('galactic-wonder'))
  it('classifies stellar-collection', () => expect(classifyClusterCondition(50)).toBe('stellar-collection'))
  it('classifies dim-cluster', () => expect(classifyClusterCondition(35)).toBe('dim-cluster'))
  it('classifies dark-region', () => expect(classifyClusterCondition(20)).toBe('dark-region'))
  it('classifies void', () => expect(classifyClusterCondition(10)).toBe('void'))
})

describe('starry-vault analyzeStarSystem', () => {
  it('analyzes RICH content correctly', () => {
    const sys = analyzeStarSystem(RICH, 'src/widget.ts')
    expect(sys.file).toBe('src/widget.ts')
    expect(sys.qualityScore).toBe(84)
    expect(sys.condition).toBe('brilliant-galaxy')
    expect(sys.cosmicArchitecture).toBe(85)
    expect(sys.constellationQuality).toBe(98)
    expect(sys.stellarBrightness).toBe(77)
    expect(sys.nebulaRichness).toBe(55)
    expect(sys.gravityStability).toBe(85)
    expect(sys.cosmicHarmony).toBe(98)
  })

  it('analyzes SIMPLE content correctly', () => {
    const sys = analyzeStarSystem(SIMPLE, 'simple.ts')
    expect(sys.file).toBe('simple.ts')
    expect(sys.qualityScore).toBe(10)
    expect(sys.condition).toBe('black-hole')
    expect(sys.cosmicArchitecture).toBe(8)
  })

  it('analyzes EMPTY content correctly', () => {
    const sys = analyzeStarSystem(EMPTY, 'empty.ts')
    expect(sys.qualityScore).toBe(0)
    expect(sys.condition).toBe('black-hole')
  })

  it('analyzes BAD content correctly', () => {
    const sys = analyzeStarSystem(BAD, 'bad.ts')
    expect(sys.qualityScore).toBe(2)
    expect(sys.condition).toBe('black-hole')
  })
})

describe('starry-vault analyzeGalaxyCluster', () => {
  it('handles empty systems', () => {
    const cl = analyzeGalaxyCluster([], 'empty-dir')
    expect(cl.directory).toBe('empty-dir')
    expect(cl.systems).toEqual([])
    expect(cl.avgArchitecture).toBe(0)
    expect(cl.avgBrightness).toBe(0)
    expect(cl.avgHarmony).toBe(0)
    expect(cl.cosmicMasterpieceCount).toBe(0)
    expect(cl.blackHoleCount).toBe(0)
    expect(cl.brilliantGalaxyCount).toBe(0)
    expect(cl.stellarSystemCount).toBe(0)
    expect(cl.clusterType).toBe('void')
    expect(cl.condition).toBe('void')
  })

  it('handles single RICH system', () => {
    const sys = analyzeStarSystem(RICH, 'src/a.ts')
    const cl = analyzeGalaxyCluster([sys], 'src')
    expect(cl.avgArchitecture).toBe(85)
    expect(cl.avgBrightness).toBe(77)
    expect(cl.avgHarmony).toBe(98)
    expect(cl.brilliantGalaxyCount).toBe(1)
    expect(cl.cosmicMasterpieceCount).toBe(0)
    expect(cl.clusterType).toBe('galaxy-cluster')
  })
})

describe('starry-vault generateRecommendations', () => {
  it('returns positive message for high quality', () => {
    const result = buildStarryVaultResult(['good.ts'], [RICH])
    expect(result.recommendations).toContain('Your starry vault shines with cosmic brilliance! Every star system is magnificent')
  })

  it('recommends architecture improvement for low scores', () => {
    const result = buildStarryVaultResult(['bad.ts'], [BAD])
    expect(result.recommendations).toContain('Elevate cosmic architecture with interfaces, generics, and well-designed abstractions')
  })

  it('recommends constellation improvement', () => {
    const result = buildStarryVaultResult(['bad.ts'], [BAD])
    expect(result.recommendations).toContain('Improve constellation quality with organized imports, exports, and clear patterns')
  })

  it('recommends stellar brightness improvement', () => {
    const result = buildStarryVaultResult(['bad.ts'], [BAD])
    expect(result.recommendations).toContain('Boost stellar brightness with strict equality, optional chaining, and error handling')
  })

  it('recommends nebula richness improvement', () => {
    const result = buildStarryVaultResult(['bad.ts'], [BAD])
    expect(result.recommendations).toContain('Deepen nebula richness with generics, type aliases, and creative type compositions')
  })

  it('recommends gravity stability improvement', () => {
    const result = buildStarryVaultResult(['bad.ts'], [BAD])
    expect(result.recommendations).toContain('Stabilize gravity with readonly fields, strict equality, and secure dependency patterns')
  })

  it('recommends cosmic harmony improvement', () => {
    const result = buildStarryVaultResult(['bad.ts'], [BAD])
    expect(result.recommendations).toContain('Enhance cosmic harmony with consistent imports/exports, documentation, and async patterns')
  })

  it('notifies about black holes', () => {
    const result = buildStarryVaultResult(['bad.ts'], [BAD])
    expect(result.recommendations).toContain('1 file(s) are black holes — consider significant refactoring')
  })

  it('notifies about low overall cosmic quality', () => {
    const result = buildStarryVaultResult(['bad.ts'], [BAD])
    expect(result.recommendations).toContain('Overall cosmic quality is low — focus on architecture and harmony fundamentals')
  })

  it('rescues specific black holes', () => {
    const result = buildStarryVaultResult(['bad.ts'], [BAD])
    expect(result.recommendations).toContain('Rescue these black holes: bad.ts')
  })

  it('warns about all void/rogue clusters', () => {
    const result = buildStarryVaultResult(['bad.ts'], [BAD])
    expect(result.recommendations).toContain('All clusters are void or rogue — consider a major quality improvement effort')
  })
})

describe('starry-vault buildStarryVaultResult', () => {
  it('handles empty input', () => {
    const r = buildStarryVaultResult([], [])
    expect(r.systems).toEqual([])
    expect(r.clusters).toEqual([])
    expect(r.stats.totalFiles).toBe(0)
    expect(r.stats.totalClusters).toBe(0)
    expect(r.stats.avgCosmicArchitecture).toBe(0)
    expect(r.stats.overallCosmic).toBe(0)
    expect(r.stats.astronomerGrade).toBe('blind')
    expect(r.stats.bestSystem).toBe('')
    expect(r.universe.isCosmic).toBe(false)
    expect(r.universe.overallCosmic).toBe(0)
    expect(r.stats.celebration).toBe('430 commands - a starry vault of code analysis excellence')
  })

  it('handles single RICH file', () => {
    const r = buildStarryVaultResult(['src/widget.ts'], [RICH])
    expect(r.systems).toHaveLength(1)
    expect(r.clusters).toHaveLength(1)
    expect(r.stats.totalFiles).toBe(1)
    expect(r.stats.avgCosmicArchitecture).toBe(85)
    expect(r.stats.avgConstellationQuality).toBe(98)
    expect(r.stats.avgStellarBrightness).toBe(77)
    expect(r.stats.avgNebulaRichness).toBe(55)
    expect(r.stats.avgGravityStability).toBe(85)
    expect(r.stats.avgCosmicHarmony).toBe(98)
    expect(r.stats.cosmicMasterpieceCount).toBe(0)
    expect(r.stats.brilliantGalaxyCount).toBe(1)
    expect(r.stats.blackHoleCount).toBe(0)
    expect(r.stats.overallCosmic).toBe(87)
    expect(r.stats.astronomerGrade).toBe('cosmic-architect')
    expect(r.stats.bestSystem).toBe('src/widget.ts')
    expect(r.stats.bestArchitected).toBe('src/widget.ts')
    expect(r.stats.bestOrganized).toBe('src/widget.ts')
    expect(r.stats.brightest).toBe('src/widget.ts')
    expect(r.stats.richest).toBe('src/widget.ts')
    expect(r.stats.mostStable).toBe('src/widget.ts')
    expect(r.universe.isCosmic).toBe(true)
    expect(r.universe.overallCosmic).toBe(87)
    expect(r.universe.avgArchitecture).toBe(85)
    expect(r.universe.avgBrightness).toBe(77)
    expect(r.universe.avgHarmony).toBe(98)
  })

  it('handles RICH + SIMPLE files', () => {
    const r = buildStarryVaultResult(['src/widget.ts', 'simple.ts'], [RICH, SIMPLE])
    expect(r.systems).toHaveLength(2)
    expect(r.clusters).toHaveLength(2)
    expect(r.stats.totalFiles).toBe(2)
    expect(r.stats.avgCosmicArchitecture).toBe(47)
    expect(r.stats.avgConstellationQuality).toBe(53)
    expect(r.stats.avgStellarBrightness).toBe(48)
    expect(r.stats.avgNebulaRichness).toBe(28)
    expect(r.stats.avgGravityStability).toBe(52)
    expect(r.stats.avgCosmicHarmony).toBe(53)
    expect(r.stats.brilliantGalaxyCount).toBe(1)
    expect(r.stats.blackHoleCount).toBe(1)
    expect(r.stats.overallCosmic).toBe(49)
    expect(r.stats.astronomerGrade).toBe('amateur-observer')
    expect(r.universe.isCosmic).toBe(false)
    expect(r.universe.overallCosmic).toBe(49)
  })

  it('handles BAD file', () => {
    const r = buildStarryVaultResult(['bad.ts'], [BAD])
    expect(r.stats.totalFiles).toBe(1)
    expect(r.stats.avgCosmicArchitecture).toBe(0)
    expect(r.stats.avgStellarBrightness).toBe(8)
    expect(r.stats.blackHoleCount).toBe(1)
    expect(r.stats.overallCosmic).toBe(3)
    expect(r.stats.astronomerGrade).toBe('blind')
    expect(r.universe.isCosmic).toBe(false)
  })

  it('groups files by directory in clusters', () => {
    const r = buildStarryVaultResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, SIMPLE, RICH],
    )
    expect(r.clusters).toHaveLength(2)
    const srcCl = r.clusters.find((cl) => cl.directory === 'src')
    const libCl = r.clusters.find((cl) => cl.directory === 'lib')
    expect(srcCl).toBeDefined()
    expect(libCl).toBeDefined()
    expect(srcCl!.systems).toHaveLength(2)
    expect(libCl!.systems).toHaveLength(1)
  })

  it('tracks hasHigh* counts correctly', () => {
    const r = buildStarryVaultResult(['src/widget.ts'], [RICH])
    expect(r.stats.hasHighDesignCount).toBe(1)
    expect(r.stats.hasHighQualityCount).toBe(1)
    expect(r.stats.hasHighBrightnessCount).toBe(1)
    expect(r.stats.hasHighRichnessCount).toBe(0)
    expect(r.stats.hasHighStabilityCount).toBe(1)
    expect(r.stats.hasHighCoherenceCount).toBe(1)
  })

  it('tracks condition counts correctly', () => {
    const r = buildStarryVaultResult(['src/widget.ts', 'simple.ts'], [RICH, SIMPLE])
    expect(r.stats.cosmicMasterpieceCount).toBe(0)
    expect(r.stats.brilliantGalaxyCount).toBe(1)
    expect(r.stats.stellarSystemCount).toBe(0)
    expect(r.stats.dimNebulaCount).toBe(0)
    expect(r.stats.darkVoidCount).toBe(0)
    expect(r.stats.blackHoleCount).toBe(1)
  })

  it('always includes celebration string', () => {
    const r1 = buildStarryVaultResult([], [])
    const r2 = buildStarryVaultResult(['src/widget.ts'], [RICH])
    expect(r1.stats.celebration).toBe('430 commands - a starry vault of code analysis excellence')
    expect(r2.stats.celebration).toBe('430 commands - a starry vault of code analysis excellence')
  })
})

describe('starry-vault format-helpers', () => {
  it('scoreColor returns string for all ranges', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(65)).toBe('string')
    expect(typeof scoreColor(45)).toBe('string')
    expect(typeof scoreColor(10)).toBe('string')
  })

  it('scaleColor handles all tiers', () => {
    expect(typeof scaleColor('cosmos-spanning')).toBe('string')
    expect(typeof scaleColor('galactic-scale')).toBe('string')
    expect(typeof scaleColor('solar-system')).toBe('string')
    expect(typeof scaleColor('planetary')).toBe('string')
    expect(typeof scaleColor('orbital')).toBe('string')
    expect(typeof scaleColor('grounded')).toBe('string')
  })

  it('patternColor handles all tiers', () => {
    expect(typeof patternColor('perfect-constellation')).toBe('string')
    expect(typeof patternColor('clear-star-map')).toBe('string')
    expect(typeof patternColor('recognizable-pattern')).toBe('string')
    expect(typeof patternColor('scattered-stars')).toBe('string')
    expect(typeof patternColor('random-dots')).toBe('string')
    expect(typeof patternColor('void')).toBe('string')
  })

  it('magnitudeColor handles all tiers', () => {
    expect(typeof magnitudeColor('supergiant')).toBe('string')
    expect(typeof magnitudeColor('bright-star')).toBe('string')
    expect(typeof magnitudeColor('steady-star')).toBe('string')
    expect(typeof magnitudeColor('dim-star')).toBe('string')
    expect(typeof magnitudeColor('brown-dwarf')).toBe('string')
    expect(typeof magnitudeColor('black-hole')).toBe('string')
  })

  it('depthColor handles all tiers', () => {
    expect(typeof depthColor('orion-nebula')).toBe('string')
    expect(typeof depthColor('rich-cloud')).toBe('string')
    expect(typeof depthColor('stellar-nursery')).toBe('string')
    expect(typeof depthColor('thin-gas')).toBe('string')
    expect(typeof depthColor('void-space')).toBe('string')
    expect(typeof depthColor('dark-matter')).toBe('string')
  })

  it('pullColor handles all tiers', () => {
    expect(typeof pullColor('stable-orbit')).toBe('string')
    expect(typeof pullColor('proper-gravity')).toBe('string')
    expect(typeof pullColor('balanced-pull')).toBe('string')
    expect(typeof pullColor('wobbly-orbit')).toBe('string')
    expect(typeof pullColor('chaotic-orbit')).toBe('string')
    expect(typeof pullColor('collapsed')).toBe('string')
  })

  it('resonanceColor handles all tiers', () => {
    expect(typeof resonanceColor('cosmic-harmony')).toBe('string')
    expect(typeof resonanceColor('stellar-resonance')).toBe('string')
    expect(typeof resonanceColor('proper-alignment')).toBe('string')
    expect(typeof resonanceColor('partial-harmony')).toBe('string')
    expect(typeof resonanceColor('dissonance')).toBe('string')
    expect(typeof resonanceColor('chaos')).toBe('string')
  })

  it('conditionColor handles all tiers', () => {
    expect(typeof conditionColor('cosmic-masterpiece')).toBe('string')
    expect(typeof conditionColor('brilliant-galaxy')).toBe('string')
    expect(typeof conditionColor('stellar-system')).toBe('string')
    expect(typeof conditionColor('dim-nebula')).toBe('string')
    expect(typeof conditionColor('dark-void')).toBe('string')
    expect(typeof conditionColor('black-hole')).toBe('string')
  })

  it('astronomerGradeColor handles all tiers', () => {
    expect(typeof astronomerGradeColor('cosmic-architect')).toBe('string')
    expect(typeof astronomerGradeColor('master-astronomer')).toBe('string')
    expect(typeof astronomerGradeColor('expert-stargazer')).toBe('string')
    expect(typeof astronomerGradeColor('amateur-observer')).toBe('string')
    expect(typeof astronomerGradeColor('cloudy-night')).toBe('string')
    expect(typeof astronomerGradeColor('blind')).toBe('string')
  })

  it('formatStarryVaultJson returns valid JSON', () => {
    const r = buildStarryVaultResult(['src/widget.ts'], [RICH])
    const json = formatStarryVaultJson(r)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.stats.celebration).toBe('430 commands - a starry vault of code analysis excellence')
  })

  it('formatStarryVaultTable returns non-empty string', () => {
    const r = buildStarryVaultResult(['src/widget.ts'], [RICH])
    const table = formatStarryVaultTable(r, false)
    expect(typeof table).toBe('string')
    expect(table.length).toBeGreaterThan(0)
  })

  it('formatStarryVaultTable verbose shows per-file details', () => {
    const r = buildStarryVaultResult(['src/widget.ts'], [RICH])
    const table = formatStarryVaultTable(r, true)
    expect(table).toContain('widget.ts')
  })

  it('formatStarryVaultTable non-verbose omits per-file details', () => {
    const r = buildStarryVaultResult(['src/widget.ts'], [RICH])
    const table = formatStarryVaultTable(r, false)
    expect(table).not.toContain('Per-File Star Systems')
  })

  it('formatStarryVaultTable includes celebration', () => {
    const r = buildStarryVaultResult(['src/widget.ts'], [RICH])
    const table = formatStarryVaultTable(r, false)
    expect(table).toContain('430 commands')
  })

  it('color functions handle unknown strings', () => {
    expect(typeof scaleColor('unknown')).toBe('string')
    expect(typeof patternColor('unknown')).toBe('string')
    expect(typeof magnitudeColor('unknown')).toBe('string')
    expect(typeof depthColor('unknown')).toBe('string')
    expect(typeof pullColor('unknown')).toBe('string')
    expect(typeof resonanceColor('unknown')).toBe('string')
    expect(typeof conditionColor('unknown')).toBe('string')
    expect(typeof astronomerGradeColor('unknown')).toBe('string')
  })

  it('formatStarryVaultTable shows recommendations', () => {
    const r = buildStarryVaultResult(['bad.ts'], [BAD])
    const table = formatStarryVaultTable(r, false)
    expect(table).toContain('Recommendations')
  })

  it('formatStarryVaultJson includes systems array', () => {
    const r = buildStarryVaultResult(['src/widget.ts'], [RICH])
    const json = formatStarryVaultJson(r)
    const parsed = JSON.parse(json)
    expect(parsed.systems).toHaveLength(1)
    expect(parsed.systems[0].file).toBe('src/widget.ts')
  })

  it('formatStarryVaultTable shows condition counts', () => {
    const r = buildStarryVaultResult(['src/widget.ts'], [RICH])
    const table = formatStarryVaultTable(r, false)
    expect(table).toContain('Condition Counts')
    expect(table).toContain('Brilliant Galaxy')
  })
})

describe('starry-vault additional coverage', () => {
  it('measureArchitect handles content with only const', () => {
    const m = measureArchitect('const x = 1\nconst y = 2\n')
    expect(m.design).toBe(8)
    expect(m.hasProperScale).toBe(false)
    expect(m.hasNoBloat).toBe(true)
  })

  it('measureConstellation handles content with import and export', () => {
    const m = measureConstellation('import { x } from "y"\nexport const z = 1\n')
    expect(m.hasOrganized).toBe(true)
    expect(m.quality).toBeGreaterThan(0)
  })

  it('measureStellar handles content with try/catch and async', () => {
    const m = measureStellar('async function foo() { try { } catch(e) {} }\n')
    expect(m.hasOutstanding).toBe(true)
    expect(m.brightness).toBeGreaterThan(0)
  })

  it('measureNebula handles content with generics and type alias', () => {
    const m = measureNebula('type Foo<T> = T | null\ninterface Bar<T> { v: T }\n')
    expect(m.hasCreative).toBe(true)
    expect(m.richness).toBeGreaterThan(0)
  })

  it('measureGravity handles content with readonly and private', () => {
    const m = measureGravity('class X { private readonly v = 1 }\n')
    expect(m.hasPinned).toBe(true)
    expect(m.stability).toBeGreaterThan(0)
  })

  it('measureHarmony handles content with all features', () => {
    const m = measureHarmony('import { x } from "y"\nexport const z = 1\ninterface A {}\nclass B {}\n/** doc */\nasync function f(): Promise<void> {}\nexport type T = string\nreadonly x = 1\n')
    expect(m.hasCoherent).toBe(true)
    expect(m.hasAligned).toBe(true)
    expect(m.coherence).toBeGreaterThan(50)
  })

  it('classifyClusterType returns binary-system for low-mid quality', () => {
    const systems = [
      { qualityScore: 32, condition: 'dark-void' } as any,
    ]
    expect(classifyClusterType(systems)).toBe('binary-system')
  })

  it('classifyClusterType returns rogue-planet for very low quality', () => {
    const systems = [
      { qualityScore: 18, condition: 'black-hole' } as any,
    ]
    expect(classifyClusterType(systems)).toBe('rogue-planet')
  })

  it('analyzeStarSystem computes qualityScore correctly', () => {
    const sys = analyzeStarSystem(RICH, 'test.ts')
    const expected = Math.round(
      sys.cosmicArchitecture * 0.2 +
      sys.constellationQuality * 0.15 +
      sys.stellarBrightness * 0.15 +
      sys.nebulaRichness * 0.15 +
      sys.gravityStability * 0.15 +
      sys.cosmicHarmony * 0.2,
    )
    expect(sys.qualityScore).toBe(expected)
  })

  it('buildStarryVaultResult correctly computes universe from averages', () => {
    const r = buildStarryVaultResult(['src/widget.ts'], [RICH])
    const expectedCosmic = Math.round((85 + 77 + 98) / 3)
    expect(r.universe.overallCosmic).toBe(expectedCosmic)
    expect(r.stats.overallCosmic).toBe(expectedCosmic)
  })
})
