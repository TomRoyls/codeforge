// ─── Type Definitions ────────────────────────────────────

export type GridUnit = 'fine' | 'medium' | 'coarse' | 'irregular'
export type CellCondition = 'architectural-marvel' | 'well-planned' | 'code-compliant' | 'needs-permits' | 'condemned-structure' | 'ruins'
export type FloorType = 'penthouse' | 'office-floor' | 'residential' | 'warehouse' | 'garage' | 'crawl-space'
export type FloorCondition = 'masterpiece' | 'well-built' | 'code-compliant' | 'needs-work' | 'dilapidated' | 'condemned'
export type ArchitectGrade = 'pritzker-winner' | 'licensed-architect' | 'architect' | 'draftsman' | 'builder' | 'demolition-crew'

export interface GridMeasure {
  alignment: number
  isOrthogonal: boolean
  hasDiagonals: boolean
  isAligned: boolean
  hasMisalignment: boolean
  alignmentScore: number
  gridUnit: GridUnit
}

export interface SpacingMeasure {
  betweenFunctions: number
  betweenSections: number
  isConsistent: boolean
  hasCrowding: boolean
  hasGaps: boolean
  hasBreathingRoom: boolean
  crowdingPoints: number
}

export interface WallsMeasure {
  loadBearing: number
  partition: number
  curtain: number
  hasStrongWalls: boolean
  hasThinWalls: boolean
  hasCracks: boolean
  loadBearingCount: number
  crackCount: number
  structuralIntegrity: number
}

export interface RoomsMeasure {
  count: number
  avgSize: number
  maxSize: number
  minSize: number
  hasGrandRoom: boolean
  hasClosets: boolean
  hasHallways: boolean
  hasOpenPlan: boolean
  proportionScore: number
}

export interface UtilityMeasure {
  hasPlumbing: boolean
  hasElectrical: boolean
  hasHVAC: boolean
  hasNetwork: boolean
  routing: number
  hasCrossover: boolean
  hasCleanRouting: boolean
  crossoverCount: number
}

export interface FoundationMeasure {
  depth: number
  hasFootings: boolean
  hasSlab: boolean
  hasBasement: boolean
  hasCrawlspace: boolean
  isSettled: boolean
  settlementScore: number
}

export interface GridCell {
  file: string
  gridAlignment: number
  structuralSpacing: number
  loadBearingScore: number
  roomProportions: number
  utilityRouting: number
  foundationDepth: number
  grid: GridMeasure
  spacing: SpacingMeasure
  walls: WallsMeasure
  rooms: RoomsMeasure
  utility: UtilityMeasure
  foundation: FoundationMeasure
  condition: CellCondition
  qualityScore: number
}

export interface BuildingFloor {
  directory: string
  cells: GridCell[]
  avgAlignment: number
  avgSpacing: number
  avgProportions: number
  avgRouting: number
  marvelCount: number
  condemnedCount: number
  strongWallsCount: number
  floorType: FloorType
  condition: FloorCondition
}

export interface BuildingMeasure {
  avgAlignment: number
  avgSpacing: number
  avgProportions: number
  avgRouting: number
  isStructurallySound: boolean
  overallStructure: number
}

export interface BlueprintGridStats {
  totalFiles: number
  totalFloors: number
  avgGridAlignment: number
  avgStructuralSpacing: number
  avgLoadBearing: number
  avgRoomProportions: number
  avgUtilityRouting: number
  avgFoundationDepth: number
  architecturalMarvelCount: number
  wellPlannedCount: number
  codeCompliantCount: number
  needsPermitsCount: number
  condemnedCount: number
  ruinsCount: number
  orthogonalCount: number
  hasDiagonalsCount: number
  isAlignedCount: number
  hasCrowdingCount: number
  strongWallsCount: number
  hasCracksCount: number
  hasCleanRoutingCount: number
  hasCrossoverCount: number
  isSettledCount: number
  hasFootingsCount: number
  grandRoomCount: number
  openPlanCount: number
  overallStructure: number
  architectGrade: ArchitectGrade
  bestAligned: string
  bestProportioned: string
  strongestWalls: string
  cleanestRouting: string
  mostSettled: string
}

export interface BlueprintGridResult {
  cells: GridCell[]
  floors: BuildingFloor[]
  building: BuildingMeasure
  stats: BlueprintGridStats
  recommendations: string[]
}

// ─── Primitive Counters ──────────────────────────────────

export function countLoc(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter(l => l.trim().length > 0).length
}

export function countImports(content: string): number {
  const m = content.match(/^import\s/gm)
  return m ? m.length : 0
}

export function countExports(content: string): number {
  const m = content.match(/^export\s/gm)
  return m ? m.length : 0
}

export function countFunctions(content: string): number {
  const m = content.match(/\bfunction\s+\w+|\b\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|(?:async\s+)?\([^)]*\)\s*:\s*\w+)/g)
  return m ? m.length : 0
}

export function countClasses(content: string): number {
  const m = content.match(/\bclass\s+\w+/g)
  return m ? m.length : 0
}

export function countInterfaces(content: string): number {
  const m = content.match(/\binterface\s+\w+/g)
  return m ? m.length : 0
}

export function countErrorHandling(content: string): number {
  let count = 0
  const t = content.match(/\btry\s*\{/g); if (t) count += t.length
  const c = content.match(/\bcatch\s/g); if (c) count += c.length
  const th = content.match(/\bthrow\s/g); if (th) count += th.length
  return count
}

export function countTypeAnnotations(content: string): number {
  const m = content.match(/:\s*(?:string|number|boolean|void|null|undefined|never|any|unknown|object|bigint|symbol)(?:\[\])?\b/g)
  return m ? m.length : 0
}

export function countBranches(content: string): number {
  let count = 0
  const i = content.match(/\bif\s*\(/g); if (i) count += i.length
  const e = content.match(/\belse\s/g); if (e) count += e.length
  const s = content.match(/\bswitch\s*\(/g); if (s) count += s.length
  return count
}

export function maxNesting(content: string): number {
  let max = 0, d = 0
  for (const ch of content) {
    if (ch === '{') { d++; if (d > max) max = d }
    if (ch === '}') d = Math.max(0, d - 1)
  }
  return max
}

export function countConsole(content: string): number {
  const m = content.match(/\bconsole\.\w+/g)
  return m ? m.length : 0
}

export function countComments(content: string): number {
  let count = 0
  const s = content.match(/\/\/.*$/gm); if (s) count += s.length
  const b = content.match(/\/\*[\s\S]*?\*\//g); if (b) count += b.length
  return count
}

export function countTodos(content: string): number {
  const m = content.match(/\bTODO\b|\bFIXME\b|\bHACK\b/gi)
  return m ? m.length : 0
}

export function countJSDoc(content: string): number {
  const m = content.match(/\/\*\*[\s\S]*?\*\//g)
  return m ? m.length : 0
}

export function countDescriptiveNames(content: string): number {
  const m = content.match(/\b(?:get|set|is|has|can|should|will|compute|calculate|validate|parse|format|transform|process|handle|build|create|generate|extract|resolve|initialize|configure|update|remove|delete|find|search|check|verify|ensure|assert)\w+/gi)
  return m ? m.length : 0
}

export function countValidations(content: string): number {
  const m = content.match(/\b(typeof|instanceof|\.length\s*[><=!]|\bin\b|\!\s*\w|===|!==)/g)
  return m ? m.length : 0
}

export function getFunctionSizes(content: string): number[] {
  const sizes: number[] = []
  const lines = content.split('\n')
  let depth = 0
  let funcStart = -1
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    for (const ch of line) {
      if (ch === '{') {
        if (depth === 0 && (/\bfunction\b/.test(lines[i] ?? '') || /=>\s*\{/.test(lines[i] ?? '') || /=\s*function/.test(lines[i] ?? ''))) {
          funcStart = i
        }
        depth++
      }
      if (ch === '}') {
        depth--
        if (depth === 0 && funcStart >= 0) {
          sizes.push(i - funcStart + 1)
          funcStart = -1
        }
      }
    }
  }
  return sizes
}

export function countBlankLineGroups(content: string): number {
  const m = content.match(/\n\s*\n/g)
  return m ? m.length : 0
}

// ─── Grid Measurement ────────────────────────────────────

/**
 * Measure grid alignment quality
 * @example
 * measureGrid('export function calc(x: number): number { return x }') // { alignment, ... }
 */
export function measureGrid(content: string): GridMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)

  const alignment = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 20 : 0) +
    (types > 0 ? 20 : 0) +
    (functions > 0 ? 15 : 0) +
    (classes > 0 || interfaces > 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0),
  )))

  const isOrthogonal = exports > 0 && types > 0
  const hasDiagonals = countBranches(content) > 3
  const isAligned = alignment >= 50
  const hasMisalignment = alignment < 30 && loc > 0

  let gridUnit: GridUnit = 'irregular'
  if (functions >= 4 && types >= 4) gridUnit = 'fine'
  else if (functions >= 2 || classes > 0) gridUnit = 'medium'
  else if (loc > 0) gridUnit = 'coarse'

  return { alignment, isOrthogonal, hasDiagonals, isAligned, hasMisalignment, alignmentScore: alignment, gridUnit }
}

// ─── Spacing Measurement ─────────────────────────────────

/**
 * Measure structural spacing quality
 * @example
 * measureSpacing('function a() {}\n\nfunction b() {}') // { betweenFunctions, ... }
 */
export function measureSpacing(content: string): SpacingMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const blankGroups = countBlankLineGroups(content)

  const betweenFunctions = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (functions > 1 && blankGroups >= functions - 1 ? 30 : functions <= 1 ? 20 : 10) +
    (countJSDoc(content) > 0 ? 25 : 0) +
    (countComments(content) > 0 ? 20 : 0) +
    (loc > 0 && functions === 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0),
  )))

  const betweenSections = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (blankGroups > 0 ? 30 : 0) +
    (countComments(content) > 0 ? 30 : 0) +
    (countJSDoc(content) > 0 ? 20 : 0) +
    (loc > 0 ? 20 : 0),
  )))

  const isConsistent = betweenFunctions >= 40 && betweenSections >= 40
  const hasCrowding = functions > 3 && blankGroups < 2
  const hasGaps = blankGroups > functions * 2 && blankGroups > 4
  const hasBreathingRoom = isConsistent && !hasCrowding
  const crowdingPoints = hasCrowding ? Math.max(0, functions - blankGroups - 1) : 0

  return { betweenFunctions, betweenSections, isConsistent, hasCrowding, hasGaps, hasBreathingRoom, crowdingPoints }
}

// ─── Walls Measurement ───────────────────────────────────

/**
 * Measure structural wall quality
 * @example
 * measureWalls('export function core() { try {} catch (e) {} }') // { loadBearing, ... }
 */
export function measureWalls(content: string): WallsMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)

  const exported = Math.min(functions, exports)
  const partition = Math.max(0, functions - exported)
  const curtain = countBranches(content) > exported ? Math.min(countBranches(content) - exported, functions) : 0

  const hasStrongWalls = exported > 0 && types > 0
  const hasThinWalls = functions > 0 && types === 0
  const hasCracks = errors === 0 && countBranches(content) > 2

  const structuralIntegrity = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 25 : 0) +
    (types > 0 ? 25 : 0) +
    (errors > 0 ? 20 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0) +
    (countValidations(content) > 0 ? 15 : 0),
  )))

  return {
    loadBearing: exported, partition, curtain,
    hasStrongWalls, hasThinWalls, hasCracks,
    loadBearingCount: exported, crackCount: hasCracks ? countBranches(content) : 0,
    structuralIntegrity,
  }
}

// ─── Rooms Measurement ───────────────────────────────────

/**
 * Measure room proportions
 * @example
 * measureRooms('function big() { a; b; c; d; e }\nfunction tiny() { return 1 }') // { count, ... }
 */
export function measureRooms(content: string): RoomsMeasure {
  const loc = countLoc(content)
  const funcSizes = getFunctionSizes(content)
  const functions = countFunctions(content)

  const count = functions
  const avgSize = funcSizes.length === 0 ? 0 : Math.round(funcSizes.reduce((s, sz) => s + sz, 0) / funcSizes.length)
  const maxSize = funcSizes.length === 0 ? 0 : Math.max(...funcSizes)
  const minSize = funcSizes.length === 0 ? 0 : Math.min(...funcSizes)

  const hasGrandRoom = maxSize > 0 && funcSizes.length > 1 && maxSize > avgSize * 3
  const hasClosets = minSize > 0 && minSize <= 2
  const hasHallways = funcSizes.some(s => s >= 2 && s <= 4) && funcSizes.length > 1
  const hasOpenPlan = functions === 1 && loc > 10

  const proportionScore = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (functions > 0 ? 20 : 0) +
    (avgSize > 0 && avgSize <= 20 ? 20 : avgSize > 20 ? 5 : 0) +
    (maxSize <= 30 ? 20 : 10) +
    (funcSizes.length > 1 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 15 : 0) +
    (countTypeAnnotations(content) > 0 ? 10 : 0),
  )))

  return { count, avgSize, maxSize, minSize, hasGrandRoom, hasClosets, hasHallways, hasOpenPlan, proportionScore }
}

// ─── Utility Measurement ─────────────────────────────────

/**
 * Measure utility routing quality
 * @example
 * measureUtility('function f() { try {} catch (e) { await fetch("/") } }') // { routing, ... }
 */
export function measureUtility(content: string): UtilityMeasure {
  const loc = countLoc(content)
  const hasPlumbing = /=\s*[^[{]/.test(content) && countFunctions(content) > 0
  const hasElectrical = /\baddEventListener\b|\bcallback\b|\bemit\b|\bon\w+\s*[=(]/.test(content)
  const hasHVAC = countErrorHandling(content) > 0
  const hasNetwork = /\bfetch\b|\bhttp\b|\brequest\b|\bajax\b|\bapi\b/i.test(content)

  const routing = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (countErrorHandling(content) > 0 ? 20 : 0) +
    (countTypeAnnotations(content) > 0 ? 20 : 0) +
    (countExports(content) > 0 ? 15 : 0) +
    (countValidations(content) > 0 ? 15 : 0) +
    (!hasElectrical || countErrorHandling(content) > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0),
  )))

  const hasCrossover = countBranches(content) > 5 && countErrorHandling(content) === 0
  const hasCleanRouting = routing >= 50 && !hasCrossover
  const crossoverCount = hasCrossover ? countBranches(content) - 5 : 0

  return { hasPlumbing, hasElectrical, hasHVAC, hasNetwork, routing, hasCrossover, hasCleanRouting, crossoverCount }
}

// ─── Foundation Measurement ──────────────────────────────

/**
 * Measure foundation depth quality
 * @example
 * measureFoundation('interface I { x: number }\nexport function f(p: I): number { return p.x }') // { depth, ... }
 */
export function measureFoundation(content: string): FoundationMeasure {
  const loc = countLoc(content)
  const types = countTypeAnnotations(content)
  const interfaces = countInterfaces(content)
  const classes = countClasses(content)
  const errors = countErrorHandling(content)
  const nesting = maxNesting(content)

  const depth = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (interfaces > 0 || classes > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (errors > 0 ? 20 : 0) +
    (nesting <= 3 ? 15 : nesting <= 5 ? 8 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0) +
    (countExports(content) > 0 ? 10 : 0),
  )))

  const hasFootings = interfaces > 0 || classes > 0
  const hasSlab = loc > 0 && interfaces === 0 && classes === 0 && types > 0
  const hasBasement = nesting > 3
  const hasCrawlspace = countTodos(content) > 0
  const isSettled = errors > 0 && countTodos(content) === 0
  const settlementScore = depth

  return { depth, hasFootings, hasSlab, hasBasement, hasCrawlspace, isSettled, settlementScore }
}

// ─── Classification ──────────────────────────────────────

export function classifyCellCondition(qualityScore: number): CellCondition {
  if (qualityScore >= 85) return 'architectural-marvel'
  if (qualityScore >= 68) return 'well-planned'
  if (qualityScore >= 50) return 'code-compliant'
  if (qualityScore >= 32) return 'needs-permits'
  if (qualityScore >= 15) return 'condemned-structure'
  return 'ruins'
}

export function classifyFloorType(cells: GridCell[]): FloorType {
  if (cells.length === 0) return 'crawl-space'
  const avg = cells.reduce((s, c) => s + c.qualityScore, 0) / cells.length
  if (avg >= 80) return 'penthouse'
  if (avg >= 62) return 'office-floor'
  if (avg >= 45) return 'residential'
  if (avg >= 28) return 'warehouse'
  if (avg >= 12) return 'garage'
  return 'crawl-space'
}

export function classifyFloorCondition(cells: GridCell[]): FloorCondition {
  if (cells.length === 0) return 'condemned'
  const avg = cells.reduce((s, c) => s + c.qualityScore, 0) / cells.length
  if (avg >= 80) return 'masterpiece'
  if (avg >= 62) return 'well-built'
  if (avg >= 45) return 'code-compliant'
  if (avg >= 28) return 'needs-work'
  if (avg >= 12) return 'dilapidated'
  return 'condemned'
}

export function classifyArchitectGrade(avgStructure: number): ArchitectGrade {
  if (avgStructure >= 80) return 'pritzker-winner'
  if (avgStructure >= 65) return 'licensed-architect'
  if (avgStructure >= 48) return 'architect'
  if (avgStructure >= 32) return 'draftsman'
  if (avgStructure >= 16) return 'builder'
  return 'demolition-crew'
}

// ─── Core Analysis ───────────────────────────────────────

/**
 * Analyze a single file as a grid cell
 * @example
 * analyzeGridCell('export function f(x: number): number { return x }', 'f.ts') // GridCell
 */
export function analyzeGridCell(content: string, filePath: string): GridCell {
  const grid = measureGrid(content)
  const spacing = measureSpacing(content)
  const walls = measureWalls(content)
  const rooms = measureRooms(content)
  const utility = measureUtility(content)
  const foundation = measureFoundation(content)

  const gridAlignment = grid.alignment
  const structuralSpacing = spacing.betweenFunctions
  const loadBearingScore = walls.structuralIntegrity
  const roomProportions = rooms.proportionScore
  const utilityRouting = utility.routing
  const foundationDepth = foundation.depth

  const loc = countLoc(content)
  const qualityScore = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (gridAlignment * 0.18) +
    (structuralSpacing * 0.12) +
    (loadBearingScore * 0.18) +
    (roomProportions * 0.12) +
    (utilityRouting * 0.18) +
    (foundationDepth * 0.22),
  )))

  const condition = classifyCellCondition(qualityScore)

  return {
    file: filePath,
    gridAlignment, structuralSpacing, loadBearingScore, roomProportions, utilityRouting, foundationDepth,
    grid, spacing, walls, rooms, utility, foundation,
    condition, qualityScore,
  }
}

// ─── Building Floor ──────────────────────────────────────

/**
 * Analyze a directory as a building floor
 * @example
 * analyzeBuildingFloor(cells, 'src') // BuildingFloor
 */
export function analyzeBuildingFloor(cells: GridCell[], dirPath: string): BuildingFloor {
  const n = cells.length
  const avgAlignment = n === 0 ? 0 : Math.round(cells.reduce((s, c) => s + c.gridAlignment, 0) / n)
  const avgSpacing = n === 0 ? 0 : Math.round(cells.reduce((s, c) => s + c.structuralSpacing, 0) / n)
  const avgProportions = n === 0 ? 0 : Math.round(cells.reduce((s, c) => s + c.roomProportions, 0) / n)
  const avgRouting = n === 0 ? 0 : Math.round(cells.reduce((s, c) => s + c.utilityRouting, 0) / n)
  const marvelCount = cells.filter(c => c.condition === 'architectural-marvel').length
  const condemnedCount = cells.filter(c => c.condition === 'condemned-structure' || c.condition === 'ruins').length
  const strongWallsCount = cells.filter(c => c.walls.hasStrongWalls).length

  return {
    directory: dirPath, cells,
    avgAlignment, avgSpacing, avgProportions, avgRouting,
    marvelCount, condemnedCount, strongWallsCount,
    floorType: classifyFloorType(cells),
    condition: classifyFloorCondition(cells),
  }
}

// ─── Recommendations ─────────────────────────────────────

/**
 * Generate actionable recommendations
 * @example
 * generateRecommendations(cells, floors, building, stats) // string[]
 */
export function generateRecommendations(
  _cells: GridCell[],
  floors: BuildingFloor[],
  building: BuildingMeasure,
  stats: BlueprintGridStats,
): string[] {
  const recs: string[] = []

  if (stats.condemnedCount + stats.ruinsCount > 0) {
    recs.push(`Structural concerns: ${stats.condemnedCount + stats.ruinsCount} file(s) need rebuilding`)
  }
  if (stats.hasCrowdingCount > stats.totalFiles * 0.3) {
    recs.push('Overcrowded layout - add spacing between functions and sections')
  }
  if (stats.hasCrossoverCount > 0) {
    recs.push(`Tangled utilities: ${stats.hasCrossoverCount} file(s) have crossing data paths`)
  }
  if (stats.hasCracksCount > 0 && stats.hasCleanRoutingCount === 0) {
    recs.push('Cracks in walls - add error handling to strengthen function boundaries')
  }
  if (stats.orthogonalCount === 0 && stats.totalFiles > 0) {
    recs.push('Non-orthogonal layout - add types and exports for consistent patterns')
  }
  if (building.overallStructure >= 70) {
    recs.push('Structurally sound - excellent architectural alignment throughout')
  }
  if (stats.isSettledCount > stats.totalFiles * 0.5) {
    recs.push('Settled foundation - stable abstractions across codebase')
  }
  if (floors.length > 1) {
    const badFloors = floors.filter(f => f.floorType === 'crawl-space' || f.floorType === 'garage')
    if (badFloors.length > 0) {
      recs.push(`Weak floors: ${badFloors.map(f => f.directory).join(', ')} need structural reinforcement`)
    }
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ────────────────────────────────────────

/**
 * Build the complete blueprint-grid result
 * @example
 * buildBlueprintGridResult(['a.ts'], ['export function a() {}'], {}) // BlueprintGridResult
 */
export function buildBlueprintGridResult(files: string[], contents: string[], _options: Record<string, unknown>): BlueprintGridResult {
  const cells: GridCell[] = files.map((file, i) => {
    const content = i < contents.length ? contents[i] : ''
    return analyzeGridCell(content ?? '', file)
  })

  const dirMap = new Map<string, GridCell[]>()
  for (const cell of cells) {
    const parts = cell.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(cell) } else { dirMap.set(dir, [cell]) }
  }

  const floors = Array.from(dirMap.entries()).map(([dir, fs]) =>
    analyzeBuildingFloor(fs, dir),
  )

  const totalFiles = cells.length
  const avg = (fn: (c: GridCell) => number) => totalFiles === 0 ? 0 : Math.round(cells.reduce((s, c) => s + fn(c), 0) / totalFiles)
  const overallStructure = avg(c => c.qualityScore)

  const building: BuildingMeasure = {
    avgAlignment: avg(c => c.gridAlignment),
    avgSpacing: avg(c => c.structuralSpacing),
    avgProportions: avg(c => c.roomProportions),
    avgRouting: avg(c => c.utilityRouting),
    isStructurallySound: overallStructure >= 60,
    overallStructure,
  }

  const condCounts = { marvel: 0, wellPlanned: 0, codeCompliant: 0, needsPermits: 0, condemned: 0, ruins: 0 }
  for (const c of cells) {
    switch (c.condition) {
      case 'architectural-marvel': condCounts.marvel++; break
      case 'well-planned': condCounts.wellPlanned++; break
      case 'code-compliant': condCounts.codeCompliant++; break
      case 'needs-permits': condCounts.needsPermits++; break
      case 'condemned-structure': condCounts.condemned++; break
      case 'ruins': condCounts.ruins++; break
    }
  }

  const stats: BlueprintGridStats = {
    totalFiles,
    totalFloors: floors.length,
    avgGridAlignment: avg(c => c.gridAlignment),
    avgStructuralSpacing: avg(c => c.structuralSpacing),
    avgLoadBearing: avg(c => c.loadBearingScore),
    avgRoomProportions: avg(c => c.roomProportions),
    avgUtilityRouting: avg(c => c.utilityRouting),
    avgFoundationDepth: avg(c => c.foundationDepth),
    architecturalMarvelCount: condCounts.marvel,
    wellPlannedCount: condCounts.wellPlanned,
    codeCompliantCount: condCounts.codeCompliant,
    needsPermitsCount: condCounts.needsPermits,
    condemnedCount: condCounts.condemned,
    ruinsCount: condCounts.ruins,
    orthogonalCount: cells.filter(c => c.grid.isOrthogonal).length,
    hasDiagonalsCount: cells.filter(c => c.grid.hasDiagonals).length,
    isAlignedCount: cells.filter(c => c.grid.isAligned).length,
    hasCrowdingCount: cells.filter(c => c.spacing.hasCrowding).length,
    strongWallsCount: cells.filter(c => c.walls.hasStrongWalls).length,
    hasCracksCount: cells.filter(c => c.walls.hasCracks).length,
    hasCleanRoutingCount: cells.filter(c => c.utility.hasCleanRouting).length,
    hasCrossoverCount: cells.filter(c => c.utility.hasCrossover).length,
    isSettledCount: cells.filter(c => c.foundation.isSettled).length,
    hasFootingsCount: cells.filter(c => c.foundation.hasFootings).length,
    grandRoomCount: cells.filter(c => c.rooms.hasGrandRoom).length,
    openPlanCount: cells.filter(c => c.rooms.hasOpenPlan).length,
    overallStructure,
    architectGrade: classifyArchitectGrade(overallStructure),
    bestAligned: totalFiles === 0 ? 'none' : cells.reduce((b, c) => c.gridAlignment > b.gridAlignment ? c : b).file,
    bestProportioned: totalFiles === 0 ? 'none' : cells.reduce((b, c) => c.roomProportions > b.roomProportions ? c : b).file,
    strongestWalls: totalFiles === 0 ? 'none' : cells.reduce((b, c) => c.walls.structuralIntegrity > b.walls.structuralIntegrity ? c : b).file,
    cleanestRouting: totalFiles === 0 ? 'none' : cells.reduce((b, c) => c.utilityRouting > b.utilityRouting ? c : b).file,
    mostSettled: totalFiles === 0 ? 'none' : cells.reduce((b, c) => c.foundation.settlementScore > b.foundation.settlementScore ? c : b).file,
  }

  const recommendations = generateRecommendations(cells, floors, building, stats)

  return { cells, floors, building, stats, recommendations }
}
