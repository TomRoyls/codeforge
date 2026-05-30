// ─── Types ──────────────────────────────────────────────────────────────────────

export type WeldType = 'function-boundary' | 'class-boundary' | 'module-boundary' | 'api-boundary'
export type WeldQuality = 'seamless' | 'clean' | 'acceptable' | 'rough' | 'broken'
export type HammerType = 'rushed' | 'careful' | 'overworked' | 'skilled' | 'novice' | 'master'
export type HammerImpact = 'positive' | 'neutral' | 'negative'
export type HeatGrade = 'properly-hardened' | 'case-hardened' | 'annealed' | 'raw' | 'brittle'
export type PieceGrade = 'masterwork' | 'fine' | 'standard' | 'rough' | 'pig-iron'
export type MetalType = 'steel' | 'iron' | 'bronze' | 'copper' | 'tin'
export type OverallForge = 'legendary' | 'master' | 'journeyman' | 'apprentice' | 'novice'

export interface ForgeWeld {
  location: string
  type: WeldType
  quality: WeldQuality
  strength: number
  description: string
  issue: string | null
}

export interface HammerMark {
  type: HammerType
  location: number
  evidence: string
  impact: HammerImpact
}

export interface HeatTreatment {
  errorHandling: number
  edgeCaseCoverage: number
  inputValidation: number
  failureRecovery: number
  grade: HeatGrade
}

export interface ForgedPiece {
  file: string
  temper: number
  welds: ForgeWeld[]
  hammerMarks: HammerMark[]
  heatTreatment: HeatTreatment
  polish: number
  craftsmanship: number
  grade: PieceGrade
  metal: MetalType
}

export interface ForgeStats {
  totalPieces: number
  avgTemper: number
  avgCraftsmanship: number
  avgPolish: number
  masterworkCount: number
  pigIronCount: number
  totalWelds: number
  seamlessWelds: number
  brokenWelds: number
  totalHammerMarks: number
  skilledMarks: number
  rushedMarks: number
  avgHeatTreatment: number
  properlyHardened: number
  brittle: number
  overallForge: OverallForge
  forgeQuality: number
  anvilIndex: number
}

export interface ForgeResult {
  pieces: ForgedPiece[]
  stats: ForgeStats
  recommendations: string[]
}

export interface ForgeOptions {
  verbose?: boolean
  format?: string
  output?: string
  ignore?: string[]
  ext?: string
}

// ─── Temper ────────────────────────────────────────────────────────────────────

/**
 * Evaluate temper — resilience to changes (0-100).
 *
 * @example
 * evaluateTemper('export function add(a: number, b: number) { return a + b }') // => 80+
 */
export function evaluateTemper(content: string): number {
  if (content.trim().length === 0) return 0

  let score = 80

  const importCount = Array.from(content.matchAll(/^import\s/gm)).length
  if (importCount > 8) score -= (importCount - 8) * 3
  if (importCount > 15) score -= 10

  const hardCodedStrings = Array.from(content.matchAll(/(?:==|===|!==|!=)\s*['"][^'"]+['"]/g)).length
  const hardCodedNumbers = Array.from(content.matchAll(/(?:==|===|!==|!=)\s*\d{2,}/g)).length
  score -= Math.min(20, (hardCodedStrings + hardCodedNumbers) * 3)

  const privateCount = Array.from(content.matchAll(/private\s+\w+/g)).length
  const exportCount = Array.from(content.matchAll(/^export\s/gm)).length
  if (privateCount > 0 || exportCount > 0) score += 5

  const anyCount = Array.from(content.matchAll(/:\s*any\b/g)).length
  score -= Math.min(15, anyCount * 5)

  const globalVars = Array.from(content.matchAll(/^(?:var|let)\s+\w+\s*=/gm)).length
  score -= Math.min(10, globalVars * 5)

  return Math.max(0, Math.min(100, score))
}

// ─── Welds ─────────────────────────────────────────────────────────────────────

/**
 * Inspect forge welds — code boundary quality.
 *
 * @example
 * inspectWelds('function add(a, b) { return a + b }', 'math.ts') // => ForgeWeld[]
 */
export function inspectWelds(content: string, filePath: string): ForgeWeld[] {
  if (content.trim().length === 0) return []

  const welds: ForgeWeld[] = []

  const functionPattern = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g
  for (const match of content.matchAll(functionPattern)) {
    const name = match[1] ?? ''
    const params = (match[2] ?? '').trim()
    const strength = computeFunctionWeldStrength(params, content, name)
    welds.push({
      location: `${filePath}::${name}`,
      type: 'function-boundary',
      quality: weldStrengthToQuality(strength),
      strength,
      description: `Function ${name}(${params || ''})`,
      issue: strength < 50 ? `Weak function boundary: ${name}` : null,
    })
  }

  const classPattern = /(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/g
  for (const match of content.matchAll(classPattern)) {
    const name = match[1] ?? ''
    const strength = computeClassWeldStrength(name, content)
    welds.push({
      location: `${filePath}::${name}`,
      type: 'class-boundary',
      quality: weldStrengthToQuality(strength),
      strength,
      description: `Class ${name}`,
      issue: strength < 50 ? `Weak class encapsulation: ${name}` : null,
    })
  }

  const exportMatches = Array.from(content.matchAll(/^export\s/gm))
  if (exportMatches.length > 0) {
    const strength = computeModuleWeldStrength(content)
    welds.push({
      location: filePath,
      type: 'module-boundary',
      quality: weldStrengthToQuality(strength),
      strength,
      description: `${exportMatches.length} exports in module`,
      issue: strength < 50 ? 'Inconsistent module boundary' : null,
    })
  }

  const hasTryCatch = content.includes('try') && content.includes('catch')
  if (hasTryCatch || content.includes('throw')) {
    const strength = computeApiWeldStrength(content)
    welds.push({
      location: filePath,
      type: 'api-boundary',
      quality: weldStrengthToQuality(strength),
      strength,
      description: 'Error boundary interface',
      issue: strength < 50 ? 'Incomplete error handling at API boundary' : null,
    })
  }

  return welds
}

function computeFunctionWeldStrength(params: string, _content: string, _name: string): number {
  if (params.length === 0) return 90

  let strength = 60
  const typedParams = Array.from(params.matchAll(/:\s*(?:string|number|boolean|void|object)/g)).length
  const totalParams = params.split(',').length
  if (typedParams === totalParams) strength += 25
  else if (typedParams > 0) strength += 10

  if (totalParams <= 3) strength += 10
  else if (totalParams > 5) strength -= 10

  return Math.max(0, Math.min(100, strength))
}

function computeClassWeldStrength(name: string, content: string): number {
  let strength = 60
  const classBody = extractClassBody(name, content)
  if (!classBody) return 50

  const privateMembers = Array.from(classBody.matchAll(/private\s+\w+/g)).length
  if (privateMembers > 0) strength += 15

  const methods = Array.from(classBody.matchAll(/(?:public|private|protected)?\s+\w+\s*\(/g)).length
  if (methods > 0 && methods <= 10) strength += 10
  else if (methods > 15) strength -= 10

  const hasConstructor = classBody.includes('constructor')
  if (hasConstructor) strength += 5

  return Math.max(0, Math.min(100, strength))
}

function extractClassBody(name: string, content: string): string | null {
  const startIdx = content.indexOf(`class ${name}`)
  if (startIdx === -1) return null
  let braceCount = 0
  let started = false
  let end = startIdx
  for (let i = startIdx; i < content.length; i++) {
    if (content.charAt(i) === '{') {
      braceCount++
      started = true
    } else if (content.charAt(i) === '}') {
      braceCount--
      if (started && braceCount === 0) {
        end = i
        break
      }
    }
  }
  return content.slice(startIdx, end + 1)
}

function computeModuleWeldStrength(content: string): number {
  let strength = 70
  const namedExports = Array.from(content.matchAll(/^export\s+(?:const|let|var|function|class|type|interface|enum)\s/gm)).length
  const reExports = Array.from(content.matchAll(/^export\s+\{/gm)).length
  if (namedExports > 0 && reExports === 0) strength += 10
  if (namedExports + reExports > 20) strength -= 10
  return Math.max(0, Math.min(100, strength))
}

function computeApiWeldStrength(content: string): number {
  let strength = 60
  const tryCount = Array.from(content.matchAll(/\btry\s*\{/g)).length
  const catchCount = Array.from(content.matchAll(/\bcatch\s*\(/g)).length
  if (tryCount > 0 && catchCount >= tryCount) strength += 20
  else if (tryCount > 0) strength += 5

  const throwCount = Array.from(content.matchAll(/\bthrow\s/g)).length
  if (throwCount > 0) strength += 10

  return Math.max(0, Math.min(100, strength))
}

function weldStrengthToQuality(strength: number): WeldQuality {
  if (strength >= 90) return 'seamless'
  if (strength >= 70) return 'clean'
  if (strength >= 50) return 'acceptable'
  if (strength >= 25) return 'rough'
  return 'broken'
}

// ─── Hammer Marks ───────────────────────────────────────────────────────────────

/**
 * Detect hammer marks — craftsmanship evidence.
 *
 * @example
 * detectHammerMarks('console.log("debug")') // => HammerMark[]
 */
export function detectHammerMarks(content: string): HammerMark[] {
  if (content.trim().length === 0) return []

  const marks: HammerMark[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const lineNum = i + 1

    if (/console\.(log|debug|info|warn|error)\s*\(/.test(line)) {
      marks.push({ type: 'rushed', location: lineNum, evidence: 'Debug console call', impact: 'negative' })
    }

    if (/\/\/\s*(TODO|FIXME|HACK|XXX|TEMP)/i.test(line)) {
      marks.push({ type: 'rushed', location: lineNum, evidence: 'TODO/FIXME marker', impact: 'negative' })
    }

    if (/\bdebugger\b/.test(line)) {
      marks.push({ type: 'rushed', location: lineNum, evidence: 'Debugger statement', impact: 'negative' })
    }

    if (/\/\*\*[\s\S]*?\*\//.test(line) || line.trim().startsWith('/**')) {
      marks.push({ type: 'careful', location: lineNum, evidence: 'JSDoc documentation', impact: 'positive' })
    }

    if (/^export\s+(?:async\s+)?function\s+\w+\s*\([^)]*\)\s*:\s*\w+/.test(line.trim())) {
      marks.push({ type: 'skilled', location: lineNum, evidence: 'Typed function signature', impact: 'positive' })
    }

    if (/\bEnum\b|\benum\s+\w+/.test(line)) {
      marks.push({ type: 'skilled', location: lineNum, evidence: 'Enum usage', impact: 'positive' })
    }

    if (/\b(?:Map|Set|WeakMap|WeakSet)\b</.test(line)) {
      marks.push({ type: 'skilled', location: lineNum, evidence: 'Advanced collection type', impact: 'positive' })
    }

    if (/any\b/.test(line) && /:\s*any/.test(line)) {
      marks.push({ type: 'novice', location: lineNum, evidence: 'Using any type', impact: 'negative' })
    }

    if (/eval\s*\(/.test(line)) {
      marks.push({ type: 'novice', location: lineNum, evidence: 'eval() usage', impact: 'negative' })
    }

    if (/\bfor\s*\(\s*let\s+\w+\s*=\s*0\s*;/.test(line) && lines[i + 1]?.includes('.push(')) {
      marks.push({ type: 'novice', location: lineNum, evidence: 'Imperative array construction', impact: 'negative' })
    }

    if (/^import type\s/.test(line.trim())) {
      marks.push({ type: 'careful', location: lineNum, evidence: 'Type-only import', impact: 'positive' })
    }

    if (/\basync\s+function\b|\basync\s+\(/.test(line) && /\bawait\b/.test(line)) {
      marks.push({ type: 'skilled', location: lineNum, evidence: 'Proper async/await usage', impact: 'positive' })
    }
  }

  const exportedFns = Array.from(content.matchAll(/^export\s+(?:async\s+)?function\s+(\w+)/gm))
  const exportedClasses = Array.from(content.matchAll(/^export\s+class\s+(\w+)/gm))
  const exportedTypes = Array.from(content.matchAll(/^export\s+(?:type|interface)\s+(\w+)/gm))

  if (exportedFns.length > 0 && exportedClasses.length > 0 && exportedTypes.length > 0) {
    marks.push({ type: 'master', location: 1, evidence: 'Well-structured module with types, classes, and functions', impact: 'positive' })
  }

  const hasOverloadedPattern = Array.from(content.matchAll(/extends\s+\w+/g)).length > 1
  const hasGenerics = content.includes('<') && content.includes('>')
  if (hasOverloadedPattern && hasGenerics) {
    marks.push({ type: 'overworked', location: 1, evidence: 'Complex generic hierarchy', impact: 'neutral' })
  }

  return marks
}

// ─── Heat Treatment ─────────────────────────────────────────────────────────────

/**
 * Evaluate heat treatment — error handling and edge case coverage.
 *
 * @example
 * evaluateHeatTreatment('try { x() } catch { }') // => HeatTreatment
 */
export function evaluateHeatTreatment(content: string): HeatTreatment {
  if (content.trim().length === 0) {
    return { errorHandling: 0, edgeCaseCoverage: 0, inputValidation: 0, failureRecovery: 0, grade: 'raw' }
  }

  const tryCount = Array.from(content.matchAll(/\btry\s*\{/g)).length
  const catchCount = Array.from(content.matchAll(/\bcatch\s*[\({]/g)).length
  const finallyCount = Array.from(content.matchAll(/\bfinally\s*\{/g)).length
  const throwCount = Array.from(content.matchAll(/\bthrow\s/g)).length

  let errorHandling = 20
  if (tryCount > 0) errorHandling += 15
  if (catchCount > 0) errorHandling += 15
  if (finallyCount > 0) errorHandling += 10
  if (throwCount > 0) errorHandling += 10
  if (content.includes('Error') || content.includes('error')) errorHandling += 10
  if (content.includes('instanceof Error')) errorHandling += 10
  errorHandling = Math.min(100, errorHandling)

  let edgeCaseCoverage = 15
  if (content.includes('null') || content.includes('undefined')) edgeCaseCoverage += 20
  if (/\bif\s*\(/.test(content)) edgeCaseCoverage += 15
  if (content.includes('default:')) edgeCaseCoverage += 15
  if (content.includes('??') || content.includes('?.')) edgeCaseCoverage += 15
  if (/\belse\s+if\b/.test(content)) edgeCaseCoverage += 10
  edgeCaseCoverage = Math.min(100, edgeCaseCoverage)

  let inputValidation = 10
  if (content.includes('typeof')) inputValidation += 20
  if (content.includes('instanceof')) inputValidation += 15
  if (/\bif\s*\(!/.test(content) || /\bif\s*\(\s*\w+\s*===?\s*null/.test(content)) inputValidation += 20
  if (content.includes('Required<') || content.includes('Partial<')) inputValidation += 15
  if (content.includes('assert')) inputValidation += 10
  inputValidation = Math.min(100, inputValidation)

  let failureRecovery = 10
  if (catchCount > 0) failureRecovery += 20
  if (finallyCount > 0) failureRecovery += 20
  if (content.includes('retry') || content.includes('fallback')) failureRecovery += 15
  if (content.includes('.catch(')) failureRecovery += 15
  if (/\breturn\b/.test(content) && catchCount > 0) failureRecovery += 10
  failureRecovery = Math.min(100, failureRecovery)

  const grade = classifyHeatGrade(errorHandling, edgeCaseCoverage, inputValidation, failureRecovery)

  return { errorHandling, edgeCaseCoverage, inputValidation, failureRecovery, grade }
}

function classifyHeatGrade(errorHandling: number, edgeCase: number, validation: number, recovery: number): HeatGrade {
  const avg = (errorHandling + edgeCase + validation + recovery) / 4
  if (avg >= 75) return 'properly-hardened'
  if (avg >= 55) return 'case-hardened'
  if (avg >= 35) return 'annealed'
  if (avg >= 15) return 'raw'
  return 'brittle'
}

// ─── Polish ─────────────────────────────────────────────────────────────────────

/**
 * Compute polish — code cleanliness (0-100).
 *
 * @example
 * computePolish('export function add(a: number, b: number) { return a + b }') // => 90+
 */
export function computePolish(content: string): number {
  if (content.trim().length === 0) return 0

  let score = 70
  const lines = content.split('\n')
  const totalLines = lines.length
  if (totalLines === 0) return 0

  const debugLines = lines.filter(l => /console\.(log|debug|info|warn|error)\s*\(/.test(l)).length
  score -= Math.min(20, debugLines * 5)

  const todoLines = lines.filter(l => /\/\/\s*(TODO|FIXME|HACK|XXX)/i.test(l)).length
  score -= Math.min(15, todoLines * 3)

  const debuggerLines = lines.filter(l => /\bdebugger\b/.test(l)).length
  score -= Math.min(20, debuggerLines * 10)

  const commentedOutCode = lines.filter(l => /^\s*\/\/\s*(const|let|var|function|class|import|export|return|if|for)\s/.test(l)).length
  score -= Math.min(15, commentedOutCode * 3)

  const hasConsistentSemicolons = lines.filter(l => /;\s*$/.test(l)).length
  const noSemicolonLines = lines.filter(l => /\S/.test(l) && !/;\s*$/.test(l) && !/^\s*[/{]/.test(l) && !/^\s*$/.test(l) && !/^\s*\/\//.test(l) && !/^\s*\*/.test(l) && !/^\s*\*/.test(l)).length
  if (hasConsistentSemicolons > noSemicolonLines * 2) score += 5
  else if (noSemicolonLines > hasConsistentSemicolons * 2) score += 5

  const avgLineLength = lines.reduce((s, l) => s + l.length, 0) / totalLines
  if (avgLineLength > 0 && avgLineLength < 80) score += 10
  else if (avgLineLength > 120) score -= 5

  if (content.includes('/**')) score += 5

  return Math.max(0, Math.min(100, score))
}

// ─── Craftsmanship ──────────────────────────────────────────────────────────────

/**
 * Compute overall craftsmanship (0-100).
 *
 * @example
 * computeCraftsmanship(80, welds, marks, heat, 75) // => 70-90
 */
export function computeCraftsmanship(
  temper: number,
  welds: ForgeWeld[],
  hammerMarks: HammerMark[],
  heatTreatment: HeatTreatment,
  polish: number,
): number {
  const avgWeldStrength = welds.length > 0
    ? welds.reduce((s, w) => s + w.strength, 0) / welds.length
    : 70

  const heatAvg = (heatTreatment.errorHandling + heatTreatment.edgeCaseCoverage + heatTreatment.inputValidation + heatTreatment.failureRecovery) / 4

  const positiveMarks = hammerMarks.filter(m => m.impact === 'positive').length
  const negativeMarks = hammerMarks.filter(m => m.impact === 'negative').length
  const totalMarks = hammerMarks.length
  const markScore = totalMarks > 0
    ? 50 + ((positiveMarks - negativeMarks) / totalMarks) * 50
    : 60

  const composite = (
    temper * 0.2 +
    avgWeldStrength * 0.2 +
    heatAvg * 0.2 +
    polish * 0.2 +
    Math.max(0, Math.min(100, markScore)) * 0.2
  )

  return Math.max(0, Math.min(100, Math.round(composite)))
}

// ─── Grade & Metal ──────────────────────────────────────────────────────────────

/**
 * Classify piece grade from craftsmanship.
 *
 * @example
 * classifyGrade(92) // => 'masterwork'
 */
export function classifyGrade(craftsmanship: number): PieceGrade {
  if (craftsmanship >= 90) return 'masterwork'
  if (craftsmanship >= 75) return 'fine'
  if (craftsmanship >= 55) return 'standard'
  if (craftsmanship >= 30) return 'rough'
  return 'pig-iron'
}

/**
 * Classify metal type from craftsmanship and temper.
 *
 * @example
 * classifyMetal(85, 80) // => 'steel'
 */
export function classifyMetal(craftsmanship: number, temper: number): MetalType {
  const combined = craftsmanship * 0.6 + temper * 0.4
  if (combined >= 80) return 'steel'
  if (combined >= 60) return 'iron'
  if (combined >= 40) return 'bronze'
  if (combined >= 20) return 'copper'
  return 'tin'
}

// ─── Forge Quality & Anvil Index ────────────────────────────────────────────────

/**
 * Compute forge quality (0-100).
 *
 * @example
 * computeForgeQuality(stats) // => 75
 */
export function computeForgeQuality(stats: ForgeStats): number {
  const craftsmanshipWeight = stats.avgCraftsmanship * 0.3
  const temperWeight = stats.avgTemper * 0.2
  const polishWeight = stats.avgPolish * 0.15
  const heatWeight = stats.avgHeatTreatment * 0.2
  const weldRatio = stats.totalWelds > 0 ? (stats.seamlessWelds / stats.totalWelds) * 100 : 70
  const weldWeight = weldRatio * 0.15
  return Math.max(0, Math.min(100, Math.round(craftsmanshipWeight + temperWeight + polishWeight + heatWeight + weldWeight)))
}

/**
 * Compute anvil index — production readiness (0-100).
 *
 * @example
 * computeAnvilIndex(stats) // => 80
 */
export function computeAnvilIndex(stats: ForgeStats): number {
  const pigRatio = stats.totalPieces > 0 ? stats.pigIronCount / stats.totalPieces : 0
  const masterRatio = stats.totalPieces > 0 ? stats.masterworkCount / stats.totalPieces : 0
  const brittleRatio = stats.totalPieces > 0 ? stats.brittle / stats.totalPieces : 0
  const rushedRatio = stats.totalHammerMarks > 0 ? stats.rushedMarks / stats.totalHammerMarks : 0

  let score = 50
  score += masterRatio * 30
  score -= pigRatio * 20
  score -= brittleRatio * 15
  score -= rushedRatio * 10
  score += (stats.avgPolish / 100) * 15

  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Classify overall forge quality.
 *
 * @example
 * classifyOverallForge(90, 85) // => 'legendary'
 */
export function classifyOverallForge(forgeQuality: number, anvilIndex: number): OverallForge {
  const combined = forgeQuality * 0.6 + anvilIndex * 0.4
  if (combined >= 85) return 'legendary'
  if (combined >= 70) return 'master'
  if (combined >= 50) return 'journeyman'
  if (combined >= 30) return 'apprentice'
  return 'novice'
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate forge recommendations.
 *
 * @example
 * generateRecommendations(pieces, stats) // => ['Add error handling...']
 */
export function generateRecommendations(pieces: ForgedPiece[], stats: ForgeStats): string[] {
  const recs: string[] = []

  const pigIron = pieces.filter(p => p.grade === 'pig-iron')
  if (pigIron.length > 0) {
    recs.push(`Rework ${pigIron.length} pig-iron file${pigIron.length > 1 ? 's' : ''} — significant quality improvements needed`)
  }

  const brittlePieces = pieces.filter(p => p.heatTreatment.grade === 'brittle' || p.heatTreatment.grade === 'raw')
  if (brittlePieces.length > 0) {
    recs.push(`Add error handling and edge case coverage to ${brittlePieces.length} file${brittlePieces.length > 1 ? 's' : ''} with ${brittlePieces[0]?.heatTreatment.grade ?? 'raw'} heat treatment`)
  }

  const roughWelds = pieces.reduce((s, p) => s + p.welds.filter(w => w.quality === 'rough' || w.quality === 'broken').length, 0)
  if (roughWelds > 0) {
    recs.push(`Improve ${roughWelds} rough/broken weld${roughWelds > 1 ? 's' : ''} — strengthen code boundaries and interfaces`)
  }

  const rushedMarks = pieces.reduce((s, p) => s + p.hammerMarks.filter(m => m.type === 'rushed').length, 0)
  if (rushedMarks > 5) {
    recs.push('High rush mark count — review and refactor rushed code sections carefully')
  }

  if (stats.avgPolish < 50) {
    recs.push('Low average polish — remove debug residue, commented-out code, and clean formatting')
  }

  if (stats.overallForge === 'apprentice' || stats.overallForge === 'novice') {
    recs.push('Overall forge quality is low — consider systematic refactoring to improve craftsmanship')
  }

  const overworked = pieces.filter(p => p.hammerMarks.some(m => m.type === 'overworked'))
  if (overworked.length > 0) {
    recs.push(`${overworked.length} file${overworked.length > 1 ? 's' : ''} show${overworked.length === 1 ? 's' : ''} overwork patterns — simplify abstractions`)
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete forge analysis result.
 *
 * @example
 * buildForgeResult(['a.ts'], ['code'], {}) // => ForgeResult
 */
export function buildForgeResult(files: string[], contents: string[], _options: ForgeOptions): ForgeResult {
  const pieces: ForgedPiece[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const file = files[i] ?? ''

    const temper = evaluateTemper(content)
    const welds = inspectWelds(content, file)
    const hammerMarks = detectHammerMarks(content)
    const heatTreatment = evaluateHeatTreatment(content)
    const polish = computePolish(content)
    const craftsmanship = computeCraftsmanship(temper, welds, hammerMarks, heatTreatment, polish)
    const grade = classifyGrade(craftsmanship)
    const metal = classifyMetal(craftsmanship, temper)

    pieces.push({ file, temper, welds, hammerMarks, heatTreatment, polish, craftsmanship, grade, metal })
  }

  const totalPieces = pieces.length
  const avgTemper = totalPieces > 0 ? Math.round(pieces.reduce((s, p) => s + p.temper, 0) / totalPieces) : 0
  const avgCraftsmanship = totalPieces > 0 ? Math.round(pieces.reduce((s, p) => s + p.craftsmanship, 0) / totalPieces) : 0
  const avgPolish = totalPieces > 0 ? Math.round(pieces.reduce((s, p) => s + p.polish, 0) / totalPieces) : 0
  const masterworkCount = pieces.filter(p => p.grade === 'masterwork').length
  const pigIronCount = pieces.filter(p => p.grade === 'pig-iron').length
  const totalWelds = pieces.reduce((s, p) => s + p.welds.length, 0)
  const seamlessWelds = pieces.reduce((s, p) => s + p.welds.filter(w => w.quality === 'seamless').length, 0)
  const brokenWelds = pieces.reduce((s, p) => s + p.welds.filter(w => w.quality === 'broken').length, 0)
  const totalHammerMarks = pieces.reduce((s, p) => s + p.hammerMarks.length, 0)
  const skilledMarks = pieces.reduce((s, p) => s + p.hammerMarks.filter(m => m.type === 'skilled' || m.type === 'master').length, 0)
  const rushedMarks = pieces.reduce((s, p) => s + p.hammerMarks.filter(m => m.type === 'rushed').length, 0)
  const avgHeatTreatment = totalPieces > 0
    ? Math.round(pieces.reduce((s, p) => {
        const avg = (p.heatTreatment.errorHandling + p.heatTreatment.edgeCaseCoverage + p.heatTreatment.inputValidation + p.heatTreatment.failureRecovery) / 4
        return s + avg
      }, 0) / totalPieces)
    : 0
  const properlyHardened = pieces.filter(p => p.heatTreatment.grade === 'properly-hardened').length
  const brittle = pieces.filter(p => p.heatTreatment.grade === 'brittle' || p.heatTreatment.grade === 'raw').length

  const stats: ForgeStats = {
    totalPieces,
    avgTemper,
    avgCraftsmanship,
    avgPolish,
    masterworkCount,
    pigIronCount,
    totalWelds,
    seamlessWelds,
    brokenWelds,
    totalHammerMarks,
    skilledMarks,
    rushedMarks,
    avgHeatTreatment,
    properlyHardened,
    brittle,
    overallForge: 'journeyman',
    forgeQuality: 0,
    anvilIndex: 0,
  }

  stats.forgeQuality = computeForgeQuality(stats)
  stats.anvilIndex = computeAnvilIndex(stats)
  stats.overallForge = classifyOverallForge(stats.forgeQuality, stats.anvilIndex)

  const recommendations = generateRecommendations(pieces, stats)

  return { pieces, stats, recommendations }
}
