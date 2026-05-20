// ─── Types ─────────────────────────────────────────────────────────────────────

export type StageName = 'egg' | 'larva' | 'pupa' | 'chrysalis' | 'butterfly' | 'fossil'
export type IndicatorType = 'structural' | 'behavioral' | 'documentation' | 'testing' | 'pattern'
export type OverallStage = 'embryonic' | 'growing' | 'maturing' | 'mature' | 'aging' | 'legacy'
export type OverallHealth = 'thriving' | 'healthy' | 'stable' | 'stagnant' | 'decaying'
export type TransitionEffort = 'trivial' | 'easy' | 'moderate' | 'significant'

export interface StageIndicator {
  stage: string
  evidence: string
  strength: number
  type: IndicatorType
}

export interface LifecycleStage {
  file: string
  stage: StageName
  maturity: number
  stageProgress: number
  indicators: StageIndicator[]
  nextStage: string | null
  readiness: number
  isStuck: boolean
  timeInStage: string
}

export interface StageTransition {
  file: string
  from: string
  to: string
  readiness: number
  blockers: string[]
  accelerators: string[]
  estimatedEffort: TransitionEffort
}

export interface CodebaseMaturity {
  stageDistribution: Record<string, number>
  avgMaturity: number
  stuckFiles: number
  readyToTransition: number
  dominantStage: string
  overallStage: OverallStage
  health: OverallHealth
}

export interface MetamorphosisStageStats {
  totalFiles: number
  eggCount: number
  larvaCount: number
  pupaCount: number
  chrysalisCount: number
  butterflyCount: number
  fossilCount: number
  stuckFiles: number
  readyForTransition: number
  avgMaturity: number
  avgReadiness: number
  dominantStage: string
  overallStage: string
  overallHealth: string
  lifecycleCompleteness: number
  transitionVelocity: number
}

export interface MetamorphosisStageResult {
  stages: LifecycleStage[]
  transitions: StageTransition[]
  maturity: CodebaseMaturity
  stats: MetamorphosisStageStats
  recommendations: string[]
}

// ─── identifyIndicators ────────────────────────────────────────────────────────

/**
 * Identify stage indicators from code content
 * @example
 * identifyIndicators('const x = 1', 'a.ts') // StageIndicator[]
 */
export function identifyIndicators(content: string, filePath: string): StageIndicator[] {
  const indicators: StageIndicator[] = []
  const lines = content.split('\n')
  const totalLines = lines.length

  const todoCount = (content.match(/TODO|FIXME|HACK|XXX/g) || []).length
  if (todoCount > 0) {
    indicators.push({ stage: 'egg', evidence: `${todoCount} TODO/FIXME marker(s)`, strength: Math.min(100, todoCount * 20), type: 'documentation' })
  }

  const placeholderCount = (content.match(/placeholder|stub|noop|pass\s*[;}]/gi) || []).length
  if (placeholderCount > 0) {
    indicators.push({ stage: 'egg', evidence: `${placeholderCount} placeholder/stub(s)`, strength: Math.min(100, placeholderCount * 30), type: 'structural' })
  }

  if (totalLines < 10 && !/export\s+(function|class|const)/.test(content)) {
    indicators.push({ stage: 'egg', evidence: 'Very small file without exports', strength: 60, type: 'structural' })
  }

  const exportCount = (content.match(/export\s+(function|class|const|interface|type)/g) || []).length
  if (exportCount >= 3) {
    indicators.push({ stage: 'larva', evidence: `${exportCount} exports — growing functionality`, strength: 50, type: 'behavioral' })
  }

  const inconsistentPatterns = detectInconsistentPatterns(content)
  if (inconsistentPatterns > 0) {
    indicators.push({ stage: 'larva', evidence: `${inconsistentPatterns} inconsistent pattern(s)`, strength: Math.min(80, inconsistentPatterns * 15), type: 'pattern' })
  }

  const refactorMarkers = (content.match(/@deprecated|refactor|rewrite|cleanup|WIP/i) || []).length
  if (refactorMarkers > 0) {
    indicators.push({ stage: 'pupa', evidence: `${refactorMarkers} refactoring marker(s)`, strength: Math.min(90, refactorMarkers * 25), type: 'behavioral' })
  }

  const halfImpl = (content.match(/\/\/\s*implement|\/\/\s*todo.*implement/i) || []).length
  if (halfImpl > 0) {
    indicators.push({ stage: 'pupa', evidence: `${halfImpl} half-implemented section(s)`, strength: 40, type: 'structural' })
  }

  const jsdocCount = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
  if (jsdocCount >= 3) {
    indicators.push({ stage: 'chrysalis', evidence: `${jsdocCount} JSDoc block(s) — documenting`, strength: 50, type: 'documentation' })
  }

  if (/import.*test|import.*spec|describe\(|it\(/.test(content)) {
    indicators.push({ stage: 'chrysalis', evidence: 'Testing patterns present', strength: 60, type: 'testing' })
  }

  const typeCoverage = computeTypeCoverage(content)
  if (typeCoverage > 0.7) {
    indicators.push({ stage: 'chrysalis', evidence: `High type coverage (${Math.round(typeCoverage * 100)}%)`, strength: 55, type: 'pattern' })
  }

  if (exportCount > 0 && jsdocCount > 0 && typeCoverage > 0.8 && totalLines > 20) {
    indicators.push({ stage: 'butterfly', evidence: 'Well-structured, documented, typed exports', strength: 70, type: 'structural' })
  }

  const hasErrorHandling = /try\s*\{|catch\s*\(|\.catch\(/g.test(content)
  if (hasErrorHandling && exportCount > 0) {
    indicators.push({ stage: 'butterfly', evidence: 'Error handling with exports', strength: 50, type: 'behavioral' })
  }

  if (/\[[\s\S]*?\]/.test(content) === false && totalLines > 5) {
    // no-array-check heuristic — look for clean interfaces
    const interfaceCount = (content.match(/interface\s+\w+/g) || []).length
    if (interfaceCount >= 2 && typeCoverage > 0.8) {
      indicators.push({ stage: 'butterfly', evidence: 'Clean interfaces with strong typing', strength: 60, type: 'pattern' })
    }
  }

  const deprecatedCount = (content.match(/@deprecated|DEPRECATED|legacy|obsolete/gi) || []).length
  if (deprecatedCount > 0) {
    indicators.push({ stage: 'fossil', evidence: `${deprecatedCount} deprecation marker(s)`, strength: Math.min(100, deprecatedCount * 30), type: 'documentation' })
  }

  if (filePath.includes('legacy') || filePath.includes('deprecated') || filePath.includes('old')) {
    indicators.push({ stage: 'fossil', evidence: 'File path suggests legacy status', strength: 70, type: 'structural' })
  }

  if (totalLines > 200 && exportCount === 0 && !/interface|type\s+/.test(content)) {
    indicators.push({ stage: 'fossil', evidence: 'Large file without exports or type definitions', strength: 50, type: 'structural' })
  }

  return indicators
}

function detectInconsistentPatterns(content: string): number {
  let count = 0
  const hasSemicolons = /;\s*$/m.test(content)
  const hasNoSemicolons = /[^;{}]\s*$/m.test(content)
  if (hasSemicolons && hasNoSemicolons) count++

  const singleQuotes = (content.match(/'/g) || []).length
  const doubleQuotes = (content.match(/"/g) || []).length
  if (singleQuotes > 2 && doubleQuotes > 2) count++

  const hasArrow = /=>\s*{/.test(content)
  const hasFunction = /function\s+\w+/.test(content)
  if (hasArrow && hasFunction) count++

  return count
}

function computeTypeCoverage(content: string): number {
  const typedLines = (content.match(/:\s*(string|number|boolean|void|unknown|never|any|null|undefined|\w+<)/g) || []).length
  const allDeclarations = (content.match(/(?:const|let|var|function|param)\s+\w+/g) || []).length
  if (allDeclarations === 0) return 0.5
  return Math.min(1, typedLines / Math.max(1, allDeclarations))
}

// ─── classifyStage ─────────────────────────────────────────────────────────────

/**
 * Classify the lifecycle stage of a file
 * @example
 * classifyStage('const x = 1', 'a.ts') // 'egg'
 */
export function classifyStage(content: string, filePath: string): StageName {
  const indicators = identifyIndicators(content, filePath)
  const scores: Record<string, number> = { egg: 0, larva: 0, pupa: 0, chrysalis: 0, butterfly: 0, fossil: 0 }

  for (const ind of indicators) {
    scores[ind.stage] = (scores[ind.stage] || 0) + ind.strength
  }

  const lines = content.split('\n').length
  if (lines === 0 || content.trim() === '') return 'egg'

  if (scores.fossil >= 40) return 'fossil'
  if (scores.egg >= 50) return 'egg'
  if (scores.butterfly >= 60) return 'butterfly'
  if (scores.chrysalis >= 40) return 'chrysalis'
  if (scores.pupa >= 30) return 'pupa'
  if (scores.larva >= 20) return 'larva'

  const exportCount = (content.match(/export\s+/g) || []).length
  const hasDocs = /\/\*\*/.test(content)
  const hasTypes = /interface|type\s+/.test(content)

  if (exportCount > 0 && hasDocs && hasTypes) return 'chrysalis'
  if (exportCount > 0) return 'larva'

  return 'egg'
}

// ─── computeMaturity ───────────────────────────────────────────────────────────

/**
 * Compute maturity 0-100 within current stage
 * @example
 * computeMaturity('export function f() {}', 'larva') // 40
 */
export function computeMaturity(content: string, stage: StageName): number {
  const indicators = identifyIndicators(content, '')
  const lines = content.split('\n').length
  const exportCount = (content.match(/export\s+/g) || []).length
  const hasTypes = /interface|type\s+/.test(content)
  const hasDocs = /\/\*\*/.test(content)
  const hasErrorHandling = /try|catch|\.catch\(/.test(content)

  let maturity = 20

  if (lines > 20) maturity += 10
  if (lines > 50) maturity += 10
  if (exportCount > 0) maturity += 15
  if (hasTypes) maturity += 15
  if (hasDocs) maturity += 10
  if (hasErrorHandling) maturity += 10
  if (indicators.filter(i => i.stage === stage).length > 0) maturity += 10

  return Math.max(0, Math.min(100, maturity))
}

// ─── computeStageProgress ──────────────────────────────────────────────────────

/**
 * Compute how far along in current stage 0-100
 * @example
 * computeStageProgress(indicators) // 50
 */
export function computeStageProgress(indicators: StageIndicator[]): number {
  if (indicators.length === 0) return 30
  const avgStrength = indicators.reduce((s, i) => s + i.strength, 0) / indicators.length
  return Math.max(0, Math.min(100, Math.round(avgStrength)))
}

// ─── predictNextStage ──────────────────────────────────────────────────────────

const STAGE_ORDER: StageName[] = ['egg', 'larva', 'pupa', 'chrysalis', 'butterfly', 'fossil']

/**
 * Predict the next lifecycle stage
 * @example
 * predictNextStage('larva', 80, 'export function f() {}') // 'pupa'
 */
export function predictNextStage(stage: StageName, maturity: number, _content: string): string | null {
  const idx = STAGE_ORDER.indexOf(stage)
  if (stage === 'butterfly') {
    return maturity < 30 ? 'fossil' : null
  }
  if (stage === 'fossil') return null
  if (maturity >= 50 && idx < STAGE_ORDER.length - 1) {
    return STAGE_ORDER[idx + 1]
  }
  if (idx < STAGE_ORDER.length - 1) {
    return STAGE_ORDER[idx + 1]
  }
  return null
}

// ─── computeReadiness ──────────────────────────────────────────────────────────

/**
 * Compute readiness to transition 0-100
 * @example
 * computeReadiness('larva', 80, []) // 75
 */
export function computeReadiness(stage: StageName, maturity: number, blockers: string[]): number {
  let readiness = maturity
  readiness -= blockers.length * 15
  if (stage === 'egg') readiness = Math.min(readiness, 40)
  if (stage === 'butterfly') readiness = Math.min(readiness, 20)
  if (stage === 'fossil') readiness = 0
  return Math.max(0, Math.min(100, readiness))
}

// ─── isStuck ───────────────────────────────────────────────────────────────────

/**
 * Determine if a file is stuck in its stage
 * @example
 * isStuck('egg', 90, indicators) // true
 */
export function isStuck(stage: StageName, maturity: number, indicators: StageIndicator[]): boolean {
  if (stage === 'butterfly' || stage === 'fossil') return false
  if (maturity >= 80) {
    const blockers = indicators.filter(i => i.stage !== stage && i.strength > 50)
    return blockers.length > 0
  }
  if (stage === 'egg' && maturity >= 60) return true
  return false
}

// ─── estimateTimeInStage ───────────────────────────────────────────────────────

/**
 * Estimate time in current stage
 * @example
 * estimateTimeInStage('egg', 30) // 'early'
 */
export function estimateTimeInStage(stage: StageName, maturity: number): string {
  if (maturity < 30) return `early-${stage}`
  if (maturity < 70) return `mid-${stage}`
  return `late-${stage}`
}

// ─── analyzeTransitions ────────────────────────────────────────────────────────

/**
 * Analyze stage transitions for all files
 * @example
 * analyzeTransitions(stages) // StageTransition[]
 */
export function analyzeTransitions(stages: LifecycleStage[]): StageTransition[] {
  const transitions: StageTransition[] = []

  for (const s of stages) {
    if (s.nextStage === null) continue
    if (s.readiness < 20) continue

    const blockers = identifyBlockers(s)
    const accelerators = identifyAccelerators(s)
    const effort = classifyEffort(s.readiness, blockers.length)

    transitions.push({
      file: s.file,
      from: s.stage,
      to: s.nextStage,
      readiness: s.readiness,
      blockers,
      accelerators,
      estimatedEffort: effort,
    })
  }

  return transitions
}

function identifyBlockers(stage: LifecycleStage): string[] {
  const blockers: string[] = []
  if (stage.stage === 'egg') {
    blockers.push('Complete initial implementation')
  }
  if (stage.indicators.filter(i => i.stage === 'egg').length > 2) {
    blockers.push('Remove TODO/placeholder markers')
  }
  if (stage.maturity < 50) {
    blockers.push('Increase code maturity')
  }
  if (stage.stage === 'larva') {
    blockers.push('Establish consistent patterns')
  }
  if (stage.stage === 'pupa') {
    blockers.push('Complete refactoring')
  }
  return blockers.slice(0, 3)
}

function identifyAccelerators(stage: LifecycleStage): string[] {
  const acc: string[] = []
  if (stage.stage === 'egg') acc.push('Add basic exports and structure')
  if (stage.stage === 'larva') acc.push('Add type definitions')
  if (stage.stage === 'pupa') acc.push('Add tests')
  if (stage.stage === 'chrysalis') acc.push('Add documentation')
  if (stage.readiness >= 70) acc.push('High readiness — proceed with transition')
  return acc.slice(0, 3)
}

function classifyEffort(readiness: number, blockerCount: number): TransitionEffort {
  if (readiness >= 80 && blockerCount <= 1) return 'trivial'
  if (readiness >= 60 && blockerCount <= 2) return 'easy'
  if (readiness >= 40) return 'moderate'
  return 'significant'
}

// ─── computeCodebaseMaturity ───────────────────────────────────────────────────

/**
 * Compute overall codebase maturity
 * @example
 * computeCodebaseMaturity(stages) // CodebaseMaturity
 */
export function computeCodebaseMaturity(stages: LifecycleStage[]): CodebaseMaturity {
  const distribution: Record<string, number> = { egg: 0, larva: 0, pupa: 0, chrysalis: 0, butterfly: 0, fossil: 0 }
  for (const s of stages) {
    distribution[s.stage] = (distribution[s.stage] || 0) + 1
  }

  const avgMaturity = stages.length > 0
    ? Math.round(stages.reduce((s, st) => s + st.maturity, 0) / stages.length)
    : 50

  const stuckFiles = stages.filter(s => s.isStuck).length
  const readyToTransition = stages.filter(s => s.readiness >= 60 && s.nextStage !== null).length

  const dominant = Object.entries(distribution).sort((a, b) => b[1] - a[1])[0]
  const dominantStage = dominant ? dominant[0] : 'egg'

  const overallStage = classifyOverallStage(distribution, stages.length)
  const health = classifyHealth(avgMaturity, stuckFiles, stages.length)

  return {
    stageDistribution: distribution,
    avgMaturity,
    stuckFiles,
    readyToTransition,
    dominantStage,
    overallStage,
    health,
  }
}

function classifyOverallStage(distribution: Record<string, number>, total: number): OverallStage {
  if (total === 0) return 'embryonic'
  const eggRatio = (distribution.egg || 0) / total
  const larvaRatio = (distribution.larva || 0) / total
  const butterflyRatio = (distribution.butterfly || 0) / total
  const fossilRatio = (distribution.fossil || 0) / total

  if (fossilRatio > 0.4) return 'legacy'
  if (butterflyRatio > 0.5) return 'mature'
  if (eggRatio > 0.5) return 'embryonic'
  if (larvaRatio > 0.4) return 'growing'
  if (fossilRatio > 0.2) return 'aging'
  return 'maturing'
}

function classifyHealth(avgMaturity: number, stuckFiles: number, total: number): OverallHealth {
  if (total === 0) return 'stable'
  const stuckRatio = stuckFiles / total
  if (avgMaturity >= 75 && stuckRatio < 0.1) return 'thriving'
  if (avgMaturity >= 60 && stuckRatio < 0.2) return 'healthy'
  if (avgMaturity >= 40) return 'stable'
  if (stuckRatio > 0.3) return 'stagnant'
  if (avgMaturity < 30) return 'decaying'
  return 'stable'
}

// ─── computeLifecycleCompleteness ──────────────────────────────────────────────

/**
 * Compute lifecycle completeness 0-100
 * @example
 * computeLifecycleCompleteness(stages) // 50
 */
export function computeLifecycleCompleteness(stages: LifecycleStage[]): number {
  if (stages.length === 0) return 0
  const butterflyOrLater = stages.filter(s => s.stage === 'butterfly' || s.stage === 'fossil').length
  return Math.round((butterflyOrLater / stages.length) * 100)
}

// ─── computeTransitionVelocity ─────────────────────────────────────────────────

/**
 * Compute transition velocity 0-100
 * @example
 * computeTransitionVelocity(stages, transitions) // 60
 */
export function computeTransitionVelocity(stages: LifecycleStage[], transitions: StageTransition[]): number {
  if (stages.length === 0) return 50
  const avgMaturity = stages.reduce((s, st) => s + st.maturity, 0) / stages.length
  const transitionRatio = transitions.length / stages.length
  const highReadiness = stages.filter(s => s.readiness >= 60).length / stages.length
  return Math.max(0, Math.min(100, Math.round(avgMaturity * 0.5 + transitionRatio * 30 + highReadiness * 20)))
}

// ─── generateRecommendations ───────────────────────────────────────────────────

/**
 * Generate metamorphosis-stage recommendations
 * @example
 * generateRecommendations(stages, transitions, maturity, stats) // string[]
 */
export function generateRecommendations(
  stages: LifecycleStage[],
  transitions: StageTransition[],
  maturity: CodebaseMaturity,
  stats: MetamorphosisStageStats,
): string[] {
  const recs: string[] = []

  if (stats.eggCount > stats.totalFiles * 0.5) {
    recs.push('Codebase is egg-heavy — focus on implementing core functionality')
  }

  if (stats.fossilCount > stats.totalFiles * 0.3) {
    recs.push('Many fossil files — plan modernization or removal strategy')
  }

  if (stats.larvaCount > stats.totalFiles * 0.4) {
    recs.push('Larva-heavy codebase — establish consistent patterns and structure')
  }

  if (stats.stuckFiles > 0) {
    recs.push(`${stats.stuckFiles} file(s) stuck in current stage — identify and remove blockers`)
  }

  if (stats.readyForTransition > 0) {
    recs.push(`${stats.readyForTransition} file(s) ready for stage transition`)
  }

  if (maturity.health === 'stagnant') {
    recs.push('Codebase health is stagnant — invest in refactoring and testing')
  }

  if (maturity.health === 'decaying') {
    recs.push('Codebase is decaying — urgent attention needed for core files')
  }

  if (stats.pupaCount > 3) {
    recs.push(`${stats.pupaCount} files in pupa stage — complete ongoing refactoring`)
  }

  if (stats.lifecycleCompleteness < 30) {
    recs.push('Low lifecycle completeness — most files have not reached maturity')
  }

  return Array.from(new Set(recs))
}

// ─── buildMetamorphosisStageResult ─────────────────────────────────────────────

/**
 * Build complete metamorphosis-stage result
 * @example
 * buildMetamorphosisStageResult(['a.ts'], ['export function f() {}'], {}) // MetamorphosisStageResult
 */
export function buildMetamorphosisStageResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): MetamorphosisStageResult {
  const stages: LifecycleStage[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i]
    const filePath = files[i]
    const indicators = identifyIndicators(content, filePath)
    const stage = classifyStage(content, filePath)
    const maturity = computeMaturity(content, stage)
    const stageProgress = computeStageProgress(indicators)
    const nextStage = predictNextStage(stage, maturity, content)
    const blockers = identifyBlockersForFile(stage, indicators)
    const readiness = computeReadiness(stage, maturity, blockers)
    const stuck = isStuck(stage, maturity, indicators)
    const timeInStage = estimateTimeInStage(stage, maturity)

    stages.push({
      file: filePath,
      stage,
      maturity,
      stageProgress,
      indicators,
      nextStage,
      readiness,
      isStuck: stuck,
      timeInStage,
    })
  }

  const transitions = analyzeTransitions(stages)
  const codebaseMaturity = computeCodebaseMaturity(stages)
  const lifecycleCompleteness = computeLifecycleCompleteness(stages)
  const transitionVelocity = computeTransitionVelocity(stages, transitions)

  const avg = (arr: number[]) => arr.length > 0
    ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
    : 50

  const stats: MetamorphosisStageStats = {
    totalFiles: files.length,
    eggCount: stages.filter(s => s.stage === 'egg').length,
    larvaCount: stages.filter(s => s.stage === 'larva').length,
    pupaCount: stages.filter(s => s.stage === 'pupa').length,
    chrysalisCount: stages.filter(s => s.stage === 'chrysalis').length,
    butterflyCount: stages.filter(s => s.stage === 'butterfly').length,
    fossilCount: stages.filter(s => s.stage === 'fossil').length,
    stuckFiles: stages.filter(s => s.isStuck).length,
    readyForTransition: transitions.filter(t => t.readiness >= 60).length,
    avgMaturity: avg(stages.map(s => s.maturity)),
    avgReadiness: avg(stages.map(s => s.readiness)),
    dominantStage: codebaseMaturity.dominantStage,
    overallStage: codebaseMaturity.overallStage,
    overallHealth: codebaseMaturity.health,
    lifecycleCompleteness,
    transitionVelocity,
  }

  const recommendations = generateRecommendations(stages, transitions, codebaseMaturity, stats)

  return { stages, transitions, maturity: codebaseMaturity, stats, recommendations }
}

function identifyBlockersForFile(stage: StageName, indicators: StageIndicator[]): string[] {
  const blockers: string[] = []
  if (stage === 'egg') blockers.push('Complete implementation')
  const eggIndicators = indicators.filter(i => i.stage === 'egg' && i.strength > 40)
  if (eggIndicators.length > 1) blockers.push('Resolve egg-stage indicators')
  return blockers
}
