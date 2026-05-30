// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface WallInfo {
  exterior: number
  interior: number
  loadBearing: boolean
  wallThickness: number
  hasOpenPlan: boolean
  hasHiddenRooms: boolean
  wallCount: number
  doorCount: number
  windowCount: number
}

export interface DimensionInfo {
  length: number
  width: number
  height: number
  area: number
  volume: number
  isProportional: boolean
}

export interface UtilityInfo {
  plumbing: number
  electrical: number
  hvac: number
  hasProperRouting: boolean
  hasCrossedWires: boolean
  hasLeaks: boolean
  hasDeadEnds: boolean
}

export interface ConnectionInfo {
  connectsTo: string[]
  hasHallway: boolean
  hasDirectDoor: boolean
  hasSecretPassage: boolean
  trafficLevel: number
}

export interface ZoningInfo {
  isProperlyZoned: boolean
  zoneType: 'residential' | 'commercial' | 'industrial' | 'mixed-use' | 'unzoned'
  hasZoningViolations: boolean
  violations: string[]
}

export interface ComplianceInfo {
  followsBuildingCode: boolean
  hasPermits: boolean
  isUpToCode: boolean
  violations: string[]
  inspectionGrade: 'passed' | 'conditional' | 'failed' | 'condemned'
}

export type RoomType = 'living-room' | 'kitchen' | 'bedroom' | 'bathroom' | 'hallway' | 'closet' | 'garage' | 'utility' | 'foyer' | 'study' | 'basement' | 'attic'

export type RoomCondition = 'masterpiece' | 'well-designed' | 'adequate' | 'rough' | 'sketchy' | 'napkin-drawing'

export interface BlueprintRoom {
  file: string
  roomType: RoomType
  scaleAccuracy: number
  dimensionConsistency: number
  roomOrganization: number
  walls: WallInfo
  dimensions: DimensionInfo
  utilities: UtilityInfo
  connections: ConnectionInfo
  zoning: ZoningInfo
  codeCompliance: ComplianceInfo
  blueprintQuality: number
  condition: RoomCondition
  qualityScore: number
}

export type FloorPlan = 'open-plan' | 'compartmentalized' | 'balanced' | 'labyrinthine' | 'chaotic'
export type FloorCondition = 'masterpiece' | 'well-designed' | 'adequate' | 'rough' | 'sketchy' | 'unplanned'

export interface BlueprintFloor {
  directory: string
  rooms: BlueprintRoom[]
  floorNumber: number
  avgBlueprintQuality: number
  avgScaleAccuracy: number
  avgDimensionConsistency: number
  totalWalls: number
  totalDoors: number
  loadBearingCount: number
  properZoningCount: number
  violationCount: number
  passedInspection: number
  condemnedCount: number
  floorPlan: FloorPlan
  floorQuality: number
  condition: FloorCondition
}

export interface BuildingInfo {
  totalRooms: number
  totalFloors: number
  avgBlueprintQuality: number
  avgScaleAccuracy: number
  avgDimensionConsistency: number
  isStructurallySound: boolean
  buildingType: 'skyscraper' | 'office' | 'house' | 'apartment' | 'warehouse' | 'shack' | 'tent'
  architecturalStyle: 'modern' | 'classical' | 'brutalist' | 'minimalist' | 'baroque' | 'chaotic'
  hasStrongFoundation: boolean
  hasProperRoof: boolean
  hasGoodFlow: boolean
  structuralHealth: number
}

export interface BlueprintStats {
  totalFiles: number
  totalFloors: number
  avgScaleAccuracy: number
  avgDimensionConsistency: number
  avgRoomOrganization: number
  avgBlueprintQuality: number
  livingRooms: number
  kitchens: number
  hallways: number
  closets: number
  loadBearingCount: number
  openPlanCount: number
  hiddenRoomCount: number
  properZoningCount: number
  zoningViolationCount: number
  codeViolationCount: number
  passedInspection: number
  condemnedCount: number
  deadEnds: number
  crossedWires: number
  overallBlueprintQuality: number
  architectGrade: 'pritzker-prize' | 'licensed-architect' | 'draftsman' | 'student' | 'amateur' | 'child'
  bestRoom: string
  worstRoom: string
  bestFloor: string
  worstFloor: string
}

export interface BlueprintResult {
  rooms: BlueprintRoom[]
  floors: BlueprintFloor[]
  building: BuildingInfo
  stats: BlueprintStats
  recommendations: string[]
}

// ─── Content Primitives ──────────────────────────────────────────────────────

/**
 * Count lines of code
 * @example
 * countLoc('const x = 1\nconst y = 2') // 2
 */
export function countLoc(content: string): number {
  return content.split('\n').filter(l => l.trim().length > 0).length
}

/**
 * Count imports
 * @example
 * countImports('import { x } from "y"') // 1
 */
export function countImports(content: string): number {
  return (content.match(/^import\s+/gm) ?? []).length
}

/**
 * Count exports
 * @example
 * countExports('export function a() {}') // 1
 */
export function countExports(content: string): number {
  return (content.match(/\bexport\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+/g) ?? []).length
}

/**
 * Count functions
 * @example
 * countFunctions('function a() {}') // 1
 */
export function countFunctions(content: string): number {
  return (content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)/g) ?? []).length
}

/**
 * Count error handling
 * @example
 * countErrorHandling('try {} catch(e) {}') // 2
 */
export function countErrorHandling(content: string): number {
  return (content.match(/\btry\s*\{|\bcatch\s*\(|\.catch\s*\(|\bthrow\s+/g) ?? []).length
}

/**
 * Count type annotations
 * @example
 * countTypeAnnotations('const x: number = 1') // 1
 */
export function countTypeAnnotations(content: string): number {
  return (content.match(/:\s*(?:string|number|boolean|void|any|never|unknown|object)/g) ?? []).length
}

/**
 * Count branches
 * @example
 * countBranches('if (a) {}') // 1
 */
export function countBranches(content: string): number {
  return (content.match(/\bif\s*\(|\?\s*[^?]\s*:|\bswitch\s*\(/g) ?? []).length
}

/**
 * Measure max nesting depth
 * @example
 * maxNesting('{{{}}}') // 3
 */
export function maxNesting(content: string): number {
  let max = 0
  let cur = 0
  for (const ch of content) {
    if (ch === '{') { cur++; if (cur > max) max = cur }
    else if (ch === '}') { cur = Math.max(0, cur - 1) }
  }
  return max
}

/**
 * Count console statements
 * @example
 * countConsole('console.log("x")') // 1
 */
export function countConsole(content: string): number {
  return (content.match(/console\.\w+\s*\(/g) ?? []).length
}

/**
 * Count comments
 * @example
 * countComments('// hello') // 1
 */
export function countComments(content: string): number {
  return (content.match(/\/\//g) ?? []).length + (content.match(/\/\*/g) ?? []).length
}

/**
 * Count TODO markers
 * @example
 * countTodos('TODO: fix') // 1
 */
export function countTodos(content: string): number {
  return (content.match(/TODO|FIXME|HACK|XXX/gi) ?? []).length
}

/**
 * Extract import paths
 * @example
 * extractImportPaths('import { x } from "./y"') // ["./y"]
 */
export function extractImportPaths(content: string): string[] {
  const matches = content.match(/from\s+['"]([^'"]+)['"]/g) ?? []
  return matches.map(m => {
    const inner = m.match(/['"]([^'"]+)['"]/)
    return inner?.[1] ?? ''
  }).filter((s): s is string => s.length > 0)
}

// ─── Core Measurements ───────────────────────────────────────────────────────

/**
 * Measure scale accuracy (code matches intended purpose)
 * @example
 * measureScaleAccuracy('export function calc() { return 1 }') // number
 */
export function measureScaleAccuracy(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0

  const exports = countExports(content)
  const funcs = countFunctions(content)
  const hasTypes = countTypeAnnotations(content) > 0 ? 20 : 0
  const singleExport = exports === 1 ? 25 : exports <= 3 ? 15 : 5
  const funcRatio = funcs > 0 && exports > 0 ? 20 : 5
  const sizeOk = loc <= 100 ? 20 : loc <= 250 ? 12 : 0
  const hasDocs = countComments(content) > 0 ? 15 : 0

  return Math.min(100, singleExport + funcRatio + hasTypes + sizeOk + hasDocs)
}

/**
 * Measure dimension consistency (consistent abstraction levels)
 * @example
 * measureDimensionConsistency('export function a() {}\nexport function b() {}') // number
 */
export function measureDimensionConsistency(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0

  const lowNesting = maxNesting(content) <= 3 ? 25 : maxNesting(content) <= 5 ? 12 : 0
  const lowBranches = countBranches(content) <= 5 ? 25 : countBranches(content) <= 10 ? 12 : 0
  const hasTypes = countTypeAnnotations(content) > 0 ? 20 : 0
  const balancedExports = (() => {
    const exp = countExports(content)
    return exp >= 1 && exp <= 5 ? 15 : 5
  })()
  const sizeOk = loc <= 150 ? 15 : loc <= 300 ? 8 : 0

  return Math.min(100, lowNesting + lowBranches + hasTypes + balancedExports + sizeOk)
}

/**
 * Measure room organization (internal structure)
 * @example
 * measureRoomOrganization('export function calc() { return 1 }') // number
 */
export function measureRoomOrganization(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0

  const hasImports = countImports(content) > 0 ? 10 : 0
  const hasExports = countExports(content) > 0 ? 10 : 0
  const hasTypes = countTypeAnnotations(content) > 0 ? 15 : 0
  const hasError = countErrorHandling(content) > 0 ? 15 : 0
  const hasDocs = countComments(content) > 0 ? 10 : 0
  const lowNesting = maxNesting(content) <= 3 ? 20 : maxNesting(content) <= 5 ? 10 : 0
  const sizeOk = loc <= 100 ? 20 : loc <= 250 ? 10 : 0

  return Math.min(100, hasImports + hasExports + hasTypes + hasError + hasDocs + lowNesting + sizeOk)
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify room type from content characteristics
 * @example
 * classifyRoomType('export function calc() { return 1 }') // string
 */
export function classifyRoomType(content: string): RoomType {
  const exports = countExports(content)
  const imports = countImports(content)
  const funcs = countFunctions(content)
  const loc = countLoc(content)

  if (exports > 3 && funcs > 3 && loc > 50) return 'living-room'
  if (/test|spec|describe|expect/.test(content)) return 'bathroom'
  if (imports > 3 && exports > 0) return 'kitchen'
  if (exports === 0 && imports > 2) return 'hallway'
  if (loc <= 20 && exports <= 1) return 'closet'
  if (/config|setting|option|env/.test(content)) return 'utility'
  if (exports === 1 && funcs <= 2 && loc <= 50) return 'study'
  if (imports === 0 && exports === 0 && loc > 0) return 'attic'
  if (exports > 0 && imports === 0 && loc <= 30) return 'foyer'
  if (/class\s+\w+/.test(content) && loc > 30) return 'bedroom'
  if (loc > 0) return 'garage'
  return 'basement'
}

/**
 * Classify architect grade from average quality
 * @example
 * classifyArchitectGrade(85) // 'pritzker-prize'
 */
export function classifyArchitectGrade(avgQuality: number): BlueprintStats['architectGrade'] {
  if (avgQuality >= 75) return 'pritzker-prize'
  if (avgQuality >= 60) return 'licensed-architect'
  if (avgQuality >= 40) return 'draftsman'
  if (avgQuality >= 25) return 'student'
  if (avgQuality >= 10) return 'amateur'
  return 'child'
}

/**
 * Classify building type from floor count and room count
 * @example
 * classifyBuildingType(5, 20) // 'skyscraper'
 */
export function classifyBuildingType(floorCount: number, roomCount: number): BuildingInfo['buildingType'] {
  if (floorCount >= 5 && roomCount >= 30) return 'skyscraper'
  if (floorCount >= 3 && roomCount >= 15) return 'office'
  if (floorCount >= 2 && roomCount >= 8) return 'apartment'
  if (roomCount >= 5) return 'house'
  if (roomCount >= 2) return 'warehouse'
  if (roomCount >= 1) return 'shack'
  return 'tent'
}

/**
 * Classify architectural style from metrics
 * @example
 * classifyArchitecturalStyle(80, 80, 20) // 'modern'
 */
export function classifyArchitecturalStyle(
  accuracy: number, consistency: number, complexity: number,
): BuildingInfo['architecturalStyle'] {
  if (accuracy >= 70 && consistency >= 70 && complexity < 50) return 'modern'
  if (accuracy >= 60 && consistency >= 60) return 'classical'
  if (accuracy < 40 && consistency < 40) return 'brutalist'
  if (accuracy >= 60 && complexity < 30) return 'minimalist'
  if (complexity >= 60) return 'baroque'
  return 'chaotic'
}

/**
 * Classify room condition from quality score
 * @example
 * classifyRoomCondition(90) // 'masterpiece'
 */
export function classifyRoomCondition(quality: number): RoomCondition {
  if (quality >= 80) return 'masterpiece'
  if (quality >= 65) return 'well-designed'
  if (quality >= 45) return 'adequate'
  if (quality >= 25) return 'rough'
  if (quality >= 10) return 'sketchy'
  return 'napkin-drawing'
}

/**
 * Classify floor condition from quality
 * @example
 * classifyFloorCondition(80) // 'masterpiece'
 */
export function classifyFloorCondition(quality: number): FloorCondition {
  if (quality >= 80) return 'masterpiece'
  if (quality >= 65) return 'well-designed'
  if (quality >= 45) return 'adequate'
  if (quality >= 25) return 'rough'
  if (quality >= 10) return 'sketchy'
  return 'unplanned'
}

/**
 * Classify floor plan from room composition
 * @example
 * classifyFloorPlan(5, 10, 3) // string
 */
export function classifyFloorPlan(openPlan: number, doors: number, walls: number): FloorPlan {
  if (openPlan > doors && openPlan > 0) return 'open-plan'
  if (walls > doors * 2) return 'compartmentalized'
  if (doors > walls * 0.5 && doors > 0) return 'balanced'
  if (walls > 20) return 'labyrinthine'
  return 'chaotic'
}

// ─── Inspection Functions ────────────────────────────────────────────────────

/**
 * Inspect code compliance
 * @example
 * inspectCodeCompliance(content) // ComplianceInfo
 */
export function inspectCodeCompliance(content: string): ComplianceInfo {
  const loc = countLoc(content)
  const violations: string[] = []

  if (countConsole(content) > 3) violations.push('Excessive console statements')
  if (countTodos(content) > 2) violations.push('Too many TODO markers')
  if (maxNesting(content) > 5) violations.push('Deep nesting')
  if (countErrorHandling(content) === 0 && loc > 20) violations.push('Missing error handling')
  if (countTypeAnnotations(content) === 0 && loc > 15) violations.push('No type annotations')
  if (/\bvar\b/.test(content)) violations.push('Uses var instead of const/let')

  const hasPermits = countComments(content) > 0 || /\/\*\*/.test(content)
  const followsBuildingCode = violations.length <= 1
  const isUpToCode = violations.length === 0

  let inspectionGrade: ComplianceInfo['inspectionGrade'] = 'passed'
  if (violations.length >= 4) inspectionGrade = 'condemned'
  else if (violations.length >= 2) inspectionGrade = 'failed'
  else if (violations.length === 1) inspectionGrade = 'conditional'

  return { followsBuildingCode, hasPermits, isUpToCode, violations, inspectionGrade }
}

/**
 * Assess zoning for a file
 * @example
 * assessZoning(content) // ZoningInfo
 */
export function assessZoning(content: string): ZoningInfo {
  const loc = countLoc(content)
  const violations: string[] = []

  const hasTests = /\bdescribe\b|\bit\b|\bexpect\b/.test(content)
  const hasBusinessLogic = /\breturn\b/.test(content) && countFunctions(content) > 0
  const hasPresentation = countConsole(content) > 2
  const hasDataAccess = /fetch|read|write|query|save|load/.test(content)

  let zoneType: ZoningInfo['zoneType'] = 'unzoned'
  let mixedCount = 0
  if (hasTests) mixedCount++
  if (hasBusinessLogic) mixedCount++
  if (hasPresentation) mixedCount++
  if (hasDataAccess) mixedCount++

  if (mixedCount >= 3) {
    zoneType = 'mixed-use'
    violations.push('Multiple concerns in single file')
  } else if (hasTests) {
    zoneType = 'industrial'
  } else if (hasBusinessLogic && !hasPresentation) {
    zoneType = 'commercial'
  } else if (hasPresentation && !hasBusinessLogic) {
    zoneType = 'residential'
  } else if (hasBusinessLogic) {
    zoneType = 'commercial'
  } else if (loc > 0) {
    zoneType = 'residential'
  }

  const hasZoningViolations = violations.length > 0
  const isProperlyZoned = !hasZoningViolations

  return { isProperlyZoned, zoneType, hasZoningViolations, violations }
}

/**
 * Measure utilities (plumbing=data, electrical=events, hvac=errors)
 * @example
 * measureUtilities(content) // UtilityInfo
 */
export function measureUtilities(content: string): UtilityInfo {
  const loc = countLoc(content)

  const plumbing = Math.min(100, Math.round(
    (countImports(content) > 0 && countExports(content) > 0 ? 30 : 0) +
    (countTypeAnnotations(content) > 0 ? 25 : 0) +
    (/async|await|Promise/.test(content) ? 20 : 0) +
    (loc > 10 && loc <= 200 ? 25 : 10),
  ))

  const electrical = Math.min(100, Math.round(
    (/\breturn\b/.test(content) ? 25 : 0) +
    (countFunctions(content) > 0 ? 25 : 0) +
    (countBranches(content) <= 5 ? 25 : countBranches(content) <= 10 ? 12 : 0) +
    (/callback|emit|subscribe|listener|handler/.test(content) ? 25 : 0),
  ))

  const hvac = Math.min(100, Math.round(
    (countErrorHandling(content) > 0 ? 35 : 0) +
    (/finally/.test(content) ? 15 : 0) +
    (/Error|throw|catch/.test(content) ? 25 : 0) +
    (countConsole(content) <= 1 ? 25 : 5),
  ))

  const hasProperRouting = plumbing >= 50 && electrical >= 40
  const hasCrossedWires = countImports(content) > 5 && countExports(content) > 5
  const hasLeaks = countConsole(content) > 3
  const hasDeadEnds = countTodos(content) > 0 || /TODO|FIXME/.test(content)

  return { plumbing, electrical, hvac, hasProperRouting, hasCrossedWires, hasLeaks, hasDeadEnds }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a blueprint room
 * @example
 * analyzeBlueprintRoom('export function calc() { return 1 }', 'calc.ts') // BlueprintRoom
 */
export function analyzeBlueprintRoom(content: string, filePath: string): BlueprintRoom {
  const scaleAccuracy = measureScaleAccuracy(content)
  const dimensionConsistency = measureDimensionConsistency(content)
  const roomOrganization = measureRoomOrganization(content)

  const loc = countLoc(content)
  const exports = countExports(content)
  const funcs = countFunctions(content)
  const nesting = maxNesting(content)

  const exterior = Math.min(100, Math.round(
    (exports > 0 ? 30 : 0) +
    (countTypeAnnotations(content) > 0 ? 30 : 0) +
    (/\/\*\*/.test(content) ? 20 : 0) +
    (exports <= 3 ? 20 : 5),
  ))

  const interior = Math.min(100, Math.round(
    (nesting <= 3 ? 30 : nesting <= 5 ? 15 : 0) +
    (countBranches(content) <= 5 ? 25 : countBranches(content) <= 10 ? 12 : 0) +
    (loc <= 150 ? 25 : 10) +
    (funcs <= 5 ? 20 : 5),
  ))

  const walls: WallInfo = {
    exterior,
    interior,
    loadBearing: exports >= 3,
    wallThickness: Math.round((exterior + interior) / 2),
    hasOpenPlan: countExports(content) === 0 && loc > 20,
    hasHiddenRooms: countComments(content) === 0 && loc > 30,
    wallCount: Math.max(1, Math.round(nesting + countBranches(content) / 2)),
    doorCount: exports,
    windowCount: Math.min(10, Math.round(funcs / 2)),
  }

  const length = Math.min(100, Math.round(loc / 3))
  const width = Math.min(100, Math.round((exports + funcs) * 8))
  const height = Math.min(100, Math.round(nesting * 15))
  const area = Math.min(100, Math.round(length * width / 100))
  const volume = Math.min(100, Math.round(area * height / 100))
  const isProportional = area > 0 && width > 0 && Math.abs(length - width) < 50

  const dimensions: DimensionInfo = { length, width, height, area, volume, isProportional }

  const utilities = measureUtilities(content)
  const importPaths = extractImportPaths(content)
  const zoning = assessZoning(content)
  const codeCompliance = inspectCodeCompliance(content)

  const imports = countImports(content)
  const connections: ConnectionInfo = {
    connectsTo: importPaths,
    hasHallway: imports > 0 && exports > 0,
    hasDirectDoor: imports > 0 && exports === 0,
    hasSecretPassage: importPaths.some(p => p.startsWith('.')),
    trafficLevel: exports + imports,
  }

  const blueprintQuality = Math.min(100, Math.max(0, Math.round(
    scaleAccuracy * 0.25 +
    dimensionConsistency * 0.25 +
    roomOrganization * 0.2 +
    (codeCompliance.isUpToCode ? 15 : codeCompliance.followsBuildingCode ? 8 : 0) +
    (zoning.isProperlyZoned ? 15 : 5),
  )))

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    blueprintQuality * 0.4 +
    scaleAccuracy * 0.2 +
    dimensionConsistency * 0.2 +
    roomOrganization * 0.2,
  )))

  const condition = classifyRoomCondition(qualityScore)
  const roomType = classifyRoomType(content)

  return {
    file: filePath, roomType, scaleAccuracy, dimensionConsistency,
    roomOrganization, walls, dimensions, utilities, connections,
    zoning, codeCompliance, blueprintQuality, condition, qualityScore,
  }
}

// ─── Floor Analysis ──────────────────────────────────────────────────────────

/**
 * Analyze a directory as a blueprint floor
 * @example
 * analyzeBlueprintFloor(rooms, 'src', 1) // BlueprintFloor
 */
export function analyzeBlueprintFloor(rooms: BlueprintRoom[], dirPath: string, floorNumber: number): BlueprintFloor {
  if (rooms.length === 0) {
    return {
      directory: dirPath, rooms: [], floorNumber,
      avgBlueprintQuality: 0, avgScaleAccuracy: 0, avgDimensionConsistency: 0,
      totalWalls: 0, totalDoors: 0, loadBearingCount: 0,
      properZoningCount: 0, violationCount: 0, passedInspection: 0,
      condemnedCount: 0, floorPlan: 'chaotic', floorQuality: 0, condition: 'unplanned',
    }
  }

  const n = rooms.length
  const avgBlueprintQuality = Math.round(rooms.reduce((s, r) => s + r.blueprintQuality, 0) / n)
  const avgScaleAccuracy = Math.round(rooms.reduce((s, r) => s + r.scaleAccuracy, 0) / n)
  const avgDimensionConsistency = Math.round(rooms.reduce((s, r) => s + r.dimensionConsistency, 0) / n)

  const totalWalls = rooms.reduce((s, r) => s + r.walls.wallCount, 0)
  const totalDoors = rooms.reduce((s, r) => s + r.walls.doorCount, 0)
  const loadBearingCount = rooms.filter(r => r.walls.loadBearing).length
  const properZoningCount = rooms.filter(r => r.zoning.isProperlyZoned).length
  const violationCount = rooms.reduce((s, r) => s + r.zoning.violations.length + r.codeCompliance.violations.length, 0)
  const passedInspection = rooms.filter(r => r.codeCompliance.inspectionGrade === 'passed').length
  const condemnedCount = rooms.filter(r => r.codeCompliance.inspectionGrade === 'condemned').length

  const openPlanRooms = rooms.filter(r => r.walls.hasOpenPlan).length
  const floorPlan = classifyFloorPlan(openPlanRooms, totalDoors, totalWalls)
  const floorQuality = Math.round(
    avgBlueprintQuality * 0.4 + avgScaleAccuracy * 0.3 +
    (properZoningCount / n * 100) * 0.15 + (passedInspection / n * 100) * 0.15,
  )

  return {
    directory: dirPath, rooms, floorNumber,
    avgBlueprintQuality, avgScaleAccuracy, avgDimensionConsistency,
    totalWalls, totalDoors, loadBearingCount,
    properZoningCount, violationCount, passedInspection,
    condemnedCount, floorPlan, floorQuality,
    condition: classifyFloorCondition(floorQuality),
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate blueprint recommendations
 * @example
 * generateRecommendations(rooms, floors, building, stats) // string[]
 */
export function generateRecommendations(
  _rooms: BlueprintRoom[],
  _floors: BlueprintFloor[],
  _building: BuildingInfo,
  stats: BlueprintStats,
): string[] {
  void _building
  const recs: string[] = []

  if (stats.condemnedCount > 0) {
    recs.push(`Condemned rooms: ${stats.condemnedCount} files need rebuilding`)
  }

  if (stats.zoningViolationCount > 0) {
    recs.push(`Zoning violations: ${stats.zoningViolationCount} files have concern mixing`)
  }

  if (stats.crossedWires > 0) {
    recs.push(`Crossed wires: ${stats.crossedWires} files with tangled data flow`)
  }

  if (stats.hiddenRoomCount > 0) {
    recs.push(`Hidden rooms: ${stats.hiddenRoomCount} undocumented files`)
  }

  if (stats.deadEnds > 0) {
    recs.push(`Dead ends: ${stats.deadEnds} files with TODO/FIXME markers`)
  }

  if (stats.overallBlueprintQuality >= 60) {
    recs.push('Solid blueprint: architectural foundation is sound')
  }

  if (stats.bestRoom !== 'none') {
    recs.push(`Best room: ${stats.bestRoom} — use as construction template`)
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete blueprint result from files and contents
 * @example
 * buildBlueprintResult(['a.ts'], ['export function a() {}'], {}) // BlueprintResult
 */
export function buildBlueprintResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): BlueprintResult {
  void options

  const rooms: BlueprintRoom[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeBlueprintRoom(content, file)
    } catch {
      return analyzeBlueprintRoom('', file)
    }
  })

  const dirMap = new Map<string, BlueprintRoom[]>()
  for (const r of rooms) {
    const dir = r.file.includes('/') ? r.file.slice(0, r.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(r) } else { dirMap.set(dir, [r]) }
  }

  const floorEntries = Array.from(dirMap.entries())
  const floors: BlueprintFloor[] = floorEntries.map(([dir, rs], idx) =>
    analyzeBlueprintFloor(rs, dir, idx + 1),
  )

  const n = rooms.length || 1
  const avgBlueprintQuality = Math.round(rooms.reduce((s, r) => s + r.blueprintQuality, 0) / n)
  const avgScaleAccuracy = Math.round(rooms.reduce((s, r) => s + r.scaleAccuracy, 0) / n)
  const avgDimensionConsistency = Math.round(rooms.reduce((s, r) => s + r.dimensionConsistency, 0) / n)
  const avgRoomOrganization = Math.round(rooms.reduce((s, r) => s + r.roomOrganization, 0) / n)

  const complexity = Math.round(rooms.reduce((s, r) => s + r.dimensions.volume, 0) / n)
  const buildingType = classifyBuildingType(floors.length, rooms.length)
  const architecturalStyle = classifyArchitecturalStyle(avgScaleAccuracy, avgDimensionConsistency, complexity)

  const structuralHealth = Math.round(
    avgBlueprintQuality * 0.35 + avgScaleAccuracy * 0.25 +
    avgDimensionConsistency * 0.2 + avgRoomOrganization * 0.2,
  )

  const building: BuildingInfo = {
    totalRooms: rooms.length,
    totalFloors: floors.length,
    avgBlueprintQuality, avgScaleAccuracy, avgDimensionConsistency,
    isStructurallySound: structuralHealth >= 50,
    buildingType, architecturalStyle,
    hasStrongFoundation: rooms.some(r => r.walls.loadBearing),
    hasProperRoof: avgScaleAccuracy >= 50,
    hasGoodFlow: avgDimensionConsistency >= 50,
    structuralHealth,
  }

  const stats: BlueprintStats = {
    totalFiles: files.length,
    totalFloors: floors.length,
    avgScaleAccuracy, avgDimensionConsistency, avgRoomOrganization, avgBlueprintQuality,
    livingRooms: rooms.filter(r => r.roomType === 'living-room').length,
    kitchens: rooms.filter(r => r.roomType === 'kitchen').length,
    hallways: rooms.filter(r => r.roomType === 'hallway').length,
    closets: rooms.filter(r => r.roomType === 'closet').length,
    loadBearingCount: rooms.filter(r => r.walls.loadBearing).length,
    openPlanCount: rooms.filter(r => r.walls.hasOpenPlan).length,
    hiddenRoomCount: rooms.filter(r => r.walls.hasHiddenRooms).length,
    properZoningCount: rooms.filter(r => r.zoning.isProperlyZoned).length,
    zoningViolationCount: rooms.reduce((s, r) => s + r.zoning.violations.length, 0),
    codeViolationCount: rooms.reduce((s, r) => s + r.codeCompliance.violations.length, 0),
    passedInspection: rooms.filter(r => r.codeCompliance.inspectionGrade === 'passed').length,
    condemnedCount: rooms.filter(r => r.codeCompliance.inspectionGrade === 'condemned').length,
    deadEnds: rooms.filter(r => r.utilities.hasDeadEnds).length,
    crossedWires: rooms.filter(r => r.utilities.hasCrossedWires).length,
    overallBlueprintQuality: structuralHealth,
    architectGrade: classifyArchitectGrade(structuralHealth),
    bestRoom: rooms.length > 0
      ? rooms.reduce((b, r) => r.qualityScore > b.qualityScore ? r : b, rooms[0] as typeof rooms[number]).file : 'none',
    worstRoom: rooms.length > 0
      ? rooms.reduce((w, r) => r.qualityScore < w.qualityScore ? r : w, rooms[0] as typeof rooms[number]).file : 'none',
    bestFloor: floors.length > 0
      ? floors.reduce((b, f) => f.floorQuality > b.floorQuality ? f : b, floors[0] as typeof floors[number]).directory : 'none',
    worstFloor: floors.length > 0
      ? floors.reduce((w, f) => f.floorQuality < w.floorQuality ? f : w, floors[0] as typeof floors[number]).directory : 'none',
  }

  const recommendations = generateRecommendations(rooms, floors, building, stats)

  return { rooms, floors, building, stats, recommendations }
}
