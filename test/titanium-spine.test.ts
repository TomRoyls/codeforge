import { describe, expect, it } from 'vitest'
import {
  measureStructural,
  measureStrength,
  measureFlexural,
  measureCorrosion,
  measureBiocompatible,
  measureFatigue,
  analyzeSpineVertebra,
  analyzeSpinalColumn,
  classifyCondition,
  classifyColumnType,
  classifyColumnCondition,
  classifyMetallurgistGrade,
  buildTitaniumSpineResult,
  generateRecommendations,
} from '../src/commands/titanium-spine-helpers.js'
import {
  scoreColor,
  gradeColor,
  ratioColor,
  flexColor,
  protectionColor,
  compatColor,
  limitColor,
  conditionColor,
  metallurgistColor,
  formatTitaniumSpineJson,
  formatTitaniumSpineTable,
} from '../src/commands/titanium-spine-format-helpers.js'

const RICH = `export interface User {
  readonly id: number
  name: string
  email?: string
}

export class UserService {
  private users: Map<number, User> = new Map()

  async getUser(id: number): Promise<User | null> {
    try {
      const user = this.users.get(id)
      if (user === undefined) {
        return null
      }
      return user
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(\`Failed to get user: \${error.message}\`)
      }
      throw new Error('Unknown error')
    } finally {
      console.log('done')
    }
  }
}

export type UserResponse = {
  user: User
  status: 'active' | 'inactive'
}

/**
 * Documentation
 */
export function processUser(user: User): UserResponse {
  return { user, status: 'active' }
}`

const EMPTY = ''
const MINIMAL = 'const x = 1'
const WITH_VAR = 'var y = 2; var z = 3;'
const WITH_ANY = 'const a: any = null; const b: any = undefined;'
const WITH_CONSOLE = 'console.log("hello"); console.warn("world");'
const WITH_TODO = '// TODO: fix this\n// FIXME: broken'
const WITH_EVAL = 'eval("dangerous")'

describe('titanium-spine-helpers', () => {
  describe('measureStructural', () => {
    it('measures rich content correctly', () => {
      const result = measureStructural(RICH)
      expect(result.integrity).toBe(72)
      expect(result.grade).toBe('medical-grade')
      expect(result.hasHighIntegrity).toBe(true)
      expect(result.hasSolidArchitecture).toBe(false)
      expect(result.hasProperLayers).toBe(true)
      expect(result.hasNoWeakPoints).toBe(true)
      expect(result.hasLoadBearing).toBe(false)
      expect(result.hasNoFragile).toBe(true)
      expect(result.hasReinforced).toBe(true)
      expect(result.hasNoCracks).toBe(true)
      expect(result.hasDistributed).toBe(true)
      expect(result.hasNoSinglePoint).toBe(true)
      expect(result.weakPointCount).toBe(0)
      expect(result.crackCount).toBe(0)
    })

    it('returns fail-grade for empty content', () => {
      const result = measureStructural(EMPTY)
      expect(result.integrity).toBe(0)
      expect(result.grade).toBe('fail-grade')
      expect(result.hasSolidArchitecture).toBe(false)
    })

    it('detects weak points from var usage', () => {
      const result = measureStructural(WITH_VAR)
      expect(result.hasNoWeakPoints).toBe(false)
      expect(result.weakPointCount).toBe(2)
      expect(result.hasNoCracks).toBe(false)
      expect(result.hasNoSinglePoint).toBe(false)
    })

    it('detects cracks from any usage', () => {
      const result = measureStructural(WITH_ANY)
      expect(result.hasNoFragile).toBe(false)
      expect(result.crackCount).toBe(2)
      expect(result.hasNoCracks).toBe(false)
    })
  })

  describe('measureStrength', () => {
    it('measures rich content correctly', () => {
      const result = measureStrength(RICH)
      expect(result.ratio).toBe(69)
      expect(result.grade2).toBe('proper-balance')
      expect(result.hasHighRatio).toBe(false)
      expect(result.hasEfficient).toBe(true)
      expect(result.hasLightweight).toBe(false)
      expect(result.hasNoOverweight).toBe(true)
      expect(result.hasOptimized).toBe(true)
      expect(result.hasNoWaste).toBe(false)
      expect(result.hasLean).toBe(true)
      expect(result.hasNoBloat).toBe(false)
      expect(result.hasPurposeful).toBe(false)
      expect(result.overweightCount).toBe(0)
      expect(result.bloatCount).toBe(1)
    })

    it('returns bloated for empty content', () => {
      const result = measureStrength(EMPTY)
      expect(result.ratio).toBe(0)
      expect(result.grade2).toBe('bloated')
      expect(result.hasNoWaste).toBe(true)
    })

    it('detects bloat from console calls', () => {
      const result = measureStrength(WITH_CONSOLE)
      expect(result.hasNoBloat).toBe(false)
      expect(result.hasNoWaste).toBe(false)
      expect(result.hasNoPadding).toBe(false)
      expect(result.bloatCount).toBe(2)
    })
  })

  describe('measureFlexural', () => {
    it('measures rich content correctly', () => {
      const result = measureFlexural(RICH)
      expect(result.strength).toBe(61)
      expect(result.flexibility).toBe('properly-elastic')
      expect(result.hasHighStrength).toBe(false)
      expect(result.hasAdaptable).toBe(false)
      expect(result.hasFlexible).toBe(false)
      expect(result.hasNoRigidity).toBe(true)
      expect(result.hasExtensible).toBe(false)
      expect(result.hasNoBrittleness).toBe(true)
      expect(result.hasModular).toBe(true)
      expect(result.hasNoMonolith).toBe(true)
      expect(result.hasResilient).toBe(true)
      expect(result.rigidityCount).toBe(0)
      expect(result.brittlenessCount).toBe(0)
    })

    it('returns brittle for empty content', () => {
      const result = measureFlexural(EMPTY)
      expect(result.strength).toBe(0)
      expect(result.flexibility).toBe('brittle')
      expect(result.hasModular).toBe(false)
    })

    it('detects rigidity from var usage', () => {
      const result = measureFlexural(WITH_VAR)
      expect(result.hasNoRigidity).toBe(false)
      expect(result.rigidityCount).toBe(2)
      expect(result.hasNoMonolith).toBe(false)
      expect(result.hasNoStiffness).toBe(false)
    })
  })

  describe('measureCorrosion', () => {
    it('measures rich content correctly', () => {
      const result = measureCorrosion(RICH)
      expect(result.resistance).toBe(55)
      expect(result.protection).toBe('proper-coating')
      expect(result.hasHighResistance).toBe(false)
      expect(result.hasErrorHandling).toBe(true)
      expect(result.hasDefensive).toBe(false)
      expect(result.hasNoVulnerability).toBe(true)
      expect(result.hasInputValidation).toBe(true)
      expect(result.hasNoBare).toBe(true)
      expect(result.hasProtected).toBe(true)
      expect(result.hasNoExposed).toBe(true)
      expect(result.hasSanitized).toBe(false)
      expect(result.vulnerabilityCount).toBe(0)
      expect(result.exposedCount).toBe(0)
    })

    it('returns rusting for empty content', () => {
      const result = measureCorrosion(EMPTY)
      expect(result.resistance).toBe(0)
      expect(result.protection).toBe('rusting')
      expect(result.hasErrorHandling).toBe(false)
    })

    it('detects eval vulnerabilities', () => {
      const result = measureCorrosion(WITH_EVAL)
      expect(result.hasNoVulnerability).toBe(false)
      expect(result.hasNoInjection).toBe(false)
      expect(result.hasNoExposed).toBe(false)
      expect(result.vulnerabilityCount).toBe(1)
    })
  })

  describe('measureBiocompatible', () => {
    it('measures rich content correctly', () => {
      const result = measureBiocompatible(RICH)
      expect(result.integration).toBe(88)
      expect(result.compatibility).toBe('universal-donor')
      expect(result.hasHighIntegration).toBe(true)
      expect(result.hasCleanAPI).toBe(true)
      expect(result.hasProperInterface).toBe(true)
      expect(result.hasNoCoupling).toBe(true)
      expect(result.hasStandardCompliant).toBe(true)
      expect(result.hasCompatible).toBe(true)
      expect(result.hasNoConflict).toBe(true)
      expect(result.hasWellTyped).toBe(false)
      expect(result.hasNoMismatch).toBe(true)
      expect(result.couplingCount).toBe(0)
      expect(result.conflictCount).toBe(0)
    })

    it('returns foreign-body for empty content', () => {
      const result = measureBiocompatible(EMPTY)
      expect(result.integration).toBe(0)
      expect(result.compatibility).toBe('foreign-body')
      expect(result.hasCleanAPI).toBe(false)
    })
  })

  describe('measureFatigue', () => {
    it('measures rich content correctly', () => {
      const result = measureFatigue(RICH)
      expect(result.endurance).toBe(87)
      expect(result.limit).toBe('infinite-life')
      expect(result.hasHighEndurance).toBe(true)
      expect(result.hasTested).toBe(true)
      expect(result.hasNoUncovered).toBe(true)
      expect(result.hasProven).toBe(true)
      expect(result.hasNoFragile).toBe(true)
      expect(result.hasStable).toBe(true)
      expect(result.hasNoRegression).toBe(true)
      expect(result.hasReliable).toBe(true)
      expect(result.hasEnduring).toBe(true)
      expect(result.uncoveredCount).toBe(0)
      expect(result.regressionCount).toBe(0)
    })

    it('returns premature-failure for empty content', () => {
      const result = measureFatigue(EMPTY)
      expect(result.endurance).toBe(0)
      expect(result.limit).toBe('premature-failure')
      expect(result.hasTested).toBe(false)
    })

    it('detects TODO/FIXME regression markers', () => {
      const result = measureFatigue(WITH_TODO)
      expect(result.hasNoRegression).toBe(false)
      expect(result.hasNoDecay).toBe(false)
      expect(result.regressionCount).toBe(2)
    })
  })

  describe('classifyCondition', () => {
    it('classifies scores correctly', () => {
      expect(classifyCondition(90)).toBe('titanium-spine')
      expect(classifyCondition(85)).toBe('titanium-spine')
      expect(classifyCondition(80)).toBe('strong-backbone')
      expect(classifyCondition(70)).toBe('strong-backbone')
      expect(classifyCondition(65)).toBe('solid-structure')
      expect(classifyCondition(55)).toBe('solid-structure')
      expect(classifyCondition(50)).toBe('weakening')
      expect(classifyCondition(40)).toBe('weakening')
      expect(classifyCondition(35)).toBe('degrading')
      expect(classifyCondition(25)).toBe('degrading')
      expect(classifyCondition(20)).toBe('collapsed')
      expect(classifyCondition(10)).toBe('collapsed')
      expect(classifyCondition(0)).toBe('collapsed')
    })
  })

  describe('classifyColumnType', () => {
    it('returns shattered for empty vertebrae', () => {
      expect(classifyColumnType([])).toBe('shattered')
    })

    it('classifies mixed vertebrae correctly', () => {
      const v = analyzeSpineVertebra(RICH, 'rich.ts')
      const e = analyzeSpineVertebra(EMPTY, 'empty.ts')
      const m = analyzeSpineVertebra(MINIMAL, 'minimal.ts')
      expect(classifyColumnType([v, e, m])).toBe('degenerating')
    })

    it('returns healthy-backbone for high quality', () => {
      const v = analyzeSpineVertebra(RICH, 'a.ts')
      const v2 = analyzeSpineVertebra(RICH, 'b.ts')
      expect(classifyColumnType([v, v2])).toBe('healthy-backbone')
    })
  })

  describe('classifyColumnCondition', () => {
    it('classifies correctly at all thresholds', () => {
      expect(classifyColumnCondition(80)).toBe('structural-marvel')
      expect(classifyColumnCondition(75)).toBe('structural-marvel')
      expect(classifyColumnCondition(65)).toBe('strong-support')
      expect(classifyColumnCondition(60)).toBe('strong-support')
      expect(classifyColumnCondition(50)).toBe('adequate-backbone')
      expect(classifyColumnCondition(45)).toBe('adequate-backbone')
      expect(classifyColumnCondition(35)).toBe('weakening-structure')
      expect(classifyColumnCondition(30)).toBe('weakening-structure')
      expect(classifyColumnCondition(20)).toBe('failing-support')
      expect(classifyColumnCondition(15)).toBe('failing-support')
      expect(classifyColumnCondition(10)).toBe('collapsed')
    })
  })

  describe('classifyMetallurgistGrade', () => {
    it('classifies correctly at all thresholds', () => {
      expect(classifyMetallurgistGrade(80)).toBe('materials-scientist')
      expect(classifyMetallurgistGrade(65)).toBe('master-metallurgist')
      expect(classifyMetallurgistGrade(50)).toBe('expert-engineer')
      expect(classifyMetallurgistGrade(35)).toBe('structural-engineer')
      expect(classifyMetallurgistGrade(20)).toBe('apprentice')
      expect(classifyMetallurgistGrade(10)).toBe('quack')
    })
  })

  describe('analyzeSpineVertebra', () => {
    it('produces correct qualityScore for rich content', () => {
      const v = analyzeSpineVertebra(RICH, 'rich.ts')
      expect(v.qualityScore).toBe(73)
      expect(v.structuralIntegrity).toBe(72)
      expect(v.strengthToWeight).toBe(69)
      expect(v.flexuralStrength).toBe(61)
      expect(v.corrosionResistance).toBe(55)
      expect(v.biocompatibility).toBe(88)
      expect(v.fatigueEndurance).toBe(87)
      expect(v.condition).toBe('strong-backbone')
      expect(v.file).toBe('rich.ts')
    })

    it('produces correct qualityScore for empty content', () => {
      const v = analyzeSpineVertebra(EMPTY, 'empty.ts')
      expect(v.qualityScore).toBe(0)
      expect(v.condition).toBe('collapsed')
    })

    it('returns correct qualityScore for minimal content', () => {
      const v = analyzeSpineVertebra(MINIMAL, 'minimal.ts')
      expect(v.qualityScore).toBe(7)
      expect(v.structuralIntegrity).toBe(0)
      expect(v.strengthToWeight).toBe(10)
      expect(v.flexuralStrength).toBe(12)
      expect(v.corrosionResistance).toBe(0)
      expect(v.biocompatibility).toBe(12)
      expect(v.fatigueEndurance).toBe(8)
      expect(v.condition).toBe('collapsed')
    })

    it('contains all six measure objects', () => {
      const v = analyzeSpineVertebra(RICH, 'rich.ts')
      expect(v.structural).toBeDefined()
      expect(v.strength).toBeDefined()
      expect(v.flexural).toBeDefined()
      expect(v.corrosion).toBeDefined()
      expect(v.biocompatible).toBeDefined()
      expect(v.fatigue).toBeDefined()
    })

    it('computes qualityScore with correct formula', () => {
      const v = analyzeSpineVertebra(RICH, 'rich.ts')
      const expected = Math.round(
        v.structuralIntegrity * 0.2 +
        v.strengthToWeight * 0.15 +
        v.flexuralStrength * 0.15 +
        v.corrosionResistance * 0.15 +
        v.biocompatibility * 0.15 +
        v.fatigueEndurance * 0.2,
      )
      expect(v.qualityScore).toBe(expected)
    })
  })

  describe('analyzeSpinalColumn', () => {
    it('returns empty column for empty vertebrae', () => {
      const col = analyzeSpinalColumn([], 'empty-dir')
      expect(col.directory).toBe('empty-dir')
      expect(col.vertebrae).toHaveLength(0)
      expect(col.avgIntegrity).toBe(0)
      expect(col.avgFlexural).toBe(0)
      expect(col.avgEndurance).toBe(0)
      expect(col.titaniumCount).toBe(0)
      expect(col.collapsedCount).toBe(0)
      expect(col.strongCount).toBe(0)
      expect(col.solidCount).toBe(0)
      expect(col.columnType).toBe('shattered')
      expect(col.condition).toBe('collapsed')
    })

    it('computes correct column averages', () => {
      const v = analyzeSpineVertebra(RICH, 'rich.ts')
      const e = analyzeSpineVertebra(EMPTY, 'empty.ts')
      const m = analyzeSpineVertebra(MINIMAL, 'minimal.ts')
      const col = analyzeSpinalColumn([v, e, m], 'src')
      expect(col.avgIntegrity).toBe(24)
      expect(col.avgFlexural).toBe(24)
      expect(col.avgEndurance).toBe(32)
      expect(col.titaniumCount).toBe(0)
      expect(col.collapsedCount).toBe(2)
      expect(col.strongCount).toBe(1)
      expect(col.solidCount).toBe(0)
      expect(col.columnType).toBe('degenerating')
      expect(col.condition).toBe('failing-support')
    })
  })

  describe('buildTitaniumSpineResult', () => {
    it('returns correct result for mixed files', () => {
      const result = buildTitaniumSpineResult(
        ['rich.ts', 'empty.ts', 'minimal.ts'],
        [RICH, EMPTY, MINIMAL],
      )

      expect(result.vertebrae).toHaveLength(3)
      expect(result.columns).toHaveLength(1)
      expect(result.columns[0].directory).toBe('.')

      expect(result.skeleton.avgIntegrity).toBe(24)
      expect(result.skeleton.avgFlexural).toBe(24)
      expect(result.skeleton.avgEndurance).toBe(32)
      expect(result.skeleton.isTitanium).toBe(false)
      expect(result.skeleton.overallStrength).toBe(27)

      expect(result.stats.totalFiles).toBe(3)
      expect(result.stats.totalColumns).toBe(1)
      expect(result.stats.avgStructuralIntegrity).toBe(24)
      expect(result.stats.avgStrengthToWeight).toBe(26)
      expect(result.stats.avgFlexuralStrength).toBe(24)
      expect(result.stats.avgCorrosionResistance).toBe(18)
      expect(result.stats.avgBiocompatibility).toBe(33)
      expect(result.stats.avgFatigueEndurance).toBe(32)
      expect(result.stats.titaniumSpineCount).toBe(0)
      expect(result.stats.strongBackboneCount).toBe(1)
      expect(result.stats.solidStructureCount).toBe(0)
      expect(result.stats.weakeningCount).toBe(0)
      expect(result.stats.degradingCount).toBe(0)
      expect(result.stats.collapsedCount).toBe(2)
      expect(result.stats.hasHighIntegrityCount).toBe(1)
      expect(result.stats.hasHighRatioCount).toBe(0)
      expect(result.stats.hasHighStrengthCount).toBe(0)
      expect(result.stats.hasHighResistanceCount).toBe(0)
      expect(result.stats.hasHighIntegrationCount).toBe(1)
      expect(result.stats.hasHighEnduranceCount).toBe(1)
      expect(result.stats.overallStrength).toBe(27)
      expect(result.stats.metallurgistGrade).toBe('apprentice')
      expect(result.stats.bestVertebra).toBe('rich.ts')
      expect(result.stats.strongest).toBe('rich.ts')
      expect(result.stats.mostEfficient).toBe('rich.ts')
      expect(result.stats.mostAdaptable).toBe('rich.ts')
      expect(result.stats.mostResilient).toBe('rich.ts')
      expect(result.stats.bestIntegrated).toBe('rich.ts')
    })

    it('returns empty result for empty input', () => {
      const result = buildTitaniumSpineResult([], [])
      expect(result.vertebrae).toHaveLength(0)
      expect(result.columns).toHaveLength(0)
      expect(result.skeleton.overallStrength).toBe(0)
      expect(result.skeleton.isTitanium).toBe(false)
      expect(result.stats.totalFiles).toBe(0)
      expect(result.stats.bestVertebra).toBe('')
      expect(result.stats.strongest).toBe('')
    })

    it('separates files into directories correctly', () => {
      const result = buildTitaniumSpineResult(
        ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
        [RICH, EMPTY, MINIMAL],
      )
      expect(result.columns).toHaveLength(2)
      const dirs = result.columns.map((c) => c.directory).sort()
      expect(dirs).toContain('lib')
      expect(dirs).toContain('src')
    })

    it('sets isTitanium when avgIntegrity >= 60', () => {
      const result = buildTitaniumSpineResult(
        ['a.ts', 'b.ts'],
        [RICH, RICH],
      )
      expect(result.skeleton.isTitanium).toBe(true)
      expect(result.skeleton.avgIntegrity).toBe(72)
    })
  })

  describe('generateRecommendations', () => {
    it('generates recommendations for low scores', () => {
      const result = buildTitaniumSpineResult(
        ['empty.ts'],
        [EMPTY],
      )
      expect(result.recommendations.length).toBeGreaterThan(0)
    })

    it('generates positive recommendation for good scores', () => {
      const result = buildTitaniumSpineResult(
        ['a.ts', 'b.ts'],
        [RICH, RICH],
      )
      expect(result.recommendations).toContain('Your code has a titanium spine! Structural integrity is exceptional')
    })

    it('recommends rebuilding collapsed files', () => {
      const result = buildTitaniumSpineResult(
        ['a.ts', 'b.ts', 'empty.ts'],
        [RICH, RICH, EMPTY],
      )
      expect(result.recommendations).toContain('Rebuild these collapsed files: empty.ts')
    })

    it('recommends rebuilding multiple collapsed files', () => {
      const result = buildTitaniumSpineResult(
        ['a.ts', 'empty.ts', 'minimal.ts'],
        [RICH, EMPTY, MINIMAL],
      )
      expect(result.recommendations).toContain('Rebuild these collapsed files: empty.ts, minimal.ts')
    })

    it('recommends improving structural integrity when low', () => {
      const result = buildTitaniumSpineResult(['empty.ts'], [EMPTY])
      expect(result.recommendations).toContain('Improve structural integrity with exports, imports, classes, and interfaces')
    })

    it('recommends improving corrosion resistance when low', () => {
      const result = buildTitaniumSpineResult(['empty.ts'], [EMPTY])
      expect(result.recommendations).toContain('Boost corrosion resistance with try/catch, null checks, and defensive programming')
    })

    it('recommends improving fatigue endurance when low', () => {
      const result = buildTitaniumSpineResult(['empty.ts'], [EMPTY])
      expect(result.recommendations).toContain('Enhance fatigue endurance with error handling, readonly properties, and stable patterns')
    })

    it('recommends improving biocompatibility when low', () => {
      const result = buildTitaniumSpineResult(['empty.ts'], [EMPTY])
      expect(result.recommendations).toContain('Improve biocompatibility with clean APIs, proper interfaces, and standard patterns')
    })

    it('recommends improving overall strength when low', () => {
      const result = buildTitaniumSpineResult(['empty.ts'], [EMPTY])
      expect(result.recommendations).toContain('Overall skeleton strength is low — prioritize architecture and error handling')
    })

    it('does not recommend rebuilding when 4+ collapsed files', () => {
      const result = buildTitaniumSpineResult(
        ['good.ts', 'e1.ts', 'e2.ts', 'e3.ts', 'e4.ts'],
        [RICH, EMPTY, EMPTY, EMPTY, EMPTY],
      )
      const rebuildRec = result.recommendations.find((r) => r.startsWith('Rebuild these'))
      expect(rebuildRec).toBeUndefined()
    })
  })
})

describe('titanium-spine-format-helpers', () => {
  describe('scoreColor', () => {
    it('returns string for score >= 80', () => {
      expect(typeof scoreColor(90)).toBe('string')
    })
    it('returns string for score >= 60', () => {
      expect(typeof scoreColor(70)).toBe('string')
    })
    it('returns string for score >= 40', () => {
      expect(typeof scoreColor(50)).toBe('string')
    })
    it('returns string for low score', () => {
      expect(typeof scoreColor(30)).toBe('string')
    })
  })

  describe('gradeColor', () => {
    it('returns string for all grades', () => {
      expect(typeof gradeColor('aerospace-grade')).toBe('string')
      expect(typeof gradeColor('medical-grade')).toBe('string')
      expect(typeof gradeColor('industrial-grade')).toBe('string')
      expect(typeof gradeColor('commercial-grade')).toBe('string')
      expect(typeof gradeColor('scrap-grade')).toBe('string')
      expect(typeof gradeColor('fail-grade')).toBe('string')
    })
  })

  describe('ratioColor', () => {
    it('returns string for all ratios', () => {
      expect(typeof ratioColor('exceptional-ratio')).toBe('string')
      expect(typeof ratioColor('high-efficiency')).toBe('string')
      expect(typeof ratioColor('proper-balance')).toBe('string')
      expect(typeof ratioColor('adequate')).toBe('string')
      expect(typeof ratioColor('heavy-for-purpose')).toBe('string')
      expect(typeof ratioColor('bloated')).toBe('string')
    })
  })

  describe('flexColor', () => {
    it('returns string for all flexibilities', () => {
      expect(typeof flexColor('supertensile')).toBe('string')
      expect(typeof flexColor('highly-flexible')).toBe('string')
      expect(typeof flexColor('properly-elastic')).toBe('string')
      expect(typeof flexColor('moderate-bend')).toBe('string')
      expect(typeof flexColor('stiff')).toBe('string')
      expect(typeof flexColor('brittle')).toBe('string')
    })
  })

  describe('protectionColor', () => {
    it('returns string for all protection levels', () => {
      expect(typeof protectionColor('passive-film')).toBe('string')
      expect(typeof protectionColor('highly-resistant')).toBe('string')
      expect(typeof protectionColor('proper-coating')).toBe('string')
      expect(typeof protectionColor('moderate-resistance')).toBe('string')
      expect(typeof protectionColor('corroding')).toBe('string')
      expect(typeof protectionColor('rusting')).toBe('string')
    })
  })

  describe('compatColor', () => {
    it('returns string for all compatibilities', () => {
      expect(typeof compatColor('universal-donor')).toBe('string')
      expect(typeof compatColor('highly-compatible')).toBe('string')
      expect(typeof compatColor('proper-interface')).toBe('string')
      expect(typeof compatColor('partial-fit')).toBe('string')
      expect(typeof compatColor('rejection-risk')).toBe('string')
      expect(typeof compatColor('foreign-body')).toBe('string')
    })
  })

  describe('limitColor', () => {
    it('returns string for all limits', () => {
      expect(typeof limitColor('infinite-life')).toBe('string')
      expect(typeof limitColor('high-cycle')).toBe('string')
      expect(typeof limitColor('proper-endurance')).toBe('string')
      expect(typeof limitColor('limited-life')).toBe('string')
      expect(typeof limitColor('low-cycle')).toBe('string')
      expect(typeof limitColor('premature-failure')).toBe('string')
    })
  })

  describe('conditionColor', () => {
    it('returns string for all conditions', () => {
      expect(typeof conditionColor('titanium-spine')).toBe('string')
      expect(typeof conditionColor('strong-backbone')).toBe('string')
      expect(typeof conditionColor('solid-structure')).toBe('string')
      expect(typeof conditionColor('weakening')).toBe('string')
      expect(typeof conditionColor('degrading')).toBe('string')
      expect(typeof conditionColor('collapsed')).toBe('string')
    })
  })

  describe('metallurgistColor', () => {
    it('returns string for all grades', () => {
      expect(typeof metallurgistColor('materials-scientist')).toBe('string')
      expect(typeof metallurgistColor('master-metallurgist')).toBe('string')
      expect(typeof metallurgistColor('expert-engineer')).toBe('string')
      expect(typeof metallurgistColor('structural-engineer')).toBe('string')
      expect(typeof metallurgistColor('apprentice')).toBe('string')
      expect(typeof metallurgistColor('quack')).toBe('string')
    })
  })

  describe('formatTitaniumSpineJson', () => {
    it('produces valid JSON', () => {
      const result = buildTitaniumSpineResult(['a.ts'], [RICH])
      const json = formatTitaniumSpineJson(result)
      const parsed = JSON.parse(json)
      expect(parsed.vertebrae).toHaveLength(1)
      expect(parsed.skeleton.overallStrength).toBe(result.skeleton.overallStrength)
    })

    it('includes recommendations in JSON output', () => {
      const result = buildTitaniumSpineResult(['empty.ts'], [EMPTY])
      const json = formatTitaniumSpineJson(result)
      const parsed = JSON.parse(json)
      expect(parsed.recommendations.length).toBeGreaterThan(0)
    })
  })

  describe('formatTitaniumSpineTable', () => {
    it('produces non-empty string for non-verbose', () => {
      const result = buildTitaniumSpineResult(['a.ts'], [RICH])
      const table = formatTitaniumSpineTable(result, false)
      expect(table.length).toBeGreaterThan(0)
      expect(table).toContain('Titanium Spine Analysis')
      expect(table).toContain('Skeleton:')
      expect(table).toContain('Statistics:')
    })

    it('includes per-file details in verbose mode', () => {
      const result = buildTitaniumSpineResult(['a.ts'], [RICH])
      const table = formatTitaniumSpineTable(result, true)
      expect(table).toContain('Per-File Vertebrae:')
      expect(table).toContain('a.ts')
    })

    it('includes recommendations when present', () => {
      const result = buildTitaniumSpineResult(['empty.ts'], [EMPTY])
      const table = formatTitaniumSpineTable(result, false)
      expect(table).toContain('Recommendations:')
    })

    it('includes highlights section when files exist', () => {
      const result = buildTitaniumSpineResult(['a.ts'], [RICH])
      const table = formatTitaniumSpineTable(result, false)
      expect(table).toContain('Highlights:')
      expect(table).toContain('Best Vertebra:')
      expect(table).toContain('Strongest:')
    })

    it('does not crash on empty result', () => {
      const result = buildTitaniumSpineResult([], [])
      const table = formatTitaniumSpineTable(result, false)
      expect(typeof table).toBe('string')
    })

    it('includes Condition Counts section', () => {
      const result = buildTitaniumSpineResult(['a.ts'], [RICH])
      const table = formatTitaniumSpineTable(result, false)
      expect(table).toContain('Condition Counts:')
      expect(table).toContain('Titanium Spine:')
      expect(table).toContain('Collapsed:')
    })

    it('includes Is Titanium status', () => {
      const result = buildTitaniumSpineResult(['a.ts', 'b.ts'], [RICH, RICH])
      const table = formatTitaniumSpineTable(result, false)
      expect(table).toContain('Is Titanium:')
    })

    it('shows correct verbose per-file details', () => {
      const result = buildTitaniumSpineResult(['a.ts', 'b.ts'], [RICH, EMPTY])
      const table = formatTitaniumSpineTable(result, true)
      expect(table).toContain('Score:')
      expect(table).toContain('Condition:')
      expect(table).toContain('Structural:')
      expect(table).toContain('Fatigue:')
    })
  })
})
