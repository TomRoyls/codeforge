import { describe, it, expect } from 'vitest'
import {
  countExports, countImports, countFunctions, countClasses,
  countInterfaces, countTypeAliases, countEnums, countJSDoc,
  countAsync, countTryCatch, countCatches, countFinallys,
  countThrows, countConsole, countTodos, countAny,
  countCommentedCode, countDeepNested, countAccessModifiers,
  countReadonly, countGenerics, countStatic,
  measureDensity, measureCarving, measureMoraine, measureCrevasse,
  measureAge, measureAdvance, analyzeIceFormation,
  buildGlacierCarveResult, classifyCondition, classifyGlaciologistGrade,
  classifySystemType, classifySystemCondition,
} from '../src/commands/glacier-carve-helpers.js'
import {
  scoreColor, conditionColor, gradeColor, systemTypeColor,
  formatGlacierCarveJson, formatGlacierCarveTable,
} from '../src/commands/glacier-carve-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const EMPTY = ''

const RICH = `import { Command } from '@oclif/core'
import type { Result } from './types.js'

/** Documentation for helper */
export interface Config {
  name: string
  version: number
  options: Record<string, unknown>
}

export type ResultType = Config | null

export enum Status { Active, Inactive, Pending }

export class Analyzer {
  private data: Map<string, number> = new Map()
  protected helper: ReadonlyArray<string> = []
  public name: string = 'default'

  static create(): Analyzer {
    return new Analyzer()
  }

  async analyze(content: string): Promise<Result> {
    try {
      if (!content) {
        return { success: false, data: null }
      }

      const lines = content.split('\\n')
      for (const line of lines) {
        if (line.includes('TODO')) continue
        await this.processLine(line)
      }

      const result = this.transform(lines)
      return { success: true, data: result }
    } catch (error) {
      throw new Error(\`Analysis failed: \${error}\`)
    } finally {
      this.cleanup()
    }
  }

  private transform(data: string[]): Result {
    return { success: true, data }
  }

  private async processLine(line: string): Promise<void> {
    const trimmed = line.trim()
    if (trimmed.length === 0) return
    this.data.set(trimmed, trimmed.length)
  }

  private cleanup(): void {
    this.data.clear()
  }
}

export function buildResult<T>(items: T[]): T[] {
  return [...items]
}

export default Analyzer`

const SIMPLE = `export function hello() {
  return "world"
}
`

const BAD = `var x = 1
console.log(x)
// TODO: fix this
// function oldCode() {}
var any = true
`

// ─── Measure Functions ─────────────────────────────────────────────────────

describe('glacier-carve measure functions', () => {
  it('measureDensity on RICH returns level 85 blue-ice', () => {
    const result = measureDensity(RICH)
    expect(result.level).toBe(85)
    expect(result.type).toBe('blue-ice')
    expect(result.isDense).toBe(false)
    expect(result.hasHighCompression).toBe(true)
    expect(result.hasNoAirBubbles).toBe(true)
    expect(result.hasNoMeltwater).toBe(true)
    expect(result.hasProperCrystal).toBe(true)
    expect(result.hasGlacialFlow).toBe(true)
    expect(result.hasPressureRecrystallization).toBe(true)
    expect(result.hasStratification).toBe(true)
    expect(result.hasNoIceLenses).toBe(true)
    expect(result.hasNoFractureZones).toBe(false)
    expect(result.airBubbleCount).toBe(0)
    expect(result.fractureZoneCount).toBe(1)
  })

  it('measureDensity on EMPTY returns level 50 firn', () => {
    const result = measureDensity(EMPTY)
    expect(result.level).toBe(50)
    expect(result.type).toBe('firn')
    expect(result.hasNoAirBubbles).toBe(true)
    expect(result.hasNoFractureZones).toBe(true)
  })

  it('measureCarving on RICH returns power 80 fjord', () => {
    const result = measureCarving(RICH)
    expect(result.power).toBe(80)
    expect(result.style).toBe('fjord')
    expect(result.hasDeepImpact).toBe(true)
    expect(result.hasUShapeValley).toBe(true)
    expect(result.hasCirqueBasin).toBe(true)
    expect(result.hasArrete).toBe(true)
    expect(result.hasHorn).toBe(true)
    expect(result.hasNoAvalanche).toBe(false)
    expect(result.hasNoRockfall).toBe(true)
    expect(result.avalancheCount).toBe(1)
    expect(result.rockfallCount).toBe(0)
  })

  it('measureCarving on EMPTY returns power 25 no-carving', () => {
    const result = measureCarving(EMPTY)
    expect(result.power).toBe(25)
    expect(result.style).toBe('no-carving')
  })

  it('measureMoraine on RICH returns stability 100 terminal', () => {
    const result = measureMoraine(RICH)
    expect(result.stability).toBe(100)
    expect(result.type).toBe('terminal')
    expect(result.isStable).toBe(true)
    expect(result.hasProperDeposition).toBe(true)
    expect(result.hasSortedMaterial).toBe(true)
    expect(result.hasNoUnstableDebris).toBe(true)
    expect(result.hasErraticBoulders).toBe(true)
    expect(result.hasNoDeadIce).toBe(true)
    expect(result.hasProperDrumlin).toBe(true)
    expect(result.hasEsker).toBe(true)
    expect(result.hasKame).toBe(true)
    expect(result.hasNoKettle).toBe(true)
    expect(result.debrisCount).toBe(0)
  })

  it('measureMoraine on EMPTY returns stability 35 ground', () => {
    const result = measureMoraine(EMPTY)
    expect(result.stability).toBe(35)
    expect(result.type).toBe('ground')
    expect(result.isStable).toBe(false)
  })

  it('measureCrevasse on RICH returns safety 75 shallow', () => {
    const result = measureCrevasse(RICH)
    expect(result.safety).toBe(75)
    expect(result.depth).toBe('shallow')
    expect(result.isSafe).toBe(false)
    expect(result.hasProperBridging).toBe(true)
    expect(result.hasSnowBridge).toBe(true)
    expect(result.hasProperRoping).toBe(true)
    expect(result.hasRescuePlan).toBe(true)
    expect(result.hasNoBergschrund).toBe(true)
    expect(result.hasAnchorPoints).toBe(true)
    expect(result.hiddenCrevasseCount).toBe(1)
  })

  it('measureCrevasse on EMPTY returns safety 45 bergschrund', () => {
    const result = measureCrevasse(EMPTY)
    expect(result.safety).toBe(45)
    expect(result.depth).toBe('bergschrund')
    expect(result.hasProperBridging).toBe(false)
  })

  it('measureAge on RICH returns depth 100 pleistocene', () => {
    const result = measureAge(RICH)
    expect(result.depth).toBe(100)
    expect(result.era).toBe('pleistocene')
    expect(result.isMature).toBe(true)
    expect(result.hasIceCore).toBe(true)
    expect(result.hasDustLayers).toBe(true)
    expect(result.hasOxygenIsotopes).toBe(true)
    expect(result.hasNoPermafrost).toBe(true)
    expect(result.hasNoFossilIce).toBe(true)
    expect(result.fossilCount).toBe(0)
  })

  it('measureAge on EMPTY returns depth 30 recent', () => {
    const result = measureAge(EMPTY)
    expect(result.depth).toBe(30)
    expect(result.era).toBe('recent')
    expect(result.isMature).toBe(false)
  })

  it('measureAdvance on RICH returns rate 90 advancing', () => {
    const result = measureAdvance(RICH)
    expect(result.rate).toBe(90)
    expect(result.status).toBe('advancing')
    expect(result.isAdvancing).toBe(true)
    expect(result.hasProperAccumulation).toBe(true)
    expect(result.hasAblationControl).toBe(true)
    expect(result.hasMassBalance).toBe(true)
    expect(result.hasNoRapidRetreat).toBe(true)
    expect(result.hasNoSurgeRisk).toBe(true)
    expect(result.retreatCount).toBe(0)
  })

  it('measureAdvance on EMPTY returns rate 45 retreating', () => {
    const result = measureAdvance(EMPTY)
    expect(result.rate).toBe(45)
    expect(result.status).toBe('retreating')
    expect(result.isAdvancing).toBe(false)
  })
})

// ─── Specimen Analysis ─────────────────────────────────────────────────────

describe('glacier-carve specimen analysis', () => {
  it('analyzeIceFormation on RICH returns polar-cap qualityScore 88', () => {
    const result = analyzeIceFormation(RICH, 'src/analyzer.ts')
    expect(result.qualityScore).toBe(88)
    expect(result.condition).toBe('polar-cap')
    expect(result.iceDensity).toBe(85)
    expect(result.carvingPower).toBe(80)
    expect(result.moraineStability).toBe(100)
    expect(result.crevasseSafety).toBe(75)
    expect(result.iceAgeDepth).toBe(100)
    expect(result.glacierAdvance).toBe(90)
    expect(result.file).toBe('src/analyzer.ts')
  })

  it('analyzeIceFormation on EMPTY returns piedmont qualityScore 38', () => {
    const result = analyzeIceFormation(EMPTY, 'empty.ts')
    expect(result.qualityScore).toBe(38)
    expect(result.condition).toBe('piedmont')
    expect(result.iceDensity).toBe(50)
  })

  it('analyzeIceFormation on BAD returns puddle qualityScore 10', () => {
    const result = analyzeIceFormation(BAD, 'src/bad.ts')
    expect(result.qualityScore).toBe(10)
    expect(result.condition).toBe('puddle')
    expect(result.advance.status).toBe('vanished')
  })

  it('formation has all measure sub-objects', () => {
    const result = analyzeIceFormation(RICH, 'test.ts')
    expect(result.density).toBeDefined()
    expect(result.carving).toBeDefined()
    expect(result.moraine).toBeDefined()
    expect(result.crevasse).toBeDefined()
    expect(result.age).toBeDefined()
    expect(result.advance).toBeDefined()
  })
})

// ─── Classification Functions ──────────────────────────────────────────────

describe('glacier-carve classification functions', () => {
  it('classifyCondition returns correct conditions', () => {
    expect(classifyCondition(90)).toBe('polar-cap')
    expect(classifyCondition(75)).toBe('alpine-glacier')
    expect(classifyCondition(55)).toBe('valley-glacier')
    expect(classifyCondition(40)).toBe('piedmont')
    expect(classifyCondition(25)).toBe('ice-shelf')
    expect(classifyCondition(10)).toBe('puddle')
  })

  it('classifyGlaciologistGrade returns correct grades', () => {
    expect(classifyGlaciologistGrade(85)).toBe('pioneer-glaciologist')
    expect(classifyGlaciologistGrade(70)).toBe('senior-glaciologist')
    expect(classifyGlaciologistGrade(55)).toBe('glaciologist')
    expect(classifyGlaciologistGrade(40)).toBe('researcher')
    expect(classifyGlaciologistGrade(25)).toBe('student')
    expect(classifyGlaciologistGrade(10)).toBe('tourist')
  })

  it('classifySystemCondition returns correct conditions', () => {
    expect(classifySystemCondition(85)).toBe('polar-stronghold')
    expect(classifySystemCondition(70)).toBe('mountain-fortress')
    expect(classifySystemCondition(55)).toBe('valley-carver')
    expect(classifySystemCondition(40)).toBe('foothills')
    expect(classifySystemCondition(25)).toBe('moraine-field')
    expect(classifySystemCondition(10)).toBe('desert')
  })

  it('classifySystemType returns permafrost for empty array', () => {
    expect(classifySystemType([])).toBe('permafrost')
  })

  it('classifySystemType returns ice-cap for high quality', () => {
    const formations = [
      { qualityScore: 70, condition: 'alpine-glacier' } as any,
    ]
    expect(classifySystemType(formations)).toBe('ice-cap')
  })

  it('classifySystemType returns permafrost for very low quality', () => {
    const formations = [
      { qualityScore: 10, condition: 'puddle' } as any,
    ]
    expect(classifySystemType(formations)).toBe('permafrost')
  })
})

// ─── Build Result ──────────────────────────────────────────────────────────

describe('glacier-carve buildGlacierCarveResult', () => {
  it('returns correct structure for 3-file mix', () => {
    const result = buildGlacierCarveResult(
      ['src/a.ts', 'src/b.ts', 'src/c.ts'],
      [RICH, SIMPLE, BAD],
    )
    expect(result.icefield.overallPower).toBe(45)
    expect(result.icefield.isAdvancing).toBe(false)
    expect(result.icefield.avgDensity).toBe(50)
    expect(result.icefield.avgPower).toBe(38)
    expect(result.icefield.avgStability).toBe(45)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalSystems).toBe(1)
    expect(result.stats.polarCapCount).toBe(1)
    expect(result.stats.puddleCount).toBe(1)
    expect(result.stats.piedmontCount).toBe(1)
    expect(result.stats.glaciologistGrade).toBe('researcher')
    expect(result.stats.bestFormation).toBe('src/a.ts')
    expect(result.stats.densest).toBe('src/a.ts')
    expect(result.stats.mostPowerful).toBe('src/a.ts')
    expect(result.stats.mostStable).toBe('src/a.ts')
    expect(result.stats.safest).toBe('src/a.ts')
    expect(result.stats.mostMature).toBe('src/a.ts')
    expect(result.stats.isDenseCount).toBe(0)
    expect(result.stats.hasDeepImpactCount).toBe(1)
    expect(result.stats.isStableCount).toBe(1)
    expect(result.stats.isSafeCount).toBe(0)
    expect(result.stats.isMatureCount).toBe(1)
    expect(result.stats.isAdvancingCount).toBe(1)
    expect(result.formations).toHaveLength(3)
    expect(result.systems).toHaveLength(1)
    expect(result.systems[0].directory).toBe('src')
    expect(result.systems[0].systemType).toBe('ice-field')
    expect(result.systems[0].condition).toBe('foothills')
    expect(result.systems[0].polarCapCount).toBe(1)
    expect(result.systems[0].puddleCount).toBe(1)
    expect(result.systems[0].denseCount).toBe(0)
    expect(result.systems[0].safeCount).toBe(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty input gracefully', () => {
    const result = buildGlacierCarveResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalSystems).toBe(0)
    expect(result.icefield.overallPower).toBe(0)
    expect(result.icefield.isAdvancing).toBe(false)
    expect(result.stats.glaciologistGrade).toBe('tourist')
    expect(result.formations).toHaveLength(0)
    expect(result.systems).toHaveLength(0)
  })

  it('single RICH file generates crevasse warning', () => {
    const result = buildGlacierCarveResult(['src/a.ts'], [RICH])
    expect(result.recommendations).toContain('1 formation(s) have crevasse hazards — add error handling and reduce nesting')
  })
})

// ─── BAD Fixture Details ───────────────────────────────────────────────────

describe('glacier-carve BAD fixture measures', () => {
  it('measureDensity on BAD returns level 15 slush', () => {
    const result = measureDensity(BAD)
    expect(result.level).toBe(15)
    expect(result.type).toBe('slush')
    expect(result.hasNoAirBubbles).toBe(false)
    expect(result.hasNoMeltwater).toBe(false)
    expect(result.airBubbleCount).toBe(2)
  })

  it('measureMoraine on BAD has debris and dead ice', () => {
    const result = measureMoraine(BAD)
    expect(result.stability).toBe(0)
    expect(result.type).toBe('none')
    expect(result.debrisCount).toBe(3)
    expect(result.deadIceCount).toBe(1)
    expect(result.hasNoUnstableDebris).toBe(false)
  })

  it('measureAdvance on BAD returns rate 0 vanished', () => {
    const result = measureAdvance(BAD)
    expect(result.rate).toBe(0)
    expect(result.status).toBe('vanished')
    expect(result.isAdvancing).toBe(false)
    expect(result.retreatCount).toBe(2)
    expect(result.surgeRiskCount).toBe(1)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('glacier-carve format helpers', () => {
  it('scoreColor returns a string for high score', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })

  it('conditionColor returns a string for each condition', () => {
    expect(typeof conditionColor('polar-cap')).toBe('string')
    expect(typeof conditionColor('alpine-glacier')).toBe('string')
    expect(typeof conditionColor('valley-glacier')).toBe('string')
    expect(typeof conditionColor('piedmont')).toBe('string')
    expect(typeof conditionColor('ice-shelf')).toBe('string')
    expect(typeof conditionColor('puddle')).toBe('string')
  })

  it('conditionColor handles unknown condition', () => {
    expect(conditionColor('unknown')).toBe('unknown')
  })

  it('gradeColor returns a string for each grade', () => {
    expect(typeof gradeColor('pioneer-glaciologist')).toBe('string')
    expect(typeof gradeColor('senior-glaciologist')).toBe('string')
    expect(typeof gradeColor('glaciologist')).toBe('string')
    expect(typeof gradeColor('researcher')).toBe('string')
    expect(typeof gradeColor('student')).toBe('string')
    expect(typeof gradeColor('tourist')).toBe('string')
  })

  it('gradeColor handles unknown grade', () => {
    expect(gradeColor('unknown')).toBe('unknown')
  })

  it('systemTypeColor returns a string for each type', () => {
    expect(typeof systemTypeColor('ice-sheet')).toBe('string')
    expect(typeof systemTypeColor('ice-cap')).toBe('string')
    expect(typeof systemTypeColor('ice-field')).toBe('string')
    expect(typeof systemTypeColor('glacier-complex')).toBe('string')
    expect(typeof systemTypeColor('ice-stream')).toBe('string')
    expect(typeof systemTypeColor('permafrost')).toBe('string')
  })

  it('systemTypeColor handles unknown type', () => {
    expect(systemTypeColor('unknown')).toBe('unknown')
  })

  it('formatGlacierCarveJson returns valid JSON', () => {
    const result = buildGlacierCarveResult(['test.ts'], [SIMPLE])
    const json = formatGlacierCarveJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('formatGlacierCarveTable returns non-empty string', () => {
    const result = buildGlacierCarveResult(['test.ts'], [SIMPLE])
    const table = formatGlacierCarveTable(result, false)
    expect(table.length).toBeGreaterThan(0)
  })

  it('formatGlacierCarveTable verbose includes per-formation', () => {
    const result = buildGlacierCarveResult(['test.ts'], [SIMPLE])
    const table = formatGlacierCarveTable(result, true)
    expect(table).toContain('test.ts')
  })
})

// ─── Counter Functions (sample) ────────────────────────────────────────────

describe('glacier-carve counter functions', () => {
  it('countExports counts export keywords', () => {
    expect(countExports(RICH)).toBe(6)
  })

  it('countImports counts import keywords', () => {
    expect(countImports(RICH)).toBe(2)
  })

  it('countFunctions counts function declarations', () => {
    expect(countFunctions(RICH)).toBe(1)
  })

  it('countClasses counts class declarations', () => {
    expect(countClasses(RICH)).toBe(1)
  })

  it('countInterfaces counts interface declarations', () => {
    expect(countInterfaces(RICH)).toBe(1)
  })

  it('countJSDoc counts JSDoc comments', () => {
    expect(countJSDoc(RICH)).toBe(1)
  })

  it('countAsync counts async keywords', () => {
    expect(countAsync(RICH)).toBe(2)
  })

  it('countTryCatch counts try blocks', () => {
    expect(countTryCatch(RICH)).toBe(1)
  })

  it('countTodos counts TODO/FIXME comments', () => {
    expect(countTodos(BAD)).toBe(1)
  })

  it('countConsole counts console calls', () => {
    expect(countConsole(BAD)).toBe(1)
  })

  it('countAny counts any keywords', () => {
    expect(countAny(BAD)).toBe(1)
  })

  it('countCommentedCode counts commented-out code', () => {
    expect(countCommentedCode(BAD)).toBe(1)
  })

  it('countExports returns 0 for empty string', () => {
    expect(countExports(EMPTY)).toBe(0)
  })
})

// ─── SIMPLE Fixture Details ────────────────────────────────────────────────

describe('glacier-carve SIMPLE fixture measures', () => {
  it('measureDensity on SIMPLE returns level 50 firn', () => {
    const result = measureDensity(SIMPLE)
    expect(result.level).toBe(50)
    expect(result.type).toBe('firn')
    expect(result.hasHighCompression).toBe(false)
    expect(result.hasGlacialFlow).toBe(false)
    expect(result.hasProperCrystal).toBe(false)
  })

  it('measureCarving on SIMPLE returns power 25 no-carving', () => {
    const result = measureCarving(SIMPLE)
    expect(result.power).toBe(25)
    expect(result.style).toBe('no-carving')
    expect(result.hasDeepImpact).toBe(false)
    expect(result.hasNoAvalanche).toBe(true)
  })

  it('measureCrevasse on SIMPLE returns safety 45 bergschrund', () => {
    const result = measureCrevasse(SIMPLE)
    expect(result.safety).toBe(45)
    expect(result.depth).toBe('bergschrund')
    expect(result.isSafe).toBe(false)
  })

  it('measureAge on SIMPLE returns depth 30 recent', () => {
    const result = measureAge(SIMPLE)
    expect(result.depth).toBe(30)
    expect(result.era).toBe('recent')
    expect(result.hasIceCore).toBe(false)
  })

  it('analyzeIceFormation on SIMPLE matches EMPTY values', () => {
    const result = analyzeIceFormation(SIMPLE, 'src/simple.ts')
    expect(result.qualityScore).toBe(38)
    expect(result.condition).toBe('piedmont')
    expect(result.iceDensity).toBe(50)
    expect(result.carvingPower).toBe(25)
  })
})

// ─── Classification Boundary Tests ─────────────────────────────────────────

describe('glacier-carve classification boundaries', () => {
  it('classifyCondition at exact boundaries', () => {
    expect(classifyCondition(80)).toBe('polar-cap')
    expect(classifyCondition(79)).toBe('alpine-glacier')
    expect(classifyCondition(65)).toBe('alpine-glacier')
    expect(classifyCondition(64)).toBe('valley-glacier')
    expect(classifyCondition(50)).toBe('valley-glacier')
    expect(classifyCondition(49)).toBe('piedmont')
    expect(classifyCondition(35)).toBe('piedmont')
    expect(classifyCondition(34)).toBe('ice-shelf')
    expect(classifyCondition(20)).toBe('ice-shelf')
    expect(classifyCondition(19)).toBe('puddle')
  })

  it('classifyGlaciologistGrade at exact boundaries', () => {
    expect(classifyGlaciologistGrade(80)).toBe('pioneer-glaciologist')
    expect(classifyGlaciologistGrade(79)).toBe('senior-glaciologist')
    expect(classifyGlaciologistGrade(65)).toBe('senior-glaciologist')
    expect(classifyGlaciologistGrade(64)).toBe('glaciologist')
    expect(classifyGlaciologistGrade(50)).toBe('glaciologist')
    expect(classifyGlaciologistGrade(49)).toBe('researcher')
    expect(classifyGlaciologistGrade(35)).toBe('researcher')
    expect(classifyGlaciologistGrade(34)).toBe('student')
    expect(classifyGlaciologistGrade(20)).toBe('student')
    expect(classifyGlaciologistGrade(19)).toBe('tourist')
  })

  it('classifySystemType returns ice-field for avg 45', () => {
    expect(classifySystemType([{ qualityScore: 45, condition: 'piedmont' } as any])).toBe('ice-field')
  })

  it('classifySystemType returns glacier-complex for avg 30', () => {
    expect(classifySystemType([{ qualityScore: 30, condition: 'ice-shelf' } as any])).toBe('glacier-complex')
  })

  it('classifySystemCondition at boundaries', () => {
    expect(classifySystemCondition(80)).toBe('polar-stronghold')
    expect(classifySystemCondition(79)).toBe('mountain-fortress')
    expect(classifySystemCondition(65)).toBe('mountain-fortress')
    expect(classifySystemCondition(64)).toBe('valley-carver')
    expect(classifySystemCondition(50)).toBe('valley-carver')
    expect(classifySystemCondition(49)).toBe('foothills')
    expect(classifySystemCondition(35)).toBe('foothills')
    expect(classifySystemCondition(34)).toBe('moraine-field')
    expect(classifySystemCondition(20)).toBe('moraine-field')
    expect(classifySystemCondition(19)).toBe('desert')
  })
})

// ─── Recommendations Tests ─────────────────────────────────────────────────

describe('glacier-carve recommendations', () => {
  it('generates quality warning when overallPower below 50', () => {
    const result = buildGlacierCarveResult(['src/a.ts'], [SIMPLE])
    expect(result.recommendations).toContain('Glacial power is low — increase code density and structural integrity')
  })

  it('generates puddle warning for bad code', () => {
    const result = buildGlacierCarveResult(['src/a.ts', 'src/b.ts', 'src/c.ts'], [SIMPLE, BAD, BAD])
    expect(result.recommendations).toContain('2 formation(s) are puddles — consider complete refactoring')
  })

  it('generates retreat warning for non-advancing formations', () => {
    const result = buildGlacierCarveResult(['src/a.ts', 'src/b.ts', 'src/c.ts'], [SIMPLE, BAD, BAD])
    expect(result.recommendations).toContain('3 formation(s) are retreating — remove technical debt and console usage')
  })

  it('generates carving power warning for weak formations', () => {
    const result = buildGlacierCarveResult(['src/a.ts'], [SIMPLE])
    expect(result.recommendations).toContain('1 formation(s) have weak carving power — add abstractions, classes, and type safety')
  })
})
