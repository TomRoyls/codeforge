// ─── Types ─────────────────────────────────────────────────────────────────────

export type WeavePattern = 'plain' | 'twill' | 'satin' | 'knit' | 'lace' | 'felt'
export type MaterialType = 'silk' | 'cotton' | 'linen' | 'wool' | 'polyester' | 'burlap'
export type FabricGrade = 'premium' | 'high-quality' | 'standard' | 'economy' | 'reject'
export type DefectType = 'snag' | 'hole' | 'loose-thread' | 'color-bleed' | 'thin-spot' | 'pilling'
export type DefectSeverity = 'minor' | 'major' | 'critical'
export type BatchGrade = 'premium' | 'standard' | 'economy' | 'reject'

export interface FabricDefect {
  type: DefectType
  line: number
  severity: DefectSeverity
  description: string
  fix: string
}

export interface FabricSample {
  file: string
  threadCount: number
  weavePattern: WeavePattern
  material: MaterialType
  dye: string
  dyeConsistency: number
  tensileStrength: number
  threadQuality: number
  overallGrade: FabricGrade
  defects: FabricDefect[]
}

export interface FabricBatch {
  name: string
  samples: FabricSample[]
  avgThreadCount: number
  dominantMaterial: MaterialType
  batchQuality: number
  grade: BatchGrade
}

export interface FabricStats {
  totalSamples: number
  avgThreadCount: number
  premiumCount: number
  rejectCount: number
  dominantMaterial: MaterialType
  dominantWeave: WeavePattern
  avgDyeConsistency: number
  avgTensileStrength: number
  avgThreadQuality: number
  defectCount: number
  criticalDefects: number
  overallFabricQuality: number
  bestBatch: string
  worstBatch: string
}

export interface FabricResult {
  samples: FabricSample[]
  batches: FabricBatch[]
  stats: FabricStats
  recommendations: string[]
}

export interface FabricOptions {
  verbose?: boolean
}

// ─── Content Analysis Helpers ──────────────────────────────────────────────────

/**
 * Count total non-blank lines.
 *
 * @example
 * countNonBlankLines('a\n\nb\nc') // => 3
 */
export function countNonBlankLines(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter(l => l.trim().length > 0).length
}

/**
 * Count total lines.
 *
 * @example
 * countTotalLines('a\nb\nc') // => 3
 */
export function countTotalLines(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').length
}

/**
 * Compute thread count — code density (non-blank / total lines, 0-100).
 *
 * @example
 * computeThreadCount('a\n\nb\nc') // => 75
 */
export function computeThreadCount(content: string): number {
  const total = countTotalLines(content)
  if (total === 0) return 0
  const nonBlank = countNonBlankLines(content)
  return Math.round((nonBlank / total) * 100)
}

/**
 * Count type annotations in content.
 *
 * @example
 * countTypeAnnotations('const x: number = 1; function f(a: string): void {}') // => 3
 */
export function countTypeAnnotations(content: string): number {
  return (content.match(/:\s*(?:string|number|boolean|void|any|never|unknown|object|Array|Record|Map|Set|Promise)\b/g) ?? []).length
}

/**
 * Count JSDoc comments.
 *
 * @example
 * countJSDocComments('/** doc *\\/ function f() {}') // => 1
 */
export function countJSDocComments(content: string): number {
  return (content.match(/\/\*\*[\s\S]*?\*\//g) ?? []).length
}

/**
 * Count exports.
 *
 * @example
 * countExports('export const a = 1; export function b() {}') // => 2
 */
export function countExports(content: string): number {
  return (content.match(/export\s+/g) ?? []).length
}

/**
 * Count JSDoc on exports.
 *
 * @example
 * countJSDocOnExports('/** doc *\\/ export function f() {}') // => 1
 */
export function countJSDocOnExports(content: string): number {
  return (content.match(/\/\*\*[\s\S]*?\*\/\s*export\s+/g) ?? []).length
}

/**
 * Compute cyclomatic complexity.
 *
 * @example
 * computeComplexity('if (a) { if (b) {} }') // => 3
 */
export function computeComplexity(content: string): number {
  const ifCount = (content.match(/\bif\b/g) ?? []).length
  const elseCount = (content.match(/\belse\b/g) ?? []).length
  const switchCount = (content.match(/\bswitch\b/g) ?? []).length
  const caseCount = (content.match(/\bcase\b/g) ?? []).length
  const ternaryCount = (content.match(/\?[^?]/g) ?? []).length
  return 1 + ifCount + elseCount + switchCount + caseCount + ternaryCount
}

/**
 * Count try/catch blocks.
 *
 * @example
 * countTryCatch('try {} catch(e) {}') // => 1
 */
export function countTryCatch(content: string): number {
  return (content.match(/\btry\s*\{/g) ?? []).length
}

/**
 * Count catch blocks with empty body.
 *
 * @example
 * countEmptyCatch('try {} catch(e) {}') // => 1
 */
export function countEmptyCatch(content: string): number {
  return (content.match(/catch\s*\([^)]*\)\s*\{\s*\}/g) ?? []).length
}

/**
 * Count null/undefined checks.
 *
 * @example
 * countNullChecks('if (x !== null) {}') // => 1
 */
export function countNullChecks(content: string): number {
  return (content.match(/[!=]==?\s*(?:null|undefined)\b/g) ?? []).length
}

/**
 * Detect camelCase names.
 *
 * @example
 * extractIdentifiers('const myVar = 1; let other_name = 2') // => ['myVar', 'other_name']
 */
export function extractIdentifiers(content: string): string[] {
  const declarations = content.match(/(?:const|let|var|function|class|interface|type)\s+([A-Za-z_]\w*)/g) ?? []
  return declarations.map(d => d.replace(/^(?:const|let|var|function|class|interface|type)\s+/, ''))
}

// ─── Weave Pattern Classification ──────────────────────────────────────────────

/**
 * Classify the weave pattern of code.
 *
 * @example
 * classifyWeavePattern('const x = 1\nconst y = 2') // => 'plain'
 */
export function classifyWeavePattern(content: string): WeavePattern {
  const lines = content.split('\n').filter(l => l.trim().length > 0)
  if (lines.length === 0) return 'lace'

  const complexity = computeComplexity(content)
  const exports = countExports(content)
  const jsDocCount = countJSDocComments(content)
  const typeAnnotations = countTypeAnnotations(content)

  // lace: very few lines, mostly type-only or empty
  if (lines.length < 5 && exports <= 1 && typeAnnotations <= 2) return 'lace'

  // satin: well-documented, clean interfaces, low complexity
  if (jsDocCount > 0 && exports > 0 && complexity < 8) return 'satin'

  // knit: many overloads/generics — type-heavy, flexible
  const genericCount = (content.match(/<\w+/g) ?? []).length
  const overloadCount = (content.match(/\.\.\./g) ?? []).length
  if (genericCount > 3 || overloadCount > 2) return 'knit'

  // felt: high complexity, dense
  if (complexity > 15) return 'felt'

  // twill: repeating patterns, consistent structure
  const avgLineLength = lines.reduce((s, l) => s + l.length, 0) / lines.length
  const lineLengthVariance = lines.reduce((s, l) => s + Math.abs(l.length - avgLineLength), 0) / lines.length
  if (lineLengthVariance < 10 && lines.length > 5) return 'twill'

  // plain: simple, straightforward
  return 'plain'
}

// ─── Material Classification ───────────────────────────────────────────────────

/**
 * Classify the material quality of code.
 *
 * @example
 * classifyMaterial('/** doc *\\/ export function f(x: number): number { return x }') // => 'silk'
 */
export function classifyMaterial(content: string): MaterialType {
  const typeAnnotations = countTypeAnnotations(content)
  const jsDocOnExports = countJSDocOnExports(content)
  const totalExports = countExports(content)
  const jsDocRatio = totalExports > 0 ? jsDocOnExports / totalExports : 0
  const complexity = computeComplexity(content)
  const hasJSDoc = countJSDocComments(content) > 0
  const lines = countNonBlankLines(content)

  if (lines === 0) return 'burlap'

  // burlap: deprecated patterns, rough code
  const hasDeprecated = /\bvar\s+\w+/.test(content) || /\barguments\b/.test(content) || /require\s*\(/.test(content)
  if (hasDeprecated) return 'burlap'

  // silk: full JSDoc, complete types, low complexity
  if (jsDocRatio >= 0.8 && typeAnnotations > 3 && complexity < 8 && hasJSDoc) return 'silk'

  // cotton: documented, typed, reasonable complexity
  if (jsDocRatio > 0.3 && typeAnnotations > 1 && complexity < 15) return 'cotton'

  // linen: strict types, minimal but clean
  if (typeAnnotations > 3 && complexity < 10) return 'linen'

  // wool: works but types could be tighter
  if (typeAnnotations > 0 && complexity < 20) return 'wool'

  // polyester: functional but not elegant
  if (lines > 0 && complexity < 25) return 'polyester'

  return 'burlap'
}

// ─── Dye Consistency ───────────────────────────────────────────────────────────

/**
 * Detect dominant naming convention.
 *
 * @example
 * detectNamingConvention(['myVar', 'otherVar', 'thirdVar']) // => 'camelCase'
 */
export function detectNamingConvention(names: string[]): string {
  const camelCase = names.filter(n => /^[a-z][a-zA-Z0-9]*$/.test(n)).length
  const PascalCase = names.filter(n => /^[A-Z][a-zA-Z0-9]*$/.test(n)).length
  const snake_case = names.filter(n => /^[a-z][a-z0-9_]*$/.test(n) && n.includes('_')).length
  const UPPER_SNAKE = names.filter(n => /^[A-Z][A-Z0-9_]*$/.test(n) && n.includes('_')).length

  const max = Math.max(camelCase, PascalCase, snake_case, UPPER_SNAKE)
  if (max === 0) return 'mixed'
  if (camelCase === max) return 'camelCase'
  if (PascalCase === max) return 'PascalCase'
  if (snake_case === max) return 'snake_case'
  return 'UPPER_SNAKE'
}

/**
 * Compute dye consistency (naming convention consistency, 0-100).
 *
 * @example
 * computeDyeConsistency('const myVar = 1; const otherVar = 2') // => 100
 */
export function computeDyeConsistency(content: string): number {
  const identifiers = extractIdentifiers(content)
  if (identifiers.length === 0) return 100

  const convention = detectNamingConvention(identifiers)
  if (convention === 'mixed') return 30

  const matching = identifiers.filter(name => {
    if (convention === 'camelCase') return /^[a-z][a-zA-Z0-9]*$/.test(name)
    if (convention === 'PascalCase') return /^[A-Z][a-zA-Z0-9]*$/.test(name)
    if (convention === 'snake_case') return /^[a-z][a-z0-9_]*$/.test(name) || /^[a-z]+$/.test(name)
    if (convention === 'UPPER_SNAKE') return /^[A-Z][A-Z0-9_]*$/.test(name) || /^[A-Z]+$/.test(name)
    return true
  }).length

  return Math.round((matching / identifiers.length) * 100)
}

// ─── Tensile Strength ──────────────────────────────────────────────────────────

/**
 * Compute tensile strength (error handling coverage, 0-100).
 *
 * @example
 * computeTensileStrength('try {} catch(e) { handle(e) }') // => 85
 */
export function computeTensileStrength(content: string): number {
  const lines = countNonBlankLines(content)
  if (lines === 0) return 0

  const tryCatch = countTryCatch(content)
  const emptyCatch = countEmptyCatch(content)
  const nullChecks = countNullChecks(content)
  const catchWithBody = tryCatch - emptyCatch

  let score = 50

  // bonus for having try/catch with actual handling
  score += Math.min(30, catchWithBody * 10)

  // bonus for null checks
  score += Math.min(20, nullChecks * 5)

  // penalty for empty catch blocks
  score -= Math.min(30, emptyCatch * 15)

  return Math.max(0, Math.min(100, score))
}

// ─── Thread Quality ────────────────────────────────────────────────────────────

/**
 * Compute thread quality (type annotation coverage, 0-100).
 *
 * @example
 * computeThreadQuality('function f(x: number): string { return String(x) }') // => 80
 */
export function computeThreadQuality(content: string): number {
  const lines = countNonBlankLines(content)
  if (lines === 0) return 0

  const typeAnnotations = countTypeAnnotations(content)
  const functionCount = (content.match(/\bfunction\s+\w+/g) ?? []).length
    + (content.match(/\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g) ?? []).length
  const paramCount = (content.match(/\([^)]*:\s/g) ?? []).length

  let score = 0

  // base: has any type annotations
  if (typeAnnotations > 0) score += 40

  // bonus: good ratio of annotations to lines
  const annotationRatio = typeAnnotations / lines
  score += Math.min(30, Math.round(annotationRatio * 100))

  // bonus: typed function parameters
  if (functionCount > 0 && paramCount > 0) {
    score += Math.min(30, Math.round((paramCount / functionCount) * 30))
  }

  return Math.max(0, Math.min(100, score))
}

// ─── Overall Grade ─────────────────────────────────────────────────────────────

/**
 * Compute overall fabric grade from a sample.
 *
 * @example
 * computeOverallGrade({ threadCount: 90, dyeConsistency: 95, tensileStrength: 85, threadQuality: 80, material: 'silk', defects: [] })
 * // => 'premium'
 */
export function computeOverallGrade(sample: Pick<FabricSample, 'threadCount' | 'dyeConsistency' | 'tensileStrength' | 'threadQuality' | 'material' | 'defects'>): FabricGrade {
  const { threadCount, dyeConsistency, tensileStrength, threadQuality, material, defects } = sample

  const qualityScore = (threadCount + dyeConsistency + tensileStrength + threadQuality) / 4
  const criticalDefects = defects.filter(d => d.severity === 'critical').length
  const majorDefects = defects.filter(d => d.severity === 'major').length

  if (material === 'silk' && qualityScore >= 80 && criticalDefects === 0 && majorDefects === 0) return 'premium'
  if (qualityScore >= 70 && criticalDefects === 0) return 'high-quality'
  if (qualityScore >= 50 && criticalDefects <= 1) return 'standard'
  if (qualityScore >= 30) return 'economy'
  return 'reject'
}

// ─── Defect Detection ──────────────────────────────────────────────────────────

/**
 * Detect snags — missing null checks and unhandled cases.
 *
 * @example
 * detectSnags('const x = data.field; if (x) {}') // => [{ type: 'snag', ... }]
 */
export function detectSnags(content: string): FabricDefect[] {
  const defects: FabricDefect[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    // missing null check before property access (simplified heuristic)
    const propAccess = line.match(/\.(\w+)\s*[=+\-*/]?=/g)
    if (propAccess && !line.includes('null') && !line.includes('undefined') && !line.includes('?.')) {
      defects.push({
        type: 'snag',
        line: lineNum,
        severity: 'minor',
        description: 'Potential snag: property access without null check',
        fix: 'Consider using optional chaining (?.) or adding a null check',
      })
    }

    // bare catch with no action
    if (/\bcatch\s*\(\w*\)\s*\{\s*\}/.test(line)) {
      defects.push({
        type: 'snag',
        line: lineNum,
        severity: 'major',
        description: 'Snag: catch block silently swallows errors',
        fix: 'Add error handling or logging in the catch block',
      })
    }
  }

  return defects
}

/**
 * Detect holes — missing error handling.
 *
 * @example
 * detectHoles('const data = JSON.parse(input);') // => [{ type: 'hole', ... }]
 */
export function detectHoles(content: string): FabricDefect[] {
  const defects: FabricDefect[] = []
  const lines = content.split('\n')
  const hasTryCatch = countTryCatch(content) > 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    // JSON.parse without try
    if (line.includes('JSON.parse') && !hasTryCatch) {
      defects.push({
        type: 'hole',
        line: lineNum,
        severity: 'major',
        description: 'Hole: JSON.parse without error handling',
        fix: 'Wrap in try/catch to handle malformed JSON',
      })
    }

    // fs operations without try
    if ((line.includes('fs.readFileSync') || line.includes('fs.readFile')) && !hasTryCatch) {
      defects.push({
        type: 'hole',
        line: lineNum,
        severity: 'major',
        description: 'Hole: filesystem operation without error handling',
        fix: 'Wrap in try/catch or use .catch() for file operations',
      })
    }

    // empty catch blocks
    if (/\bcatch\s*\([^)]*\)\s*\{\s*\}/.test(line)) {
      defects.push({
        type: 'hole',
        line: lineNum,
        severity: 'major',
        description: 'Hole: empty catch block — errors silently ignored',
        fix: 'Handle the error: log, rethrow, or take corrective action',
      })
    }
  }

  return defects
}

/**
 * Detect loose threads — unused imports or variables.
 *
 * @example
 * detectLooseThreads('import { unused } from "mod"') // => [{ type: 'loose-thread', ... }]
 */
export function detectLooseThreads(content: string): FabricDefect[] {
  const defects: FabricDefect[] = []
  const lines = content.split('\n')

  // collect imports
  const imports: { name: string; line: number }[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const importMatch = line.match(/import\s+(?:\{([^}]+)\}|(\w+))\s+from/)
    if (importMatch) {
      const names = importMatch[1]
        ? importMatch[1].split(',').map(s => s.trim())
        : [importMatch[2] ?? '']
      for (const name of names) {
        imports.push({ name: name.trim(), line: i + 1 })
      }
    }
  }

  // check if each import is used elsewhere
  for (const imp of imports) {
    if (imp.name.length === 0) continue
    const usagePattern = new RegExp(`\\b${imp.name}\\b`, 'g')
    const usages = content.match(usagePattern) ?? []
    // 1 usage = the import itself, >1 means it's used
    if (usages.length <= 1) {
      defects.push({
        type: 'loose-thread',
        line: imp.line,
        severity: 'minor',
        description: `Loose thread: '${imp.name}' is imported but not used`,
        fix: `Remove unused import '${imp.name}'`,
      })
    }
  }

  return defects
}

/**
 * Detect color bleed — inconsistent naming in the same file.
 *
 * @example
 * detectColorBleed('const myVar = 1; const other_var = 2') // => [{ type: 'color-bleed', ... }]
 */
export function detectColorBleed(content: string): FabricDefect[] {
  const defects: FabricDefect[] = []
  const identifiers = extractIdentifiers(content)

  if (identifiers.length < 2) return defects

  const camelCase = identifiers.filter(n => /^[a-z][a-zA-Z0-9]*$/.test(n))
  const snake_case = identifiers.filter(n => /^[a-z][a-z0-9_]*$/.test(n) && n.includes('_'))
  const PascalCase = identifiers.filter(n => /^[A-Z][a-zA-Z0-9]*$/.test(n))

  const conventions: string[] = []
  if (camelCase.length > 0) conventions.push('camelCase')
  if (snake_case.length > 0) conventions.push('snake_case')
  if (PascalCase.length > 0 && camelCase.length > 0) conventions.push('PascalCase')

  if (conventions.length > 1) {
    defects.push({
      type: 'color-bleed',
      line: 1,
      severity: 'minor',
      description: `Color bleed: mixed naming conventions (${conventions.join(', ')})`,
      fix: `Standardize on one naming convention (${conventions[0]})`,
    })
  }

  return defects
}

/**
 * Detect thin spots — under-documented sections.
 *
 * @example
 * detectThinSpots('export function compute(x) { return x * 2 }') // => [{ type: 'thin-spot', ... }]
 */
export function detectThinSpots(content: string): FabricDefect[] {
  const defects: FabricDefect[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    // export without preceding JSDoc
    if (/^\s*export\s+(function|class|const|interface|type)\s/.test(line)) {
      const prevLine = i > 0 ? lines[i - 1] : ''
      const twoPrev = i > 1 ? lines[i - 2] : ''
      const hasDoc = prevLine.includes('*/') || twoPrev.includes('*/')
      if (!hasDoc) {
        defects.push({
          type: 'thin-spot',
          line: lineNum,
          severity: 'minor',
          description: 'Thin spot: exported symbol without JSDoc documentation',
          fix: 'Add JSDoc documentation above this export',
        })
      }
    }
  }

  return defects
}

/**
 * Detect pilling — accumulated minor issues.
 *
 * @example
 * detectPilling('// TODO: fix\n// FIXME: broken\n// HACK: temp') // => [{ type: 'pilling', ... }]
 */
export function detectPilling(content: string): FabricDefect[] {
  const defects: FabricDefect[] = []
  const todoCount = (content.match(/(?:TODO|FIXME|HACK|XXX)\b/gi) ?? []).length
  const consoleLog = (content.match(/console\.log\s*\(/g) ?? []).length
  const anyType = (content.match(/:\s*any\b/g) ?? []).length

  const issueCount = todoCount + consoleLog + anyType

  if (issueCount >= 3) {
    const details: string[] = []
    if (todoCount > 0) details.push(`${todoCount} TODO/FIXME`)
    if (consoleLog > 0) details.push(`${consoleLog} console.log`)
    if (anyType > 0) details.push(`${anyType} any type`)

    defects.push({
      type: 'pilling',
      line: 1,
      severity: issueCount >= 5 ? 'major' : 'minor',
      description: `Pilling: accumulated issues (${details.join(', ')})`,
      fix: 'Address accumulated TODO/FIXME markers, remove console.log, replace any types',
    })
  }

  return defects
}

/**
 * Run all defect detectors on content.
 *
 * @example
 * detectAllDefects('const x: any = JSON.parse(input)') // => [...]
 */
export function detectAllDefects(content: string): FabricDefect[] {
  return [
    ...detectSnags(content),
    ...detectHoles(content),
    ...detectLooseThreads(content),
    ...detectColorBleed(content),
    ...detectThinSpots(content),
    ...detectPilling(content),
  ]
}

// ─── Batch Grouping ────────────────────────────────────────────────────────────

/**
 * Group samples into batches by directory.
 *
 * @example
 * groupIntoBatches(samples, ['src/a.ts', 'src/b.ts', 'test/c.ts'])
 * // => [{ name: 'src', ... }, { name: 'test', ... }]
 */
export function groupIntoBatches(samples: FabricSample[], files: string[]): FabricBatch[] {
  const dirMap = new Map<string, FabricSample[]>()

  for (let i = 0; i < samples.length; i++) {
    const dir = files[i].includes('/') ? files[i].substring(0, files[i].lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir) ?? []
    existing.push(samples[i])
    dirMap.set(dir, existing)
  }

  const batches: FabricBatch[] = []
  for (const [name, batchSamples] of dirMap) {
    const avgThreadCount = batchSamples.length > 0
      ? Math.round(batchSamples.reduce((s, b) => s + b.threadCount, 0) / batchSamples.length)
      : 0

    // find dominant material
    const materialCounts = new Map<MaterialType, number>()
    for (const s of batchSamples) {
      materialCounts.set(s.material, (materialCounts.get(s.material) ?? 0) + 1)
    }
    let dominantMaterial: MaterialType = 'polyester'
    let maxCount = 0
    for (const [mat, count] of materialCounts) {
      if (count > maxCount) {
        maxCount = count
        dominantMaterial = mat
      }
    }

    const batchQuality = computeBatchQuality(batchSamples)

    batches.push({
      name,
      samples: batchSamples,
      avgThreadCount,
      dominantMaterial,
      batchQuality,
      grade: classifyBatchGrade(batchQuality),
    })
  }

  return batches
}

/**
 * Compute batch quality from samples (0-100).
 *
 * @example
 * computeBatchQuality(samples) // => 72
 */
export function computeBatchQuality(samples: FabricSample[]): number {
  if (samples.length === 0) return 0

  const materialWeights: Record<MaterialType, number> = {
    silk: 100,
    cotton: 80,
    linen: 70,
    wool: 60,
    polyester: 40,
    burlap: 20,
  }

  const total = samples.reduce((sum, s) => {
    const materialScore = materialWeights[s.material]
    const defectPenalty = s.defects.filter(d => d.severity === 'critical').length * 15
      + s.defects.filter(d => d.severity === 'major').length * 5
    return sum + Math.max(0, materialScore - defectPenalty)
  }, 0)

  return Math.min(100, Math.round(total / samples.length))
}

/**
 * Classify batch grade from quality score.
 *
 * @example
 * classifyBatchGrade(85) // => 'premium'
 */
export function classifyBatchGrade(quality: number): BatchGrade {
  if (quality >= 80) return 'premium'
  if (quality >= 55) return 'standard'
  if (quality >= 30) return 'economy'
  return 'reject'
}

// ─── System Metrics ────────────────────────────────────────────────────────────

/**
 * Compute overall fabric quality across all samples (0-100).
 *
 * @example
 * computeOverallFabricQuality(samples) // => 72
 */
export function computeOverallFabricQuality(samples: FabricSample[]): number {
  if (samples.length === 0) return 0

  const total = samples.reduce((sum, s) => {
    return sum + (s.threadCount + s.dyeConsistency + s.tensileStrength + s.threadQuality) / 4
  }, 0)

  return Math.round(total / samples.length)
}

/**
 * Find dominant value in an array.
 *
 * @example
 * findDominant(['silk', 'cotton', 'silk']) // => 'silk'
 */
export function findDominant<T extends string>(values: T[]): T {
  const counts = new Map<T, number>()
  for (const v of values) {
    counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  let dominant = values[0]
  let maxCount = 0
  for (const [val, count] of counts) {
    if (count > maxCount) {
      maxCount = count
      dominant = val
    }
  }
  return dominant
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate fabric quality recommendations.
 *
 * @example
 * generateRecommendations(samples, batches, stats)
 * // => ['Upgrade burlap files with type annotations...']
 */
export function generateRecommendations(samples: FabricSample[], batches: FabricBatch[], stats: FabricStats): string[] {
  const recs: string[] = []

  const burlapFiles = samples.filter(s => s.material === 'burlap')
  if (burlapFiles.length > 0) {
    recs.push(`Upgrade ${burlapFiles.length} burlap file(s) — add type annotations and reduce complexity`)
  }

  const holes = samples.filter(s => s.defects.some(d => d.type === 'hole'))
  if (holes.length > 0) {
    recs.push(`Patch holes in ${holes.length} file(s) — add proper error handling`)
  }

  const colorBleed = samples.filter(s => s.defects.some(d => d.type === 'color-bleed'))
  if (colorBleed.length > 0) {
    recs.push(`Fix color bleed in ${colorBleed.length} file(s) — standardize naming conventions`)
  }

  const rejectBatches = batches.filter(b => b.grade === 'reject')
  if (rejectBatches.length > 0) {
    recs.push(`Quality improvement needed in ${rejectBatches.length} reject batch(es): ${rejectBatches.map(b => b.name).join(', ')}`)
  }

  if (stats.avgThreadQuality < 40) {
    recs.push('Thread quality is low — add more type annotations across the codebase')
  }

  if (stats.avgDyeConsistency < 50) {
    recs.push('Dye consistency is poor — adopt a consistent naming convention')
  }

  if (stats.criticalDefects > 0) {
    recs.push(`${stats.criticalDefects} critical defect(s) require immediate attention`)
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build the full fabric analysis result.
 *
 * @example
 * buildFabricResult(['app.ts'], ['const x = 1'], {})
 * // => { samples: [...], batches: [...], stats: {...}, recommendations: [...] }
 */
export function buildFabricResult(files: string[], contents: string[], options: FabricOptions): FabricResult {
  const samples: FabricSample[] = files.map((file, idx) => {
    const content = contents[idx]
    const threadCount = computeThreadCount(content)
    const weavePattern = classifyWeavePattern(content)
    const material = classifyMaterial(content)
    const dye = detectNamingConvention(extractIdentifiers(content))
    const dyeConsistency = computeDyeConsistency(content)
    const tensileStrength = computeTensileStrength(content)
    const threadQuality = computeThreadQuality(content)
    const defects = detectAllDefects(content)

    const sample: FabricSample = {
      file,
      threadCount,
      weavePattern,
      material,
      dye,
      dyeConsistency,
      tensileStrength,
      threadQuality,
      overallGrade: 'standard',
      defects,
    }

    sample.overallGrade = computeOverallGrade(sample)

    return sample
  })

  const batches = groupIntoBatches(samples, files)

  const premiumCount = samples.filter(s => s.overallGrade === 'premium' || s.overallGrade === 'high-quality').length
  const rejectCount = samples.filter(s => s.overallGrade === 'reject').length

  const allDefects = samples.flatMap(s => s.defects)
  const criticalDefects = allDefects.filter(d => d.severity === 'critical').length

  const avgThreadCount = samples.length > 0
    ? Math.round(samples.reduce((s, x) => s + x.threadCount, 0) / samples.length)
    : 0
  const avgDyeConsistency = samples.length > 0
    ? Math.round(samples.reduce((s, x) => s + x.dyeConsistency, 0) / samples.length)
    : 0
  const avgTensileStrength = samples.length > 0
    ? Math.round(samples.reduce((s, x) => s + x.tensileStrength, 0) / samples.length)
    : 0
  const avgThreadQuality = samples.length > 0
    ? Math.round(samples.reduce((s, x) => s + x.threadQuality, 0) / samples.length)
    : 0

  const sortedBatches = [...batches].sort((a, b) => b.batchQuality - a.batchQuality)
  const bestBatch = sortedBatches.length > 0 ? sortedBatches[0].name : ''
  const worstBatch = sortedBatches.length > 0 ? sortedBatches[sortedBatches.length - 1].name : ''

  const stats: FabricStats = {
    totalSamples: samples.length,
    avgThreadCount,
    premiumCount,
    rejectCount,
    dominantMaterial: samples.length > 0 ? findDominant(samples.map(s => s.material)) : 'polyester',
    dominantWeave: samples.length > 0 ? findDominant(samples.map(s => s.weavePattern)) : 'plain',
    avgDyeConsistency,
    avgTensileStrength,
    avgThreadQuality,
    defectCount: allDefects.length,
    criticalDefects,
    overallFabricQuality: computeOverallFabricQuality(samples),
    bestBatch,
    worstBatch,
  }

  const recommendations = generateRecommendations(samples, batches, stats)

  return { samples, batches, stats, recommendations }
}
