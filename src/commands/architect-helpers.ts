// ─── Types ─────────────────────────────────────────────────────────────────────

export type StructureType = 'foundation' | 'load-bearing' | 'wall' | 'partition' | 'facade' | 'decoration'

export type IssueType =
  | 'cracked-foundation'
  | 'load-bearing-overload'
  | 'leaky-roof'
  | 'weak-walls'
  | 'bad-plumbing'
  | 'faulty-wiring'
  | 'poor-ventilation'
  | 'structural-debt'
  | 'code-rot'
  | 'fragile-facade'

export type IssueSeverity = 'cosmetic' | 'minor' | 'major' | 'structural' | 'critical'

export type IssueCost = 'cheap' | 'moderate' | 'expensive' | 'major-renovation'

export type BlueprintGrade = 'masterwork' | 'sound' | 'adequate' | 'substandard' | 'condemned'

export interface StructuralIssue {
  type: IssueType
  severity: IssueSeverity
  description: string
  fix: string
  estimatedCost: IssueCost
}

export interface Blueprint {
  file: string
  structure: StructureType
  floors: number
  rooms: number
  doors: number
  windows: number
  structuralScore: number
  foundationQuality: number
  wallIntegrity: number
  plumbing: number
  electrical: number
  curbAppeal: number
  issues: StructuralIssue[]
  grade: BlueprintGrade
}

export type FloorLayout = 'organized' | 'semi-organized' | 'ad-hoc' | 'chaotic'
export type FloorZoning = 'residential' | 'commercial' | 'industrial' | 'mixed-use' | 'unzoned'

export interface FloorPlan {
  directory: string
  files: string[]
  layout: FloorLayout
  zoning: FloorZoning
  description: string
  issues: string[]
}

export type BuildingCode = 'passing' | 'minor-violations' | 'major-violations' | 'condemned'
export type OverallGrade = 'skyscraper' | 'office-building' | 'house' | 'shed' | 'ruins'

export interface ArchitectStats {
  totalBlueprints: number
  foundations: number
  loadBearing: number
  facades: number
  decorations: number
  avgStructuralScore: number
  avgFoundationQuality: number
  avgWallIntegrity: number
  avgPlumbing: number
  avgElectrical: number
  avgCurbAppeal: number
  masterworkBlueprints: number
  condemnedBlueprints: number
  totalIssues: number
  criticalIssues: number
  structuralIssues: number
  avgFloors: number
  totalFloorPlans: number
  organizedPlans: number
  chaoticPlans: number
  buildingCode: BuildingCode
  overallGrade: OverallGrade
  structuralIntegrity: number
}

export interface ArchitectResult {
  blueprints: Blueprint[]
  floorPlans: FloorPlan[]
  stats: ArchitectStats
  recommendations: string[]
}

// ─── Metric Helpers ────────────────────────────────────────────────────────────

/**
 * Count maximum nesting depth in content
 * @example
 * countFloors('if (a) { if (b) { } }') // 2
 */
function countFloors(content: string): number {
  let max = 0
  let depth = 0
  for (const ch of content) {
    if (ch === '{') { depth++; if (depth > max) max = depth }
    else if (ch === '}') { depth = Math.max(0, depth - 1) }
  }
  return max
}

/**
 * Count logical sections separated by blank lines or comments
 * @example
 * countRooms('a\n\nb\n\nc') // 3
 */
function countRooms(content: string): number {
  const sections = content.split(/\n\s*\n/).filter(s => s.trim().length > 0)
  return Math.max(1, sections.length)
}

/**
 * Count export declarations
 * @example
 * countDoors('export const x = 1; export function f() {}') // 2
 */
function countDoors(content: string): number {
  return (content.match(/export\s+/g) || []).length
}

/**
 * Count import declarations
 * @example
 * countWindows("import { x } from 'y'; import z from 'w'") // 2
 */
function countWindows(content: string): number {
  return (content.match(/import\s+/g) || []).length
}

/**
 * Count error handling patterns
 * @example
 * countErrorHandling('try {} catch(e) {}') // 2
 */
function countErrorHandling(content: string): number {
  const tryCatch = (content.match(/try\s*\{|catch\s*\(/g) || []).length
  const throws = (content.match(/throw\s+/g) || []).length
  return tryCatch + throws
}

/**
 * Count functions and methods
 * @example
 * countFunctions('function foo() {} const bar = () => {}') // 2
 */
function countFunctions(content: string): number {
  const named = (content.match(/function\s+\w+/g) || []).length
  const arrow = (content.match(/=>\s*[{(]/g) || []).length
  return named + arrow
}

/**
 * Count interface/type/abstract patterns
 * @example
 * countAbstractions('interface Foo {} type Bar = {}') // 2
 */
function countAbstractions(content: string): number {
  const ifaces = (content.match(/interface\s+\w+/g) || []).length
  const types = (content.match(/type\s+\w+\s*=/g) || []).length
  const abstracts = (content.match(/abstract\s+/g) || []).length
  return ifaces + types + abstracts
}

function countBranches(content: string): number {
  const ifs = (content.match(/if\s*\(/g) || []).length
  const cases = (content.match(/case\s+/g) || []).length
  return ifs + cases
}


/**
 * Count comment lines
 * @example
 * countComments('// hello') // 1
 */
function countComments(content: string): number {
  const lineComments = (content.match(/\/\/.*$/gm) || []).length
  const blockComments = (content.match(/\/\*[\s\S]*?\*\//g) || []).length
  return lineComments + blockComments
}

// ─── Structure Classification ──────────────────────────────────────────────────

/**
 * Classify the structure type of a file based on content and context
 * @example
 * classifyStructureType('export interface Config {}', 'types.ts', []) // 'foundation'
 */
export function classifyStructureType(content: string, filePath: string, allFiles: string[]): StructureType {
  const exports = countDoors(content)
  const imports = countWindows(content)
  const abstractions = countAbstractions(content)

  const isCoreFile = /core|config|types|interfaces|constants|utils|helpers/i.test(filePath)
  const isInterfaceOnly = abstractions > 0 && countFunctions(content) === 0 && !/class\s+\w+/.test(content)
  const isTestFile = /\.test\.|\.spec\.|__tests__|test\//i.test(filePath)
  const isStyleFile = /\.css|\.scss|\.less|\.style/i.test(filePath)

  if (isStyleFile) return 'decoration'
  if (isInterfaceOnly) return 'facade'

  const isImportedBy = allFiles.filter(f => f !== filePath).length
  if (isCoreFile && exports >= 3) return 'foundation'
  if (isCoreFile && exports >= 1) return 'load-bearing'
  if (exports >= 5 && isImportedBy >= 3) return 'load-bearing'
  if (exports >= 1 && imports >= 1) return 'wall'
  if (exports >= 1) return 'partition'
  if (isTestFile) return 'partition'
  return 'decoration'
}

// ─── Blueprint Evaluation ──────────────────────────────────────────────────────

/**
 * Evaluate a blueprint for a single file
 * @example
 * evaluateBlueprint('export function foo() {}', 'a.ts', []) // Blueprint
 */
export function evaluateBlueprint(content: string, filePath: string, allFiles: string[]): Blueprint {
  const structure = classifyStructureType(content, filePath, allFiles)
  const floors = countFloors(content)
  const rooms = countRooms(content)
  const doors = countDoors(content)
  const windows = countWindows(content)
  const lines = content.split('\n').length

  const exports = doors
  const imports = windows
  const functions = countFunctions(content)
  const abstractions = countAbstractions(content)
  const errorHandling = countErrorHandling(content)
  const hasTypes = /:\s*\w+|interface\s|type\s+\w+/.test(content)

  const structuralScore = Math.max(0, Math.min(100, Math.round(
    40 +
    (exports > 0 ? 15 : 0) +
    (abstractions > 0 ? 10 : 0) +
    (floors <= 4 ? 15 : Math.max(0, 15 - (floors - 4) * 5)) +
    (lines < 300 ? 10 : Math.max(0, 10 - Math.round((lines - 300) / 50))) +
    (functions <= 10 ? 10 : Math.max(0, 10 - (functions - 10)))
  )))

  const foundationQuality = Math.max(0, Math.min(100, Math.round(
    30 +
    (hasTypes ? 20 : 0) +
    (abstractions > 0 ? 15 : 0) +
    (errorHandling > 0 ? 15 : 0) +
    (exports > 0 ? 10 : 0) +
    (structure === 'foundation' ? 10 : 0)
  )))

  const wallIntegrity = Math.max(0, Math.min(100, Math.round(
    40 +
    (exports >= 1 && exports <= 10 ? 20 : exports > 10 ? 5 : 0) +
    (imports >= 1 && imports <= 8 ? 15 : imports > 8 ? 5 : 0) +
    (Math.abs(exports - imports) <= 3 ? 15 : 0) +
    (abstractions > 0 ? 10 : 0)
  )))

  const hasReturnTypes = /\)\s*:\s*\w+/.test(content)
  const hasParams = /\(\s*\w+\s*:/.test(content)
  const branches = countBranches(content)
  const comments = countComments(content)
  const plumbing = Math.max(0, Math.min(100, Math.round(
    35 +
    (hasTypes ? 15 : 0) +
    (hasReturnTypes ? 10 : 0) +
    (hasParams ? 10 : 0) +
    (imports > 0 ? 10 : 0) +
    (errorHandling > 0 ? 10 : 0) +
    (branches <= 10 ? 10 : Math.max(0, 10 - (branches - 10)))
  )))

  const hasAsync = /async|await|Promise/.test(content)
  const hasCallbacks = /callback|\.then\(|\.catch\(/.test(content)
  const electrical = Math.max(0, Math.min(100, Math.round(
    35 +
    (hasAsync ? 15 : 0) +
    (errorHandling > 0 ? 15 : 0) +
    (branches <= 8 ? 15 : Math.max(0, 15 - (branches - 8) * 2)) +
    (hasCallbacks ? 5 : 0) +
    (floors <= 3 ? 15 : Math.max(0, 15 - (floors - 3) * 3))
  )))

  const commentRatio = lines > 0 ? comments / lines : 0
  const hasDescriptiveNames = /\w{4,}/.test(content)
  const curbAppeal = Math.max(0, Math.min(100, Math.round(
    30 +
    (commentRatio >= 0.1 ? 15 : Math.round(commentRatio * 100)) +
    (hasDescriptiveNames ? 10 : 0) +
    (lines < 200 ? 15 : Math.max(0, 15 - Math.round((lines - 200) / 30))) +
    (rooms >= 2 ? 10 : 0) +
    (hasTypes ? 10 : 0) +
    (floors <= 4 ? 10 : 0)
  )))

  const issues = detectStructuralIssues(content, filePath, structure, {
    floors, doors, windows, lines, functions, errorHandling, abstractions, comments, branches,
  })

  const avgScore = (structuralScore + foundationQuality + wallIntegrity + plumbing + electrical + curbAppeal) / 6
  let grade: BlueprintGrade = 'adequate'
  if (avgScore >= 80 && issues.filter(i => i.severity === 'critical').length === 0) grade = 'masterwork'
  else if (avgScore >= 65) grade = 'sound'
  else if (avgScore >= 45) grade = 'adequate'
  else if (avgScore >= 25) grade = 'substandard'
  else grade = 'condemned'

  return {
    file: filePath,
    structure,
    floors,
    rooms,
    doors,
    windows,
    structuralScore,
    foundationQuality,
    wallIntegrity,
    plumbing,
    electrical,
    curbAppeal,
    issues,
    grade,
  }
}

// ─── Structural Issue Detection ────────────────────────────────────────────────

interface ContentMetrics {
  floors: number
  doors: number
  windows: number
  lines: number
  functions: number
  errorHandling: number
  abstractions: number
  comments: number
  branches: number
}

/**
 * Detect structural issues in a file
 * @example
 * detectStructuralIssues('eval("bad")', 'a.ts', 'wall', metrics) // StructuralIssue[]
 */
export function detectStructuralIssues(
  content: string,
  _filePath: string,
  structure: StructureType,
  metrics: ContentMetrics,
): StructuralIssue[] {
  const issues: StructuralIssue[] = []

  if (structure === 'foundation' && !/interface|type\s+\w+\s*=|:\s*\w+/.test(content)) {
    issues.push({
      type: 'cracked-foundation',
      severity: 'structural',
      description: 'Foundation module lacks type definitions',
      fix: 'Add interface and type definitions to strengthen the foundation',
      estimatedCost: 'moderate',
    })
  }

  if (metrics.doors > 15) {
    issues.push({
      type: 'load-bearing-overload',
      severity: metrics.doors > 25 ? 'critical' : 'major',
      description: `${metrics.doors} exports — too many responsibilities for one file`,
      fix: 'Split into focused modules to distribute load',
      estimatedCost: metrics.doors > 25 ? 'major-renovation' : 'expensive',
    })
  }

  if (metrics.errorHandling === 0 && metrics.lines > 30 && /function|=>|async/.test(content)) {
    issues.push({
      type: 'leaky-roof',
      severity: 'major',
      description: 'No error handling — errors will leak through',
      fix: 'Add try/catch blocks and error boundaries',
      estimatedCost: 'moderate',
    })
  }

  if (metrics.floors > 5) {
    issues.push({
      type: 'weak-walls',
      severity: metrics.floors > 7 ? 'structural' : 'major',
      description: `Deep nesting (level ${metrics.floors}) — walls cannot support this depth`,
      fix: 'Flatten nested logic by extracting functions',
      estimatedCost: 'expensive',
    })
  }

  if (/any|as\s+any|@ts-ignore/.test(content)) {
    issues.push({
      type: 'bad-plumbing',
      severity: 'minor',
      description: 'Type safety bypasses detected — plumbing is leaky',
      fix: 'Replace type assertions with proper type narrowing',
      estimatedCost: 'cheap',
    })
  }

  if (metrics.branches > 15) {
    issues.push({
      type: 'faulty-wiring',
      severity: metrics.branches > 25 ? 'major' : 'minor',
      description: `${metrics.branches} control flow branches — wiring is tangled`,
      fix: 'Simplify control flow using early returns and polymorphism',
      estimatedCost: 'moderate',
    })
  }

  if (metrics.comments === 0 && metrics.lines > 20) {
    issues.push({
      type: 'poor-ventilation',
      severity: 'cosmetic',
      description: 'No comments — code needs ventilation for clarity',
      fix: 'Add comments explaining intent for complex sections',
      estimatedCost: 'cheap',
    })
  }

  const todoCount = (content.match(/TODO|FIXME|HACK|XXX/gi) || []).length
  if (todoCount > 3) {
    issues.push({
      type: 'structural-debt',
      severity: todoCount > 8 ? 'major' : 'minor',
      description: `${todoCount} TODO/FIXME markers — structural debt accumulating`,
      fix: 'Resolve outstanding TODOs and FIXMEs',
      estimatedCost: 'moderate',
    })
  }

  const unusedImports = content.match(/import\s+.*from\s+['"].*['"]/g)
  const importNames = unusedImports?.flatMap(m => {
    const match = m.match(/import\s+\{([^}]+)\}/)
    return match ? match?.[1]?.split(',').map(s => s.trim()) : []
  }) || []
  const deadImports = importNames.filter(name => {
    const identifier = name?.replace(/\s+as\s+\w+/, '').trim()
    return identifier && !content.slice(content.indexOf('}') + 1).includes(identifier)
  })
  if (deadImports.length > 2) {
    issues.push({
      type: 'code-rot',
      severity: 'cosmetic',
      description: `${deadImports.length} potentially unused imports — code is rotting`,
      fix: 'Remove unused imports to prevent decay',
      estimatedCost: 'cheap',
    })
  }

  if (structure === 'facade' && metrics.lines > 100 && metrics.floors > 3) {
    issues.push({
      type: 'fragile-facade',
      severity: 'minor',
      description: 'Interface file has complex implementation — facade is fragile',
      fix: 'Keep interface files clean and move implementation elsewhere',
      estimatedCost: 'moderate',
    })
  }

  return issues
}

// ─── Floor Plan Analysis ───────────────────────────────────────────────────────

/**
 * Analyze directory organization as a floor plan
 * @example
 * analyzeFloorPlan(['a.ts', 'b.ts', 'c.ts'], 'src') // FloorPlan
 */
export function analyzeFloorPlan(files: string[], dirPath: string): FloorPlan {
  const extensions = Array.from(new Set(files.map(f => {
    const parts = f.split('.')
    return parts.length > 1 ? parts[parts.length - 1] : 'unknown'
  })))

  const hasIndex = files.some(f => f.endsWith('index.ts') || f.endsWith('index.js'))
  const hasTypes = files.some(f => /types|interfaces/i.test(f))
  const consistentNaming = files.every(f => /^[\w-]+\.\w+$/.test(f.split('/').pop() || ''))
  const fileCount = files.length

  let layout: FloorLayout = 'ad-hoc'
  if (consistentNaming && hasIndex && fileCount <= 15) layout = 'organized'
  else if (consistentNaming && fileCount <= 20) layout = 'semi-organized'
  else if (fileCount > 30) layout = 'chaotic'

  let zoning: FloorZoning = 'unzoned'
  if (/test|spec/i.test(dirPath)) zoning = 'industrial'
  else if (extensions.length === 1 && fileCount <= 10) zoning = 'residential'
  else if (extensions.length >= 3) zoning = 'mixed-use'
  else if (fileCount <= 5 && extensions.length <= 2) zoning = 'commercial'

  const description = layout === 'organized'
    ? 'Well-organized directory with consistent naming'
    : layout === 'semi-organized'
      ? 'Mostly organized with some inconsistencies'
      : layout === 'ad-hoc'
        ? 'Ad-hoc organization without clear structure'
        : 'Chaotic directory with many files and no clear organization'

  const issues: string[] = []
  if (fileCount > 20) issues.push('Too many files in a single directory')
  if (!consistentNaming) issues.push('Inconsistent file naming conventions')
  if (!hasIndex && fileCount > 5) issues.push('Missing index file for re-exports')
  if (extensions.length > 4) issues.push('Too many file types mixed together')
  if (!hasTypes && fileCount > 3) issues.push('No type definition files')

  return { directory: dirPath, files, layout, zoning, description, issues }
}

// ─── Classification Functions ──────────────────────────────────────────────────

/**
 * Compute structural integrity score (0-100)
 * @example
 * computeStructuralIntegrity(blueprints, allIssues) // 75
 */
export function computeStructuralIntegrity(blueprints: Blueprint[], allIssues: StructuralIssue[]): number {
  if (blueprints.length === 0) return 50

  const avgScore = blueprints.reduce((s, b) => s + b.structuralScore, 0) / blueprints.length
  const criticalPenalty = allIssues.filter(i => i.severity === 'critical').length * 8
  const structuralPenalty = allIssues.filter(i => i.severity === 'structural').length * 5

  return Math.max(0, Math.min(100, Math.round(avgScore - criticalPenalty - structuralPenalty)))
}

/**
 * Classify building code compliance
 * @example
 * classifyBuildingCode(85, 0) // 'passing'
 */
export function classifyBuildingCode(integrity: number, criticalIssues: number): BuildingCode {
  if (integrity >= 70 && criticalIssues === 0) return 'passing'
  if (integrity >= 50 && criticalIssues <= 1) return 'minor-violations'
  if (integrity >= 30) return 'major-violations'
  return 'condemned'
}

/**
 * Classify the overall building grade
 * @example
 * classifyOverallGrade(90, 85) // 'skyscraper'
 */
export function classifyOverallGrade(integrity: number, avgScores: number): OverallGrade {
  const combined = integrity * 0.6 + avgScores * 0.4
  if (combined >= 80) return 'skyscraper'
  if (combined >= 65) return 'office-building'
  if (combined >= 45) return 'house'
  if (combined >= 25) return 'shed'
  return 'ruins'
}

// ─── Recommendation Generation ─────────────────────────────────────────────────

/**
 * Generate architectural recommendations
 * @example
 * generateArchitectRecommendations(blueprints, floorPlans, allIssues, stats) // string[]
 */
export function generateArchitectRecommendations(
  blueprints: Blueprint[],
  floorPlans: FloorPlan[],
  allIssues: StructuralIssue[],
  stats: ArchitectStats,
): string[] {
  const recs: string[] = []

  const criticals = allIssues.filter(i => i.severity === 'critical')
  if (criticals.length > 0) {
    recs.push(`Address ${criticals.length} critical structural issue(s) immediately`)
  }

  const condemned = blueprints.filter(b => b.grade === 'condemned')
  if (condemned.length > 0) {
    recs.push(`Rebuild or heavily refactor ${condemned.length} condemned file(s)`)
  }

  const overloaded = blueprints.filter(b => b.doors > 15)
  if (overloaded.length > 0) {
    recs.push(`Distribute load from ${overloaded.length} overloaded file(s) — too many exports`)
  }

  const leaky = blueprints.filter(b => b.issues.some(i => i.type === 'leaky-roof'))
  if (leaky.length > 0) {
    recs.push(`Fix leaky roofs in ${leaky.length} file(s) — add error handling`)
  }

  const chaotic = floorPlans.filter(fp => fp.layout === 'chaotic')
  if (chaotic.length > 0) {
    recs.push(`Reorganize ${chaotic.length} chaotic director(ies) — establish clear structure`)
  }

  if (stats.avgCurbAppeal < 50) {
    recs.push('Improve curb appeal — add comments and improve readability')
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build the complete architect result
 * @example
 * buildArchitectResult(['a.ts'], ['export const x = 1'], {}) // ArchitectResult
 */
export function buildArchitectResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): ArchitectResult {
  const blueprints: Blueprint[] = []
  for (let i = 0; i < files.length; i++) {
    blueprints.push(evaluateBlueprint(contents[i] ?? '',files[i] ?? '', files))
  }

  const byDir = new Map<string, string[]>()
  for (const file of files) {
    const dir = file.split('/').slice(0, -1).join('/') || 'root'
    if (!byDir.has(dir)) byDir.set(dir, [])
    byDir.get(dir)!.push(file)
  }

  const floorPlans: FloorPlan[] = []
  for (const [dir, dirFiles] of byDir) {
    floorPlans.push(analyzeFloorPlan(dirFiles, dir))
  }

  const allIssues = blueprints.flatMap(b => b.issues)

  const avg = (arr: number[]) => arr.length > 0
    ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
    : 50

  const structuralIntegrity = computeStructuralIntegrity(blueprints, allIssues)
  const criticalIssues = allIssues.filter(i => i.severity === 'critical').length
  const structuralIssueCount = allIssues.filter(i => i.severity === 'structural').length
  const buildingCode = classifyBuildingCode(structuralIntegrity, criticalIssues)

  const avgScores = avg([
    ...blueprints.map(b => b.structuralScore),
    ...blueprints.map(b => b.foundationQuality),
    ...blueprints.map(b => b.wallIntegrity),
  ])
  const overallGrade = classifyOverallGrade(structuralIntegrity, avgScores)

  const stats: ArchitectStats = {
    totalBlueprints: blueprints.length,
    foundations: blueprints.filter(b => b.structure === 'foundation').length,
    loadBearing: blueprints.filter(b => b.structure === 'load-bearing').length,
    facades: blueprints.filter(b => b.structure === 'facade').length,
    decorations: blueprints.filter(b => b.structure === 'decoration').length,
    avgStructuralScore: avg(blueprints.map(b => b.structuralScore)),
    avgFoundationQuality: avg(blueprints.map(b => b.foundationQuality)),
    avgWallIntegrity: avg(blueprints.map(b => b.wallIntegrity)),
    avgPlumbing: avg(blueprints.map(b => b.plumbing)),
    avgElectrical: avg(blueprints.map(b => b.electrical)),
    avgCurbAppeal: avg(blueprints.map(b => b.curbAppeal)),
    masterworkBlueprints: blueprints.filter(b => b.grade === 'masterwork').length,
    condemnedBlueprints: blueprints.filter(b => b.grade === 'condemned').length,
    totalIssues: allIssues.length,
    criticalIssues,
    structuralIssues: structuralIssueCount,
    avgFloors: avg(blueprints.map(b => b.floors)),
    totalFloorPlans: floorPlans.length,
    organizedPlans: floorPlans.filter(fp => fp.layout === 'organized').length,
    chaoticPlans: floorPlans.filter(fp => fp.layout === 'chaotic').length,
    buildingCode,
    overallGrade,
    structuralIntegrity,
  }

  const recommendations = generateArchitectRecommendations(blueprints, floorPlans, allIssues, stats)

  return { blueprints, floorPlans, stats, recommendations }
}
