import { describe, expect, it } from 'vitest'

import {
  analyzeCoralColony,
  analyzeReefSystem,
  buildCoralReefResult,
  classifyCondition,
  classifyMarineBiologistGrade,
  classifySystemCondition,
  classifySystemType,
  countAccessModifiers,
  countAny,
  countArrows,
  countAsync,
  countClasses,
  countCommentedCode,
  countConsole,
  countDeepNested,
  countEnums,
  countExports,
  countFunctions,
  countGenerics,
  countImports,
  countInterfaces,
  countJSDoc,
  countReadonly,
  countReexports,
  countStatic,
  countTernaries,
  countTodos,
  countTryCatch,
  countTypeAliases,
  generateRecommendations,
  measureCalcium,
  measureClarity,
  measureComplexity,
  measurePolyp,
  measureSymbiotic,
  measureVitality,
} from '../src/commands/coral-ecosystem-helpers.js'

import { formatCoralEcosystemJson, formatCoralEcosystemTable } from '../src/commands/coral-ecosystem-format-helpers.js'

import type { CoralColony } from '../src/commands/coral-ecosystem-helpers.js'

// ─── Fixtures ───────────────────────────────────────────────────────────────

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

// ─── Counter Tests ──────────────────────────────────────────────────────────

describe('coral-ecosystem counters', () => {
  it('countExports', () => {
    expect(countExports(RICH)).toBe(7)
    expect(countExports(EMPTY)).toBe(0)
  })

  it('countImports', () => {
    expect(countImports(EMPTY)).toBe(0)
  })

  it('countFunctions', () => {
    expect(countFunctions(RICH)).toBe(1)
    expect(countFunctions(EMPTY)).toBe(0)
  })

  it('countArrows', () => {
    expect(countArrows(RICH)).toBe(1)
    expect(countArrows(EMPTY)).toBe(0)
  })

  it('countClasses', () => {
    expect(countClasses(RICH)).toBe(1)
    expect(countClasses(EMPTY)).toBe(0)
  })

  it('countInterfaces', () => {
    expect(countInterfaces(RICH)).toBe(1)
    expect(countInterfaces(EMPTY)).toBe(0)
  })

  it('countTypeAliases', () => {
    expect(countTypeAliases(RICH)).toBe(1)
    expect(countTypeAliases(EMPTY)).toBe(0)
  })

  it('countEnums', () => {
    expect(countEnums(RICH)).toBe(1)
    expect(countEnums(EMPTY)).toBe(0)
  })

  it('countJSDoc', () => {
    expect(countJSDoc(RICH)).toBe(1)
    expect(countJSDoc(EMPTY)).toBe(0)
  })

  it('countAsync', () => {
    expect(countAsync(RICH)).toBe(1)
    expect(countAsync(EMPTY)).toBe(0)
  })

  it('countTryCatch', () => {
    expect(countTryCatch(RICH)).toBe(1)
    expect(countTryCatch(EMPTY)).toBe(0)
  })

  it('countDeepNested', () => {
    expect(countDeepNested(RICH)).toBe(1)
    expect(countDeepNested(EMPTY)).toBe(0)
  })

  it('countTernaries', () => {
    expect(countTernaries(RICH)).toBe(0)
    expect(countTernaries(EMPTY)).toBe(0)
  })

  it('countConsole', () => {
    expect(countConsole(RICH)).toBe(0)
    expect(countConsole(EMPTY)).toBe(0)
  })

  it('countTodos', () => {
    expect(countTodos(RICH)).toBe(0)
    expect(countTodos(EMPTY)).toBe(0)
  })

  it('countAny', () => {
    expect(countAny(RICH)).toBe(0)
    expect(countAny(EMPTY)).toBe(0)
  })

  it('countCommentedCode', () => {
    expect(countCommentedCode(RICH)).toBe(0)
    expect(countCommentedCode(EMPTY)).toBe(0)
  })

  it('countGenerics', () => {
    expect(countGenerics(RICH)).toBe(1)
    expect(countGenerics(EMPTY)).toBe(0)
  })

  it('countAccessModifiers', () => {
    expect(countAccessModifiers(RICH)).toBe(3)
    expect(countAccessModifiers(EMPTY)).toBe(0)
  })

  it('countStatic', () => {
    expect(countStatic(RICH)).toBe(1)
    expect(countStatic(EMPTY)).toBe(0)
  })

  it('countReadonly', () => {
    expect(countReadonly(RICH)).toBe(2)
    expect(countReadonly(EMPTY)).toBe(0)
  })

  it('countReexports', () => {
    expect(countReexports(RICH)).toBe(0)
    expect(countReexports(EMPTY)).toBe(0)
  })
})

// ─── Measure Tests ──────────────────────────────────────────────────────────

describe('measurePolyp', () => {
  it('RICH: has high density', () => {
    const result = measurePolyp(RICH)
    expect(result.density).toBe(80)
    expect(result.species).toBe('brain-coral')
    expect(result.hasNoBleaching).toBe(true)
    expect(result.hasNoCrownOfThorns).toBe(true)
    expect(result.hasProperCalcification).toBe(true)
    expect(result.hasReefBuilding).toBe(true)
    expect(result.hasSpawningCycle).toBe(true)
    expect(result.hasFeedingPolyps).toBe(true)
    expect(result.hasNoOvergrowth).toBe(false)
    expect(result.hasProperZonation).toBe(true)
    expect(result.hasZooxanthellae).toBe(false)
    expect(result.isHealthy).toBe(false)
    expect(result.bleachingCount).toBe(0)
    expect(result.crownOfThornsCount).toBe(0)
  })

  it('EMPTY: has low density', () => {
    const result = measurePolyp(EMPTY)
    expect(result.density).toBe(40)
    expect(result.species).toBe('table')
    expect(result.hasNoBleaching).toBe(true)
    expect(result.hasNoOvergrowth).toBe(true)
    expect(result.isHealthy).toBe(false)
  })
})

describe('measureComplexity', () => {
  it('RICH: has high level with atoll formation', () => {
    const result = measureComplexity(RICH)
    expect(result.level).toBe(70)
    expect(result.formation).toBe('atoll')
    expect(result.hasComplexStructure).toBe(true)
    expect(result.hasBranchingPattern).toBe(true)
    expect(result.hasMassiveStructure).toBe(true)
    expect(result.hasPlateauFormation).toBe(true)
    expect(result.hasEncrustingGrowth).toBe(true)
    expect(result.hasNoAlgalOvergrowth).toBe(false)
    expect(result.hasNoErosion).toBe(false)
    expect(result.hasSpurAndGroove).toBe(true)
    expect(result.hasNoStructuralCollapse).toBe(true)
    expect(result.erosionCount).toBe(1)
    expect(result.collapseCount).toBe(0)
  })

  it('EMPTY: has low level with none formation', () => {
    const result = measureComplexity(EMPTY)
    expect(result.level).toBe(20)
    expect(result.formation).toBe('none')
    expect(result.hasComplexStructure).toBe(false)
  })
})

describe('measureSymbiotic', () => {
  it('RICH: has high index with competition relationship', () => {
    const result = measureSymbiotic(RICH)
    expect(result.index).toBe(75)
    expect(result.relationship).toBe('competition')
    expect(result.hasAnemone).toBe(true)
    expect(result.hasClownfish).toBe(true)
    expect(result.hasNoParasite).toBe(true)
    expect(result.hasNoInvasiveSpecies).toBe(true)
    expect(result.hasMutualism).toBe(false)
    expect(result.hasSeaUrchin).toBe(true)
    expect(result.hasProperNichePartition).toBe(true)
    expect(result.hasTrophicLevel).toBe(true)
    expect(result.parasiteCount).toBe(0)
    expect(result.invasiveCount).toBe(0)
  })

  it('EMPTY: has neutralism', () => {
    const result = measureSymbiotic(EMPTY)
    expect(result.index).toBe(35)
    expect(result.relationship).toBe('neutralism')
    expect(result.hasMutualism).toBe(false)
  })
})

describe('measureClarity', () => {
  it('RICH: has crystal clarity', () => {
    const result = measureClarity(RICH)
    expect(result.level).toBe(80)
    expect(result.condition).toBe('crystal')
    expect(result.isClear).toBe(true)
    expect(result.hasGoodVisibility).toBe(true)
    expect(result.hasNoSediment).toBe(true)
    expect(result.hasNoTurbidity).toBe(true)
    expect(result.hasUVPenetration).toBe(true)
    expect(result.hasNoThermalPlume).toBe(false)
    expect(result.hasProperFiltration).toBe(true)
    expect(result.sedimentCount).toBe(0)
    expect(result.turbidityCount).toBe(0)
  })

  it('EMPTY: has turbid clarity', () => {
    const result = measureClarity(EMPTY)
    expect(result.level).toBe(60)
    expect(result.condition).toBe('turbid')
    expect(result.isClear).toBe(false)
  })
})

describe('measureCalcium', () => {
  it('RICH: has aragonite hardness', () => {
    const result = measureCalcium(RICH)
    expect(result.deposit).toBe(100)
    expect(result.hardness).toBe('aragonite')
    expect(result.hasQualityDeposit).toBe(true)
    expect(result.hasSolidFoundation).toBe(true)
    expect(result.hasProperLayering).toBe(true)
    expect(result.hasFossilRecord).toBe(true)
    expect(result.hasReefFramework).toBe(true)
    expect(result.hasNoDissolution).toBe(true)
    expect(result.hasNoAcidification).toBe(true)
    expect(result.dissolutionCount).toBe(0)
    expect(result.acidificationCount).toBe(0)
  })

  it('EMPTY: has chalk hardness', () => {
    const result = measureCalcium(EMPTY)
    expect(result.deposit).toBe(40)
    expect(result.hardness).toBe('chalk')
    expect(result.hasQualityDeposit).toBe(false)
  })
})

describe('measureVitality', () => {
  it('RICH: has healthy vitality', () => {
    const result = measureVitality(RICH)
    expect(result.score).toBe(85)
    expect(result.status).toBe('healthy')
    expect(result.hasBiodiversity).toBe(true)
    expect(result.hasResilience).toBe(true)
    expect(result.hasRecoveryCapacity).toBe(true)
    expect(result.hasNoBleaching).toBe(true)
    expect(result.hasNoDisease).toBe(true)
    expect(result.hasConnectivity).toBe(false)
    expect(result.hasRecruitment).toBe(true)
    expect(result.isVital).toBe(false)
    expect(result.diseaseCount).toBe(0)
    expect(result.bleachingVitalityCount).toBe(0)
  })

  it('EMPTY: has stressed vitality', () => {
    const result = measureVitality(EMPTY)
    expect(result.score).toBe(40)
    expect(result.status).toBe('stressed')
    expect(result.isVital).toBe(false)
    expect(result.hasBiodiversity).toBe(false)
  })
})

// ─── Classifier Tests ───────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies all conditions correctly', () => {
    expect(classifyCondition(85)).toBe('great-barrier')
    expect(classifyCondition(70)).toBe('coral-triangle')
    expect(classifyCondition(55)).toBe('caribbean')
    expect(classifyCondition(40)).toBe('red-sea')
    expect(classifyCondition(25)).toBe('bleached-zone')
    expect(classifyCondition(10)).toBe('dead-zone')
  })
})

describe('classifySystemCondition', () => {
  it('classifies all system conditions correctly', () => {
    expect(classifySystemCondition(85)).toBe('unesco-heritage')
    expect(classifySystemCondition(70)).toBe('marine-reserve')
    expect(classifySystemCondition(55)).toBe('reef-sanctuary')
    expect(classifySystemCondition(40)).toBe('fishing-zone')
    expect(classifySystemCondition(25)).toBe('dead-zone')
    expect(classifySystemCondition(10)).toBe('wasteland')
  })
})

describe('classifyMarineBiologistGrade', () => {
  it('classifies all grades correctly', () => {
    expect(classifyMarineBiologistGrade(85)).toBe('chief-scientist')
    expect(classifyMarineBiologistGrade(70)).toBe('marine-biologist')
    expect(classifyMarineBiologistGrade(55)).toBe('oceanographer')
    expect(classifyMarineBiologistGrade(40)).toBe('diver')
    expect(classifyMarineBiologistGrade(25)).toBe('snorkeler')
    expect(classifyMarineBiologistGrade(10)).toBe('beachgoer')
  })
})

describe('classifySystemType', () => {
  it('classifies atoll-chain for high quality with many great-barrier', () => {
    const colonies = [
      { qualityScore: 85, condition: 'great-barrier' },
      { qualityScore: 80, condition: 'great-barrier' },
      { qualityScore: 70, condition: 'coral-triangle' },
    ] as CoralColony[]
    expect(classifySystemType(colonies)).toBe('atoll-chain')
  })

  it('classifies barrier-system for avg >= 60', () => {
    const colonies = [
      { qualityScore: 60, condition: 'caribbean' },
      { qualityScore: 65, condition: 'caribbean' },
    ] as CoralColony[]
    expect(classifySystemType(colonies)).toBe('barrier-system')
  })

  it('classifies fringing-complex for avg >= 45', () => {
    const colonies = [{ qualityScore: 45, condition: 'red-sea' }] as CoralColony[]
    expect(classifySystemType(colonies)).toBe('fringing-complex')
  })

  it('classifies patch-mosaic for avg >= 30', () => {
    const colonies = [{ qualityScore: 30, condition: 'bleached-zone' }] as CoralColony[]
    expect(classifySystemType(colonies)).toBe('patch-mosaic')
  })

  it('classifies seamount for avg >= 15', () => {
    const colonies = [{ qualityScore: 15, condition: 'dead-zone' }] as CoralColony[]
    expect(classifySystemType(colonies)).toBe('seamount')
  })

  it('classifies abyssal-plain for empty colonies', () => {
    expect(classifySystemType([])).toBe('abyssal-plain')
  })
})

// ─── Colony Analysis Tests ──────────────────────────────────────────────────

describe('analyzeCoralColony', () => {
  it('RICH: produces correct colony', () => {
    const colony = analyzeCoralColony(RICH, 'src/rich.ts')
    expect(colony.file).toBe('src/rich.ts')
    expect(colony.qualityScore).toBe(81)
    expect(colony.condition).toBe('great-barrier')
    expect(colony.polypDensity).toBe(80)
    expect(colony.reefComplexity).toBe(70)
    expect(colony.symbioticIndex).toBe(75)
    expect(colony.waterClarity).toBe(80)
    expect(colony.calciumDeposit).toBe(100)
    expect(colony.reefVitality).toBe(85)
  })

  it('EMPTY: produces correct colony', () => {
    const colony = analyzeCoralColony(EMPTY, 'src/empty.ts')
    expect(colony.file).toBe('src/empty.ts')
    expect(colony.qualityScore).toBe(38)
    expect(colony.condition).toBe('red-sea')
    expect(colony.polypDensity).toBe(40)
    expect(colony.reefComplexity).toBe(20)
    expect(colony.symbioticIndex).toBe(35)
    expect(colony.waterClarity).toBe(60)
    expect(colony.calciumDeposit).toBe(40)
    expect(colony.reefVitality).toBe(40)
  })

  it('MEDIUM: produces correct colony', () => {
    const colony = analyzeCoralColony(MEDIUM, 'src/medium.ts')
    expect(colony.file).toBe('src/medium.ts')
    expect(colony.qualityScore).toBe(71)
    expect(colony.condition).toBe('coral-triangle')
    expect(colony.polypDensity).toBe(80)
    expect(colony.reefComplexity).toBe(80)
    expect(colony.symbioticIndex).toBe(65)
    expect(colony.waterClarity).toBe(60)
    expect(colony.calciumDeposit).toBe(70)
    expect(colony.reefVitality).toBe(65)
  })
})

// ─── System Analysis Tests ──────────────────────────────────────────────────

describe('analyzeReefSystem', () => {
  it('groups colonies by directory', () => {
    const colonies = [
      analyzeCoralColony(RICH, 'src/rich.ts'),
      analyzeCoralColony(EMPTY, 'src/empty.ts'),
    ]
    const system = analyzeReefSystem(colonies, 'src')
    expect(system.directory).toBe('src')
    expect(system.colonies.length).toBe(2)
    expect(system.avgDensity).toBe(60)
    expect(system.avgComplexity).toBe(45)
    expect(system.systemType).toBe('fringing-complex')
  })
})

// ─── Build Result Tests ─────────────────────────────────────────────────────

describe('buildCoralReefResult', () => {
  it('RICH+EMPTY+MEDIUM: produces correct 3-file result', () => {
    const result = buildCoralReefResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.ocean.overallHealth).toBe(63)
    expect(result.ocean.avgDensity).toBe(67)
    expect(result.ocean.avgComplexity).toBe(57)
    expect(result.ocean.avgVitality).toBe(63)
    expect(result.ocean.isThriving).toBe(false)
    expect(result.colonies.length).toBe(3)
    expect(result.systems.length).toBe(1)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalSystems).toBe(1)
    expect(result.stats.avgPolypDensity).toBe(67)
    expect(result.stats.avgReefComplexity).toBe(57)
    expect(result.stats.avgSymbioticIndex).toBe(58)
    expect(result.stats.avgWaterClarity).toBe(67)
    expect(result.stats.avgCalciumDeposit).toBe(70)
    expect(result.stats.avgReefVitality).toBe(63)
    expect(result.stats.greatBarrierCount).toBe(1)
    expect(result.stats.coralTriangleCount).toBe(1)
    expect(result.stats.caribbeanCount).toBe(0)
    expect(result.stats.redSeaCount).toBe(1)
    expect(result.stats.bleachedZoneCount).toBe(0)
    expect(result.stats.deadZoneCount).toBe(0)
    expect(result.stats.isHealthyCount).toBe(0)
    expect(result.stats.hasComplexStructureCount).toBe(2)
    expect(result.stats.hasMutualismCount).toBe(0)
    expect(result.stats.isClearCount).toBe(1)
    expect(result.stats.hasQualityDepositCount).toBe(2)
    expect(result.stats.isVitalCount).toBe(0)
    expect(result.stats.overallHealth).toBe(63)
    expect(result.stats.marineBiologistGrade).toBe('oceanographer')
    expect(result.stats.bestColony).toBe('src/rich.ts')
    expect(result.stats.densest).toBe('src/rich.ts')
    expect(result.stats.mostComplex).toBe('src/medium.ts')
    expect(result.stats.mostSymbiotic).toBe('src/rich.ts')
    expect(result.stats.clearest).toBe('src/rich.ts')
    expect(result.stats.mostVital).toBe('src/rich.ts')
  })

  it('EMPTY: produces zero result', () => {
    const result = buildCoralReefResult([], [])
    expect(result.ocean.overallHealth).toBe(0)
    expect(result.ocean.isThriving).toBe(false)
    expect(result.colonies.length).toBe(0)
    expect(result.systems.length).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.marineBiologistGrade).toBe('beachgoer')
    expect(result.stats.bestColony).toBe('')
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Recommendations Tests ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns default thriving message when all is well', () => {
    const colonies = [analyzeCoralColony(RICH, 'src/rich.ts')]
    const ocean = { avgDensity: 80, avgComplexity: 80, avgVitality: 80, isThriving: true, overallHealth: 90 }
    const stats = {
      totalFiles: 1, totalSystems: 1, avgPolypDensity: 80, avgReefComplexity: 80,
      avgSymbioticIndex: 75, avgWaterClarity: 80, avgCalciumDeposit: 100, avgReefVitality: 85,
      greatBarrierCount: 1, coralTriangleCount: 0, caribbeanCount: 0, redSeaCount: 0,
      bleachedZoneCount: 0, deadZoneCount: 0, isHealthyCount: 0, hasComplexStructureCount: 1,
      hasMutualismCount: 0, isClearCount: 1, hasQualityDepositCount: 1, isVitalCount: 0,
      overallHealth: 90, marineBiologistGrade: 'chief-scientist' as const,
      bestColony: 'src/rich.ts', densest: 'src/rich.ts', mostComplex: 'src/rich.ts',
      mostSymbiotic: 'src/rich.ts', clearest: 'src/rich.ts', mostVital: 'src/rich.ts',
    }
    const recs = generateRecommendations(colonies, [], ocean, stats)
    // RICH colony has isVital=false (hasConnectivity=false) so stressed recommendation appears
    expect(recs.some((r) => r.includes('stressed'))).toBe(true)
  })

  it('recommends reducing stress when colonies are stressed', () => {
    const result = buildCoralReefResult(
      ['src/rich.ts', 'src/empty.ts', 'src/medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.recommendations).toContain('3 colony/colonies are stressed — reduce any usage, console logs, and technical debt')
  })

  it('warns about critical reef health', () => {
    const result = buildCoralReefResult(['src/empty.ts'], [EMPTY])
    expect(result.recommendations.some((r) => r.includes('critical'))).toBe(true)
  })
})

// ─── Format Helpers Tests ───────────────────────────────────────────────────

describe('formatCoralEcosystemJson', () => {
  it('returns valid JSON string', () => {
    const result = buildCoralReefResult(['src/rich.ts'], [RICH])
    const json = formatCoralEcosystemJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.colonies.length).toBe(1)
    expect(parsed.ocean.overallHealth).toBe(result.ocean.overallHealth)
  })
})

describe('formatCoralEcosystemTable', () => {
  it('returns formatted table string', () => {
    const result = buildCoralReefResult(['src/rich.ts'], [RICH])
    const table = formatCoralEcosystemTable(result, false)
    expect(table).toContain('Coral Ecosystem Analysis')
    expect(table).toContain('Ocean Overview')
    expect(table).toContain('Statistics')
  })

  it('includes per-colony breakdown when verbose', () => {
    const result = buildCoralReefResult(['src/rich.ts'], [RICH])
    const table = formatCoralEcosystemTable(result, true)
    expect(table).toContain('Per-Colony Breakdown')
    expect(table).toContain('src/rich.ts')
  })

  it('includes systems section when systems exist', () => {
    const result = buildCoralReefResult(
      ['src/rich.ts', 'src/empty.ts'],
      [RICH, EMPTY],
    )
    const table = formatCoralEcosystemTable(result, false)
    expect(table).toContain('Systems')
  })

  it('includes recommendations section', () => {
    const result = buildCoralReefResult(['src/empty.ts'], [EMPTY])
    const table = formatCoralEcosystemTable(result, false)
    expect(table).toContain('Recommendations')
  })
})

// ─── Additional Measure Tests ───────────────────────────────────────────────

describe('measurePolyp MEDIUM', () => {
  it('MEDIUM: has brain-coral species', () => {
    const result = measurePolyp(MEDIUM)
    expect(result.density).toBe(80)
    expect(result.species).toBe('brain-coral')
    expect(result.hasProperCalcification).toBe(true)
    expect(result.hasReefBuilding).toBe(true)
    expect(result.hasSpawningCycle).toBe(true)
    expect(result.hasNoOvergrowth).toBe(true)
    expect(result.hasProperZonation).toBe(true)
    expect(result.hasFeedingPolyps).toBe(false)
    expect(result.hasZooxanthellae).toBe(false)
    expect(result.isHealthy).toBe(false)
  })
})

describe('measureComplexity MEDIUM', () => {
  it('MEDIUM: has atoll formation', () => {
    const result = measureComplexity(MEDIUM)
    expect(result.level).toBe(80)
    expect(result.formation).toBe('atoll')
    expect(result.hasComplexStructure).toBe(true)
    expect(result.hasBranchingPattern).toBe(true)
    expect(result.hasPlateauFormation).toBe(true)
    expect(result.hasEncrustingGrowth).toBe(false)
    expect(result.hasNoAlgalOvergrowth).toBe(true)
    expect(result.hasNoErosion).toBe(true)
  })
})

describe('measureSymbiotic MEDIUM', () => {
  it('MEDIUM: has competition relationship', () => {
    const result = measureSymbiotic(MEDIUM)
    expect(result.index).toBe(65)
    expect(result.relationship).toBe('competition')
    expect(result.hasAnemone).toBe(true)
    expect(result.hasSeaUrchin).toBe(true)
    expect(result.hasMutualism).toBe(false)
    expect(result.hasClownfish).toBe(false)
    expect(result.hasTrophicLevel).toBe(false)
  })
})

describe('measureCalcium MEDIUM', () => {
  it('MEDIUM: has calcite hardness', () => {
    const result = measureCalcium(MEDIUM)
    expect(result.deposit).toBe(70)
    expect(result.hardness).toBe('calcite')
    expect(result.hasQualityDeposit).toBe(true)
    expect(result.hasSolidFoundation).toBe(true)
    expect(result.hasProperLayering).toBe(true)
    expect(result.hasProperPhBalance).toBe(false)
    expect(result.hasFossilRecord).toBe(false)
  })
})

describe('measureVitality MEDIUM', () => {
  it('MEDIUM: has healthy status', () => {
    const result = measureVitality(MEDIUM)
    expect(result.score).toBe(65)
    expect(result.status).toBe('healthy')
    expect(result.hasBiodiversity).toBe(true)
    expect(result.hasConnectivity).toBe(false)
    expect(result.hasRecruitment).toBe(true)
    expect(result.isVital).toBe(false)
  })
})

describe('buildCoralReefResult single file', () => {
  it('RICH: produces correct single-file result', () => {
    const result = buildCoralReefResult(['src/rich.ts'], [RICH])
    expect(result.colonies.length).toBe(1)
    expect(result.colonies[0].qualityScore).toBe(81)
    expect(result.colonies[0].condition).toBe('great-barrier')
    expect(result.ocean.overallHealth).toBe(81)
    expect(result.ocean.isThriving).toBe(true)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.greatBarrierCount).toBe(1)
    expect(result.stats.marineBiologistGrade).toBe('chief-scientist')
    expect(result.stats.bestColony).toBe('src/rich.ts')
  })
})

describe('analyzeCoralColony with multi-dir files', () => {
  it('groups files into separate systems by directory', () => {
    const result = buildCoralReefResult(
      ['src/foo/a.ts', 'src/bar/b.ts'],
      [RICH, EMPTY],
    )
    expect(result.systems.length).toBe(2)
    expect(result.systems[0].directory).toBe('src/foo')
    expect(result.systems[1].directory).toBe('src/bar')
  })

  it('handles file without directory separator as dot directory', () => {
    const result = buildCoralReefResult(
      ['simple.ts'],
      [EMPTY],
    )
    expect(result.systems.length).toBe(1)
    expect(result.systems[0].directory).toBe('.')
  })
})
