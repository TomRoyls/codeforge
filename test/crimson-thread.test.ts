import { describe, expect, it } from 'vitest'

import {
  measureArterial,
  measurePulse,
  measureCirculation,
  measureOxygen,
  measureImmune,
  measureLife,
  analyzeBloodVessel,
  classifyVesselCondition,
  classifySystemType,
  analyzeCirculatorySystem,
  classifyPhysicianGrade,
  generateRecommendations,
  buildCrimsonThreadResult,
} from '../src/commands/crimson-thread-helpers.js'
import {
  scoreColor,
  conditionColor,
  rhythmColor,
  flowColor,
  saturationColor,
  immuneStrengthColor,
  vitalityColor,
  vesselConditionColor,
  physicianGradeColor,
  systemTypeColor,
  systemConditionColor,
  formatCrimsonThreadJson,
  formatCrimsonThreadTable,
} from '../src/commands/crimson-thread-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH_CONTENT = `export interface User { id: number; name: string }
export type UserRole = 'admin' | 'user'
export class UserService {
  private users: Map<number, User> = new Map()
  async getUser(id: number): Promise<User | null> {
    try {
      const user = this.users.get(id)
      return user ?? null
    } catch (error) {
      return null
    }
  }
}
import { injectable } from 'tsyringe'
/** Documentation */
export async function processUser(user: User): Promise<void> {
  await Promise.resolve(user)
}
`

const MEDIUM_CONTENT = `function hello(name) {
  console.log('hello', name)
  return name
}
`

const EMPTY_CONTENT = ''

// ─── measureArterial ────────────────────────────────────────────────────────

describe('measureArterial', () => {
  it('returns high strength for rich content', () => {
    const result = measureArterial(RICH_CONTENT)
    expect(result.strength).toBe(75)
    expect(result.condition).toBe('strong-artery')
  })

  it('returns low strength for simple content', () => {
    const result = measureArterial(MEDIUM_CONTENT)
    expect(result.strength).toBe(33)
    expect(result.condition).toBe('blocked')
  })

  it('returns zero for empty content', () => {
    const result = measureArterial(EMPTY_CONTENT)
    expect(result.strength).toBe(0)
    expect(result.condition).toBe('ruptured')
  })

  it('detects types', () => {
    const result = measureArterial('export type Config = { debug: boolean }')
    expect(result.strength).toBeGreaterThanOrEqual(35)
  })

  it('counts blockage from any/eval', () => {
    const result = measureArterial('const x: any = eval("1")')
    expect(result.blockageCount).toBeGreaterThanOrEqual(1)
  })

  it('counts leakage from console.log/debugger', () => {
    const result = measureArterial('console.log("x"); debugger;')
    expect(result.leakageCount).toBeGreaterThanOrEqual(1)
  })

  it('sets hasResilient for private/readonly', () => {
    const result = measureArterial(RICH_CONTENT)
    expect(result.hasResilient).toBe(true)
  })

  it('sets hasStrongWalls for interfaces/types', () => {
    const result = measureArterial(RICH_CONTENT)
    expect(result.hasStrongWalls).toBe(true)
  })
})

// ─── measurePulse ────────────────────────────────────────────────────────────

describe('measurePulse', () => {
  it('returns high quality for rich content', () => {
    const result = measurePulse(RICH_CONTENT)
    expect(result.quality).toBe(76)
    expect(result.rhythm).toBe('strong-steady')
  })

  it('returns medium quality for simple content', () => {
    const result = measurePulse(MEDIUM_CONTENT)
    expect(result.quality).toBe(45)
    expect(result.rhythm).toBe('irregular')
  })

  it('returns low quality for empty content', () => {
    const result = measurePulse(EMPTY_CONTENT)
    expect(result.quality).toBe(24)
    expect(result.rhythm).toBe('flatline')
  })

  it('detects exports and imports', () => {
    const result = measurePulse("import { x } from 'y'\nexport const z = x")
    expect(result.quality).toBeGreaterThanOrEqual(55)
  })

  it('sets hasProperBeat for named exports + imports', () => {
    const result = measurePulse("import { x } from 'y'\nexport const z = x")
    expect(result.hasProperBeat).toBe(true)
  })

  it('sets hasConsistent for consistent style', () => {
    const result = measurePulse(RICH_CONTENT)
    expect(result.hasConsistent).toBe(true)
  })
})

// ─── measureCirculation ──────────────────────────────────────────────────────

describe('measureCirculation', () => {
  it('returns high efficiency for rich content', () => {
    const result = measureCirculation(RICH_CONTENT)
    expect(result.efficiency).toBe(70)
    expect(result.flow).toBe('good-circulation')
  })

  it('returns low efficiency for simple content', () => {
    const result = measureCirculation(MEDIUM_CONTENT)
    expect(result.efficiency).toBe(13)
    expect(result.flow).toBe('clotted')
  })

  it('returns zero for empty content', () => {
    const result = measureCirculation(EMPTY_CONTENT)
    expect(result.efficiency).toBe(0)
    expect(result.flow).toBe('clotted')
  })

  it('detects imports for smooth flow', () => {
    const result = measureCirculation("import { x } from 'y'\nexport interface I {}")
    expect(result.hasSmoothFlow).toBe(true)
  })

  it('detects error handling for no pooling', () => {
    const result = measureCirculation('try { x() } catch(e) {}')
    expect(result.hasNoPooling).toBe(true)
  })
})

// ─── measureOxygen ───────────────────────────────────────────────────────────

describe('measureOxygen', () => {
  it('returns high delivery for rich content', () => {
    const result = measureOxygen(RICH_CONTENT)
    expect(result.delivery).toBe(88)
    expect(result.saturation).toBe('high-oxygen')
  })

  it('returns low delivery for simple content', () => {
    const result = measureOxygen(MEDIUM_CONTENT)
    expect(result.delivery).toBe(23)
    expect(result.saturation).toBe('asphyxiated')
  })

  it('returns near zero for empty content', () => {
    const result = measureOxygen(EMPTY_CONTENT)
    expect(result.delivery).toBe(3)
    expect(result.saturation).toBe('asphyxiated')
  })

  it('detects JSDoc comments', () => {
    const result = measureOxygen('/** docs */\nexport function x() {}')
    expect(result.delivery).toBeGreaterThanOrEqual(40)
  })

  it('detects type annotations', () => {
    const result = measureOxygen('function go(x: number): string { return "a" }')
    expect(result.delivery).toBeGreaterThanOrEqual(35)
  })

  it('counts starvation from missing docs', () => {
    const result = measureOxygen(MEDIUM_CONTENT)
    expect(result.starvationCount).toBe(2)
  })
})

// ─── measureImmune ───────────────────────────────────────────────────────────

describe('measureImmune', () => {
  it('returns response for rich content', () => {
    const result = measureImmune(RICH_CONTENT)
    expect(result.response).toBe(49)
    expect(result.strength).toBe('weak-immunity')
  })

  it('returns low response for simple content', () => {
    const result = measureImmune(MEDIUM_CONTENT)
    expect(result.response).toBe(19)
    expect(result.strength).toBe('no-defense')
  })

  it('returns zero for empty content', () => {
    const result = measureImmune(EMPTY_CONTENT)
    expect(result.response).toBe(0)
    expect(result.strength).toBe('no-defense')
  })

  it('detects try/catch', () => {
    const result = measureImmune('try { x() } catch(e) {}')
    expect(result.hasProperDefenses).toBe(true)
  })

  it('detects nullish coalescing for recovery', () => {
    const result = measureImmune('const x = a ?? b')
    expect(result.hasRecoveryMechanism).toBe(true)
  })

  it('counts silent failures from any', () => {
    const result = measureImmune('const x: any = 1')
    expect(result.silentFailureCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── measureLife ─────────────────────────────────────────────────────────────

describe('measureLife', () => {
  it('returns high force for rich content', () => {
    const result = measureLife(RICH_CONTENT)
    expect(result.force).toBe(83)
    expect(result.vitality).toBe('vibrant')
  })

  it('returns low force for simple content', () => {
    const result = measureLife(MEDIUM_CONTENT)
    expect(result.force).toBe(20)
    expect(result.vitality).toBe('lifeless')
  })

  it('returns near zero for empty content', () => {
    const result = measureLife(EMPTY_CONTENT)
    expect(result.force).toBe(5)
    expect(result.vitality).toBe('lifeless')
  })

  it('detects exports for thriving', () => {
    const result = measureLife('export interface X {} export function x() {}')
    expect(result.hasThriving).toBe(true)
  })

  it('flags fatigue from missing try/catch', () => {
    const result = measureLife('function x(): any { return 1 }')
    expect(result.fatigueCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── classifyVesselCondition ────────────────────────────────────────────────

describe('classifyVesselCondition', () => {
  it('classifies life-blood for 90+', () => {
    expect(classifyVesselCondition(95)).toBe('life-blood')
  })

  it('classifies lifeless for low scores', () => {
    expect(classifyVesselCondition(5)).toBe('lifeless')
  })

  it('classifies vital-thread for 75-89', () => {
    expect(classifyVesselCondition(80)).toBe('vital-thread')
  })

  it('classifies healthy-flow for 60-74', () => {
    expect(classifyVesselCondition(65)).toBe('healthy-flow')
  })

  it('classifies fading-pulse for 45-59', () => {
    expect(classifyVesselCondition(50)).toBe('fading-pulse')
  })

  it('classifies critical-condition for 30-44', () => {
    expect(classifyVesselCondition(35)).toBe('critical-condition')
  })
})

// ─── analyzeBloodVessel ─────────────────────────────────────────────────────

describe('analyzeBloodVessel', () => {
  it('returns correct values for rich content', () => {
    const result = analyzeBloodVessel(RICH_CONTENT, 'rich.ts')
    expect(result.file).toBe('rich.ts')
    expect(result.qualityScore).toBe(74)
    expect(result.condition).toBe('healthy-flow')
    expect(result.arterialStrength).toBe(75)
    expect(result.pulseQuality).toBe(76)
    expect(result.circulationEfficiency).toBe(70)
    expect(result.oxygenDelivery).toBe(88)
    expect(result.immuneResponse).toBe(49)
    expect(result.lifeForce).toBe(83)
  })

  it('returns correct values for medium content', () => {
    const result = analyzeBloodVessel(MEDIUM_CONTENT, 'medium.ts')
    expect(result.file).toBe('medium.ts')
    expect(result.qualityScore).toBe(26)
    expect(result.condition).toBe('lifeless')
    expect(result.arterialStrength).toBe(33)
    expect(result.pulseQuality).toBe(45)
    expect(result.circulationEfficiency).toBe(13)
    expect(result.oxygenDelivery).toBe(23)
    expect(result.immuneResponse).toBe(19)
    expect(result.lifeForce).toBe(20)
  })

  it('returns correct values for empty content', () => {
    const result = analyzeBloodVessel(EMPTY_CONTENT, 'empty.ts')
    expect(result.file).toBe('empty.ts')
    expect(result.qualityScore).toBe(5)
    expect(result.condition).toBe('lifeless')
    expect(result.arterialStrength).toBe(0)
    expect(result.pulseQuality).toBe(24)
    expect(result.circulationEfficiency).toBe(0)
    expect(result.oxygenDelivery).toBe(3)
    expect(result.immuneResponse).toBe(0)
    expect(result.lifeForce).toBe(5)
  })

  it('qualityScore is weighted sum', () => {
    const result = analyzeBloodVessel(RICH_CONTENT, 'r.ts')
    const expected = Math.round(
      result.arterialStrength * 0.2 +
      result.pulseQuality * 0.15 +
      result.circulationEfficiency * 0.15 +
      result.oxygenDelivery * 0.15 +
      result.immuneResponse * 0.15 +
      result.lifeForce * 0.2,
    )
    expect(result.qualityScore).toBe(expected)
  })
})

// ─── classifySystemType ─────────────────────────────────────────────────────

describe('classifySystemType', () => {
  it('returns flatline for empty array', () => {
    expect(classifySystemType([])).toBe('flatline')
  })

  it('returns cardiovascular-masterpiece for high avg + 50% life-blood', () => {
    const v = analyzeBloodVessel(RICH_CONTENT, 'a.ts')
    v.qualityScore = 95
    v.condition = 'life-blood'
    expect(classifySystemType([v])).toBe('cardiovascular-masterpiece')
  })

  it('returns struggling-system for mixed content', () => {
    const r = analyzeBloodVessel(RICH_CONTENT, 'a.ts')
    const m = analyzeBloodVessel(MEDIUM_CONTENT, 'b.ts')
    expect(classifySystemType([r, m])).toBe('struggling-system')
  })
})

// ─── analyzeCirculatorySystem ───────────────────────────────────────────────

describe('analyzeCirculatorySystem', () => {
  it('returns deceased system for no vessels', () => {
    const system = analyzeCirculatorySystem([], 'src')
    expect(system.directory).toBe('src')
    expect(system.systemType).toBe('flatline')
    expect(system.condition).toBe('deceased')
  })

  it('returns system with correct averages', () => {
    const vs = [analyzeBloodVessel(RICH_CONTENT, 'a.ts')]
    const system = analyzeCirculatorySystem(vs, '.')
    expect(system.avgArterial).toBe(vs[0].arterialStrength)
    expect(system.vessels).toHaveLength(1)
  })
})

// ─── classifyPhysicianGrade ─────────────────────────────────────────────────

describe('classifyPhysicianGrade', () => {
  it('returns surgeon-general for 80+', () => {
    expect(classifyPhysicianGrade(85)).toBe('surgeon-general')
  })
  it('returns surgeon-general for exactly 80', () => {
    expect(classifyPhysicianGrade(80)).toBe('surgeon-general')
  })
  it('returns cardiologist for 65-79', () => {
    expect(classifyPhysicianGrade(72)).toBe('cardiologist')
  })
  it('returns physician for 50-64', () => {
    expect(classifyPhysicianGrade(55)).toBe('physician')
  })
  it('returns physician for exactly 50', () => {
    expect(classifyPhysicianGrade(50)).toBe('physician')
  })
  it('returns medic for 35-49', () => {
    expect(classifyPhysicianGrade(43)).toBe('medic')
  })
  it('returns intern for 20-34', () => {
    expect(classifyPhysicianGrade(25)).toBe('intern')
  })
  it('returns quack for below 20', () => {
    expect(classifyPhysicianGrade(10)).toBe('quack')
  })
  it('returns quack for 0', () => {
    expect(classifyPhysicianGrade(0)).toBe('quack')
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns recommendations for rich content', () => {
    const result = buildCrimsonThreadResult(['a.ts'], [RICH_CONTENT])
    const recs = generateRecommendations(result.vessels, result.systems, result.organism, result.stats)
    expect(Array.isArray(recs)).toBe(true)
  })

  it('returns recommendations for empty content', () => {
    const result = buildCrimsonThreadResult(['a.ts'], [EMPTY_CONTENT])
    const recs = generateRecommendations(result.vessels, result.systems, result.organism, result.stats)
    expect(Array.isArray(recs)).toBe(true)
  })
})

// ─── buildCrimsonThreadResult (integration) ─────────────────────────────────

describe('buildCrimsonThreadResult', () => {
  it('handles RICH+MEDIUM correctly', () => {
    const result = buildCrimsonThreadResult(
      ['rich.ts', 'medium.ts'],
      [RICH_CONTENT, MEDIUM_CONTENT],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalSystems).toBe(1)
    expect(result.stats.avgArterialStrength).toBe(54)
    expect(result.stats.avgPulseQuality).toBe(61)
    expect(result.stats.avgCirculationEfficiency).toBe(42)
    expect(result.stats.avgOxygenDelivery).toBe(56)
    expect(result.stats.avgImmuneResponse).toBe(34)
    expect(result.stats.avgLifeForce).toBe(52)
    expect(result.stats.lifelessCount).toBe(1)
    expect(result.stats.healthyFlowCount).toBe(1)
    expect(result.stats.overallVitality).toBe(50)
    expect(result.stats.physicianGrade).toBe('physician')
    expect(result.stats.bestVessel).toBe('rich.ts')
    expect(result.stats.strongest).toBe('rich.ts')
    expect(result.stats.bestRhythm).toBe('rich.ts')
    expect(result.stats.mostEfficient).toBe('rich.ts')
    expect(result.stats.bestDocumented).toBe('rich.ts')
    expect(result.stats.bestDefended).toBe('rich.ts')
    expect(result.organism.overallVitality).toBe(50)
    expect(result.organism.isVital).toBe(false)
    expect(result.organism.avgArterial).toBe(54)
    expect(result.organism.avgCirculation).toBe(42)
    expect(result.organism.avgLifeForce).toBe(52)
    expect(result.vessels).toHaveLength(2)
    expect(result.systems).toHaveLength(1)
    expect(result.systems[0].systemType).toBe('struggling-system')
    expect(result.systems[0].condition).toBe('stable-organism')
  })

  it('handles all EMPTY correctly', () => {
    const result = buildCrimsonThreadResult(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
      [EMPTY_CONTENT, EMPTY_CONTENT, EMPTY_CONTENT, EMPTY_CONTENT],
    )
    expect(result.stats.totalFiles).toBe(4)
    expect(result.stats.avgArterialStrength).toBe(0)
    expect(result.stats.avgPulseQuality).toBe(24)
    expect(result.stats.avgCirculationEfficiency).toBe(0)
    expect(result.stats.avgOxygenDelivery).toBe(3)
    expect(result.stats.avgImmuneResponse).toBe(0)
    expect(result.stats.avgLifeForce).toBe(5)
    expect(result.stats.lifelessCount).toBe(4)
    expect(result.stats.overallVitality).toBe(5)
    expect(result.stats.physicianGrade).toBe('quack')
    expect(result.organism.isVital).toBe(false)
  })

  it('handles single rich file', () => {
    const result = buildCrimsonThreadResult(['rich.ts'], [RICH_CONTENT])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.vessels).toHaveLength(1)
    expect(result.vessels[0].qualityScore).toBe(74)
    expect(result.systems).toHaveLength(1)
  })

  it('handles empty files array', () => {
    const result = buildCrimsonThreadResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.vessels).toHaveLength(0)
    expect(result.systems).toHaveLength(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns string for high score', () => { expect(typeof scoreColor(90)).toBe('string') })
  it('returns string for medium score', () => { expect(typeof scoreColor(65)).toBe('string') })
  it('returns string for low score', () => { expect(typeof scoreColor(30)).toBe('string') })
  it('returns string for very low score', () => { expect(typeof scoreColor(10)).toBe('string') })
})

describe('conditionColor', () => {
  it('colors all conditions', () => {
    for (const c of ['artery-of-steel', 'strong-artery', 'healthy-vessel', 'narrowing', 'blocked', 'ruptured']) {
      expect(typeof conditionColor(c)).toBe('string')
    }
  })
  it('passes through unknown', () => { expect(conditionColor('unknown')).toBe('unknown') })
})

describe('rhythmColor', () => {
  it('colors all rhythms', () => {
    for (const r of ['athletes-pulse', 'strong-steady', 'healthy-rhythm', 'irregular', 'weak-pulse', 'flatline']) {
      expect(typeof rhythmColor(r)).toBe('string')
    }
  })
})

describe('flowColor', () => {
  it('colors all flows', () => {
    for (const f of ['optimal-circulation', 'efficient-flow', 'good-circulation', 'sluggish', 'stagnant', 'clotted']) {
      expect(typeof flowColor(f)).toBe('string')
    }
  })
})

describe('saturationColor', () => {
  it('colors all saturations', () => {
    for (const s of ['fully-saturated', 'high-oxygen', 'adequate', 'low-saturation', 'hypoxic', 'asphyxiated']) {
      expect(typeof saturationColor(s)).toBe('string')
    }
  })
})

describe('immuneStrengthColor', () => {
  it('colors all strengths', () => {
    for (const s of ['robust-immunity', 'strong-defense', 'proper-response', 'weak-immunity', 'compromised', 'no-defense']) {
      expect(typeof immuneStrengthColor(s)).toBe('string')
    }
  })
})

describe('vitalityColor', () => {
  it('colors all vitalities', () => {
    for (const v of ['radiant-health', 'vibrant', 'healthy', 'ailing', 'critical', 'lifeless']) {
      expect(typeof vitalityColor(v)).toBe('string')
    }
  })
})

describe('vesselConditionColor', () => {
  it('colors all conditions', () => {
    for (const c of ['life-blood', 'vital-thread', 'healthy-flow', 'fading-pulse', 'critical-condition', 'lifeless']) {
      expect(typeof vesselConditionColor(c)).toBe('string')
    }
  })
})

describe('physicianGradeColor', () => {
  it('colors all grades', () => {
    for (const g of ['surgeon-general', 'cardiologist', 'physician', 'medic', 'intern', 'quack']) {
      expect(typeof physicianGradeColor(g)).toBe('string')
    }
  })
})

describe('systemTypeColor', () => {
  it('colors all types', () => {
    for (const t of ['cardiovascular-masterpiece', 'healthy-system', 'functioning-system', 'struggling-system', 'failing-system', 'flatline']) {
      expect(typeof systemTypeColor(t)).toBe('string')
    }
  })
})

describe('systemConditionColor', () => {
  it('colors all conditions', () => {
    for (const c of ['peak-vitality', 'healthy-organism', 'stable-organism', 'weakened', 'critical', 'deceased']) {
      expect(typeof systemConditionColor(c)).toBe('string')
    }
  })
})

// ─── JSON Formatter ────────────────────────────────────────────────────────

describe('formatCrimsonThreadJson', () => {
  it('returns valid JSON string', () => {
    const result = buildCrimsonThreadResult(['a.ts'], [RICH_CONTENT])
    const json = formatCrimsonThreadJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

// ─── Table Formatter ───────────────────────────────────────────────────────

describe('formatCrimsonThreadTable', () => {
  it('includes header', () => {
    const result = buildCrimsonThreadResult(['a.ts'], [RICH_CONTENT])
    const table = formatCrimsonThreadTable(result, false)
    expect(table).toContain('Crimson Thread Analysis')
  })

  it('includes organism overview section', () => {
    const result = buildCrimsonThreadResult(['a.ts'], [RICH_CONTENT])
    const table = formatCrimsonThreadTable(result, false)
    expect(table).toContain('Organism Overview')
    expect(table).toContain('Is Vital')
  })

  it('includes statistics section', () => {
    const result = buildCrimsonThreadResult(['a.ts'], [RICH_CONTENT])
    const table = formatCrimsonThreadTable(result, false)
    expect(table).toContain('Statistics')
    expect(table).toContain('Physician Grade')
  })

  it('includes condition counts section', () => {
    const result = buildCrimsonThreadResult(['a.ts'], [RICH_CONTENT])
    const table = formatCrimsonThreadTable(result, false)
    expect(table).toContain('Condition Counts')
    expect(table).toContain('Lifeless')
  })

  it('shows highlights for best vessel', () => {
    const result = buildCrimsonThreadResult(
      ['a.ts', 'b.ts'],
      [RICH_CONTENT, MEDIUM_CONTENT],
    )
    const table = formatCrimsonThreadTable(result, false)
    expect(table).toContain('Highlights')
    expect(table).toContain('Best Vessel')
    expect(table).toContain('Strongest')
    expect(table).toContain('Best Rhythm')
    expect(table).toContain('Most Efficient')
    expect(table).toContain('Best Documented')
    expect(table).toContain('Best Defended')
  })

  it('shows per-file details in verbose mode', () => {
    const result = buildCrimsonThreadResult(['a.ts'], [RICH_CONTENT])
    const table = formatCrimsonThreadTable(result, true)
    expect(table).toContain('Per-File Vessels')
  })

  it('hides per-file details without verbose', () => {
    const result = buildCrimsonThreadResult(['a.ts'], [RICH_CONTENT])
    const table = formatCrimsonThreadTable(result, false)
    expect(table).not.toContain('Per-File Vessels')
  })

  it('shows recommendations when present', () => {
    const result = buildCrimsonThreadResult(['a.ts'], [MEDIUM_CONTENT])
    if (result.recommendations.length > 0) {
      const table = formatCrimsonThreadTable(result, false)
      expect(table).toContain('Recommendations')
    }
  })
})
