// ─── Types ─────────────────────────────────────────────────────────────────────

export type StageName = 'egg' | 'larva' | 'pupa' | 'chrysalis' | 'butterfly' | 'fossil'
export type PressureType = 'feature-demand' | 'bug-pressure' | 'refactor-need' | 'tech-debt' | 'modernization'

export interface LifeStage {
  stage: StageName
  description: string
  criteria: string[]
}

export interface Transformation {
  file: string
  currentStage: LifeStage
  previousStages: string[]
  transformations: number
  growthRate: number
  maturationScore: number
  nextStage: string
  blockers: string[]
}

export interface EvolutionaryPressure {
  type: PressureType
  files: string[]
  strength: number
  description: string
}

export interface MetamorphosisStats {
  totalFiles: number
  eggCount: number
  larvaCount: number
  pupaCount: number
  chrysalisCount: number
  butterflyCount: number
  fossilCount: number
  avgMaturation: number
  mostMature: string
  leastMature: string
  mostTransformed: string
  evolutionaryPressure: number
  ecosystemMaturity: number
}

export interface MetamorphosisResult {
  transformations: Transformation[]
  pressures: EvolutionaryPressure[]
  stats: MetamorphosisStats
  recommendations: string[]
}

export interface MetamorphosisOptions {
  verbose?: boolean
}

// ─── Content Analysis Helpers ──────────────────────────────────────────────────

/**
 * Count lines in content.
 *
 * @example
 * countLines('a\nb\nc') // => 3
 */
export function countLines(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').length
}

/**
 * Check if content has JSDoc comments.
 *
 * @example
 * hasJSDoc('/** doc *\\/ export function f() {}') // => true
 */
export function hasJSDoc(content: string): boolean {
  return /\/\*\*[\s\S]*?\*\//.test(content)
}

/**
 * Count JSDoc comments covering exports.
 *
 * @example
 * countJSDocOnExports('/** doc *\\/ export function f() {}') // => 1
 */
export function countJSDocOnExports(content: string): number {
  const matches = content.match(/\/\*\*[\s\S]*?\*\/\s*export\s+/g) ?? []
  return matches.length
}

/**
 * Count total exports in content.
 *
 * @example
 * countExports('export const a = 1; export function b() {}') // => 2
 */
export function countExports(content: string): number {
  return (content.match(/export\s+/g) ?? []).length
}

/**
 * Compute cyclomatic complexity estimate.
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
 * Check if file has an associated test file.
 *
 * @example
 * hasTestFile('app.ts', ['app.ts', 'app.test.ts']) // => true
 */
export function hasTestFile(file: string, allFiles: string[]): boolean {
  const base = file.replace(/\.\w+$/, '')
  return allFiles.some(f =>
    f !== file && (f.includes('.test.') || f.includes('.spec.')) && f.includes(base.split('/').pop() ?? '')
  )
}

/**
 * Check if content has type annotations.
 *
 * @example
 * hasTypeAnnotations('const x: number = 1') // => true
 */
export function hasTypeAnnotations(content: string): boolean {
  return /:\s*(?:string|number|boolean|void|any|never|unknown|object)\b/.test(content)
}

/**
 * Check if content has functions or classes.
 *
 * @example
 * hasFunctionsOrClasses('function run() {}') // => true
 */
export function hasFunctionsOrClasses(content: string): boolean {
  return /\b(function\s+\w+|class\s+\w+|\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)/.test(content)
}

/**
 * Count TODO/FIXME markers.
 *
 * @example
 * countTodos('// TODO: fix this') // => 1
 */
export function countTodos(content: string): number {
  return (content.match(/(?:TODO|FIXME|HACK|XXX)\b/gi) ?? []).length
}

/**
 * Check for deprecated patterns.
 *
 * @example
 * hasDeprecatedPatterns('var x = 1') // => true
 */
export function hasDeprecatedPatterns(content: string): boolean {
  return /\bvar\s+\w+/.test(content) || /\barguments\b/.test(content) || /require\s*\(/.test(content)
}

// ─── Life Stage Classification ─────────────────────────────────────────────────

const STAGE_ORDER: StageName[] = ['egg', 'larva', 'pupa', 'chrysalis', 'butterfly']

/**
 * Classify the life stage of a file.
 *
 * @example
 * classifyLifeStage('app.ts', '', [], false) // => { stage: 'egg', ... }
 */
export function classifyLifeStage(file: string, content: string, allFiles: string[], isFossil: boolean): LifeStage {
  if (isFossil && countLines(content) >= 10) {
    return { stage: 'fossil', description: 'Ancient, unchanged code', criteria: ['no recent changes', 'still in use'] }
  }

  const lines = countLines(content)
  const complexity = computeComplexity(content)
  const jsDocOnExports = countJSDocOnExports(content)
  const totalExports = countExports(content)
  const jsDocRatio = totalExports > 0 ? jsDocOnExports / totalExports : 0
  const hasTest = hasTestFile(file, allFiles)

  // egg: < 10 lines
  if (lines < 10) {
    return { stage: 'egg', description: 'Newly created, minimal content', criteria: ['< 10 lines'] }
  }

  // butterfly: JSDoc on > 80% exports, test exists, low complexity
  if (jsDocRatio > 0.8 && hasTest && complexity < 10 && hasJSDoc(content)) {
    return { stage: 'butterfly', description: 'Mature, polished, well-documented', criteria: ['JSDoc on >80% exports', 'test file exists', 'low complexity'] }
  }

  // chrysalis: has JSDoc on some exports or test exists
  if ((jsDocRatio > 0 || hasJSDoc(content)) && hasTest) {
    return { stage: 'chrysalis', description: 'Actively being refined', criteria: ['has JSDoc', 'test file exists', 'still evolving'] }
  }

  // pupa: has functions/classes, basic structure
  if (hasFunctionsOrClasses(content) && hasTypeAnnotations(content)) {
    return { stage: 'pupa', description: 'Functional but needs polish', criteria: ['has functions/classes', 'has types', 'minimal docs'] }
  }

  return { stage: 'larva', description: 'Basic implementation', criteria: ['needs structure'] }
}

// ─── Maturation Score ──────────────────────────────────────────────────────────

/**
 * Compute maturation score (0-100) for a file.
 *
 * @example
 * computeMaturationScore('app.ts', content, allFiles) // => 75
 */
export function computeMaturationScore(file: string, content: string, allFiles: string[]): number {
  if (content.length === 0) return 0

  let score = 0

  // +25: has functions/classes
  if (hasFunctionsOrClasses(content)) score += 25

  // +20: has type annotations
  if (hasTypeAnnotations(content)) score += 20

  // +20: has JSDoc on exports
  if (countJSDocOnExports(content) > 0) score += 20

  // +15: has associated test file
  if (hasTestFile(file, allFiles)) score += 15

  // +10: low complexity
  if (computeComplexity(content) < 10) score += 10

  // +10: has documentation
  if (hasJSDoc(content)) score += 10

  return Math.min(100, score)
}

// ─── Stage Progression ─────────────────────────────────────────────────────────

/**
 * Determine the next stage for a file.
 *
 * @example
 * determineNextStage('larva', 25) // => 'pupa'
 */
export function determineNextStage(currentStage: StageName, maturationScore: number): string {
  if (currentStage === 'egg') return 'larva'
  if (currentStage === 'larva') return 'pupa'
  if (currentStage === 'pupa') return 'chrysalis'
  if (currentStage === 'chrysalis') return 'butterfly'
  if (currentStage === 'butterfly') return 'butterfly (maintain)'
  if (currentStage === 'fossil') return 'review for relevance'
  return 'pupa'
}

/**
 * Identify blockers preventing stage advancement.
 *
 * @example
 * identifyBlockers('app.ts', content, 'larva', allFiles) // => ['no documentation', ...]
 */
export function identifyBlockers(file: string, content: string, stage: StageName, allFiles: string[]): string[] {
  const blockers: string[] = []

  if (stage === 'egg') {
    blockers.push('add substantive code')
    return blockers
  }

  if (stage === 'larva') {
    if (!hasJSDoc(content)) blockers.push('add documentation')
    if (!hasTestFile(file, allFiles)) blockers.push('create test file')
    if (!hasTypeAnnotations(content)) blockers.push('add type annotations')
    return blockers
  }

  if (stage === 'pupa') {
    if (countJSDocOnExports(content) === 0) blockers.push('add JSDoc to exports')
    if (!hasTestFile(file, allFiles)) blockers.push('create test file')
    if (computeComplexity(content) >= 10) blockers.push('reduce complexity')
    return blockers
  }

  if (stage === 'chrysalis') {
    const totalExports = countExports(content)
    const jsDocExports = countJSDocOnExports(content)
    if (totalExports > 0 && jsDocExports / totalExports < 0.8) blockers.push('document remaining exports')
    if (computeComplexity(content) >= 10) blockers.push('reduce complexity')
    return blockers
  }

  if (stage === 'fossil') {
    blockers.push('review for outdated patterns')
    if (hasDeprecatedPatterns(content)) blockers.push('update deprecated patterns')
    return blockers
  }

  return blockers
}

// ─── Evolutionary Pressures ────────────────────────────────────────────────────

/**
 * Detect evolutionary pressures in the codebase.
 *
 * @example
 * detectEvolutionaryPressures(files, contents) // => [{ type: 'tech-debt', ... }]
 */
export function detectEvolutionaryPressures(files: string[], contents: string[]): EvolutionaryPressure[] {
  const pressures: EvolutionaryPressure[] = []

  // tech-debt: files with many TODO/FIXME
  const todoFiles: string[] = []
  let todoTotal = 0
  for (let i = 0; i < files.length; i++) {
    const count = countTodos(contents[i])
    if (count > 0) {
      todoFiles.push(files[i])
      todoTotal += count
    }
  }
  if (todoFiles.length > 0) {
    pressures.push({
      type: 'tech-debt',
      files: todoFiles,
      strength: Math.min(100, todoTotal * 15),
      description: `${todoTotal} TODO/FIXME markers across ${todoFiles.length} file(s)`,
    })
  }

  // modernization: files using deprecated patterns
  const deprecFiles: string[] = []
  for (let i = 0; i < files.length; i++) {
    if (hasDeprecatedPatterns(contents[i])) deprecFiles.push(files[i])
  }
  if (deprecFiles.length > 0) {
    pressures.push({
      type: 'modernization',
      files: deprecFiles,
      strength: Math.min(100, deprecFiles.length * 20),
      description: `${deprecFiles.length} file(s) using deprecated patterns (var, arguments, require)`,
    })
  }

  // refactor-need: high complexity files
  const complexFiles: string[] = []
  let maxComplexity = 0
  for (let i = 0; i < files.length; i++) {
    const c = computeComplexity(contents[i])
    if (c > 15) {
      complexFiles.push(files[i])
      maxComplexity = Math.max(maxComplexity, c)
    }
  }
  if (complexFiles.length > 0) {
    pressures.push({
      type: 'refactor-need',
      files: complexFiles,
      strength: Math.min(100, maxComplexity * 3),
      description: `${complexFiles.length} file(s) with high complexity (max: ${maxComplexity})`,
    })
  }

  // feature-demand: large, actively growing files
  const largeFiles = files.filter((_, i) => countLines(contents[i]) > 200)
  if (largeFiles.length > 0) {
    pressures.push({
      type: 'feature-demand',
      files: largeFiles,
      strength: Math.min(100, largeFiles.length * 15),
      description: `${largeFiles.length} large file(s) (> 200 lines) under active development`,
    })
  }

  // bug-pressure: files with many error handling patterns (proxy for bug history)
  const errorHeavy: string[] = []
  for (let i = 0; i < files.length; i++) {
    const tryCount = (contents[i].match(/\btry\s*\{/g) ?? []).length
    const catchCount = (contents[i].match(/\.catch\s*\(/g) ?? []).length
    if (tryCount + catchCount > 5) errorHeavy.push(files[i])
  }
  if (errorHeavy.length > 0) {
    pressures.push({
      type: 'bug-pressure',
      files: errorHeavy,
      strength: Math.min(100, errorHeavy.length * 20),
      description: `${errorHeavy.length} file(s) with heavy error handling (potential bug history)`,
    })
  }

  return pressures
}

// ─── System Metrics ────────────────────────────────────────────────────────────

/**
 * Compute ecosystem maturity (0-100).
 *
 * @example
 * computeEcosystemMaturity(transformations) // => 65
 */
export function computeEcosystemMaturity(transformations: Transformation[]): number {
  if (transformations.length === 0) return 0

  const stageWeights: Record<StageName, number> = {
    egg: 0,
    larva: 20,
    pupa: 40,
    chrysalis: 60,
    butterfly: 100,
    fossil: 30,
  }

  const total = transformations.reduce((sum, t) => sum + (stageWeights[t.currentStage.stage] ?? 0), 0)
  return Math.round(total / transformations.length)
}

/**
 * Compute overall evolutionary pressure (0-100).
 *
 * @example
 * computeEvolutionaryPressure(pressures) // => 45
 */
export function computeEvolutionaryPressure(pressures: EvolutionaryPressure[]): number {
  if (pressures.length === 0) return 0
  const total = pressures.reduce((s, p) => s + p.strength, 0)
  return Math.min(100, Math.round(total / pressures.length))
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate recommendations based on transformations and pressures.
 *
 * @example
 * generateMetamorphosisRecommendations(transformations, pressures, stats)
 * // => ['Feed larval files with structure and documentation...']
 */
export function generateMetamorphosisRecommendations(transformations: Transformation[], pressures: EvolutionaryPressure[], stats: MetamorphosisStats): string[] {
  const recs: string[] = []

  const larval = transformations.filter(t => t.currentStage.stage === 'egg' || t.currentStage.stage === 'larva')
  if (larval.length > 0) {
    recs.push(`Feed ${larval.length} larval file(s) — add structure, documentation, and type annotations`)
  }

  const chrysalis = transformations.filter(t => t.currentStage.stage === 'chrysalis')
  if (chrysalis.length > 0) {
    recs.push(`Help ${chrysalis.length} chrysalis file(s) emerge — complete documentation and reduce complexity`)
  }

  const fossils = transformations.filter(t => t.currentStage.stage === 'fossil')
  if (fossils.length > 0) {
    recs.push(`Review ${fossils.length} fossil file(s) for relevance and update outdated patterns`)
  }

  if (stats.ecosystemMaturity < 40) {
    recs.push('Ecosystem maturity is low — prioritize documentation and testing across the codebase')
  }

  const highPressure = pressures.filter(p => p.strength > 60)
  if (highPressure.length > 0) {
    recs.push(`${highPressure.length} high-pressure area(s) detected — allocate resources to ${highPressure.map(p => p.type).join(', ')}`)
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build the full metamorphosis analysis result.
 *
 * @example
 * buildMetamorphosisResult(files, contents, {})
 * // => { transformations: [...], pressures: [...], stats: {...}, recommendations: [...] }
 */
export function buildMetamorphosisResult(files: string[], contents: string[], options: MetamorphosisOptions): MetamorphosisResult {
  const transformations: Transformation[] = files.map((file, idx) => {
    const content = contents[idx]
    const stage = classifyLifeStage(file, content, files, false)
    const maturation = computeMaturationScore(file, content, files)

    const stageIdx = STAGE_ORDER.indexOf(stage.stage)
    const previousStages = stageIdx > 0 ? STAGE_ORDER.slice(0, stageIdx) : []

    return {
      file,
      currentStage: stage,
      previousStages,
      transformations: previousStages.length,
      growthRate: countLines(content),
      maturationScore: maturation,
      nextStage: determineNextStage(stage.stage, maturation),
      blockers: identifyBlockers(file, content, stage.stage, files),
    }
  })

  const pressures = detectEvolutionaryPressures(files, contents)

  const counts = { egg: 0, larva: 0, pupa: 0, chrysalis: 0, butterfly: 0, fossil: 0 }
  for (const t of transformations) counts[t.currentStage.stage]++

  const avgMaturation = transformations.length > 0
    ? Math.round(transformations.reduce((s, t) => s + t.maturationScore, 0) / transformations.length)
    : 0

  const sorted = [...transformations].sort((a, b) => b.maturationScore - a.maturationScore)
  const mostMature = sorted.length > 0 ? sorted[0].file : ''
  const leastMature = sorted.length > 0 ? sorted[sorted.length - 1].file : ''

  const mostTransformed = [...transformations].sort((a, b) => b.transformations - a.transformations)[0]?.file ?? ''

  const stats: MetamorphosisStats = {
    totalFiles: files.length,
    eggCount: counts.egg,
    larvaCount: counts.larva,
    pupaCount: counts.pupa,
    chrysalisCount: counts.chrysalis,
    butterflyCount: counts.butterfly,
    fossilCount: counts.fossil,
    avgMaturation,
    mostMature,
    leastMature,
    mostTransformed,
    evolutionaryPressure: computeEvolutionaryPressure(pressures),
    ecosystemMaturity: computeEcosystemMaturity(transformations),
  }

  const recommendations = generateMetamorphosisRecommendations(transformations, pressures, stats)

  return { transformations, pressures, stats, recommendations }
}
