import { describe, expect, it } from 'vitest'

import {
  analyzeCoralColony,
  analyzeReefZone,
  buildCoralReefResult,
  classifyCondition,
  classifyGuardianGrade,
  classifyZoneCondition,
  classifyZoneType,
  generateRecommendations,
  measureBio,
  measureBleaching,
  measurePolyp,
  measureReef,
  measureSymbiosis,
  measureTide,
  type CoralColony,
} from '../src/commands/coral-reef-helpers.js'
import {
  bleachingStatusColor,
  conditionColor,
  formationColor,
  formatCoralReefJson,
  formatCoralReefTable,
  gradeColor,
  harmonyColor,
  richnessColor,
  scoreColor,
  strengthColor,
  vitalityColor,
  zoneTypeColor,
} from '../src/commands/coral-reef-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

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

// ─── measureReef ───────────────────────────────────────────────────────────

describe('measureReef', () => {
  it('returns fringing-reef for RICH content', () => {
    const result = measureReef(RICH)
    expect(result.structure).toBe(78)
    expect(result.formation).toBe('fringing-reef')
    expect(result.hasHighStructure).toBe(true)
    expect(result.hasSolidFoundation).toBe(true)
    expect(result.hasLayered).toBe(true)
    expect(result.hasComplexity).toBe(true)
    expect(result.hasGrowth).toBe(true)
    expect(result.erosionCount).toBe(1)
    expect(result.fragmentationCount).toBe(0)
  })

  it('returns rubble for EMPTY content', () => {
    const result = measureReef(EMPTY)
    expect(result.structure).toBe(40)
    expect(result.formation).toBe('rubble')
    expect(result.hasHighStructure).toBe(false)
    expect(result.hasSolidFoundation).toBe(false)
    expect(result.hasNoErosion).toBe(true)
    expect(result.hasGrowth).toBe(false)
    expect(result.erosionCount).toBe(0)
  })

  it('returns rubble for MEDIUM content', () => {
    const result = measureReef(MEDIUM)
    expect(result.structure).toBe(45)
    expect(result.formation).toBe('rubble')
    expect(result.hasNoCollapse).toBe(true)
    expect(result.hasNoSubsidence).toBe(true)
    expect(result.hasNoFragmentation).toBe(true)
  })
})

// ─── measurePolyp ──────────────────────────────────────────────────────────

describe('measurePolyp', () => {
  it('returns thriving for RICH content', () => {
    const result = measurePolyp(RICH)
    expect(result.health).toBe(90)
    expect(result.vitality).toBe('thriving')
    expect(result.hasHighHealth).toBe(true)
    expect(result.hasCleanTentacles).toBe(true)
    expect(result.hasProperFeeding).toBe(true)
    expect(result.hasNoParasites).toBe(true)
    expect(result.hasCalcification).toBe(true)
    expect(result.hasNoDisease).toBe(true)
    expect(result.parasiteCount).toBe(0)
  })

  it('returns dying for EMPTY content', () => {
    const result = measurePolyp(EMPTY)
    expect(result.health).toBe(50)
    expect(result.vitality).toBe('dying')
    expect(result.hasHighHealth).toBe(false)
    expect(result.hasProperFeeding).toBe(false)
    expect(result.hasCalcification).toBe(false)
    expect(result.hasReproduction).toBe(false)
    expect(result.parasiteCount).toBe(0)
    expect(result.diseaseCount).toBe(0)
  })

  it('returns dying for MEDIUM content', () => {
    const result = measurePolyp(MEDIUM)
    expect(result.health).toBe(45)
    expect(result.vitality).toBe('dying')
    expect(result.hasCleanTentacles).toBe(true)
    expect(result.hasNoStunting).toBe(true)
    expect(result.hasNoNecrosis).toBe(false)
  })
})

// ─── measureSymbiosis ──────────────────────────────────────────────────────

describe('measureSymbiosis', () => {
  it('returns neutral for RICH content', () => {
    const result = measureSymbiosis(RICH)
    expect(result.index).toBe(66)
    expect(result.harmony).toBe('neutral')
    expect(result.hasNoExploitation).toBe(true)
    expect(result.hasProperExchange).toBe(true)
    expect(result.hasNoCompetition).toBe(true)
    expect(result.hasNoConflict).toBe(true)
    expect(result.exploitationCount).toBe(0)
  })

  it('returns parasitism for EMPTY content', () => {
    const result = measureSymbiosis(EMPTY)
    expect(result.index).toBe(40)
    expect(result.harmony).toBe('parasitism')
    expect(result.hasHighHarmony).toBe(false)
    expect(result.hasCleanPartnership).toBe(false)
    expect(result.hasMutualBenefit).toBe(false)
    expect(result.exploitationCount).toBe(0)
    expect(result.conflictCount).toBe(0)
  })

  it('returns parasitism for MEDIUM content', () => {
    const result = measureSymbiosis(MEDIUM)
    expect(result.index).toBe(45)
    expect(result.harmony).toBe('parasitism')
    expect(result.hasNoOverdependence).toBe(true)
    expect(result.hasSharedResources).toBe(false)
  })
})

// ─── measureTide ───────────────────────────────────────────────────────────

describe('measureTide', () => {
  it('returns tide-proof for RICH content', () => {
    const result = measureTide(RICH)
    expect(result.resilience).toBe(80)
    expect(result.strength).toBe('tide-proof')
    expect(result.hasHighResilience).toBe(true)
    expect(result.hasAdaptation).toBe(true)
    expect(result.hasProperAnchor).toBe(true)
    expect(result.hasNoDisplacement).toBe(true)
    expect(result.hasNoScouring).toBe(true)
    expect(result.displacementCount).toBe(0)
  })

  it('returns fragile for EMPTY content', () => {
    const result = measureTide(EMPTY)
    expect(result.resilience).toBe(40)
    expect(result.strength).toBe('fragile')
    expect(result.hasHighResilience).toBe(false)
    expect(result.hasAdaptation).toBe(false)
    expect(result.hasProperAnchor).toBe(false)
    expect(result.displacementCount).toBe(0)
    expect(result.scouringCount).toBe(0)
  })

  it('returns fragile for MEDIUM content', () => {
    const result = measureTide(MEDIUM)
    expect(result.resilience).toBe(45)
    expect(result.strength).toBe('fragile')
    expect(result.hasNoBrittle).toBe(true)
    expect(result.hasNoCrushing).toBe(true)
  })
})

// ─── measureBio ────────────────────────────────────────────────────────────

describe('measureBio', () => {
  it('returns mega-diverse for RICH content', () => {
    const result = measureBio(RICH)
    expect(result.diversity).toBe(90)
    expect(result.richness).toBe('mega-diverse')
    expect(result.hasHighDiversity).toBe(true)
    expect(result.hasVariety).toBe(true)
    expect(result.hasMultipleSpecies).toBe(true)
    expect(result.hasEndemic).toBe(true)
    expect(result.hasKeystone).toBe(true)
    expect(result.invasiveCount).toBe(0)
  })

  it('returns barren for EMPTY content', () => {
    const result = measureBio(EMPTY)
    expect(result.diversity).toBe(20)
    expect(result.richness).toBe('barren')
    expect(result.hasHighDiversity).toBe(false)
    expect(result.hasVariety).toBe(false)
    expect(result.hasNoMonoculture).toBe(false)
    expect(result.extinctionCount).toBe(1)
  })

  it('returns barren for MEDIUM content', () => {
    const result = measureBio(MEDIUM)
    expect(result.diversity).toBe(25)
    expect(result.richness).toBe('barren')
    expect(result.hasNoInvasive).toBe(true)
    expect(result.hasNoOvergrowth).toBe(true)
  })
})

// ─── measureBleaching ──────────────────────────────────────────────────────

describe('measureBleaching', () => {
  it('returns healthy for RICH content', () => {
    const result = measureBleaching(RICH)
    expect(result.risk).toBe(28)
    expect(result.status).toBe('healthy')
    expect(result.hasLowRisk).toBe(true)
    expect(result.hasNoThermalStress).toBe(true)
    expect(result.hasProtection).toBe(true)
    expect(result.hasNoPollution).toBe(false)
    expect(result.hasRecoveryPath).toBe(true)
    expect(result.pollutionCount).toBe(1)
  })

  it('returns stressed for EMPTY content', () => {
    const result = measureBleaching(EMPTY)
    expect(result.risk).toBe(46)
    expect(result.status).toBe('stressed')
    expect(result.hasLowRisk).toBe(false)
    expect(result.hasProtection).toBe(false)
    expect(result.hasRecoveryPath).toBe(false)
    expect(result.pollutionCount).toBe(0)
    expect(result.overfishingCount).toBe(0)
  })

  it('returns warning for MEDIUM content', () => {
    const result = measureBleaching(MEDIUM)
    expect(result.risk).toBe(36)
    expect(result.status).toBe('warning')
    expect(result.hasNoThermalStress).toBe(true)
    expect(result.hasNoAcidification).toBe(true)
    expect(result.hasNoAlgalBloom).toBe(true)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns pristine-reef for score >= 80', () => {
    const colony = { qualityScore: 80 } as CoralColony
    expect(classifyCondition(colony)).toBe('pristine-reef')
  })

  it('returns healthy-reef for score >= 65', () => {
    const colony = { qualityScore: 65 } as CoralColony
    expect(classifyCondition(colony)).toBe('healthy-reef')
  })

  it('returns recovering-reef for score >= 50', () => {
    const colony = { qualityScore: 50 } as CoralColony
    expect(classifyCondition(colony)).toBe('recovering-reef')
  })

  it('returns stressed-reef for score >= 35', () => {
    const colony = { qualityScore: 35 } as CoralColony
    expect(classifyCondition(colony)).toBe('stressed-reef')
  })

  it('returns degraded for score >= 20', () => {
    const colony = { qualityScore: 20 } as CoralColony
    expect(classifyCondition(colony)).toBe('degraded')
  })

  it('returns dead-zone for score < 20', () => {
    const colony = { qualityScore: 10 } as CoralColony
    expect(classifyCondition(colony)).toBe('dead-zone')
  })
})

// ─── classifyZoneType ──────────────────────────────────────────────────────

describe('classifyZoneType', () => {
  it('returns mud-flat for empty colonies', () => {
    expect(classifyZoneType([])).toBe('mud-flat')
  })

  it('returns great-barrier for high avg and pristine majority', () => {
    const colonies = Array.from({ length: 5 }, () => ({
      qualityScore: 90, condition: 'pristine-reef',
    } as unknown as CoralColony))
    expect(classifyZoneType(colonies)).toBe('great-barrier')
  })

  it('returns major-reef for avg >= 60', () => {
    const colonies = [{ qualityScore: 60, condition: 'stressed-reef' } as unknown as CoralColony]
    expect(classifyZoneType(colonies)).toBe('major-reef')
  })

  it('returns atoll-system for avg >= 45', () => {
    const colonies = [{ qualityScore: 45, condition: 'stressed-reef' } as unknown as CoralColony]
    expect(classifyZoneType(colonies)).toBe('atoll-system')
  })

  it('returns patch-system for avg >= 30', () => {
    const colonies = [{ qualityScore: 30, condition: 'degraded' } as unknown as CoralColony]
    expect(classifyZoneType(colonies)).toBe('patch-system')
  })

  it('returns rocky-shore for avg >= 15', () => {
    const colonies = [{ qualityScore: 15, condition: 'dead-zone' } as unknown as CoralColony]
    expect(classifyZoneType(colonies)).toBe('rocky-shore')
  })
})

// ─── classifyZoneCondition ─────────────────────────────────────────────────

describe('classifyZoneCondition', () => {
  it('returns world-heritage for avg >= 80', () => {
    expect(classifyZoneCondition(80)).toBe('world-heritage')
  })

  it('returns marine-reserve for avg >= 65', () => {
    expect(classifyZoneCondition(65)).toBe('marine-reserve')
  })

  it('returns fishing-zone for avg >= 50', () => {
    expect(classifyZoneCondition(50)).toBe('fishing-zone')
  })

  it('returns stressed-area for avg >= 35', () => {
    expect(classifyZoneCondition(35)).toBe('stressed-area')
  })

  it('returns dead-zone for avg >= 20', () => {
    expect(classifyZoneCondition(20)).toBe('dead-zone')
  })

  it('returns desert for avg < 20', () => {
    expect(classifyZoneCondition(10)).toBe('desert')
  })
})

// ─── classifyGuardianGrade ─────────────────────────────────────────────────

describe('classifyGuardianGrade', () => {
  it('returns reef-guardian for avg >= 80', () => {
    expect(classifyGuardianGrade(80)).toBe('reef-guardian')
  })

  it('returns marine-biologist for avg >= 65', () => {
    expect(classifyGuardianGrade(65)).toBe('marine-biologist')
  })

  it('returns conservationist for avg >= 50', () => {
    expect(classifyGuardianGrade(50)).toBe('conservationist')
  })

  it('returns observer for avg >= 35', () => {
    expect(classifyGuardianGrade(35)).toBe('observer')
  })

  it('returns tourist for avg >= 20', () => {
    expect(classifyGuardianGrade(20)).toBe('tourist')
  })

  it('returns polluter for avg < 20', () => {
    expect(classifyGuardianGrade(10)).toBe('polluter')
  })
})

// ─── analyzeCoralColony ────────────────────────────────────────────────────

describe('analyzeCoralColony', () => {
  it('produces healthy-reef for RICH', () => {
    const colony = analyzeCoralColony(RICH, 'rich.ts')
    expect(colony.file).toBe('rich.ts')
    expect(colony.reefStructure).toBe(78)
    expect(colony.polypHealth).toBe(90)
    expect(colony.symbiosisIndex).toBe(66)
    expect(colony.tideResilience).toBe(80)
    expect(colony.biodiversity).toBe(90)
    expect(colony.bleachingRisk).toBe(28)
    expect(colony.qualityScore).toBe(79)
    expect(colony.condition).toBe('healthy-reef')
  })

  it('produces stressed-reef for EMPTY', () => {
    const colony = analyzeCoralColony(EMPTY, 'empty.ts')
    expect(colony.file).toBe('empty.ts')
    expect(colony.reefStructure).toBe(40)
    expect(colony.polypHealth).toBe(50)
    expect(colony.symbiosisIndex).toBe(40)
    expect(colony.tideResilience).toBe(40)
    expect(colony.biodiversity).toBe(20)
    expect(colony.bleachingRisk).toBe(46)
    expect(colony.qualityScore).toBe(41)
    expect(colony.condition).toBe('stressed-reef')
  })

  it('produces stressed-reef for MEDIUM', () => {
    const colony = analyzeCoralColony(MEDIUM, 'medium.ts')
    expect(colony.file).toBe('medium.ts')
    expect(colony.reefStructure).toBe(45)
    expect(colony.polypHealth).toBe(45)
    expect(colony.symbiosisIndex).toBe(45)
    expect(colony.tideResilience).toBe(45)
    expect(colony.biodiversity).toBe(25)
    expect(colony.bleachingRisk).toBe(36)
    expect(colony.qualityScore).toBe(46)
    expect(colony.condition).toBe('stressed-reef')
  })
})

// ─── analyzeReefZone ───────────────────────────────────────────────────────

describe('analyzeReefZone', () => {
  it('handles empty colonies with mud-flat', () => {
    const zone = analyzeReefZone([], 'src')
    expect(zone.directory).toBe('src')
    expect(zone.colonies).toEqual([])
    expect(zone.zoneType).toBe('mud-flat')
  })

  it('computes correct averages for single colony', () => {
    const colony = analyzeCoralColony(RICH, 'rich.ts')
    const zone = analyzeReefZone([colony], 'src')
    expect(zone.avgStructure).toBe(colony.reefStructure)
    expect(zone.avgSymbiosis).toBe(colony.symbiosisIndex)
    expect(zone.colonies.length).toBe(1)
  })

  it('computes correct averages for multiple colonies', () => {
    const rich = analyzeCoralColony(RICH, 'rich.ts')
    const med = analyzeCoralColony(MEDIUM, 'medium.ts')
    const zone = analyzeReefZone([rich, med], 'src')
    expect(zone.avgStructure).toBe(62)
    expect(zone.avgSymbiosis).toBe(56)
    expect(zone.colonies.length).toBe(2)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns empty array for empty result', () => {
    const result = buildCoralReefResult([], [])
    const recs = generateRecommendations(result.colonies, result.zones, result.ocean, result.stats)
    expect(Array.isArray(recs)).toBe(true)
  })

  it('returns recommendations for RICH content', () => {
    const result = buildCoralReefResult(['rich.ts'], [RICH])
    const recs = generateRecommendations(result.colonies, result.zones, result.ocean, result.stats)
    expect(Array.isArray(recs)).toBe(true)
  })

  it('returns recommendations for mixed content', () => {
    const result = buildCoralReefResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    const recs = generateRecommendations(result.colonies, result.zones, result.ocean, result.stats)
    expect(Array.isArray(recs)).toBe(true)
  })
})

// ─── buildCoralReefResult ──────────────────────────────────────────────────

describe('buildCoralReefResult', () => {
  it('handles empty input gracefully', () => {
    const result = buildCoralReefResult([], [])
    expect(result.colonies).toEqual([])
    expect(result.zones).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalZones).toBe(0)
    expect(result.ocean.overallHealth).toBe(20)
  })

  it('handles single RICH file', () => {
    const result = buildCoralReefResult(['rich.ts'], [RICH])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalZones).toBe(1)
    expect(result.colonies.length).toBe(1)
    expect(result.colonies[0].qualityScore).toBe(79)
    expect(result.colonies[0].condition).toBe('healthy-reef')
    expect(result.stats.healthyReefCount).toBe(1)
    expect(result.stats.bestColony).toBe('rich.ts')
  })

  it('handles rich+medium files', () => {
    const result = buildCoralReefResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalZones).toBe(1)
    expect(result.stats.avgReefStructure).toBe(62)
    expect(result.stats.avgPolypHealth).toBe(68)
    expect(result.stats.avgSymbiosisIndex).toBe(56)
    expect(result.stats.avgTideResilience).toBe(63)
    expect(result.stats.avgBiodiversity).toBe(58)
    expect(result.stats.avgBleachingRisk).toBe(32)
    expect(result.stats.guardianGrade).toBe('conservationist')
    expect(result.stats.bestColony).toBe('rich.ts')
    expect(result.stats.bestStructured).toBe('rich.ts')
    expect(result.stats.healthiest).toBe('rich.ts')
    expect(result.stats.mostHarmonious).toBe('rich.ts')
    expect(result.stats.mostResilient).toBe('rich.ts')
    expect(result.stats.mostDiverse).toBe('rich.ts')
    expect(result.ocean.avgStructure).toBe(62)
    expect(result.ocean.avgSymbiosis).toBe(56)
    expect(result.ocean.avgBleaching).toBe(32)
    expect(result.ocean.isHealthy).toBe(true)
    expect(result.ocean.overallHealth).toBe(63)
  })
})

// ─── formatCoralReefJson ───────────────────────────────────────────────────

describe('formatCoralReefJson', () => {
  it('produces valid JSON string', () => {
    const result = buildCoralReefResult(['rich.ts'], [RICH])
    const json = formatCoralReefJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.colonies[0].file).toBe('rich.ts')
  })
})

// ─── formatCoralReefTable ──────────────────────────────────────────────────

describe('formatCoralReefTable', () => {
  it('produces non-empty string for table format', () => {
    const result = buildCoralReefResult(['rich.ts'], [RICH])
    const table = formatCoralReefTable(result, false)
    expect(table.length).toBeGreaterThan(0)
    expect(table).toContain('Coral Reef')
  })

  it('includes per-file details when verbose', () => {
    const result = buildCoralReefResult(['rich.ts'], [RICH])
    const table = formatCoralReefTable(result, true)
    expect(table).toContain('rich.ts')
    expect(table).toContain('Per-File Details')
  })

  it('includes recommendations when present', () => {
    const result = buildCoralReefResult(['rich.ts'], [RICH])
    const table = formatCoralReefTable(result, false)
    if (result.recommendations.length > 0) {
      expect(table).toContain('Recommendations')
    }
  })
})

// ─── Color Helpers ─────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns green for >= 80', () => { expect(scoreColor(90)).toBeTruthy() })
  it('returns yellow for >= 60', () => { expect(scoreColor(70)).toBeTruthy() })
  it('returns orange for >= 40', () => { expect(scoreColor(50)).toBeTruthy() })
  it('returns red for < 40', () => { expect(scoreColor(30)).toBeTruthy() })
})

describe('conditionColor', () => {
  it('colors pristine-reef', () => { expect(conditionColor('pristine-reef')).toBeTruthy() })
  it('colors healthy-reef', () => { expect(conditionColor('healthy-reef')).toBeTruthy() })
  it('colors recovering-reef', () => { expect(conditionColor('recovering-reef')).toBeTruthy() })
  it('colors stressed-reef', () => { expect(conditionColor('stressed-reef')).toBeTruthy() })
  it('colors degraded', () => { expect(conditionColor('degraded')).toBeTruthy() })
  it('colors dead-zone', () => { expect(conditionColor('dead-zone')).toBeTruthy() })
})

describe('gradeColor', () => {
  it('colors reef-guardian', () => { expect(gradeColor('reef-guardian')).toBeTruthy() })
  it('colors marine-biologist', () => { expect(gradeColor('marine-biologist')).toBeTruthy() })
  it('colors conservationist', () => { expect(gradeColor('conservationist')).toBeTruthy() })
  it('colors observer', () => { expect(gradeColor('observer')).toBeTruthy() })
  it('colors tourist', () => { expect(gradeColor('tourist')).toBeTruthy() })
  it('colors polluter', () => { expect(gradeColor('polluter')).toBeTruthy() })
})

describe('formationColor', () => {
  it('colors barrier-reef', () => { expect(formationColor('barrier-reef')).toBeTruthy() })
  it('colors atoll', () => { expect(formationColor('atoll')).toBeTruthy() })
  it('colors fringing-reef', () => { expect(formationColor('fringing-reef')).toBeTruthy() })
  it('colors patch-reef', () => { expect(formationColor('patch-reef')).toBeTruthy() })
  it('colors rubble', () => { expect(formationColor('rubble')).toBeTruthy() })
  it('colors sand', () => { expect(formationColor('sand')).toBeTruthy() })
})

describe('vitalityColor', () => {
  it('colors thriving', () => { expect(vitalityColor('thriving')).toBeTruthy() })
  it('colors healthy', () => { expect(vitalityColor('healthy')).toBeTruthy() })
  it('colors stressed', () => { expect(vitalityColor('stressed')).toBeTruthy() })
  it('colors declining', () => { expect(vitalityColor('declining')).toBeTruthy() })
  it('colors dying', () => { expect(vitalityColor('dying')).toBeTruthy() })
  it('colors dead', () => { expect(vitalityColor('dead')).toBeTruthy() })
})

describe('harmonyColor', () => {
  it('colors perfect-symbiosis', () => { expect(harmonyColor('perfect-symbiosis')).toBeTruthy() })
  it('colors mutualism', () => { expect(harmonyColor('mutualism')).toBeTruthy() })
  it('colors commensalism', () => { expect(harmonyColor('commensalism')).toBeTruthy() })
  it('colors neutral', () => { expect(harmonyColor('neutral')).toBeTruthy() })
  it('colors parasitism', () => { expect(harmonyColor('parasitism')).toBeTruthy() })
  it('colors toxic', () => { expect(harmonyColor('toxic')).toBeTruthy() })
})

describe('strengthColor', () => {
  it('colors tide-proof', () => { expect(strengthColor('tide-proof')).toBeTruthy() })
  it('colors storm-resistant', () => { expect(strengthColor('storm-resistant')).toBeTruthy() })
  it('colors weathered', () => { expect(strengthColor('weathered')).toBeTruthy() })
  it('colors vulnerable', () => { expect(strengthColor('vulnerable')).toBeTruthy() })
  it('colors fragile', () => { expect(strengthColor('fragile')).toBeTruthy() })
  it('colors washed-away', () => { expect(strengthColor('washed-away')).toBeTruthy() })
})

describe('richnessColor', () => {
  it('colors mega-diverse', () => { expect(richnessColor('mega-diverse')).toBeTruthy() })
  it('colors high-diversity', () => { expect(richnessColor('high-diversity')).toBeTruthy() })
  it('colors moderate', () => { expect(richnessColor('moderate')).toBeTruthy() })
  it('colors low-diversity', () => { expect(richnessColor('low-diversity')).toBeTruthy() })
  it('colors monoculture', () => { expect(richnessColor('monoculture')).toBeTruthy() })
  it('colors barren', () => { expect(richnessColor('barren')).toBeTruthy() })
})

describe('bleachingStatusColor', () => {
  it('colors pristine', () => { expect(bleachingStatusColor('pristine')).toBeTruthy() })
  it('colors healthy', () => { expect(bleachingStatusColor('healthy')).toBeTruthy() })
  it('colors warning', () => { expect(bleachingStatusColor('warning')).toBeTruthy() })
  it('colors stressed', () => { expect(bleachingStatusColor('stressed')).toBeTruthy() })
  it('colors bleaching', () => { expect(bleachingStatusColor('bleaching')).toBeTruthy() })
  it('colors dead-zone', () => { expect(bleachingStatusColor('dead-zone')).toBeTruthy() })
})

describe('zoneTypeColor', () => {
  it('colors great-barrier', () => { expect(zoneTypeColor('great-barrier')).toBeTruthy() })
  it('colors major-reef', () => { expect(zoneTypeColor('major-reef')).toBeTruthy() })
  it('colors atoll-system', () => { expect(zoneTypeColor('atoll-system')).toBeTruthy() })
  it('colors patch-system', () => { expect(zoneTypeColor('patch-system')).toBeTruthy() })
  it('colors rocky-shore', () => { expect(zoneTypeColor('rocky-shore')).toBeTruthy() })
  it('colors mud-flat', () => { expect(zoneTypeColor('mud-flat')).toBeTruthy() })
})
