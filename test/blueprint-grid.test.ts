import { describe, expect, it } from 'vitest'
import {
  analyzeBuildingFloor,
  analyzeGridCell,
  buildBlueprintGridResult,
  classifyArchitectGrade,
  classifyCellCondition,
  classifyFloorCondition,
  classifyFloorType,
  countBlankLineGroups,
  countBranches,
  countClasses,
  countComments,
  countConsole,
  countDescriptiveNames,
  countErrorHandling,
  countExports,
  countFunctions,
  countImports,
  countInterfaces,
  countJSDoc,
  countLoc,
  countTodos,
  countTypeAnnotations,
  countValidations,
  generateRecommendations,
  getFunctionSizes,
  maxNesting,
  measureFoundation,
  measureGrid,
  measureRooms,
  measureSpacing,
  measureUtility,
  measureWalls,
} from '../src/commands/blueprint-grid-helpers.js'
import {
  formatBlueprintGridJSON,
  formatBlueprintGridReport,
  formatCellTable,
  formatFloorTable,
  formatBuilding,
  formatStats,
  formatRecommendations,
} from '../src/commands/blueprint-grid-format-helpers.js'

// ─── countLoc ────────────────────────────────────────────

describe('countLoc', () => {
  it('counts lines of code', () => { expect(countLoc('a\nb\nc')).toBe(3) })
  it('ignores blank lines', () => { expect(countLoc('a\n\n\nc')).toBe(2) })
  it('returns 0 for empty', () => { expect(countLoc('')).toBe(0) })
})

// ─── countImports / countExports / countFunctions / countClasses ────

describe('countImports', () => {
  it('counts imports', () => { expect(countImports('import { x } from "y"')).toBe(1) })
  it('returns 0 when none', () => { expect(countImports('const x = 1')).toBe(0) })
})

describe('countExports', () => {
  it('counts exports', () => { expect(countExports('export function a() {}')).toBe(1) })
})

describe('countFunctions', () => {
  it('counts function declarations', () => { expect(countFunctions('function hello() {}')).toBe(1) })
  it('counts arrow functions', () => { expect(countFunctions('const x = () => {}')).toBe(1) })
})

describe('countClasses', () => {
  it('counts classes', () => { expect(countClasses('class A {} class B {}')).toBe(2) })
})

describe('countInterfaces', () => {
  it('counts interfaces', () => { expect(countInterfaces('interface I {} interface J {}')).toBe(2) })
})

// ─── countErrorHandling / countTypeAnnotations / countBranches ────

describe('countErrorHandling', () => {
  it('counts try/catch/throw', () => { expect(countErrorHandling('try {} catch (e) {} throw e')).toBe(3) })
})

describe('countTypeAnnotations', () => {
  it('counts type annotations', () => { expect(countTypeAnnotations('function f(x: string): number {}')).toBe(2) })
})

describe('countBranches', () => {
  it('counts branches', () => { expect(countBranches('if (x) {} else {}')).toBe(2) })
})

// ─── countConsole / countComments / countTodos / countJSDoc ────

describe('countConsole', () => {
  it('counts console calls', () => { expect(countConsole('console.log("a")')).toBe(1) })
})

describe('countComments', () => {
  it('counts comments', () => { expect(countComments('// hello\n/* world */')).toBe(2) })
})

describe('countTodos', () => {
  it('counts TODOs', () => { expect(countTodos('// TODO fix')).toBe(1) })
})

describe('countJSDoc', () => {
  it('counts JSDoc', () => { expect(countJSDoc('/** docs */')).toBe(1) })
})

// ─── maxNesting / countBlankLineGroups ────────────────────

describe('maxNesting', () => {
  it('measures nesting', () => { expect(maxNesting('{{{}}}')).toBe(3) })
})

describe('countBlankLineGroups', () => {
  it('counts blank line groups', () => {
    expect(countBlankLineGroups('a\n\nb\n\nc')).toBe(2)
  })
  it('returns 0 for no blanks', () => {
    expect(countBlankLineGroups('a\nb\nc')).toBe(0)
  })
})

// ─── getFunctionSizes ────────────────────────────────────

describe('getFunctionSizes', () => {
  it('returns sizes of functions', () => {
    const sizes = getFunctionSizes('function big() {\n  a\n  b\n  c\n}\nfunction tiny() {\n  return 1\n}')
    expect(sizes.length).toBeGreaterThanOrEqual(1)
  })
  it('returns empty for no functions', () => {
    expect(getFunctionSizes('const x = 1')).toEqual([])
  })
})

// ─── measureGrid ─────────────────────────────────────────

describe('measureGrid', () => {
  it('detects orthogonal with exports and types', () => {
    const g = measureGrid('export function f(x: number): number { return x }')
    expect(g.isOrthogonal).toBe(true)
  })
  it('detects alignment for structured code', () => {
    const g = measureGrid('export function f(x: number): number { return x }')
    expect(g.isAligned).toBe(true)
  })
  it('detects misalignment for unstructured code', () => {
    const g = measureGrid('const x = 1')
    expect(g.hasMisalignment).toBe(true)
  })
  it('detects diagonals with many branches', () => {
    const code = 'if (a) {} else if (b) {} else if (c) {} else if (d) {}'
    const g = measureGrid(code)
    expect(g.hasDiagonals).toBe(true)
  })
  it('returns fine grid for many functions and types', () => {
    const code = 'function f(x: number): number { return x }\nfunction g(y: string): string { return y }\nfunction h(z: boolean): boolean { return z }\nfunction i(w: void): void {}'
    const g = measureGrid(code)
    expect(g.gridUnit).toBe('fine')
  })
  it('returns irregular for empty', () => {
    const g = measureGrid('')
    expect(g.gridUnit).toBe('irregular')
    expect(g.alignment).toBe(0)
  })
})

// ─── measureSpacing ──────────────────────────────────────

describe('measureSpacing', () => {
  it('detects consistent spacing', () => {
    const code = '/** a */\nfunction a() {}\n\n/** b */\nfunction b() {}'
    const s = measureSpacing(code)
    expect(s.betweenFunctions).toBeGreaterThan(0)
  })
  it('detects crowding with many functions and few blanks', () => {
    const code = 'function a() {}\nfunction b() {}\nfunction c() {}\nfunction d() {}'
    const s = measureSpacing(code)
    expect(s.hasCrowding).toBe(true)
  })
  it('detects breathing room', () => {
    const code = '/** a */\nfunction a() { return 1 }\n\n/** b */\nfunction b() { return 2 }'
    const s = measureSpacing(code)
    expect(s.hasBreathingRoom).toBe(true)
  })
  it('returns 0 for empty', () => {
    const s = measureSpacing('')
    expect(s.betweenFunctions).toBe(0)
  })
})

// ─── measureWalls ────────────────────────────────────────

describe('measureWalls', () => {
  it('detects strong walls with exports and types', () => {
    const w = measureWalls('export function f(x: number): number { return x }')
    expect(w.hasStrongWalls).toBe(true)
  })
  it('detects thin walls without types', () => {
    const w = measureWalls('function f() { return 1 }')
    expect(w.hasThinWalls).toBe(true)
  })
  it('detects cracks with branches and no errors', () => {
    const w = measureWalls('if (x) { if (y) { if (z) {} } }')
    expect(w.hasCracks).toBe(true)
  })
  it('counts load bearing as exported functions', () => {
    const w = measureWalls('export function core() {} function helper() {}')
    expect(w.loadBearingCount).toBe(1)
    expect(w.partition).toBe(1)
  })
  it('returns integrity 0 for empty', () => {
    const w = measureWalls('')
    expect(w.structuralIntegrity).toBe(0)
  })
})

// ─── measureRooms ────────────────────────────────────────

describe('measureRooms', () => {
  it('counts function rooms', () => {
    const r = measureRooms('function a() {}\nfunction b() {}')
    expect(r.count).toBeGreaterThanOrEqual(1)
  })
  it('detects open plan for single large function', () => {
    const lines = Array.from({ length: 15 }, (_, i) => `  line${i}`).join('\n')
    const r = measureRooms(`function big() {\n${lines}\n}`)
    expect(r.hasOpenPlan).toBe(true)
  })
  it('detects closets for tiny functions', () => {
    const r = measureRooms('function tiny() { return 1 }')
    expect(r.hasClosets).toBe(true)
  })
  it('returns 0 count for empty', () => {
    const r = measureRooms('')
    expect(r.count).toBe(0)
  })
})

// ─── measureUtility ──────────────────────────────────────

describe('measureUtility', () => {
  it('detects HVAC with error handling', () => {
    const u = measureUtility('try {} catch (e) {}')
    expect(u.hasHVAC).toBe(true)
  })
  it('detects plumbing with assignments and functions', () => {
    const u = measureUtility('function f() { const x = 1 }')
    expect(u.hasPlumbing).toBe(true)
  })
  it('detects network with fetch', () => {
    const u = measureUtility('fetch("/api")')
    expect(u.hasNetwork).toBe(true)
  })
  it('detects crossover with many branches and no errors', () => {
    const code = 'if (a) {} if (b) {} if (c) {} if (d) {} if (e) {} if (f) {}'
    const u = measureUtility(code)
    expect(u.hasCrossover).toBe(true)
  })
  it('detects clean routing', () => {
    const u = measureUtility('export function f(x: number): number { try { return x } catch (e) { return 0 } }')
    expect(u.hasCleanRouting).toBe(true)
  })
  it('returns routing 0 for empty', () => {
    const u = measureUtility('')
    expect(u.routing).toBe(0)
  })
})

// ─── measureFoundation ───────────────────────────────────

describe('measureFoundation', () => {
  it('detects footings with interfaces', () => {
    const f = measureFoundation('interface I { x: number }')
    expect(f.hasFootings).toBe(true)
  })
  it('detects slab with types but no interfaces', () => {
    const f = measureFoundation('const x: number = 1')
    expect(f.hasSlab).toBe(true)
    expect(f.hasFootings).toBe(false)
  })
  it('detects basement with deep nesting', () => {
    const deep = '{'.repeat(5) + '}'.repeat(5)
    const f = measureFoundation(`function f() { ${deep} }`)
    expect(f.hasBasement).toBe(true)
  })
  it('detects crawlspace with todos', () => {
    const f = measureFoundation('// TODO fix')
    expect(f.hasCrawlspace).toBe(true)
  })
  it('detects settled with errors and no todos', () => {
    const f = measureFoundation('try {} catch (e) {}')
    expect(f.isSettled).toBe(true)
  })
  it('returns depth 0 for empty', () => {
    const f = measureFoundation('')
    expect(f.depth).toBe(0)
  })
})

// ─── classifyCellCondition ───────────────────────────────

describe('classifyCellCondition', () => {
  it('classifies architectural-marvel', () => { expect(classifyCellCondition(90)).toBe('architectural-marvel') })
  it('classifies well-planned', () => { expect(classifyCellCondition(70)).toBe('well-planned') })
  it('classifies code-compliant', () => { expect(classifyCellCondition(55)).toBe('code-compliant') })
  it('classifies needs-permits', () => { expect(classifyCellCondition(35)).toBe('needs-permits') })
  it('classifies condemned-structure', () => { expect(classifyCellCondition(20)).toBe('condemned-structure') })
  it('classifies ruins', () => { expect(classifyCellCondition(5)).toBe('ruins') })
})

// ─── classifyArchitectGrade ──────────────────────────────

describe('classifyArchitectGrade', () => {
  it('pritzker-winner', () => { expect(classifyArchitectGrade(85)).toBe('pritzker-winner') })
  it('licensed-architect', () => { expect(classifyArchitectGrade(70)).toBe('licensed-architect') })
  it('architect', () => { expect(classifyArchitectGrade(50)).toBe('architect') })
  it('draftsman', () => { expect(classifyArchitectGrade(35)).toBe('draftsman') })
  it('builder', () => { expect(classifyArchitectGrade(20)).toBe('builder') })
  it('demolition-crew', () => { expect(classifyArchitectGrade(5)).toBe('demolition-crew') })
})

// ─── classifyFloorType / classifyFloorCondition ──────────

describe('classifyFloorType', () => {
  it('returns crawl-space for empty', () => { expect(classifyFloorType([])).toBe('crawl-space') })
})

describe('classifyFloorCondition', () => {
  it('returns condemned for empty', () => { expect(classifyFloorCondition([])).toBe('condemned') })
})

// ─── analyzeGridCell ─────────────────────────────────────

describe('analyzeGridCell', () => {
  it('returns complete GridCell', () => {
    const cell = analyzeGridCell('export function f(x: number): number { return x }', 'f.ts')
    expect(cell.file).toBe('f.ts')
    expect(cell.gridAlignment).toBeGreaterThanOrEqual(0)
    expect(cell.structuralSpacing).toBeGreaterThanOrEqual(0)
    expect(cell.loadBearingScore).toBeGreaterThanOrEqual(0)
    expect(cell.roomProportions).toBeGreaterThanOrEqual(0)
    expect(cell.utilityRouting).toBeGreaterThanOrEqual(0)
    expect(cell.foundationDepth).toBeGreaterThanOrEqual(0)
    expect(cell.qualityScore).toBeGreaterThanOrEqual(0)
    expect(cell.condition).toBeDefined()
    expect(cell.grid).toBeDefined()
    expect(cell.spacing).toBeDefined()
    expect(cell.walls).toBeDefined()
    expect(cell.rooms).toBeDefined()
    expect(cell.utility).toBeDefined()
    expect(cell.foundation).toBeDefined()
  })
  it('returns qualityScore 0 for empty', () => {
    expect(analyzeGridCell('', 'empty.ts').qualityScore).toBe(0)
  })
})

// ─── analyzeBuildingFloor ────────────────────────────────

describe('analyzeBuildingFloor', () => {
  it('returns complete BuildingFloor', () => {
    const cells = [
      analyzeGridCell('export function a(x: number): number { return x }', 'a.ts'),
      analyzeGridCell('export function b(): string { return "hi" }', 'b.ts'),
    ]
    const floor = analyzeBuildingFloor(cells, 'src')
    expect(floor.directory).toBe('src')
    expect(floor.cells).toHaveLength(2)
    expect(floor.floorType).toBeDefined()
    expect(floor.condition).toBeDefined()
  })
  it('handles empty cells', () => {
    const floor = analyzeBuildingFloor([], 'empty')
    expect(floor.avgAlignment).toBe(0)
    expect(floor.floorType).toBe('crawl-space')
  })
})

// ─── buildBlueprintGridResult ────────────────────────────

describe('buildBlueprintGridResult', () => {
  it('returns complete result', () => {
    const result = buildBlueprintGridResult(
      ['src/a.ts', 'src/b.ts'],
      ['export function a(x: number): number { return x }', 'export function b(): string { return "hi" }'],
      {},
    )
    expect(result.cells).toHaveLength(2)
    expect(result.floors).toHaveLength(1)
    expect(result.building).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })
  it('handles empty input', () => {
    const result = buildBlueprintGridResult([], [], {})
    expect(result.cells).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.building.isStructurallySound).toBe(false)
  })
  it('groups by directory', () => {
    const result = buildBlueprintGridResult(
      ['src/a.ts', 'lib/b.ts'],
      ['export function a() {}', 'export function b() {}'],
      {},
    )
    expect(result.floors).toHaveLength(2)
  })
})

// ─── Format Helpers ──────────────────────────────────────

describe('formatCellTable', () => {
  it('formats empty', () => { expect(formatCellTable([])).toContain('No grid cells') })
  it('formats cells', () => {
    const cell = analyzeGridCell('export function f() {}', 'f.ts')
    expect(formatCellTable([cell])).toContain('f.ts')
  })
})

describe('formatFloorTable', () => {
  it('formats empty', () => { expect(formatFloorTable([])).toContain('No building floors') })
  it('formats floors', () => {
    const result = buildBlueprintGridResult(['a.ts'], ['export function a() {}'], {})
    expect(formatFloorTable(result.floors)).toContain('Directory')
  })
})

describe('formatBuilding', () => {
  it('formats building summary', () => {
    const result = buildBlueprintGridResult(['a.ts'], ['export function a() {}'], {})
    expect(formatBuilding(result.building)).toContain('Building Summary')
  })
})

describe('formatStats', () => {
  it('formats stats', () => {
    const result = buildBlueprintGridResult(['a.ts'], ['export function a() {}'], {})
    expect(formatStats(result.stats)).toContain('Blueprint Statistics')
  })
})

describe('formatRecommendations', () => {
  it('formats empty', () => { expect(formatRecommendations([])).toContain('No recommendations') })
  it('formats recs', () => { expect(formatRecommendations(['Fix types'])).toContain('Fix types') })
})

describe('formatBlueprintGridReport', () => {
  it('formats complete report', () => {
    const result = buildBlueprintGridResult(['a.ts'], ['export function a() {}'], {})
    expect(formatBlueprintGridReport(result)).toContain('Building Summary')
  })
})

describe('formatBlueprintGridJSON', () => {
  it('produces valid JSON', () => {
    const result = buildBlueprintGridResult(['a.ts'], ['export function a() {}'], {})
    const parsed = JSON.parse(formatBlueprintGridJSON(result))
    expect(parsed.cells).toHaveLength(1)
  })
})
