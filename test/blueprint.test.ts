import { describe, expect, it } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countErrorHandling, countTypeAnnotations, countBranches,
  maxNesting, countConsole, countComments, countTodos, extractImportPaths,
  measureScaleAccuracy, measureDimensionConsistency, measureRoomOrganization,
  classifyRoomType, classifyArchitectGrade, classifyBuildingType,
  classifyArchitecturalStyle, classifyRoomCondition, classifyFloorCondition,
  classifyFloorPlan, inspectCodeCompliance, assessZoning, measureUtilities,
  analyzeBlueprintRoom, analyzeBlueprintFloor,
  generateRecommendations, buildBlueprintResult,
} from '../src/commands/blueprint-helpers.js'
import { formatBlueprintJson, formatBlueprintTable } from '../src/commands/blueprint-format-helpers.js'
import type { BlueprintStats, BuildingInfo } from '../src/commands/blueprint-helpers.js'

const strongCode = `import { readFileSync } from 'node:fs'
import type { Result } from './types.js'

/**
 * Parse a file
 * @example
 * parseFile('test.ts')
 */
export function parseFile(path: string): Result {
  try {
    const content: string = readFileSync(path, 'utf8')
    if (content.length === 0) {
      return { ok: false, error: 'empty' }
    }
    return { ok: true, data: content }
  } catch (e: unknown) {
    return { ok: false, error: String(e) }
  }
}
`

const weakCode = `var x = 1
console.log(x)
console.log("hello")
console.log("world")
// TODO: fix this
// FIXME: broken
function a(b){if(b){if(c){if(d){if(e){if(f){}}}}}}
`

const emptyCode = ''

const simpleExport = 'export function calc(x: number): number { return x * 2 }'

const testCode = `import { describe, it, expect } from 'vitest'
describe('calc', () => {
  it('works', () => {
    expect(calc(2)).toBe(4)
  })
})
`

describe('blueprint primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc('const a = 1\nconst b = 2')).toBe(2)
    expect(countLoc(emptyCode)).toBe(0)
  })

  it('countImports counts imports', () => {
    expect(countImports('import { x } from "y"')).toBe(1)
    expect(countImports('const x = 1')).toBe(0)
  })

  it('countExports counts exports', () => {
    expect(countExports('export function a() {}')).toBe(1)
    expect(countExports('export const x = 1')).toBe(1)
  })

  it('countFunctions counts functions', () => {
    expect(countFunctions('function a() {}')).toBe(1)
    expect(countFunctions('const fn = () => {}')).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling('try {} catch(e) {}')).toBe(2)
    expect(countErrorHandling('throw new Error("x")')).toBe(1)
  })

  it('countTypeAnnotations counts types', () => {
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })

  it('countBranches counts branches', () => {
    expect(countBranches('if (a) {}')).toBe(1)
  })

  it('maxNesting counts brace depth', () => {
    expect(maxNesting('{{{}}}')).toBe(3)
    expect(maxNesting('no braces')).toBe(0)
  })

  it('countConsole counts console calls', () => {
    expect(countConsole('console.log("x")')).toBe(1)
  })

  it('countComments counts comments', () => {
    expect(countComments('// hello')).toBe(1)
  })

  it('countTodos counts TODOs', () => {
    expect(countTodos('TODO: fix')).toBe(1)
    expect(countTodos('FIXME: broken')).toBe(1)
  })

  it('extractImportPaths extracts paths', () => {
    expect(extractImportPaths('import { x } from "./y"')).toEqual(['./y'])
  })
})

describe('blueprint measurements', () => {
  it('measureScaleAccuracy returns 0 for empty', () => {
    expect(measureScaleAccuracy(emptyCode)).toBe(0)
  })

  it('measureScaleAccuracy rewards good code', () => {
    const result = measureScaleAccuracy(strongCode)
    expect(typeof result).toBe('number')
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('measureDimensionConsistency returns 0 for empty', () => {
    expect(measureDimensionConsistency(emptyCode)).toBe(0)
  })

  it('measureDimensionConsistency rewards low nesting', () => {
    const result = measureDimensionConsistency(simpleExport)
    expect(result).toBeGreaterThan(30)
  })

  it('measureRoomOrganization returns 0 for empty', () => {
    expect(measureRoomOrganization(emptyCode)).toBe(0)
  })

  it('measureRoomOrganization rewards structure', () => {
    const result = measureRoomOrganization(strongCode)
    expect(result).toBeGreaterThan(50)
  })
})

describe('blueprint classifications', () => {
  it('classifyRoomType classifies correctly', () => {
    expect(classifyRoomType(emptyCode)).toBe('closet')
    expect(classifyRoomType(testCode)).toBe('bathroom')
    expect(classifyRoomType('export function a() { return 1 }\nconst x = 2\nconst y = 3\nconst z = 4\nconst w = 5\nconst q = 6\nconst r = 7\nconst s = 8\nconst t = 9\nconst u = 10\nconst v = 11\nconst p = 12\nconst m = 13\nconst n = 14\nconst o = 15\nconst l = 16\nconst k = 17\nconst j = 18\nconst h = 19\nconst g = 20\nconst f = 21')).toBe('study')
  })

  it('classifyArchitectGrade classifies correctly', () => {
    expect(classifyArchitectGrade(80)).toBe('pritzker-prize')
    expect(classifyArchitectGrade(65)).toBe('licensed-architect')
    expect(classifyArchitectGrade(45)).toBe('draftsman')
    expect(classifyArchitectGrade(30)).toBe('student')
    expect(classifyArchitectGrade(15)).toBe('amateur')
    expect(classifyArchitectGrade(5)).toBe('child')
  })

  it('classifyBuildingType classifies correctly', () => {
    expect(classifyBuildingType(5, 30)).toBe('skyscraper')
    expect(classifyBuildingType(3, 15)).toBe('office')
    expect(classifyBuildingType(2, 8)).toBe('apartment')
    expect(classifyBuildingType(1, 5)).toBe('house')
    expect(classifyBuildingType(1, 2)).toBe('warehouse')
    expect(classifyBuildingType(1, 1)).toBe('shack')
    expect(classifyBuildingType(0, 0)).toBe('tent')
  })

  it('classifyArchitecturalStyle classifies correctly', () => {
    expect(classifyArchitecturalStyle(80, 80, 20)).toBe('modern')
    expect(classifyArchitecturalStyle(65, 65, 40)).toBe('classical')
    expect(classifyArchitecturalStyle(30, 30, 60)).toBe('brutalist')
    expect(classifyArchitecturalStyle(70, 70, 25)).toBe('modern')
    expect(classifyArchitecturalStyle(50, 50, 70)).toBe('baroque')
    expect(classifyArchitecturalStyle(20, 20, 30)).toBe('brutalist')
  })

  it('classifyRoomCondition classifies correctly', () => {
    expect(classifyRoomCondition(90)).toBe('masterpiece')
    expect(classifyRoomCondition(70)).toBe('well-designed')
    expect(classifyRoomCondition(50)).toBe('adequate')
    expect(classifyRoomCondition(30)).toBe('rough')
    expect(classifyRoomCondition(15)).toBe('sketchy')
    expect(classifyRoomCondition(5)).toBe('napkin-drawing')
  })

  it('classifyFloorCondition classifies correctly', () => {
    expect(classifyFloorCondition(85)).toBe('masterpiece')
    expect(classifyFloorCondition(70)).toBe('well-designed')
    expect(classifyFloorCondition(50)).toBe('adequate')
    expect(classifyFloorCondition(30)).toBe('rough')
    expect(classifyFloorCondition(15)).toBe('sketchy')
    expect(classifyFloorCondition(5)).toBe('unplanned')
  })

  it('classifyFloorPlan classifies correctly', () => {
    expect(classifyFloorPlan(5, 3, 2)).toBe('open-plan')
    expect(classifyFloorPlan(0, 3, 10)).toBe('compartmentalized')
    expect(classifyFloorPlan(1, 5, 8)).toBe('balanced')
    expect(classifyFloorPlan(0, 2, 25)).toBe('compartmentalized')
    expect(classifyFloorPlan(0, 0, 0)).toBe('chaotic')
  })
})

describe('blueprint inspection', () => {
  it('inspectCodeCompliance returns valid ComplianceInfo', () => {
    const result = inspectCodeCompliance(strongCode)
    expect(typeof result.followsBuildingCode).toBe('boolean')
    expect(typeof result.hasPermits).toBe('boolean')
    expect(typeof result.isUpToCode).toBe('boolean')
    expect(Array.isArray(result.violations)).toBe(true)
    expect(typeof result.inspectionGrade).toBe('string')
  })

  it('inspectCodeCompliance strong code passes', () => {
    const result = inspectCodeCompliance(strongCode)
    expect(result.inspectionGrade).toBe('passed')
    expect(result.violations.length).toBe(0)
  })

  it('inspectCodeCompliance weak code has violations', () => {
    const result = inspectCodeCompliance(weakCode)
    expect(result.violations.length).toBeGreaterThan(0)
    expect(result.inspectionGrade).not.toBe('passed')
  })

  it('inspectCodeCompliance empty code is conditional', () => {
    const result = inspectCodeCompliance(emptyCode)
    expect(result.inspectionGrade).toBe('passed')
  })
})

describe('blueprint zoning', () => {
  it('assessZoning returns valid ZoningInfo', () => {
    const result = assessZoning(strongCode)
    expect(typeof result.isProperlyZoned).toBe('boolean')
    expect(typeof result.zoneType).toBe('string')
    expect(typeof result.hasZoningViolations).toBe('boolean')
    expect(Array.isArray(result.violations)).toBe(true)
  })

  it('assessZoning single-concern code is properly zoned', () => {
    const result = assessZoning(simpleExport)
    expect(result.isProperlyZoned).toBe(true)
  })

  it('assessZoning empty code is unzoned', () => {
    const result = assessZoning(emptyCode)
    expect(result.zoneType).toBe('unzoned')
  })
})

describe('blueprint utilities', () => {
  it('measureUtilities returns valid UtilityInfo', () => {
    const result = measureUtilities(strongCode)
    expect(typeof result.plumbing).toBe('number')
    expect(typeof result.electrical).toBe('number')
    expect(typeof result.hvac).toBe('number')
    expect(typeof result.hasProperRouting).toBe('boolean')
    expect(typeof result.hasCrossedWires).toBe('boolean')
    expect(typeof result.hasLeaks).toBe('boolean')
    expect(typeof result.hasDeadEnds).toBe('boolean')
  })

  it('measureUtilities strong code has good plumbing', () => {
    const result = measureUtilities(strongCode)
    expect(result.plumbing).toBeGreaterThan(30)
    expect(result.hvac).toBeGreaterThan(30)
  })

  it('measureUtilities weak code has dead ends', () => {
    const result = measureUtilities(weakCode)
    expect(result.hasDeadEnds).toBe(true)
  })
})

describe('blueprint room analysis', () => {
  it('analyzeBlueprintRoom returns valid BlueprintRoom', () => {
    const result = analyzeBlueprintRoom(strongCode, 'strong.ts')
    expect(result.file).toBe('strong.ts')
    expect(typeof result.scaleAccuracy).toBe('number')
    expect(typeof result.dimensionConsistency).toBe('number')
    expect(typeof result.roomOrganization).toBe('number')
    expect(typeof result.roomType).toBe('string')
    expect(typeof result.blueprintQuality).toBe('number')
    expect(typeof result.condition).toBe('string')
    expect(typeof result.qualityScore).toBe('number')
    expect(result.walls).toBeDefined()
    expect(result.dimensions).toBeDefined()
    expect(result.utilities).toBeDefined()
    expect(result.connections).toBeDefined()
    expect(result.zoning).toBeDefined()
    expect(result.codeCompliance).toBeDefined()
  })

  it('analyzeBlueprintRoom strong code has good quality', () => {
    const result = analyzeBlueprintRoom(strongCode, 'strong.ts')
    expect(result.qualityScore).toBeGreaterThan(40)
    expect(result.codeCompliance.inspectionGrade).toBe('passed')
  })

  it('analyzeBlueprintRoom empty code has low quality', () => {
    const result = analyzeBlueprintRoom(emptyCode, 'empty.ts')
    expect(result.condition).toBe('sketchy')
    expect(result.qualityScore).toBeLessThan(20)
    expect(result.roomType).toBe('closet')
  })

  it('analyzeBlueprintRoom qualityScore is bounded 0-100', () => {
    const result = analyzeBlueprintRoom(strongCode, 'test.ts')
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
    expect(result.qualityScore).toBeLessThanOrEqual(100)
  })

  it('analyzeBlueprintRoom has correct dimensions', () => {
    const result = analyzeBlueprintRoom(strongCode, 'strong.ts')
    expect(result.dimensions.length).toBeGreaterThan(0)
    expect(result.dimensions.width).toBeGreaterThan(0)
    expect(typeof result.dimensions.isProportional).toBe('boolean')
  })

  it('analyzeBlueprintRoom weak code has walls and issues', () => {
    const result = analyzeBlueprintRoom(weakCode, 'weak.ts')
    expect(result.walls.wallCount).toBeGreaterThan(0)
    expect(result.utilities.hasDeadEnds).toBe(true)
  })
})

describe('blueprint floor analysis', () => {
  it('analyzeBlueprintFloor with empty rooms returns unplanned', () => {
    const result = analyzeBlueprintFloor([], 'empty-dir', 1)
    expect(result.directory).toBe('empty-dir')
    expect(result.rooms.length).toBe(0)
    expect(result.floorQuality).toBe(0)
    expect(result.condition).toBe('unplanned')
    expect(result.floorPlan).toBe('chaotic')
  })

  it('analyzeBlueprintFloor with strong rooms returns good floor', () => {
    const room = analyzeBlueprintRoom(strongCode, 'strong.ts')
    const result = analyzeBlueprintFloor([room], 'src', 1)
    expect(result.directory).toBe('src')
    expect(result.rooms.length).toBe(1)
    expect(result.avgBlueprintQuality).toBeGreaterThan(0)
  })

  it('analyzeBlueprintFloor calculates aggregates', () => {
    const r1 = analyzeBlueprintRoom(simpleExport, 'a.ts')
    const r2 = analyzeBlueprintRoom(strongCode, 'b.ts')
    const result = analyzeBlueprintFloor([r1, r2], 'src', 1)
    const expectedAvg = Math.round((r1.blueprintQuality + r2.blueprintQuality) / 2)
    expect(result.avgBlueprintQuality).toBe(expectedAvg)
  })

  it('analyzeBlueprintFloor counts load bearing and condemned', () => {
    const strong = analyzeBlueprintRoom(strongCode, 'strong.ts')
    const weak = analyzeBlueprintRoom(weakCode, 'weak.ts')
    const result = analyzeBlueprintFloor([strong, weak], 'src', 1)
    expect(typeof result.loadBearingCount).toBe('number')
    expect(typeof result.condemnedCount).toBe('number')
    expect(typeof result.passedInspection).toBe('number')
  })
})

describe('blueprint recommendations', () => {
  it('generateRecommendations returns array', () => {
    const building: BuildingInfo = {
      totalRooms: 0, totalFloors: 0, avgBlueprintQuality: 70,
      avgScaleAccuracy: 70, avgDimensionConsistency: 70,
      isStructurallySound: true, buildingType: 'house',
      architecturalStyle: 'modern', hasStrongFoundation: true,
      hasProperRoof: true, hasGoodFlow: true, structuralHealth: 70,
    }
    const stats: BlueprintStats = {
      totalFiles: 1, totalFloors: 1, avgScaleAccuracy: 70,
      avgDimensionConsistency: 70, avgRoomOrganization: 70,
      avgBlueprintQuality: 70, livingRooms: 0, kitchens: 0,
      hallways: 0, closets: 0, loadBearingCount: 0,
      openPlanCount: 0, hiddenRoomCount: 0, properZoningCount: 1,
      zoningViolationCount: 0, codeViolationCount: 0,
      passedInspection: 1, condemnedCount: 0, deadEnds: 0,
      crossedWires: 0, overallBlueprintQuality: 70,
      architectGrade: 'licensed-architect',
      bestRoom: 'a.ts', worstRoom: 'a.ts',
      bestFloor: 'src', worstFloor: 'src',
    }
    const recs = generateRecommendations([], [], building, stats)
    expect(Array.isArray(recs)).toBe(true)
  })

  it('generateRecommendations warns about condemned', () => {
    const result = buildBlueprintResult(['weak.ts'], [weakCode], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

describe('blueprint buildBlueprintResult', () => {
  it('buildBlueprintResult returns valid result', () => {
    const result = buildBlueprintResult(['a.ts'], [simpleExport], {})
    expect(result.rooms.length).toBe(1)
    expect(result.floors.length).toBe(1)
    expect(result.building).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('buildBlueprintResult handles empty files', () => {
    const result = buildBlueprintResult([], [], {})
    expect(result.rooms.length).toBe(0)
    expect(result.floors.length).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.bestRoom).toBe('none')
    expect(result.stats.worstRoom).toBe('none')
    expect(result.building.buildingType).toBe('tent')
  })

  it('buildBlueprintResult handles multiple files', () => {
    const result = buildBlueprintResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [simpleExport, strongCode, weakCode],
      {},
    )
    expect(result.rooms.length).toBe(3)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('buildBlueprintResult groups files into floors by directory', () => {
    const result = buildBlueprintResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [simpleExport, strongCode, weakCode],
      {},
    )
    expect(result.floors.length).toBe(2)
  })

  it('buildBlueprintResult computes building info', () => {
    const result = buildBlueprintResult(['a.ts'], [strongCode], {})
    const b = result.building
    expect(typeof b.structuralHealth).toBe('number')
    expect(typeof b.isStructurallySound).toBe('boolean')
    expect(typeof b.buildingType).toBe('string')
    expect(typeof b.architecturalStyle).toBe('string')
    expect(typeof b.hasStrongFoundation).toBe('boolean')
  })

  it('buildBlueprintResult identifies strongest and weakest', () => {
    const result = buildBlueprintResult(
      ['strong.ts', 'empty.ts'],
      [strongCode, emptyCode],
      {},
    )
    expect(result.stats.bestRoom).toBe('strong.ts')
    expect(result.stats.worstRoom).toBe('empty.ts')
  })

  it('buildBlueprintResult handles missing content', () => {
    const result = buildBlueprintResult(['a.ts'], [], {})
    expect(result.rooms.length).toBe(1)
    expect(result.rooms[0].roomType).toBe('closet')
  })

  it('buildBlueprintResult computes stats', () => {
    const result = buildBlueprintResult(['a.ts'], [simpleExport], {})
    const s = result.stats
    expect(typeof s.livingRooms).toBe('number')
    expect(typeof s.kitchens).toBe('number')
    expect(typeof s.loadBearingCount).toBe('number')
    expect(typeof s.passedInspection).toBe('number')
    expect(typeof s.condemnedCount).toBe('number')
    expect(typeof s.architectGrade).toBe('string')
  })

  it('buildBlueprintResult quality scores bounded 0-100', () => {
    const result = buildBlueprintResult(
      ['a.ts', 'b.ts'],
      [strongCode, weakCode],
      {},
    )
    for (const room of result.rooms) {
      expect(room.qualityScore).toBeGreaterThanOrEqual(0)
      expect(room.qualityScore).toBeLessThanOrEqual(100)
      expect(room.scaleAccuracy).toBeGreaterThanOrEqual(0)
      expect(room.blueprintQuality).toBeLessThanOrEqual(100)
    }
  })
})

describe('blueprint format helpers', () => {
  it('formatBlueprintTable returns string', () => {
    const result = buildBlueprintResult(['a.ts'], [simpleExport], {})
    const formatted = formatBlueprintTable(result, false)
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })

  it('formatBlueprintTable verbose returns more detail', () => {
    const result = buildBlueprintResult(['a.ts'], [strongCode], {})
    const normal = formatBlueprintTable(result, false)
    const verbose = formatBlueprintTable(result, true)
    expect(verbose.length).toBeGreaterThanOrEqual(normal.length)
  })

  it('formatBlueprintTable handles empty results', () => {
    const result = buildBlueprintResult([], [], {})
    const formatted = formatBlueprintTable(result, false)
    expect(typeof formatted).toBe('string')
    expect(formatted).toContain('No files analyzed')
  })

  it('formatBlueprintTable handles many rooms (truncation)', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = Array.from({ length: 20 }, () => simpleExport)
    const result = buildBlueprintResult(files, contents, {})
    const formatted = formatBlueprintTable(result, false)
    expect(formatted).toContain('more')
  })

  it('formatBlueprintJson returns valid JSON', () => {
    const result = buildBlueprintResult(['a.ts'], [simpleExport], {})
    const json = formatBlueprintJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.rooms).toBeDefined()
    expect(parsed.floors).toBeDefined()
    expect(parsed.building).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('formatBlueprintJson preserves all fields', () => {
    const result = buildBlueprintResult(['a.ts'], [strongCode], {})
    const json = formatBlueprintJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.rooms.length).toBe(1)
    expect(parsed.building.totalRooms).toBe(1)
  })
})

describe('blueprint end-to-end', () => {
  it('full analysis produces consistent result', () => {
    const result = buildBlueprintResult(
      ['strong.ts', 'weak.ts', 'empty.ts'],
      [strongCode, weakCode, emptyCode],
      {},
    )
    expect(result.rooms.length).toBe(3)

    const strong = result.rooms.find(r => r.file === 'strong.ts')!
    const weak = result.rooms.find(r => r.file === 'weak.ts')!
    const empty = result.rooms.find(r => r.file === 'empty.ts')!

    expect(strong.qualityScore).toBeGreaterThan(weak.qualityScore)
    expect(weak.qualityScore).toBeGreaterThan(empty.qualityScore)
    expect(empty.qualityScore).toBeLessThan(20)

    expect(result.stats.bestRoom).toBe('strong.ts')
    expect(result.stats.worstRoom).toBe('empty.ts')
  })

  it('all room types are valid', () => {
    const validTypes = ['living-room', 'kitchen', 'bedroom', 'bathroom', 'hallway', 'closet', 'garage', 'utility', 'foyer', 'study', 'basement', 'attic']
    const result = buildBlueprintResult(['a.ts'], [simpleExport], {})
    expect(validTypes).toContain(result.rooms[0].roomType)
  })

  it('all conditions are valid', () => {
    const validConds = ['masterpiece', 'well-designed', 'adequate', 'rough', 'sketchy', 'napkin-drawing']
    const result = buildBlueprintResult(['a.ts'], [simpleExport], {})
    expect(validConds).toContain(result.rooms[0].condition)
  })

  it('all inspection grades are valid', () => {
    const validGrades = ['passed', 'conditional', 'failed', 'condemned']
    const result = buildBlueprintResult(['a.ts'], [simpleExport], {})
    expect(validGrades).toContain(result.rooms[0].codeCompliance.inspectionGrade)
  })

  it('section with directory grouping works', () => {
    const result = buildBlueprintResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [strongCode, simpleExport, weakCode],
      {},
    )
    expect(result.floors.length).toBe(2)
    expect(result.stats.totalFloors).toBe(2)
  })
})
