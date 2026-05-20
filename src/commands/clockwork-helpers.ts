// ─── Types ─────────────────────────────────────────────────────────────────────

export type GearType = 'drive' | 'driven' | 'idler' | 'compound' | 'planetary' | 'worm'
export type MeshAlignment = 'perfect' | 'aligned' | 'misaligned' | 'stripped'
export type MeshType = 'parameter-passing' | 'return-value' | 'callback' | 'event' | 'inheritance'
export type SpringType = 'tension' | 'compression' | 'torsion' | 'constant-force'
export type MechanismClass = 'swiss-watch' | 'precision' | 'standard' | 'wind-up' | 'broken-clock'
export type OverallCondition = 'mint' | 'excellent' | 'good' | 'fair' | 'needs-repair' | 'broken'
export type ClockworkGrade = 'swiss-chronometer' | 'precision-timepiece' | 'standard-clock' | 'wind-up-toy' | 'stopped-clock'

export interface Gear {
  file: string
  name: string
  type: GearType
  teeth: number
  size: number
  rpm: number
  precision: number
  wear: number
  meshPoints: MeshPoint[]
  isJammed: boolean
  isOverwound: boolean
}

export interface MeshPoint {
  gearA: string
  gearB: string
  alignment: MeshAlignment
  type: MeshType
  friction: number
  lubrication: number
}

export interface Spring {
  name: string
  type: SpringType
  file: string
  wound: number
  isOverwound: boolean
  isUnwound: boolean
  description: string
}

export interface MechanismInspection {
  file: string
  gears: number
  meshPoints: number
  springs: number
  jammedGears: number
  overwoundSprings: number
  precision: number
  lubrication: number
  efficiency: number
  classification: MechanismClass
}

export interface ClockworkStats {
  totalGears: number
  driveGears: number
  idlerGears: number
  jammedGears: number
  totalMeshPoints: number
  perfectMeshes: number
  strippedMeshes: number
  totalSprings: number
  overwoundSprings: number
  unwoundSprings: number
  avgPrecision: number
  avgLubrication: number
  avgEfficiency: number
  swissWatches: number
  brokenClocks: number
  mechanismPrecision: number
  overallCondition: OverallCondition
  clockworkGrade: ClockworkGrade
}

export interface ClockworkResult {
  gears: Gear[]
  meshPoints: MeshPoint[]
  springs: Spring[]
  inspections: MechanismInspection[]
  stats: ClockworkStats
  recommendations: string[]
}

// ─── identifyGears ─────────────────────────────────────────────────────────────

/**
 * Identify code mechanisms (functions/classes) as gears
 * @example
 * identifyGears('export function main() {}', 'a.ts') // Gear[]
 */
export function identifyGears(content: string, filePath: string): Gear[] {
  const gears: Gear[] = []
  const lines = content.split('\n')

  const funcMatches = content.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g) || []
  const classMatches = content.match(/(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/g) || []
  const arrowMatches = content.match(/(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/g) || []
  const methodMatches = content.match(/(?:(?:public|private|protected|static)\s+)*(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*(?::\s*\w+)?\s*[{]/g) || []

  for (const fm of funcMatches) {
    const nameMatch = fm.match(/function\s+(\w+)/)
    const paramMatch = fm.match(/\(([^)]*)\)/)
    const name = nameMatch ? nameMatch[1] : 'anonymous'
    const params = paramMatch && paramMatch[1].trim() ? paramMatch[1].split(',').length : 0
    const isExported = fm.includes('export')

    const lineIdx = content.indexOf(fm)
    const lineNum = content.substring(0, lineIdx).split('\n').length
    const bodyLines = extractBodyLines(lines, lineNum - 1)

    const type = classifyGearType(fm, bodyLines, isExported, content)
    const precision = computeGearPrecision(bodyLines)
    const wear = computeGearWear(bodyLines)
    const rpm = estimateRpm(bodyLines, content)

    gears.push({
      file: filePath,
      name,
      type,
      teeth: params,
      size: bodyLines,
      rpm,
      precision,
      wear,
      meshPoints: [],
      isJammed: precision < 20,
      isOverwound: bodyLines > 50 && wear > 60,
    })
  }

  for (const cm of classMatches) {
    const nameMatch = cm.match(/class\s+(\w+)/)
    const name = nameMatch ? nameMatch[1] : 'anonymous'
    const isExported = cm.includes('export')

    const lineIdx = content.indexOf(cm)
    const lineNum = content.substring(0, lineIdx).split('\n').length
    const bodyLines = extractBodyLines(lines, lineNum - 1)

    const methodCount = (content.match(/(?:async\s+)?\w+\s*\([^)]*\)\s*[{]/g) || []).length

    gears.push({
      file: filePath,
      name,
      type: isExported ? 'drive' : (methodCount > 5 ? 'compound' : 'driven'),
      teeth: methodCount,
      size: bodyLines,
      rpm: isExported ? 80 : 40,
      precision: computeGearPrecision(bodyLines),
      wear: computeGearWear(bodyLines),
      meshPoints: [],
      isJammed: false,
      isOverwound: methodCount > 10,
    })
  }

  for (const am of arrowMatches) {
    const nameMatch = am.match(/const\s+(\w+)/)
    const paramMatch = am.match(/\(([^)]*)\)/)
    const name = nameMatch ? nameMatch[1] : 'anonymous'
    const params = paramMatch && paramMatch[1].trim() ? paramMatch[1].split(',').length : 0
    const isExported = am.includes('export')

    const lineIdx = content.indexOf(am)
    const lineNum = content.substring(0, lineIdx).split('\n').length
    const bodyLines = extractBodyLines(lines, lineNum - 1)

    gears.push({
      file: filePath,
      name,
      type: isExported ? 'drive' : 'idler',
      teeth: params,
      size: bodyLines,
      rpm: isExported ? 70 : 30,
      precision: computeGearPrecision(bodyLines),
      wear: computeGearWear(bodyLines),
      meshPoints: [],
      isJammed: false,
      isOverwound: false,
    })
  }

  return gears
}

// ─── Gear helpers ──────────────────────────────────────────────────────────────

function extractBodyLines(lines: string[], startIdx: number): number {
  let depth = 0
  let count = 0
  let started = false
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i]
    for (const ch of line) {
      if (ch === '{') { depth++; started = true }
      if (ch === '}') depth--
    }
    count++
    if (started && depth <= 0) break
  }
  return Math.max(1, count)
}

function classifyGearType(signature: string, bodyLines: number, isExported: boolean, _content: string): GearType {
  if (isExported) return 'drive'
  if (bodyLines > 30) return 'compound'
  if (/callback|handler|listener/i.test(signature)) return 'worm'
  return 'driven'
}

function computeGearPrecision(bodyLines: number): number {
  let score = 70
  if (bodyLines <= 5) score += 15
  else if (bodyLines <= 15) score += 10
  else if (bodyLines > 100) score -= 55
  else if (bodyLines > 50) score -= 20
  else if (bodyLines > 30) score -= 10
  return Math.max(0, Math.min(100, score))
}

function computeGearWear(bodyLines: number): number {
  let wear = 10
  if (bodyLines > 50) wear += 30
  else if (bodyLines > 30) wear += 15
  return Math.max(0, Math.min(100, wear))
}

function estimateRpm(bodyLines: number, content: string): number {
  let rpm = 30
  if (bodyLines > 20) rpm += 20
  if (/export/.test(content)) rpm += 20
  if (/await|Promise/.test(content)) rpm += 10
  return Math.max(0, Math.min(100, rpm))
}

// ─── analyzeMeshPoints ─────────────────────────────────────────────────────────

/**
 * Analyze interface mesh points between gears
 * @example
 * analyzeMeshPoints(content, 'a.ts', gears) // MeshPoint[]
 */
export function analyzeMeshPoints(content: string, filePath: string, gears: Gear[]): MeshPoint[] {
  const meshPoints: MeshPoint[] = []
  if (gears.length < 2) return meshPoints

  const imports = (content.match(/import\s+.*?from\s+['"][^'"]+['"]/g) || [])
  const funcCalls = (content.match(/\w+\(/g) || [])

  for (let i = 0; i < gears.length - 1; i++) {
    const a = gears[i]
    const b = gears[i + 1]

    const hasParams = a.teeth > 0 || b.teeth > 0
    const hasCallback = /callback|handler|listener/i.test(a.name + b.name)
    const hasInheritance = /extends|implements/.test(content)

    let meshType: MeshType = 'parameter-passing'
    if (hasCallback) meshType = 'callback'
    else if (hasInheritance) meshType = 'inheritance'
    else if (funcCalls.length > gears.length * 2) meshType = 'return-value'

    const friction = computeFriction(a, b)
    const lubrication = computeLubricationAtPoint(content, a, b)

    meshPoints.push({
      gearA: `${filePath}:${a.name}`,
      gearB: `${filePath}:${b.name}`,
      alignment: classifyAlignment(friction, lubrication),
      type: meshType,
      friction,
      lubrication,
    })
  }

  if (imports.length > 0 && gears.length > 0) {
    const mainGear = gears.find(g => g.type === 'drive') || gears[0]
    meshPoints.push({
      gearA: `${filePath}:${mainGear.name}`,
      gearB: `${filePath}:imports`,
      alignment: imports.length < 5 ? 'aligned' : 'misaligned',
      type: 'event',
      friction: Math.min(100, imports.length * 8),
      lubrication: 60,
    })
  }

  return meshPoints
}

function computeFriction(a: Gear, b: Gear): number {
  let friction = 20
  friction += Math.abs(a.teeth - b.teeth) * 5
  friction += Math.abs(a.size - b.size) > 20 ? 15 : 0
  if (a.isJammed || b.isJammed) friction += 30
  return Math.max(0, Math.min(100, friction))
}

function computeLubricationAtPoint(content: string, _a: Gear, _b: Gear): number {
  let lub = 50
  if (/try\s*\{/.test(content)) lub += 15
  if (/catch\s*\(/.test(content)) lub += 10
  if (/finally\s*\{/.test(content)) lub += 5
  if (/\.catch\(/.test(content)) lub += 8
  if (/Error|throw/.test(content)) lub += 5
  return Math.max(0, Math.min(100, lub))
}

function classifyAlignment(friction: number, lubrication: number): MeshAlignment {
  if (friction <= 20 && lubrication >= 70) return 'perfect'
  if (friction <= 40 && lubrication >= 50) return 'aligned'
  if (friction <= 60) return 'misaligned'
  return 'stripped'
}

// ─── identifySprings ───────────────────────────────────────────────────────────

/**
 * Identify tension points in code as springs
 * @example
 * identifySprings('function f() { if (x) { if (y) {} } }', 'a.ts') // Spring[]
 */
export function identifySprings(content: string, filePath: string): Spring[] {
  const springs: Spring[] = []
  const lines = content.split('\n')

  const maxNesting = computeMaxNesting(content)
  if (maxNesting >= 3) {
    springs.push({
      name: 'deep-nesting',
      type: 'torsion',
      file: filePath,
      wound: Math.min(100, maxNesting * 20),
      isOverwound: maxNesting >= 6,
      isUnwound: false,
      description: `Deep nesting (${maxNesting} levels) creates twisted control flow`,
    })
  }

  const complexFunctions = lines.filter(l => /function|=>/.test(l) && l.length > 100)
  if (complexFunctions.length > 0) {
    springs.push({
      name: 'long-lines',
      type: 'tension',
      file: filePath,
      wound: Math.min(100, complexFunctions.length * 25),
      isOverwound: complexFunctions.length >= 4,
      isUnwound: false,
      description: `${complexFunctions.length} function line(s) over 100 chars`,
    })
  }

  const setIntervalMatch = content.match(/setInterval|setTimeout|requestAnimationFrame/g) || []
  if (setIntervalMatch.length > 0) {
    springs.push({
      name: 'timers',
      type: 'constant-force',
      file: filePath,
      wound: Math.min(100, setIntervalMatch.length * 30),
      isOverwound: setIntervalMatch.length >= 3,
      isUnwound: false,
      description: `${setIntervalMatch.length} timer(s)/interval(s) provide constant force`,
    })
  }

  const constrainedLines = lines.filter(l => /^\s*(const|readonly|final|sealed)\b/.test(l))
  if (constrainedLines.length > 5) {
    springs.push({
      name: 'constraints',
      type: 'compression',
      file: filePath,
      wound: Math.min(100, constrainedLines.length * 8),
      isOverwound: constrainedLines.length > 15,
      isUnwound: false,
      description: `${constrainedLines.length} constrained declarations`,
    })
  }

  const totalLines = lines.length
  const funcCount = (content.match(/function\s+\w|=>\s*[{(]/g) || []).length
  if (funcCount > 0 && totalLines / funcCount < 3) {
    springs.push({
      name: 'dense-functions',
      type: 'tension',
      file: filePath,
      wound: Math.min(100, Math.round(funcCount * 10)),
      isOverwound: funcCount > 10,
      isUnwound: false,
      description: `${funcCount} functions in ${totalLines} lines — high density`,
    })
  }

  const hasDeadCode = content.includes('TODO') || content.includes('FIXME') || content.includes('HACK')
  if (hasDeadCode) {
    springs.push({
      name: 'dead-code',
      type: 'tension',
      file: filePath,
      wound: 30,
      isOverwound: false,
      isUnwound: true,
      description: 'TODO/FIXME/HACK comments indicate potential dead code',
    })
  }

  return springs
}

function computeMaxNesting(content: string): number {
  let maxDepth = 0
  let depth = 0
  for (const ch of content) {
    if (ch === '{') { depth++; maxDepth = Math.max(maxDepth, depth) }
    if (ch === '}') depth--
  }
  return maxDepth
}

// ─── inspectMechanism ──────────────────────────────────────────────────────────

/**
 * Inspect mechanism for a single file
 * @example
 * inspectMechanism(gears, meshPoints, springs, 'a.ts') // MechanismInspection
 */
export function inspectMechanism(
  gears: Gear[],
  meshPoints: MeshPoint[],
  springs: Spring[],
  filePath: string,
): MechanismInspection {
  const fileGears = gears.filter(g => g.file === filePath)
  const fileMeshes = meshPoints.filter(m => m.gearA.startsWith(filePath) || m.gearB.startsWith(filePath))
  const fileSprings = springs.filter(s => s.file === filePath)

  const precision = computePrecision(fileGears, fileMeshes)
  const lubrication = computeLubrication(fileMeshes)
  const efficiency = computeEfficiency(precision, lubrication, fileGears)
  const jammedCount = fileGears.filter(g => g.isJammed).length
  const classification = classifyMechanism(precision, efficiency, jammedCount)

  return {
    file: filePath,
    gears: fileGears.length,
    meshPoints: fileMeshes.length,
    springs: fileSprings.length,
    jammedGears: jammedCount,
    overwoundSprings: fileSprings.filter(s => s.isOverwound).length,
    precision,
    lubrication,
    efficiency,
    classification,
  }
}

// ─── computePrecision ──────────────────────────────────────────────────────────

/**
 * Compute mechanism precision 0-100
 * @example
 * computePrecision(gears, meshes) // 75
 */
export function computePrecision(gears: Gear[], meshPoints: MeshPoint[]): number {
  if (gears.length === 0) return 50
  const avgGearPrecision = gears.reduce((s, g) => s + g.precision, 0) / gears.length
  const meshPenalty = meshPoints.filter(m => m.alignment === 'stripped').length * 10
  return Math.max(0, Math.min(100, Math.round(avgGearPrecision - meshPenalty)))
}

// ─── computeLubrication ────────────────────────────────────────────────────────

/**
 * Compute lubrication (error handling) 0-100
 * @example
 * computeLubrication(meshes) // 65
 */
export function computeLubrication(meshPoints: MeshPoint[]): number {
  if (meshPoints.length === 0) return 60
  return Math.round(meshPoints.reduce((s, m) => s + m.lubrication, 0) / meshPoints.length)
}

// ─── computeEfficiency ─────────────────────────────────────────────────────────

/**
 * Compute mechanism efficiency 0-100
 * @example
 * computeEfficiency(80, 70, gears) // 75
 */
export function computeEfficiency(precision: number, lubrication: number, gears: Gear[]): number {
  const avgWear = gears.length > 0
    ? gears.reduce((s, g) => s + g.wear, 0) / gears.length
    : 20
  return Math.max(0, Math.min(100, Math.round(
    precision * 0.5 + lubrication * 0.3 + (100 - avgWear) * 0.2,
  )))
}

// ─── classifyMechanism ─────────────────────────────────────────────────────────

/**
 * Classify mechanism quality
 * @example
 * classifyMechanism(90, 85, 0) // 'swiss-watch'
 */
export function classifyMechanism(precision: number, efficiency: number, jammedCount: number): MechanismClass {
  if (jammedCount > 2) return 'broken-clock'
  if (precision >= 80 && efficiency >= 75) return 'swiss-watch'
  if (precision >= 65 && efficiency >= 60) return 'precision'
  if (precision >= 45 && efficiency >= 40) return 'standard'
  if (precision >= 25) return 'wind-up'
  return 'broken-clock'
}

// ─── classifyOverall ───────────────────────────────────────────────────────────

/**
 * Classify overall clockwork condition
 * @example
 * classifyOverall(80, 'good') // 'precision-timepiece'
 */
export function classifyOverall(mechanismPrecision: number, condition: OverallCondition): ClockworkGrade {
  if (mechanismPrecision >= 80 && (condition === 'mint' || condition === 'excellent')) return 'swiss-chronometer'
  if (mechanismPrecision >= 65 && condition !== 'broken') return 'precision-timepiece'
  if (mechanismPrecision >= 45 && condition !== 'needs-repair' && condition !== 'broken') return 'standard-clock'
  if (mechanismPrecision >= 25) return 'wind-up-toy'
  return 'stopped-clock'
}

// ─── classifyCondition ─────────────────────────────────────────────────────────

/**
 * Classify condition from stats
 * @example
 * classifyCondition(5, 0, 80, 70) // 'excellent'
 */
export function classifyCondition(
  jammedGears: number,
  brokenClocks: number,
  avgPrecision: number,
  avgEfficiency: number,
): OverallCondition {
  if (brokenClocks > 0 || jammedGears > 3) return 'broken'
  if (jammedGears > 1) return 'needs-repair'
  if (avgPrecision >= 75 && avgEfficiency >= 70) return 'mint'
  if (avgPrecision >= 60 && avgEfficiency >= 55) return 'excellent'
  if (avgPrecision >= 45 && avgEfficiency >= 40) return 'good'
  if (avgPrecision >= 30) return 'fair'
  return 'needs-repair'
}

// ─── generateRecommendations ───────────────────────────────────────────────────

/**
 * Generate clockwork recommendations
 * @example
 * generateRecommendations(gears, meshes, springs, inspections, stats) // string[]
 */
export function generateRecommendations(
  gears: Gear[],
  meshPoints: MeshPoint[],
  springs: Spring[],
  inspections: MechanismInspection[],
  stats: ClockworkStats,
): string[] {
  const recs: string[] = []

  const jammed = gears.filter(g => g.isJammed)
  if (jammed.length > 0) {
    recs.push(`Debug ${jammed.length} jammed gear(s): ${jammed.map(g => g.name).slice(0, 3).join(', ')}`)
  }

  const stripped = meshPoints.filter(m => m.alignment === 'stripped')
  if (stripped.length > 0) {
    recs.push(`Fix ${stripped.length} stripped mesh(es) — interface mismatches detected`)
  }

  const overwound = springs.filter(s => s.isOverwound)
  if (overwound.length > 0) {
    recs.push(`Simplify ${overwound.length} overwound spring(s) — reduce complexity`)
  }

  const brokenFiles = inspections.filter(i => i.classification === 'broken-clock')
  if (brokenFiles.length > 0) {
    recs.push(`Major refactoring needed for ${brokenFiles.length} broken-clock file(s)`)
  }

  if (stats.avgLubrication < 40) {
    recs.push('Low lubrication — add error handling (try/catch, .catch())')
  }

  if (stats.strippedMeshes > 3) {
    recs.push(`${stats.strippedMeshes} stripped meshes — review interface compatibility`)
  }

  if (stats.unwoundSprings > 2) {
    recs.push(`${stats.unwoundSprings} unwound spring(s) — remove dead code or TODO markers`)
  }

  if (stats.avgPrecision < 40) {
    recs.push('Low average precision — refactor large, complex functions')
  }

  return Array.from(new Set(recs))
}

// ─── buildClockworkResult ──────────────────────────────────────────────────────

/**
 * Build complete clockwork analysis result
 * @example
 * buildClockworkResult(['a.ts'], ['export function main() {}'], {}) // ClockworkResult
 */
export function buildClockworkResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): ClockworkResult {
  const allGears: Gear[] = []
  const allMeshPoints: MeshPoint[] = []
  const allSprings: Spring[] = []
  const inspections: MechanismInspection[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i]
    const filePath = files[i]

    const gears = identifyGears(content, filePath)
    const meshes = analyzeMeshPoints(content, filePath, gears)
    const springs = identifySprings(content, filePath)

    allGears.push(...gears)
    allMeshPoints.push(...meshes)
    allSprings.push(...springs)

    inspections.push(inspectMechanism(gears, meshes, springs, filePath))
  }

  const avg = (arr: number[]) => arr.length > 0
    ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
    : 50

  const avgPrecision = avg(inspections.map(i => i.precision))
  const avgLubrication = avg(inspections.map(i => i.lubrication))
  const avgEfficiency = avg(inspections.map(i => i.efficiency))

  const driveGears = allGears.filter(g => g.type === 'drive').length
  const idlerGears = allGears.filter(g => g.type === 'idler').length
  const jammedGears = allGears.filter(g => g.isJammed).length
  const perfectMeshes = allMeshPoints.filter(m => m.alignment === 'perfect').length
  const strippedMeshes = allMeshPoints.filter(m => m.alignment === 'stripped').length
  const overwoundSprings = allSprings.filter(s => s.isOverwound).length
  const unwoundSprings = allSprings.filter(s => s.isUnwound).length
  const swissWatches = inspections.filter(i => i.classification === 'swiss-watch').length
  const brokenClocks = inspections.filter(i => i.classification === 'broken-clock').length

  const mechanismPrecision = avgPrecision

  const overallCondition = classifyCondition(
    jammedGears, brokenClocks, avgPrecision, avgEfficiency,
  )
  const clockworkGrade = classifyOverall(mechanismPrecision, overallCondition)

  const stats: ClockworkStats = {
    totalGears: allGears.length,
    driveGears,
    idlerGears,
    jammedGears,
    totalMeshPoints: allMeshPoints.length,
    perfectMeshes,
    strippedMeshes,
    totalSprings: allSprings.length,
    overwoundSprings,
    unwoundSprings,
    avgPrecision,
    avgLubrication,
    avgEfficiency,
    swissWatches,
    brokenClocks,
    mechanismPrecision,
    overallCondition,
    clockworkGrade,
  }

  const recommendations = generateRecommendations(allGears, allMeshPoints, allSprings, inspections, stats)

  return { gears: allGears, meshPoints: allMeshPoints, springs: allSprings, inspections, stats, recommendations }
}
