// ─── Types ──────────────────────────────────────────────────────────────────────

export type SymptomSeverity = 'mild' | 'moderate' | 'severe' | 'critical'
export type SymptomCategory = 'structural' | 'behavioral' | 'cosmetic' | 'performance' | 'security' | 'maintainability'
export type ChronicLevel = 'acute' | 'chronic' | 'terminal'
export type SpreadRisk = 'contained' | 'local' | 'systemic' | 'pandemic'
export type Dosage = 'single-file' | 'module' | 'codebase-wide'
export type Difficulty = 'trivial' | 'easy' | 'moderate' | 'difficult'
export type IngredientType = 'pattern' | 'refactor' | 'test' | 'documentation' | 'type' | 'config'
export type OverallHealth = 'robust' | 'healthy' | 'ailing' | 'sick' | 'critical'
export type Recovery = 'quick' | 'moderate' | 'long-term' | 'major-surgery'

export interface Symptom {
  name: string
  file: string
  line: number
  severity: SymptomSeverity
  category: SymptomCategory
  description: string
  indicators: string[]
}

export interface Ailment {
  name: string
  symptoms: string[]
  diagnosis: string
  affectedFiles: string[]
  chronicLevel: ChronicLevel
  spreadRisk: SpreadRisk
  description: string
}

export interface RemedyIngredient {
  name: string
  type: IngredientType
  description: string
}

export interface Remedy {
  name: string
  targetAilment: string
  ingredients: RemedyIngredient[]
  preparation: string[]
  dosage: Dosage
  sideEffects: string[]
  contraindications: string[]
  effectiveness: number
  difficulty: Difficulty
}

export interface MedicineCabinet {
  file: string
  existingRemedies: string[]
  missingRemedies: string[]
  cabinetScore: number
  isWellEquipped: boolean
}

export interface ApothecaryStats {
  totalSymptoms: number
  mildSymptoms: number
  severeSymptoms: number
  criticalSymptoms: number
  totalAilments: number
  acuteAilments: number
  chronicAilments: number
  totalRemedies: number
  easyRemedies: number
  difficultRemedies: number
  avgEffectiveness: number
  avgCabinetScore: number
  wellEquippedFiles: number
  poorlyEquippedFiles: number
  overallHealth: OverallHealth
  healthIndex: number
  treatmentPriority: string
  estimatedRecovery: Recovery
}

export interface ApothecaryResult {
  symptoms: Symptom[]
  ailments: Ailment[]
  remedies: Remedy[]
  cabinet: MedicineCabinet[]
  stats: ApothecaryStats
  recommendations: string[]
}

export interface ApothecaryOptions {
  verbose?: boolean
  format?: string
  output?: string
  ignore?: string[]
  ext?: string
}

// ─── Symptom Detection ─────────────────────────────────────────────────────────

/**
 * Detect code symptoms in a file.
 *
 * @example
 * detectSymptoms('if (a) { if (b) { if (c) {} } }', 'a.ts') // => Symptom[]
 */
export function detectSymptoms(content: string, filePath: string): Symptom[] {
  if (content.trim().length === 0) return []

  const symptoms: Symptom[] = []
  const lines = content.split('\n')

  let maxNesting = 0
  let currentNesting = 0
  for (const line of lines) {
    const opens = (line.match(/\{/g) ?? []).length
    const closes = (line.match(/\}/g) ?? []).length
    currentNesting += opens - closes
    if (currentNesting > maxNesting) maxNesting = currentNesting
  }

  if (maxNesting > 5) {
    symptoms.push({
      name: 'excessive-nesting', file: filePath, line: 1,
      severity: maxNesting > 8 ? 'critical' : maxNesting > 6 ? 'severe' : 'moderate',
      category: 'structural',
      description: `Nesting depth of ${maxNesting} exceeds recommended 4`,
      indicators: [`max-nesting:${maxNesting}`],
    })
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const stripped = line?.trimStart()
    const indent = line?.length - stripped?.length

    if (indent > 24) {
      symptoms.push({
        name: 'deep-indentation', file: filePath, line: i + 1,
        severity: 'mild', category: 'cosmetic',
        description: `Deep indentation (${indent} spaces) suggests excessive nesting`,
        indicators: [`indent:${indent}`],
      })
      break
    }
  }

  const fnMatches = Array.from(content.matchAll(/(?:function\s+\w+|(?:const|let)\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*(?::\s*[^=]+)?\s*=>)/g))
  for (const m of fnMatches) {
    const startIdx = m.index ?? 0
    const before = content.substring(0, startIdx)
    const lineNum = (before.match(/\n/g) ?? []).length + 1
    let braceCount = 0
    let fnBody = ''
    let started = false
    for (let ci = startIdx; ci < content.length; ci++) {
      const ch = content[ci]
      if (ch === '{') { braceCount++; started = true }
      if (ch === '}') braceCount--
      if (started) fnBody += ch
      if (started && braceCount === 0) break
    }
    const fnLines = fnBody.split('\n').length
    if (fnLines > 40) {
      symptoms.push({
        name: 'long-function', file: filePath, line: lineNum,
        severity: fnLines > 60 ? 'severe' : 'moderate',
        category: 'structural',
        description: `Function '${m[0].split(/\s+/).pop()}' is ${fnLines} lines (max 40 recommended)`,
        indicators: [`lines:${fnLines}`],
      })
    }
  }

  const anyUsage = Array.from(content.matchAll(/:\s*any\b/g))
  if (anyUsage.length > 0) {
    const lineNum = (content.substring(0, anyUsage[0]?.index ?? 0).match(/\n/g) ?? []).length + 1
    symptoms.push({
      name: 'missing-types', file: filePath, line: lineNum,
      severity: anyUsage.length > 3 ? 'severe' : 'moderate',
      category: 'maintainability',
      description: `${anyUsage.length} 'any' type${anyUsage.length > 1 ? 's' : ''} found`,
      indicators: [`any-count:${anyUsage.length}`],
    })
  }

  const todoFixme = Array.from(content.matchAll(/(?:TODO|FIXME|HACK|XXX)[\s:]/gi))
  if (todoFixme.length > 0) {
    const lineNum = (content.substring(0, todoFixme[0]?.index ?? 0).match(/\n/g) ?? []).length + 1
    symptoms.push({
      name: 'debt-accumulation', file: filePath, line: lineNum,
      severity: todoFixme.length > 5 ? 'severe' : 'moderate',
      category: 'maintainability',
      description: `${todoFixme.length} TODO/FIXME/HACK comment${todoFixme.length > 1 ? 's' : ''}`,
      indicators: [`count:${todoFixme.length}`],
    })
  }

  const evalUsage = Array.from(content.matchAll(/\beval\s*\(/g))
  if (evalUsage.length > 0) {
    symptoms.push({
      name: 'eval-usage', file: filePath, line: 1,
      severity: 'critical', category: 'security',
      description: 'eval() usage detected — potential code injection risk',
      indicators: ['eval-call'],
    })
  }

  const magicNums = Array.from(content.matchAll(/(?<![.\w])\d{4,}(?![.\w])/g))
  if (magicNums.length > 3) {
    symptoms.push({
      name: 'magic-numbers', file: filePath, line: 1,
      severity: 'mild', category: 'maintainability',
      description: `${magicNums.length} potential magic numbers found`,
      indicators: [`count:${magicNums.length}`],
    })
  }

  const imports = Array.from(content.matchAll(/^import\s+/gm))
  if (imports.length > 15) {
    symptoms.push({
      name: 'import-overload', file: filePath, line: 1,
      severity: imports.length > 25 ? 'severe' : 'moderate',
      category: 'structural',
      description: `${imports.length} imports — high dependency count`,
      indicators: [`import-count:${imports.length}`],
    })
  }

  const globalMuts = Array.from(content.matchAll(/(?:globalThis|window|global)\.\w+\s*=/g))
  const arrMuts = Array.from(content.matchAll(/\.push\(|\.splice\(|\.sort\s*\(\s*\)/g))
  const mutations = globalMuts.concat(arrMuts)
  if (mutations.length > 2) {
    symptoms.push({
      name: 'mutation-risk', file: filePath, line: 1,
      severity: mutations.length > 5 ? 'severe' : 'moderate',
      category: 'behavioral',
      description: `${mutations.length} potential mutation${mutations.length > 1 ? 's' : ''} detected`,
      indicators: [`mutation-count:${mutations.length}`],
    })
  }

  return symptoms
}

// ─── Ailment Diagnosis ─────────────────────────────────────────────────────────

/**
 * Diagnose ailments from symptoms.
 *
 * @example
 * diagnoseAilments(symptoms) // => Ailment[]
 */
export function diagnoseAilments(symptoms: Symptom[]): Ailment[] {
  if (symptoms.length === 0) return []

  const ailments: Ailment[] = []
  const symptomNames = new Set(symptoms.map(s => s.name))
  const symptomFiles = Array.from(new Set(symptoms.map(s => s.file)))

  const ailmentDefs: Array<{
    name: string
    triggers: string[]
    diagnosis: string
    description: string
  }> = [
    {
      name: 'complexity-fever',
      triggers: ['excessive-nesting', 'long-function', 'deep-indentation'],
      diagnosis: 'Code is too complex — functions are too long and nesting is too deep',
      description: 'Structural complexity making code hard to understand and maintain',
    },
    {
      name: 'type-blindness',
      triggers: ['missing-types'],
      diagnosis: 'Missing type safety — code relies on implicit any and lacks type annotations',
      description: 'Insufficient type coverage leading to runtime type errors',
    },
    {
      name: 'debt-accumulation',
      triggers: ['debt-accumulation'],
      diagnosis: 'Technical debt is accumulating — many TODO/FIXME markers left unresolved',
      description: 'Unresolved technical debt increasing maintenance burden',
    },
    {
      name: 'dependency-addiction',
      triggers: ['import-overload'],
      diagnosis: 'Too many dependencies — file is tightly coupled to many modules',
      description: 'Excessive coupling reducing modularity',
    },
    {
      name: 'mutation-sickness',
      triggers: ['mutation-risk'],
      diagnosis: 'Side effects and mutations — code mutates state unpredictably',
      description: 'State mutations causing unpredictable behavior',
    },
    {
      name: 'security-vulnerability',
      triggers: ['eval-usage'],
      diagnosis: 'Security risk — eval() usage allows arbitrary code execution',
      description: 'Critical security vulnerability',
    },
  ]

  for (const def of ailmentDefs) {
    const matched = def.triggers.filter(t => symptomNames.has(t))
    if (matched.length === 0) continue

    const matchedSymptoms = symptoms.filter(s => matched.includes(s.name))
    const affectedFiles = Array.from(new Set(matchedSymptoms.map(s => s.file)))
    const hasCritical = matchedSymptoms.some(s => s.severity === 'critical')
    const hasSevere = matchedSymptoms.some(s => s.severity === 'severe')
    const fileRatio = affectedFiles.length / Math.max(1, symptomFiles.length)

    let chronicLevel: ChronicLevel = 'acute'
    if (hasCritical) chronicLevel = 'terminal'
    else if (hasSevere && affectedFiles.length > 3) chronicLevel = 'chronic'

    let spreadRisk: SpreadRisk = 'contained'
    if (fileRatio > 0.6) spreadRisk = 'pandemic'
    else if (fileRatio > 0.3) spreadRisk = 'systemic'
    else if (affectedFiles.length > 1) spreadRisk = 'local'

    ailments.push({
      name: def.name,
      symptoms: matched,
      diagnosis: def.diagnosis,
      affectedFiles,
      chronicLevel,
      spreadRisk,
      description: def.description,
    })
  }

  return ailments
}

// ─── Remedy Prescription ───────────────────────────────────────────────────────

/**
 * Prescribe remedies for diagnosed ailments.
 *
 * @example
 * prescribeRemedies(ailments, symptoms) // => Remedy[]
 */
export function prescribeRemedies(ailments: Ailment[], _symptoms: Symptom[]): Remedy[] {
  if (ailments.length === 0) return []

  const remedies: Remedy[] = []

  const remedyMap: Record<string, Remedy> = {
    'complexity-fever': {
      name: 'extract-function',
      targetAilment: 'complexity-fever',
      ingredients: [
        { name: 'extract-method', type: 'refactor', description: 'Extract nested logic into named functions' },
        { name: 'early-return', type: 'pattern', description: 'Use guard clauses to reduce nesting' },
      ],
      preparation: ['Identify deeply nested blocks', 'Extract inner blocks into functions', 'Replace conditions with guard clauses'],
      dosage: 'single-file',
      sideEffects: ['May increase number of small functions', 'Requires updating tests'],
      contraindications: ['Performance-critical hot paths where function call overhead matters'],
      effectiveness: 80,
      difficulty: 'moderate',
    },
    'type-blindness': {
      name: 'add-type-annotations',
      targetAilment: 'type-blindness',
      ingredients: [
        { name: 'replace-any', type: 'type', description: 'Replace any with specific types' },
        { name: 'add-generics', type: 'type', description: 'Use generics for flexible typing' },
      ],
      preparation: ['Enable strict mode in tsconfig', 'Replace any with proper types', 'Add return type annotations'],
      dosage: 'module',
      sideEffects: ['May reveal hidden type errors', 'Requires fixing downstream code'],
      contraindications: ['Prototype/spike code that will be thrown away'],
      effectiveness: 90,
      difficulty: 'easy',
    },
    'debt-accumulation': {
      name: 'resolve-tech-debt',
      targetAilment: 'debt-accumulation',
      ingredients: [
        { name: 'triage-todos', type: 'documentation', description: 'Review and prioritize TODO items' },
        { name: 'fix-hacks', type: 'refactor', description: 'Replace workaround code with proper solutions' },
      ],
      preparation: ['List all TODO/FIXME items', 'Prioritize by severity', 'Fix or create issues for each'],
      dosage: 'codebase-wide',
      sideEffects: ['May uncover deeper issues', 'Time-consuming'],
      contraindications: ['Pre-release when stability is priority'],
      effectiveness: 60,
      difficulty: 'moderate',
    },
    'dependency-addiction': {
      name: 'reduce-coupling',
      targetAilment: 'dependency-addiction',
      ingredients: [
        { name: 'dependency-injection', type: 'pattern', description: 'Inject dependencies instead of importing' },
        { name: 'module-split', type: 'refactor', description: 'Split large files into focused modules' },
      ],
      preparation: ['Identify core vs peripheral dependencies', 'Group related functionality', 'Extract interfaces'],
      dosage: 'module',
      sideEffects: ['More files to manage', 'May need dependency injection framework'],
      contraindications: ['Simple scripts with few dependencies'],
      effectiveness: 70,
      difficulty: 'difficult',
    },
    'mutation-sickness': {
      name: 'immutable-patterns',
      targetAilment: 'mutation-sickness',
      ingredients: [
        { name: 'const-over-let', type: 'pattern', description: 'Use const instead of let' },
        { name: 'immutable-ops', type: 'pattern', description: 'Use spread/map/filter instead of mutation' },
      ],
      preparation: ['Replace let with const where possible', 'Use immutable array operations', 'Remove global mutations'],
      dosage: 'single-file',
      sideEffects: ['May increase memory usage', 'Requires thinking in functional style'],
      contraindications: ['Performance-critical loops with large datasets'],
      effectiveness: 75,
      difficulty: 'easy',
    },
    'security-vulnerability': {
      name: 'remove-eval',
      targetAilment: 'security-vulnerability',
      ingredients: [
        { name: 'replace-eval', type: 'refactor', description: 'Replace eval with safe alternatives' },
        { name: 'input-sanitization', type: 'pattern', description: 'Validate and sanitize all inputs' },
      ],
      preparation: ['Identify eval usage', 'Replace with JSON.parse or Function constructor', 'Add input validation'],
      dosage: 'single-file',
      sideEffects: ['May require restructuring dynamic code patterns'],
      contraindications: ['Legitimate sandboxed eval usage with full input control'],
      effectiveness: 95,
      difficulty: 'trivial',
    },
  }

  for (const ailment of ailments) {
    const remedy = remedyMap[ailment.name]
    if (remedy) {
      remedies.push({ ...remedy })
    }
  }

  return remedies
}

// ─── Medicine Cabinet ──────────────────────────────────────────────────────────

/**
 * Evaluate medicine cabinet for a file.
 *
 * @example
 * evaluateMedicineCabinet('try { foo(); } catch(e) {}', 'a.ts') // => MedicineCabinet
 */
export function evaluateMedicineCabinet(content: string, filePath: string): MedicineCabinet {
  if (content.trim().length === 0) {
    return { file: filePath, existingRemedies: [], missingRemedies: [], cabinetScore: 100, isWellEquipped: true }
  }

  const existing: string[] = []
  const missing: string[] = []

  if (/try\s*\{/.test(content)) existing.push('error-handling')
  else if (/\.\w+\(/.test(content)) missing.push('error-handling')

  if (/typeof\s+\w+\s*===?\s*['"]/.test(content) || /instanceof\s+\w+/.test(content)) {
    existing.push('type-guards')
  } else if (/:\s*any\b/.test(content)) {
    missing.push('type-guards')
  }

  if (/\?\./.test(content) || /\?\?/.test(content)) {
    existing.push('null-safety')
  }

  if (/if\s*\([^)]*!==?\s*null/.test(content) || /if\s*\([^)]*!==?\s*undefined/.test(content)) {
    existing.push('null-checks')
  }

  if (/\/\*\*[\s\S]*?\*\//.test(content)) existing.push('jsdoc')
  else missing.push('jsdoc')

  if (/\bconst\s+/.test(content) && !/\blet\s+/.test(content)) {
    existing.push('immutability')
  } else if (/\blet\s+\w+/.test(content)) {
    missing.push('immutability')
  }

  const score = Math.min(100, existing.length * 20)

  return {
    file: filePath,
    existingRemedies: existing,
    missingRemedies: missing,
    cabinetScore: score,
    isWellEquipped: score >= 60,
  }
}

// ─── Computed Metrics ──────────────────────────────────────────────────────────

/**
 * Compute health index.
 *
 * @example
 * computeHealthIndex(symptoms, ailments, cabinet) // => 75
 */
export function computeHealthIndex(
  symptoms: Symptom[],
  ailments: Ailment[],
  cabinet: MedicineCabinet[],
): number {
  let score = 100

  score -= symptoms.filter(s => s.severity === 'critical').length * 15
  score -= symptoms.filter(s => s.severity === 'severe').length * 8
  score -= symptoms.filter(s => s.severity === 'moderate').length * 3
  score -= symptoms.filter(s => s.severity === 'mild').length * 1
  score -= ailments.filter(a => a.chronicLevel === 'terminal').length * 20
  score -= ailments.filter(a => a.chronicLevel === 'chronic').length * 10

  if (cabinet.length > 0) {
    const avgCabinet = cabinet.reduce((s, c) => s + c.cabinetScore, 0) / cabinet.length
    score += Math.round(avgCabinet * 0.1)
  }

  return Math.max(0, Math.min(100, score))
}

/**
 * Classify overall health.
 *
 * @example
 * classifyOverallHealth(85) // => 'healthy'
 */
export function classifyOverallHealth(healthIndex: number): OverallHealth {
  if (healthIndex >= 80) return 'robust'
  if (healthIndex >= 60) return 'healthy'
  if (healthIndex >= 40) return 'ailing'
  if (healthIndex >= 20) return 'sick'
  return 'critical'
}

/**
 * Determine treatment priority.
 *
 * @example
 * determineTreatmentPriority(remedies) // => 'remove-eval'
 */
export function determineTreatmentPriority(remedies: Remedy[]): string {
  if (remedies.length === 0) return 'none'
  const sorted = [...remedies].sort((a, b) => b.effectiveness - a.effectiveness)
  return sorted[0]?.name ?? ''
}

/**
 * Estimate recovery time.
 *
 * @example
 * estimateRecovery(stats) // => 'quick'
 */
export function estimateRecovery(stats: ApothecaryStats): Recovery {
  if (stats.criticalSymptoms === 0 && stats.totalAilments <= 1) return 'quick'
  if (stats.chronicAilments === 0 && stats.totalAilments <= 3) return 'moderate'
  if (stats.totalAilments <= 5) return 'long-term'
  return 'major-surgery'
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate apothecary recommendations.
 *
 * @example
 * generateRecommendations(symptoms, ailments, remedies, stats) // => string[]
 */
export function generateRecommendations(
  _symptoms: Symptom[],
  ailments: Ailment[],
  remedies: Remedy[],
  stats: ApothecaryStats,
): string[] {
  const recs: string[] = []

  const terminal = ailments.filter(a => a.chronicLevel === 'terminal')
  if (terminal.length > 0) {
    recs.push(`${terminal.length} terminal ailment${terminal.length > 1 ? 's' : ''} (${terminal.map(a => a.name).join(', ')}) — treat immediately`)
  }

  const easyWins = remedies.filter(r => r.difficulty === 'trivial' || r.difficulty === 'easy')
  if (easyWins.length > 0) {
    recs.push(`${easyWins.length} quick win${easyWins.length > 1 ? 's' : ''} available: ${easyWins.map(r => r.name).join(', ')}`)
  }

  if (stats.poorlyEquippedFiles > 0) {
    recs.push(`${stats.poorlyEquippedFiles} file${stats.poorlyEquippedFiles > 1 ? 's' : ''} with poor medicine cabinets — add error handling, type guards, and documentation`)
  }

  const highEff = remedies.filter(r => r.effectiveness >= 80)
  if (highEff.length > 0) {
    recs.push(`High-impact remedies: ${highEff.map(r => `${r.name} (${r.effectiveness}%)`).join(', ')}`)
  }

  if (stats.overallHealth === 'critical' || stats.overallHealth === 'sick') {
    recs.push('Codebase health is poor — focus on critical ailments first, then stock medicine cabinets')
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete apothecary analysis result.
 *
 * @example
 * buildApothecaryResult(['a.ts'], ['code'], {}) // => ApothecaryResult
 */
export function buildApothecaryResult(files: string[], contents: string[], _options: ApothecaryOptions): ApothecaryResult {
  if (files.length === 0) {
    const emptyStats: ApothecaryStats = {
      totalSymptoms: 0, mildSymptoms: 0, severeSymptoms: 0, criticalSymptoms: 0,
      totalAilments: 0, acuteAilments: 0, chronicAilments: 0,
      totalRemedies: 0, easyRemedies: 0, difficultRemedies: 0,
      avgEffectiveness: 0, avgCabinetScore: 100,
      wellEquippedFiles: 0, poorlyEquippedFiles: 0,
      overallHealth: 'robust', healthIndex: 100,
      treatmentPriority: 'none', estimatedRecovery: 'quick',
    }
    return { symptoms: [], ailments: [], remedies: [], cabinet: [], stats: emptyStats, recommendations: [] }
  }

  const allSymptoms: Symptom[] = []
  const cabinet: MedicineCabinet[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const symptoms = detectSymptoms(content, files[i] ?? '')
    allSymptoms.push(...symptoms)
    cabinet.push(evaluateMedicineCabinet(content, files[i] ?? ''))
  }

  const ailments = diagnoseAilments(allSymptoms)
  const remedies = prescribeRemedies(ailments, allSymptoms)

  const mildSymptoms = allSymptoms.filter(s => s.severity === 'mild').length
  const severeSymptoms = allSymptoms.filter(s => s.severity === 'severe').length
  const criticalSymptoms = allSymptoms.filter(s => s.severity === 'critical').length
  const acuteAilments = ailments.filter(a => a.chronicLevel === 'acute').length
  const chronicAilments = ailments.filter(a => a.chronicLevel === 'chronic' || a.chronicLevel === 'terminal').length
  const easyRemedies = remedies.filter(r => r.difficulty === 'trivial' || r.difficulty === 'easy').length
  const difficultRemedies = remedies.filter(r => r.difficulty === 'difficult').length
  const avgEffectiveness = remedies.length > 0
    ? Math.round(remedies.reduce((s, r) => s + r.effectiveness, 0) / remedies.length)
    : 0
  const avgCabinetScore = Math.round(cabinet.reduce((s, c) => s + c.cabinetScore, 0) / cabinet.length)
  const wellEquippedFiles = cabinet.filter(c => c.isWellEquipped).length
  const poorlyEquippedFiles = cabinet.length - wellEquippedFiles
  const healthIndex = computeHealthIndex(allSymptoms, ailments, cabinet)
  const overallHealth = classifyOverallHealth(healthIndex)
  const treatmentPriority = determineTreatmentPriority(remedies)

  const stats: ApothecaryStats = {
    totalSymptoms: allSymptoms.length,
    mildSymptoms,
    severeSymptoms,
    criticalSymptoms,
    totalAilments: ailments.length,
    acuteAilments,
    chronicAilments,
    totalRemedies: remedies.length,
    easyRemedies,
    difficultRemedies,
    avgEffectiveness,
    avgCabinetScore,
    wellEquippedFiles,
    poorlyEquippedFiles,
    overallHealth,
    healthIndex,
    treatmentPriority,
    estimatedRecovery: 'quick',
  }
  stats.estimatedRecovery = estimateRecovery(stats)

  const recommendations = generateRecommendations(allSymptoms, ailments, remedies, stats)

  return { symptoms: allSymptoms, ailments, remedies, cabinet, stats, recommendations }
}
