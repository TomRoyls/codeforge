// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface MarkQuality {
  cleanCuts: number
  roughCuts: number
  overcuts: number
  undercuts: number
  chatterMarks: number
  raspMarks: number
}

export interface Sculpting {
  roughingOut: number
  shaping: number
  detailing: number
  finishing: number
  totalStages: number
}

export interface Dimensions {
  depth: number
  detail: number
  definition: number
  delicacy: number
}

export interface ToolMarks {
  appropriateTools: number
  inappropriateTools: number
  missingTools: number
  overusedTools: number
}

export interface ChiselMark {
  file: string
  precision: number
  toolSelection: number
  forceControl: number
  grainRespect: number
  finishingQuality: number
  material: 'marble' | 'granite' | 'sandstone' | 'limestone' | 'alabaster' | 'soapstone' | 'wood' | 'clay'
  chiselType: 'point' | 'flat' | 'round' | 'toothed' | 'diamond' | 'bullnose'
  markQuality: MarkQuality
  sculpting: Sculpting
  grainAlignment: number
  dimensions: Dimensions
  toolMarks: ToolMarks
  sculptorGrade: 'master' | 'artisan' | 'journeyman' | 'apprentice' | 'novice' | 'hacker'
  condition: 'masterpiece' | 'refined' | 'shaped' | 'rough' | 'unworked' | 'butchered'
  qualityScore: number
  issues: string[]
  highlights: string[]
}

export interface ChiselBlock {
  directory: string
  marks: ChiselMark[]
  avgPrecision: number
  avgToolSelection: number
  avgForceControl: number
  avgGrainRespect: number
  avgFinishing: number
  dominantMaterial: string
  dominantChiselType: string
  masterCount: number
  noviceCount: number
  totalCleanCuts: number
  totalRoughCuts: number
  totalOvercuts: number
  totalUndercuts: number
  totalChatterMarks: number
  totalRaspMarks: number
  blockQuality: number
  studioGrade: 'master-studio' | 'workshop' | 'garage' | 'shed' | 'salvage-yard'
}

export interface ChiselStats {
  totalFiles: number
  totalBlocks: number
  avgPrecision: number
  avgToolSelection: number
  avgForceControl: number
  avgGrainRespect: number
  avgFinishing: number
  avgGrainAlignment: number
  marbleFiles: number
  graniteFiles: number
  woodFiles: number
  clayFiles: number
  masterSculptor: number
  noviceSculptor: number
  hackerSculptor: number
  masterpieceCount: number
  butcheredCount: number
  totalCleanCuts: number
  totalRoughCuts: number
  totalOvercuts: number
  totalUndercuts: number
  totalChatterMarks: number
  totalRaspMarks: number
  appropriateToolUsage: number
  inappropriateToolUsage: number
  overallPrecision: number
  sculptorGrade: string
  bestMark: string
  worstMark: string
  mostDetailed: string
  cleanestWork: string
}

export interface ChiselResult {
  marks: ChiselMark[]
  blocks: ChiselBlock[]
  stats: ChiselStats
  recommendations: string[]
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify material type from code quality
 * @example
 * classifyMaterial(90, 10) // 'marble'
 */
export function classifyMaterial(
  quality: number,
  complexity: number,
): ChiselMark['material'] {
  if (quality >= 80 && complexity < 50) return 'marble'
  if (quality >= 70 && complexity >= 50) return 'granite'
  if (quality >= 55) return 'alabaster'
  if (quality >= 40 && complexity < 30) return 'limestone'
  if (quality >= 40) return 'sandstone'
  if (quality >= 25) return 'soapstone'
  if (quality >= 10) return 'wood'
  return 'clay'
}

/**
 * Classify chisel type from code patterns
 * @example
 * classifyChiselType(3, 2, 0) // 'flat'
 */
export function classifyChiselType(
  exports: number,
  classes: number,
  generics: number,
): ChiselMark['chiselType'] {
  if (generics >= 3) return 'diamond'
  if (classes >= 3 && exports >= 3) return 'point'
  if (classes >= 2) return 'round'
  if (exports >= 4) return 'toothed'
  if (exports >= 2 || classes >= 1) return 'flat'
  return 'bullnose'
}

/**
 * Classify sculptor grade from average quality
 * @example
 * classifySculptorGrade(90) // 'master'
 */
export function classifySculptorGrade(quality: number): ChiselMark['sculptorGrade'] {
  if (quality >= 85) return 'master'
  if (quality >= 70) return 'artisan'
  if (quality >= 55) return 'journeyman'
  if (quality >= 40) return 'apprentice'
  if (quality >= 20) return 'novice'
  return 'hacker'
}

/**
 * Classify studio grade from average block quality
 * @example
 * classifyStudioGrade(85) // 'master-studio'
 */
export function classifyStudioGrade(quality: number): ChiselBlock['studioGrade'] {
  if (quality >= 80) return 'master-studio'
  if (quality >= 60) return 'workshop'
  if (quality >= 40) return 'garage'
  if (quality >= 20) return 'shed'
  return 'salvage-yard'
}

// ─── Detection Functions ─────────────────────────────────────────────────────

/**
 * Detect overcuts — code doing too much
 * @example
 * detectOvercuts('function f(a,b,c,d,e,f) {}') // 1
 */
export function detectOvercuts(content: string): number {
  let count = 0
  const longParamLists = (content.match(/\([^)]{80,}\)/g) ?? []).length
  count += longParamLists
  const longLines = content.split('\n').filter(l => l.trim().length > 150).length
  count += longLines
  const godClasses = (content.match(/class\s+\w+[^{]*\{[\s\S]{500,}/g) ?? []).length
  count += godClasses
  return count
}

/**
 * Detect undercuts — code doing too little
 * @example
 * detectUndercuts('function f() {}') // 1
 */
export function detectUndercuts(content: string): number {
  let count = 0
  const emptyFunctions = (content.match(/function\s+\w+\s*\([^)]*\)\s*\{\s*\}/g) ?? []).length
  count += emptyFunctions
  const emptyArrow = (content.match(/\w+\s*=\s*\([^)]*\)\s*=>\s*\{\s*\}/g) ?? []).length
  count += emptyArrow
  const todoOnly = (content.match(/\/\/\s*(TODO|FIXME).*/g) ?? []).length
  count += todoOnly
  return count
}

/**
 * Detect chatter marks — inconsistent patterns
 * @example
 * detectChatterMarks('let x = 1\nconst y = 2\nlet z = 3') // 1
 */
export function detectChatterMarks(content: string): number {
  let count = 0
  const letCount = (content.match(/\blet\s+\w+/g) ?? []).length
  const constCount = (content.match(/\bconst\s+\w+/g) ?? []).length
  if (letCount > 0 && constCount > 0 && letCount > constCount * 2) count++
  const hasTabs = content.includes('\t')
  const hasSpaces = /^  /m.test(content)
  if (hasTabs && hasSpaces) count++
  const singleQuotes = (content.match(/'/g) ?? []).length
  const doubleQuotes = (content.match(/"/g) ?? []).length
  if (singleQuotes > 0 && doubleQuotes > 0 && singleQuotes > doubleQuotes * 3) count++
  return count
}

/**
 * Detect rasp marks — signs of rework/patches
 * @example
 * detectRaspMarks('try { } catch(e) { /star patch star/ }') // 1
 */
export function detectRaspMarks(content: string): number {
  let count = 0
  const emptyCatch = (content.match(/catch\s*\([^)]*\)\s*\{\s*(\/\/|\/\*)?[\s]*\}/g) ?? []).length
  count += emptyCatch
  const hackComments = (content.match(/\/\/\s*(HACK|WORKAROUND|PATCH|TEMP|QUICKFIX)/gi) ?? []).length
  count += hackComments
  const typeAssertions = (content.match(/\bas\s+\w+/g) ?? []).length
  count += Math.min(3, typeAssertions)
  return count
}

/**
 * Evaluate tool usage — appropriate vs inappropriate
 * @example
 * evaluateToolUsage('const x: any = 1') // { appropriateTools: 0, inappropriateTools: 1, ... }
 */
export function evaluateToolUsage(content: string): ToolMarks {
  let appropriateTools = 0
  let inappropriateTools = 0
  let missingTools = 0
  let overusedTools = 0

  const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTypes = /\binterface\b|\btype\b/.test(content)
  const hasExports = /\bexport\b/.test(content)
  const hasGenerics = /<\w+>/.test(content)

  if (hasJSDoc) appropriateTools++
  if (hasTypes) appropriateTools++
  if (hasExports) appropriateTools++
  if (hasGenerics) appropriateTools++

  const hasAny = /\bany\b/.test(content)
  const hasEval = /\beval\s*\(/.test(content)
  const hasConsole = /console\.\w+\s*\(/.test(content)
  const hasTsIgnore = /@ts-ignore|@ts-expect-error/.test(content)

  if (hasAny) inappropriateTools++
  if (hasEval) inappropriateTools++
  if (hasConsole) inappropriateTools++
  if (hasTsIgnore) inappropriateTools++

  const hasFunctions = /\bfunction\b|=>/.test(content)
  if (hasFunctions && !hasJSDoc) missingTools++
  if (hasFunctions && !hasTypes) missingTools++

  const genericCount = (content.match(/<\w+>/g) ?? []).length
  if (genericCount > 5) overusedTools++
  const importCount = (content.match(/\bimport\s+/g) ?? []).length
  if (importCount > 10) overusedTools++

  return { appropriateTools, inappropriateTools, missingTools, overusedTools }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a chisel mark
 * @example
 * analyzeChiselMark('export function f() {}', 'f.ts') // ChiselMark
 */
export function analyzeChiselMark(content: string, filePath: string): ChiselMark {
  const lines = content.split('\n')
  const totalLines = lines.length
  const codeLines = lines.filter(l => l.trim().length > 0 && !l.trim().startsWith('//') && !l.trim().startsWith('*')).length

  const exportCount = (content.match(/\bexport\s+/g) ?? []).length
  const functionCount = (content.match(/(?:function\s+\w+|=>\s*[{(]|\w+\s*\([^)]*\)\s*[{=])/g) ?? []).length
  const classCount = (content.match(/\bclass\s+\w+/g) ?? []).length
  const interfaceCount = (content.match(/\binterface\s+\w+/g) ?? []).length
  const typeCount = (content.match(/\btype\s+\w+/g) ?? []).length
  const genericCount = (content.match(/<\w+>/g) ?? []).length
  const jsdocCount = (content.match(/\/\*\*[\s\S]*?\*\//g) ?? []).length
  const importCount = (content.match(/\bimport\s+/g) ?? []).length

  const hasJSDoc = jsdocCount > 0
  const hasTypes = interfaceCount + typeCount > 0
  const hasExports = exportCount > 0
  const hasTests = /describe\s*\(|it\s*\(|test\s*\(/.test(content)
  const hasAny = /\bany\b/.test(content)
  const hasConsole = /console\.\w+\s*\(/.test(content)
  const hasEval = /\beval\s*\(/.test(content)

  const precision = Math.min(100, Math.max(0, Math.round(
    (totalLines > 0 ? Math.min(100, (codeLines / totalLines) * 120) : 0) * 0.3 +
    (hasJSDoc ? 15 : 0) + (hasTypes ? 15 : 0) +
    (hasAny ? -10 : 0) + (hasConsole ? -5 : 0) +
    Math.min(15, exportCount * 3),
  )))

  const toolUsage = evaluateToolUsage(content)
  const toolSelection = Math.min(100, Math.max(0, Math.round(
    (toolUsage.appropriateTools * 15) - (toolUsage.inappropriateTools * 15) - (toolUsage.missingTools * 8) - (toolUsage.overusedTools * 5) + 20,
  )))

  const overcuts = detectOvercuts(content)
  const undercuts = detectUndercuts(content)
  const complexity = totalLines + functionCount * 5 + classCount * 10
  const forceControl = Math.min(100, Math.max(0, Math.round(
    80 - overcuts * 10 - undercuts * 8 - (complexity > 200 ? 15 : 0) - (hasEval ? 20 : 0) + (hasTests ? 10 : 0),
  )))

  const chatter = detectChatterMarks(content)
  const rasp = detectRaspMarks(content)
  const grainRespect = Math.min(100, Math.max(0, Math.round(
    70 - chatter * 10 - rasp * 8 + (hasJSDoc ? 10 : 0) + (hasTypes ? 10 : 0) + (importCount > 0 ? 5 : 0),
  )))

  const finishingQuality = Math.min(100, Math.max(0, Math.round(
    (hasJSDoc ? 20 : 0) + (hasTests ? 20 : 0) + (hasExports ? 10 : 0) +
    (hasTypes ? 15 : 0) + (hasAny ? -10 : 0) + (hasConsole ? -5 : 0) +
    Math.min(15, jsdocCount * 3) + Math.min(10, exportCount * 2),
  )))

  const cleanCuts = exportCount + interfaceCount + typeCount + jsdocCount
  const roughCuts = (hasAny ? 1 : 0) + (hasConsole ? 1 : 0) + (hasEval ? 1 : 0)
  const chatterMarks = chatter
  const raspMarks = rasp

  const roughingOut = Math.min(100, Math.round(
    (hasExports ? 25 : 0) + (functionCount > 0 ? 25 : 0) + (classCount > 0 ? 25 : 0) + Math.min(25, codeLines),
  ))
  const shaping = Math.min(100, Math.round(
    (hasTypes ? 30 : 0) + (hasExports ? 20 : 0) + (importCount > 0 ? 15 : 0) + (genericCount > 0 ? 15 : 0) + Math.min(20, interfaceCount * 10),
  ))
  const detailing = Math.min(100, Math.round(
    (hasJSDoc ? 30 : 0) + (hasTypes ? 25 : 0) + (genericCount > 0 ? 20 : 0) + Math.min(25, jsdocCount * 8),
  ))
  const finishing = finishingQuality
  const totalStages = [roughingOut, shaping, detailing, finishing].filter(s => s > 20).length

  const grainAlignment = Math.min(100, Math.max(0, Math.round(
    (hasJSDoc && hasTypes ? 25 : 0) + (hasExports ? 15 : 0) + (importCount > 0 ? 10 : 0) +
    (chatter === 0 ? 20 : 0) + (rasp === 0 ? 15 : 0) + Math.min(15, jsdocCount * 3),
  )))

  const depth = Math.min(100, Math.round(
    (functionCount * 5) + (classCount * 10) + (interfaceCount * 8) + (typeCount * 5) + Math.min(30, totalLines / 3),
  ))
  const detail = Math.min(100, Math.round(
    (jsdocCount * 10) + (interfaceCount * 12) + (typeCount * 8) + (genericCount * 5) + Math.min(30, exportCount * 3),
  ))
  const definition = Math.min(100, Math.round(
    (hasExports ? 20 : 0) + (hasTypes ? 25 : 0) + (hasJSDoc ? 20 : 0) + (hasTests ? 15 : 0) + (genericCount > 0 ? 10 : 0),
  ))
  const delicacy = Math.min(100, Math.round(
    (grainRespect * 0.3) + (finishingQuality * 0.3) + (precision * 0.2) + (toolSelection * 0.2),
  ))

  const material = classifyMaterial(
    Math.round((precision + toolSelection + forceControl + grainRespect + finishingQuality) / 5),
    complexity,
  )
  const chiselType = classifyChiselType(exportCount, classCount, genericCount)

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    (precision * 0.25) + (toolSelection * 0.2) + (forceControl * 0.2) +
    (grainRespect * 0.15) + (finishingQuality * 0.2),
  )))

  const sculptorGrade = classifySculptorGrade(qualityScore)

  let condition: ChiselMark['condition']
  if (qualityScore >= 85) condition = 'masterpiece'
  else if (qualityScore >= 70) condition = 'refined'
  else if (qualityScore >= 55) condition = 'shaped'
  else if (qualityScore >= 35) condition = 'rough'
  else if (qualityScore >= 15) condition = 'unworked'
  else condition = 'butchered'

  const issues: string[] = []
  const highlights: string[] = []
  if (hasAny) issues.push('Uses any type')
  if (hasConsole) issues.push('Contains console statements')
  if (hasEval) issues.push('Uses eval')
  if (overcuts > 0) issues.push(`Overcuts: ${overcuts} areas doing too much`)
  if (undercuts > 0) issues.push(`Undercuts: ${undercuts} incomplete implementations`)
  if (chatterMarks > 0) issues.push(`Chatter marks: ${chatterMarks} inconsistencies`)
  if (raspMarks > 0) issues.push(`Rasp marks: ${raspMarks} rework signs`)
  if (hasJSDoc) highlights.push('Documented with JSDoc')
  if (hasTypes) highlights.push('Uses TypeScript types')
  if (hasTests) highlights.push('Contains tests')
  if (hasExports) highlights.push('Exports public API')
  if (cleanCuts > roughCuts * 3) highlights.push('Mostly clean cuts')

  return {
    file: filePath,
    precision,
    toolSelection,
    forceControl,
    grainRespect,
    finishingQuality,
    material,
    chiselType,
    markQuality: { cleanCuts, roughCuts, overcuts, undercuts, chatterMarks, raspMarks },
    sculpting: { roughingOut, shaping, detailing, finishing, totalStages },
    grainAlignment,
    dimensions: { depth, detail, definition, delicacy },
    toolMarks: toolUsage,
    sculptorGrade,
    condition,
    qualityScore,
    issues,
    highlights,
  }
}

// ─── Block Analysis ──────────────────────────────────────────────────────────

/**
 * Analyze a directory as a chisel block
 * @example
 * analyzeChiselBlock(marks, 'src') // ChiselBlock
 */
export function analyzeChiselBlock(marks: ChiselMark[], dirPath: string): ChiselBlock {
  if (marks.length === 0) {
    return {
      directory: dirPath,
      marks: [],
      avgPrecision: 0, avgToolSelection: 0, avgForceControl: 0, avgGrainRespect: 0, avgFinishing: 0,
      dominantMaterial: 'clay', dominantChiselType: 'bullnose',
      masterCount: 0, noviceCount: 0,
      totalCleanCuts: 0, totalRoughCuts: 0, totalOvercuts: 0, totalUndercuts: 0,
      totalChatterMarks: 0, totalRaspMarks: 0,
      blockQuality: 0, studioGrade: 'salvage-yard',
    }
  }

  const avgPrecision = Math.round(marks.reduce((s, m) => s + m.precision, 0) / marks.length)
  const avgToolSelection = Math.round(marks.reduce((s, m) => s + m.toolSelection, 0) / marks.length)
  const avgForceControl = Math.round(marks.reduce((s, m) => s + m.forceControl, 0) / marks.length)
  const avgGrainRespect = Math.round(marks.reduce((s, m) => s + m.grainRespect, 0) / marks.length)
  const avgFinishing = Math.round(marks.reduce((s, m) => s + m.finishingQuality, 0) / marks.length)

  const materialCounts = new Map<string, number>()
  const chiselCounts = new Map<string, number>()
  for (const m of marks) {
    materialCounts.set(m.material, (materialCounts.get(m.material) ?? 0) + 1)
    chiselCounts.set(m.chiselType, (chiselCounts.get(m.chiselType) ?? 0) + 1)
  }
  const dominantMaterial = Array.from(materialCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'clay'
  const dominantChiselType = Array.from(chiselCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'bullnose'

  const masterCount = marks.filter(m => m.sculptorGrade === 'master' || m.sculptorGrade === 'artisan').length
  const noviceCount = marks.filter(m => m.sculptorGrade === 'novice' || m.sculptorGrade === 'hacker').length

  const totalCleanCuts = marks.reduce((s, m) => s + m.markQuality.cleanCuts, 0)
  const totalRoughCuts = marks.reduce((s, m) => s + m.markQuality.roughCuts, 0)
  const totalOvercuts = marks.reduce((s, m) => s + m.markQuality.overcuts, 0)
  const totalUndercuts = marks.reduce((s, m) => s + m.markQuality.undercuts, 0)
  const totalChatterMarks = marks.reduce((s, m) => s + m.markQuality.chatterMarks, 0)
  const totalRaspMarks = marks.reduce((s, m) => s + m.markQuality.raspMarks, 0)

  const blockQuality = Math.round(marks.reduce((s, m) => s + m.qualityScore, 0) / marks.length)
  const studioGrade = classifyStudioGrade(blockQuality)

  return {
    directory: dirPath, marks,
    avgPrecision, avgToolSelection, avgForceControl, avgGrainRespect, avgFinishing,
    dominantMaterial, dominantChiselType,
    masterCount, noviceCount,
    totalCleanCuts, totalRoughCuts, totalOvercuts, totalUndercuts, totalChatterMarks, totalRaspMarks,
    blockQuality, studioGrade,
  }
}

// ─── Recommendations ────────────────────────────────────────────────────────

/**
 * Generate chisel recommendations
 * @example
 * generateRecommendations(marks, blocks, stats) // string[]
 */
export function generateRecommendations(
  marks: ChiselMark[],
  blocks: ChiselBlock[],
  stats: ChiselStats,
): string[] {
  const recs: string[] = []

  if (stats.overallPrecision >= 75) {
    recs.push('Excellent precision: code is well-sculpted, maintain current standards')
  }

  if (stats.totalRoughCuts > 0) {
    recs.push(`Rough cuts detected: ${stats.totalRoughCuts} imprecise areas need refinement`)
  }

  if (stats.totalOvercuts > 0) {
    recs.push(`Overcuts found: ${stats.totalOvercuts} areas doing too much, trim excess code`)
  }

  if (stats.totalUndercuts > 0) {
    recs.push(`Undercuts found: ${stats.totalUndercuts} incomplete implementations need finishing`)
  }

  if (stats.totalChatterMarks > 0) {
    recs.push(`Chatter marks: ${stats.totalChatterMarks} inconsistent patterns need standardization`)
  }

  if (stats.inappropriateToolUsage > 0) {
    recs.push(`Wrong tools: ${stats.inappropriateToolUsage} inappropriate language feature usages`)
  }

  if (stats.avgToolSelection < 40) {
    recs.push('Poor tool selection: review language feature usage for better precision')
  }

  if (stats.avgForceControl < 40) {
    recs.push('Poor force control: simplify complex code for cleaner cuts')
  }

  if (stats.avgFinishing < 40) {
    recs.push('Low finishing quality: add documentation and polish')
  }

  if (stats.butcheredCount > 0) {
    recs.push(`Butchered files: ${stats.butcheredCount} files need complete rework`)
  }

  if (stats.masterpieceCount > 0) {
    recs.push(`Masterpiece files: ${stats.masterpieceCount} exemplary files to use as templates`)
  }

  const lowPrecision = marks.filter(m => m.precision < 30)
  if (lowPrecision.length > 0) {
    recs.push(`Low precision: ${lowPrecision.length} files have poor line exactness`)
  }

  const badBlocks = blocks.filter(b => b.studioGrade === 'salvage-yard')
  if (badBlocks.length > 0) {
    recs.push(`Salvage yards: ${badBlocks.length} directories need major cleanup`)
  }

  if (stats.overallPrecision < 40) {
    recs.push('Overall precision is low: consider systematic refactoring')
  } else if (stats.overallPrecision < 60) {
    recs.push('Moderate precision: targeted improvements will yield good results')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete chisel result from files and contents
 * @example
 * buildChiselResult(['a.ts'], ['export function a() {}'], {}) // ChiselResult
 */
export function buildChiselResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): ChiselResult {
  const marks: ChiselMark[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeChiselMark(content, file)
    } catch {
      return analyzeChiselMark('', file)
    }
  })

  const dirMap = new Map<string, ChiselMark[]>()
  for (const mark of marks) {
    const dir = mark.file.includes('/') ? mark.file.slice(0, mark.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(mark)
    } else {
      dirMap.set(dir, [mark])
    }
  }

  const blocks: ChiselBlock[] = Array.from(dirMap.entries()).map(([dir, ms]) =>
    analyzeChiselBlock(ms, dir),
  )

  const avgPrecision = marks.length > 0 ? Math.round(marks.reduce((s, m) => s + m.precision, 0) / marks.length) : 0
  const avgToolSelection = marks.length > 0 ? Math.round(marks.reduce((s, m) => s + m.toolSelection, 0) / marks.length) : 0
  const avgForceControl = marks.length > 0 ? Math.round(marks.reduce((s, m) => s + m.forceControl, 0) / marks.length) : 0
  const avgGrainRespect = marks.length > 0 ? Math.round(marks.reduce((s, m) => s + m.grainRespect, 0) / marks.length) : 0
  const avgFinishing = marks.length > 0 ? Math.round(marks.reduce((s, m) => s + m.finishingQuality, 0) / marks.length) : 0
  const avgGrainAlignment = marks.length > 0 ? Math.round(marks.reduce((s, m) => s + m.grainAlignment, 0) / marks.length) : 0

  const marbleFiles = marks.filter(m => m.material === 'marble').length
  const graniteFiles = marks.filter(m => m.material === 'granite').length
  const woodFiles = marks.filter(m => m.material === 'wood').length
  const clayFiles = marks.filter(m => m.material === 'clay').length

  const masterSculptor = marks.filter(m => m.sculptorGrade === 'master').length
  const noviceSculptor = marks.filter(m => m.sculptorGrade === 'novice').length
  const hackerSculptor = marks.filter(m => m.sculptorGrade === 'hacker').length
  const masterpieceCount = marks.filter(m => m.condition === 'masterpiece').length
  const butcheredCount = marks.filter(m => m.condition === 'butchered').length

  const totalCleanCuts = marks.reduce((s, m) => s + m.markQuality.cleanCuts, 0)
  const totalRoughCuts = marks.reduce((s, m) => s + m.markQuality.roughCuts, 0)
  const totalOvercuts = marks.reduce((s, m) => s + m.markQuality.overcuts, 0)
  const totalUndercuts = marks.reduce((s, m) => s + m.markQuality.undercuts, 0)
  const totalChatterMarks = marks.reduce((s, m) => s + m.markQuality.chatterMarks, 0)
  const totalRaspMarks = marks.reduce((s, m) => s + m.markQuality.raspMarks, 0)

  const appropriateToolUsage = marks.reduce((s, m) => s + m.toolMarks.appropriateTools, 0)
  const inappropriateToolUsage = marks.reduce((s, m) => s + m.toolMarks.inappropriateTools, 0)

  const overallPrecision = marks.length > 0 ? Math.round(marks.reduce((s, m) => s + m.qualityScore, 0) / marks.length) : 0
  const sculptorGrade = classifySculptorGrade(overallPrecision)

  const bestMark = marks.length > 0
    ? marks.reduce((best, m) => m.precision > best.precision ? m : best, marks[0] as typeof marks[number]).file
    : 'none'
  const worstMark = marks.length > 0
    ? marks.reduce((worst, m) => m.precision < worst.precision ? m : worst, marks[0] as typeof marks[number]).file
    : 'none'
  const mostDetailed = marks.length > 0
    ? marks.reduce((m, cur) => cur.dimensions.detail > m.dimensions.detail ? cur : m, marks[0] as typeof marks[number]).file
    : 'none'
  const cleanestWork = marks.length > 0
    ? marks.reduce((m, cur) => cur.markQuality.cleanCuts > m.markQuality.cleanCuts ? cur : m, marks[0] as typeof marks[number]).file
    : 'none'

  const stats: ChiselStats = {
    totalFiles: files.length,
    totalBlocks: blocks.length,
    avgPrecision, avgToolSelection, avgForceControl, avgGrainRespect, avgFinishing, avgGrainAlignment,
    marbleFiles, graniteFiles, woodFiles, clayFiles,
    masterSculptor, noviceSculptor, hackerSculptor,
    masterpieceCount, butcheredCount,
    totalCleanCuts, totalRoughCuts, totalOvercuts, totalUndercuts, totalChatterMarks, totalRaspMarks,
    appropriateToolUsage, inappropriateToolUsage,
    overallPrecision, sculptorGrade,
    bestMark, worstMark, mostDetailed, cleanestWork,
  }

  const recommendations = generateRecommendations(marks, blocks, stats)

  void options

  return { marks, blocks, stats, recommendations }
}
