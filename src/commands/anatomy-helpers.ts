// ─── Types ─────────────────────────────────────────────────────────────────────

export type SystemStatus = 'healthy' | 'minor-issues' | 'moderate-issues' | 'critical-issues'
export type BloodPressure = 'normal' | 'high' | 'critical'

export interface Organ {
  name: string
  system: string
  function: string
  health: number
  size: number
  vitality: number
  issues: string[]
}

export interface BodySystem {
  name: string
  health: number
  organs: Organ[]
  diagnosis: string
  status: SystemStatus
}

export interface VitalSigns {
  heartRate: number
  bloodPressure: BloodPressure
  bodyTemp: number
  respiratory: number
  reflexes: number
  immunity: number
}

export interface AnatomyStats {
  totalOrgans: number
  healthySystems: number
  criticalSystems: number
  avgSystemHealth: number
  largestOrgan: string
  smallestOrgan: string
  mostVital: string
  weakestOrgan: string
  overallHealth: number
  bodyMassIndex: number
  lifeExpectancy: string
}

export interface AnatomyResult {
  systems: BodySystem[]
  vitalSigns: VitalSigns
  stats: AnatomyStats
  recommendations: string[]
}

export interface AnatomyOptions {
  verbose?: boolean
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Extract imports from content.
 *
 * @example
 * extractImports("import { foo } from './bar'") // ['./bar']
 */
export function extractImports(content: string): string[] {
  const imports: string[] = []
  for (const m of content.matchAll(/import\s+.*?from\s+['"](.+?)['"]/g) || []) {
    if (m[1]) imports.push(m[1])
  }
  for (const m of content.matchAll(/import\(['"](.+?)['"]\)/g) || []) {
    if (m[1]) imports.push(m[1])
  }
  return imports
}

/**
 * Count exports in content.
 *
 * @example
 * countExports('export const x = 1; export function y() {}') // 2
 */
export function countExports(content: string): number {
  return (content.match(/export\s+(function|class|const|let|var|interface|type|default|enum)\b/g) || []).length
}

/**
 * Compute cyclomatic complexity.
 *
 * @example
 * computeComplexity('if (x) { for (let i = 0; i < 10; i++) {} }') // 3
 */
export function computeComplexity(content: string): number {
  return 1 + (content.match(/\bif\b|\belse\b|\bfor\b|\bwhile\b|\bswitch\b|\bcatch\b|\?\?|&&|\|\||\?\./g) || []).length
}

/**
 * Count lines of code.
 *
 * @example
 * countLines('a\nb\nc') // 3
 */
export function countLines(content: string): number {
  if (!content || content.trim().length === 0) return 0
  return content.split('\n').length
}

/**
 * Count JSDoc blocks.
 *
 * @example
 * countJSDoc('/** doc *\\/ function f() {}') // 1
 */
export function countJSDoc(content: string): number {
  return (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
}

/**
 * Count catch blocks.
 *
 * @example
 * countCatchBlocks('try {} catch(e) {}') // 1
 */
export function countCatchBlocks(content: string): number {
  return (content.match(/\bcatch\b/g) || []).length
}

/**
 * Count try blocks.
 *
 * @example
 * countTryBlocks('try {} catch(e) {}') // 1
 */
export function countTryBlocks(content: string): number {
  return (content.match(/\btry\b/g) || []).length
}

/**
 * Count any type usages.
 *
 * @example
 * countAnyTypes('function fn(x: any): any {}') // 2
 */
export function countAnyTypes(content: string): number {
  return (content.match(/:\s*any\b/g) || []).length
}

/**
 * Count test assertions.
 *
 * @example
 * countAssertions('expect(x).toBe(1)') // 1
 */
export function countAssertions(content: string): number {
  return (content.match(/expect\s*\(|assert|should\b|assertEquals|assertNotNull/g) || []).length
}

// ─── Organ Classification ──────────────────────────────────────────────────────

/**
 * Classify organ role within a system.
 *
 * @example
 * classifyOrganRole('src/core/engine.ts', 'skeletal')
 */
export function classifyOrganRole(file: string, system: string): string {
  switch (system) {
    case 'skeletal':
      if (file.includes('index.ts')) return 'joint (entry point)'
      if (file.includes('core/')) return 'spine (core infrastructure)'
      return 'bone (structural module)'
    case 'muscular':
      if (file.includes('commands/') && !file.includes('-helpers')) return 'prime mover (command)'
      if (file.includes('-helpers')) return 'synergist (helper)'
      return 'muscle (implementation)'
    case 'nervous':
      if (file.includes('error') || file.includes('Error')) return 'sensory neuron (error detection)'
      if (file.includes('valid') || file.includes('Valid')) return 'motor neuron (validation)'
      return 'nerve (signal handler)'
    case 'circulatory':
      if (file.includes('core/')) return 'heart (data pump)'
      if (file.includes('format-helpers') || file.includes('-format-helpers')) return 'capillary (data formatter)'
      return 'vessel (data transport)'
    case 'immune':
      if (file.includes('.test.') || file.includes('.spec.')) return 'white blood cell (test)'
      if (file.includes('interface ') || file.includes('type ')) return 'antibody (type guard)'
      return 'lymph node (defense)'
    case 'integumentary':
      if (file.includes('.md')) return 'epidermis (documentation layer)'
      return 'skin cell (documentation surface)'
    default:
      return 'tissue'
  }
}

/**
 * Compute organ health for a given system context.
 *
 * @example
 * computeOrganHealth('a.ts', content, 'skeletal')
 */
export function computeOrganHealth(file: string, content: string, system: string): number {
  switch (system) {
    case 'skeletal':
      return computeSkeletalHealth(file, content)
    case 'muscular':
      return computeMuscularHealth(file, content)
    case 'nervous':
      return computeNervousHealth(file, content)
    case 'circulatory':
      return computeCirculatoryHealth(file, content)
    case 'immune':
      return computeImmuneHealth(file, content)
    case 'integumentary':
      return computeIntegumentaryHealth(file, content)
    default:
      return 50
  }
}

function computeSkeletalHealth(file: string, content: string): number {
  let score = 60
  if (file.includes('index.ts')) score += 20
  if (file.includes('core/')) score += 15
  const exports = countExports(content)
  if (exports > 0) score += 10
  if (exports > 5) score -= 10
  if (content.includes('export default')) score += 5
  return clamp(score)
}

function computeMuscularHealth(_file: string, content: string): number {
  let score = 60
  const complexity = computeComplexity(content)
  if (complexity <= 5) score += 20
  else if (complexity <= 10) score += 10
  else if (complexity > 20) score -= 20
  else if (complexity > 15) score -= 10
  const lines = countLines(content)
  if (lines > 300) score -= 15
  else if (lines > 200) score -= 5
  const jsdoc = countJSDoc(content)
  if (jsdoc > 0) score += 10
  const anyTypes = countAnyTypes(content)
  score -= anyTypes * 3
  return clamp(score)
}

function computeNervousHealth(_file: string, content: string): number {
  let score = 40
  const catches = countCatchBlocks(content)
  const tries = countTryBlocks(content)
  score += Math.min(catches * 15, 30)
  if (content.includes('throw ')) score += 10
  if (content.includes('Error') || content.includes('error')) score += 5
  if (tries > 0 && catches > 0) score += 10
  if (catches === 0 && tries === 0 && !content.includes('throw')) score -= 10
  const lines = countLines(content)
  if (lines > 0 && catches === 0 && !content.includes('throw')) score = Math.min(score, 40)
  return clamp(score)
}

function computeCirculatoryHealth(file: string, content: string): number {
  let score = 50
  const imports = extractImports(content).length
  const exports = countExports(content)
  if (imports > 0 && exports > 0) score += 15
  if (exports > 0) score += 10
  if (imports > 10) score -= 15
  else if (imports > 5) score -= 5
  if (file.includes('core/')) score += 10
  if (file.includes('index.ts')) score += 10
  return clamp(score)
}

function computeImmuneHealth(file: string, content: string): number {
  let score = 30
  if (file.includes('.test.') || file.includes('.spec.')) {
    score = 60
    const assertions = countAssertions(content)
    score += Math.min(assertions * 5, 30)
    const imports = extractImports(content).length
    if (imports > 0) score += 10
  }
  const anyTypes = countAnyTypes(content)
  score -= anyTypes * 5
  if (content.includes('interface ') || content.includes('export type ')) score += 15
  return clamp(score)
}

function computeIntegumentaryHealth(_file: string, content: string): number {
  let score = 30
  const lines = countLines(content)
  if (lines === 0) return 0
  const jsdoc = countJSDoc(content)
  const docRatio = jsdoc / Math.max(lines, 1)
  if (docRatio > 0.1) score += 40
  else if (docRatio > 0.05) score += 30
  else if (docRatio > 0) score += 15
  const comments = (content.match(/\/\/.*$/gm) || []).length
  const commentRatio = (jsdoc + comments) / Math.max(lines, 1)
  if (commentRatio > 0.15) score += 20
  else if (commentRatio > 0.05) score += 10
  const paramDocs = (content.match(/@param|@returns/g) || []).length
  if (paramDocs > 0) score += 10
  return clamp(score)
}

function clamp(score: number): number {
  return Math.max(0, Math.min(100, score))
}

/**
 * Compute organ vitality.
 *
 * @example
 * computeVitality(100, 50) // active
 */
export function computeVitality(size: number, health: number): number {
  if (size === 0) return 0
  return Math.round((health * 0.6 + Math.min(size, 100) * 0.4))
}

// ─── System Examinations ───────────────────────────────────────────────────────

/**
 * Examine skeletal system.
 *
 * @example
 * examineSkeletalSystem(files, contents)
 */
export function examineSkeletalSystem(files: string[], contents: string[]): BodySystem {
  const organs: Organ[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file) continue
    const content = contents[i] ?? ''
    if (file.includes('index.ts') || file.includes('core/') || file.includes('main.ts') || file.includes('app.ts')) {
      const health = computeOrganHealth(file, content, 'skeletal')
      const size = countLines(content)
      const issues = diagnoseOrganIssues(file, content, 'skeletal')
      organs.push({
        name: file,
        system: 'skeletal',
        function: classifyOrganRole(file, 'skeletal'),
        health,
        size,
        vitality: computeVitality(size, health),
        issues,
      })
    }
  }

  if (organs.length === 0) {
    organs.push({
      name: '(no structural files detected)',
      system: 'skeletal',
      function: 'unknown',
      health: 30,
      size: 0,
      vitality: 0,
      issues: ['No core structural files found'],
    })
  }

  const health = Math.round(organs.reduce((s, o) => s + o.health, 0) / organs.length)
  return {
    name: 'Skeletal',
    health,
    organs,
    diagnosis: diagnoseSystem(health),
    status: healthToStatus(health),
  }
}

/**
 * Examine muscular system.
 *
 * @example
 * examineMuscularSystem(files, contents)
 */
export function examineMuscularSystem(files: string[], contents: string[]): BodySystem {
  const organs: Organ[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file) continue
    const content = contents[i] ?? ''
    if (file.includes('commands/') || file.includes('-helpers') || (content.includes('function ') && !file.includes('.test.'))) {
      const health = computeOrganHealth(file, content, 'muscular')
      const size = countLines(content)
      const issues = diagnoseOrganIssues(file, content, 'muscular')
      organs.push({
        name: file,
        system: 'muscular',
        function: classifyOrganRole(file, 'muscular'),
        health,
        size,
        vitality: computeVitality(size, health),
        issues,
      })
    }
  }

  if (organs.length === 0) {
    organs.push({
      name: '(no implementation files detected)',
      system: 'muscular',
      function: 'unknown',
      health: 20,
      size: 0,
      vitality: 0,
      issues: ['No implementation files found'],
    })
  }

  const health = Math.round(organs.reduce((s, o) => s + o.health, 0) / organs.length)
  return {
    name: 'Muscular',
    health,
    organs,
    diagnosis: diagnoseSystem(health),
    status: healthToStatus(health),
  }
}

/**
 * Examine nervous system.
 *
 * @example
 * examineNervousSystem(files, contents)
 */
export function examineNervousSystem(files: string[], contents: string[]): BodySystem {
  const organs: Organ[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file) continue
    const content = contents[i] ?? ''
    const hasErrorHandling = content.includes('try') || content.includes('catch') || content.includes('throw') || content.includes('Error') || content.includes('error')
    if (hasErrorHandling) {
      const health = computeOrganHealth(file, content, 'nervous')
      const size = countLines(content)
      const issues = diagnoseOrganIssues(file, content, 'nervous')
      organs.push({
        name: file,
        system: 'nervous',
        function: classifyOrganRole(file, 'nervous'),
        health,
        size,
        vitality: computeVitality(size, health),
        issues,
      })
    }
  }

  if (organs.length === 0) {
    organs.push({
      name: '(no error handling detected)',
      system: 'nervous',
      function: 'missing',
      health: 10,
      size: 0,
      vitality: 0,
      issues: ['No error handling found — nervous system underdeveloped'],
    })
  }

  const health = Math.round(organs.reduce((s, o) => s + o.health, 0) / organs.length)
  return {
    name: 'Nervous',
    health,
    organs,
    diagnosis: diagnoseSystem(health),
    status: healthToStatus(health),
  }
}

/**
 * Examine circulatory system.
 *
 * @example
 * examineCirculatorySystem(files, contents)
 */
export function examineCirculatorySystem(files: string[], contents: string[]): BodySystem {
  const organs: Organ[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file) continue
    const content = contents[i] ?? ''
    const imports = extractImports(content).length
    const exports = countExports(content)
    if (imports > 0 || exports > 0) {
      const health = computeOrganHealth(file, content, 'circulatory')
      const size = countLines(content)
      const issues = diagnoseOrganIssues(file, content, 'circulatory')
      organs.push({
        name: file,
        system: 'circulatory',
        function: classifyOrganRole(file, 'circulatory'),
        health,
        size,
        vitality: computeVitality(size, health),
        issues,
      })
    }
  }

  if (organs.length === 0) {
    organs.push({
      name: '(no data flow detected)',
      system: 'circulatory',
      function: 'missing',
      health: 10,
      size: 0,
      vitality: 0,
      issues: ['No import/export connections found'],
    })
  }

  const health = Math.round(organs.reduce((s, o) => s + o.health, 0) / organs.length)
  return {
    name: 'Circulatory',
    health,
    organs,
    diagnosis: diagnoseSystem(health),
    status: healthToStatus(health),
  }
}

/**
 * Examine immune system.
 *
 * @example
 * examineImmuneSystem(files, contents)
 */
export function examineImmuneSystem(files: string[], contents: string[]): BodySystem {
  const organs: Organ[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file) continue
    const content = contents[i] ?? ''
    if (file.includes('.test.') || file.includes('.spec.') || file.includes('test/') || content.includes('interface ') || content.includes('export type ')) {
      const health = computeOrganHealth(file, content, 'immune')
      const size = countLines(content)
      const issues = diagnoseOrganIssues(file, content, 'immune')
      organs.push({
        name: file,
        system: 'immune',
        function: classifyOrganRole(file, 'immune'),
        health,
        size,
        vitality: computeVitality(size, health),
        issues,
      })
    }
  }

  if (organs.length === 0) {
    organs.push({
      name: '(no immune defenses detected)',
      system: 'immune',
      function: 'missing',
      health: 5,
      size: 0,
      vitality: 0,
      issues: ['No tests or type definitions found — immune system absent'],
    })
  }

  const health = Math.round(organs.reduce((s, o) => s + o.health, 0) / organs.length)
  return {
    name: 'Immune',
    health,
    organs,
    diagnosis: diagnoseSystem(health),
    status: healthToStatus(health),
  }
}

/**
 * Examine integumentary system.
 *
 * @example
 * examineIntegumentarySystem(files, contents)
 */
export function examineIntegumentarySystem(files: string[], contents: string[]): BodySystem {
  const organs: Organ[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file) continue
    const content = contents[i] ?? ''
    const health = computeOrganHealth(file, content, 'integumentary')
    const size = countLines(content)
    const issues = diagnoseOrganIssues(file, content, 'integumentary')
    organs.push({
      name: file,
      system: 'integumentary',
      function: classifyOrganRole(file, 'integumentary'),
      health,
      size,
      vitality: computeVitality(size, health),
      issues,
    })
  }

  if (organs.length === 0) {
    organs.push({
      name: '(empty codebase)',
      system: 'integumentary',
      function: 'none',
      health: 0,
      size: 0,
      vitality: 0,
      issues: ['No files to document'],
    })
  }

  const health = Math.round(organs.reduce((s, o) => s + o.health, 0) / organs.length)
  return {
    name: 'Integumentary',
    health,
    organs,
    diagnosis: diagnoseSystem(health),
    status: healthToStatus(health),
  }
}

// ─── Diagnosis ─────────────────────────────────────────────────────────────────

/**
 * Diagnose a system from its health score.
 *
 * @example
 * diagnoseSystem(85) // 'System functioning well'
 */
export function diagnoseSystem(health: number): string {
  if (health >= 80) return 'System functioning well'
  if (health >= 60) return 'Minor issues detected — monitor'
  if (health >= 40) return 'Moderate issues — treatment recommended'
  return 'Critical condition — immediate intervention needed'
}

/**
 * Convert health score to status.
 *
 * @example
 * healthToStatus(85) // 'healthy'
 */
export function healthToStatus(health: number): SystemStatus {
  if (health >= 80) return 'healthy'
  if (health >= 60) return 'minor-issues'
  if (health >= 40) return 'moderate-issues'
  return 'critical-issues'
}

/**
 * Diagnose individual organ issues.
 *
 * @example
 * diagnoseOrganIssues('a.ts', content, 'muscular')
 */
export function diagnoseOrganIssues(file: string, content: string, system: string): string[] {
  const issues: string[] = []

  if (system === 'skeletal') {
    if (!file.includes('index.ts') && !file.includes('core/')) {
      if (countExports(content) === 0) issues.push('No exports — disconnected from skeleton')
    }
  }

  if (system === 'muscular') {
    const complexity = computeComplexity(content)
    if (complexity > 20) issues.push(`High complexity (${complexity}) — overexerted muscle`)
    const lines = countLines(content)
    if (lines > 300) issues.push(`Large file (${lines} lines) — hypertrophied`)
    if (countAnyTypes(content) > 0) issues.push('Type weaknesses detected')
  }

  if (system === 'nervous') {
    if (countCatchBlocks(content) === 0 && !content.includes('throw')) issues.push('No error handling — nerve damage')
    if (countTryBlocks(content) > countCatchBlocks(content)) issues.push('Unhandled promise rejections possible')
  }

  if (system === 'circulatory') {
    const imports = extractImports(content).length
    if (imports > 10) issues.push(`High coupling (${imports} imports) — circulatory congestion`)
    if (countExports(content) === 0) issues.push('No exports — blocked circulation')
  }

  if (system === 'immune') {
    if (file.includes('.test.') && countAssertions(content) < 3) issues.push('Weak test coverage — low antibody count')
    if (countAnyTypes(content) > 0) issues.push('Type weaknesses — compromised immunity')
  }

  if (system === 'integumentary') {
    if (countJSDoc(content) === 0) issues.push('No JSDoc — exposed skin')
    const lines = countLines(content)
    if (lines > 50 && countJSDoc(content) === 0) issues.push('Undocumented large file — vulnerable surface')
  }

  return issues
}

// ─── Vital Signs ───────────────────────────────────────────────────────────────

/**
 * Measure vital signs.
 *
 * @example
 * measureVitalSigns(files, contents)
 */
export function measureVitalSigns(files: string[], contents: string[]): VitalSigns {
  const totalLines = contents.reduce((s, c) => s + countLines(c), 0)
  const totalComplexity = contents.reduce((s, c) => s + computeComplexity(c), 0)
  const avgComplexity = files.length > 0 ? totalComplexity / files.length : 0

  const testFiles = files.filter((f) => f.includes('.test.') || f.includes('.spec.') || f.includes('test/'))
  const immunity = files.length > 0 ? Math.round((testFiles.length / files.length) * 100) : 0

  const totalCatch = contents.reduce((s, c) => s + countCatchBlocks(c), 0)
  const totalThrow = contents.reduce((s, c) => s + (c.match(/\bthrow\b/g) || []).length, 0)
  const reflexes = files.length > 0 ? Math.min(100, Math.round(((totalCatch + totalThrow) / files.length) * 50)) : 0

  const totalAny = contents.reduce((s, c) => s + countAnyTypes(c), 0)
  const bodyTemp = Math.min(100, totalAny * 10 + Math.round(avgComplexity * 2))

  const heartRate = Math.min(200, files.length * 5)
  const respiratory = Math.round(totalLines / Math.max(files.length, 1))

  const bloodPressure: BloodPressure = avgComplexity > 15 ? 'critical' : avgComplexity > 8 ? 'high' : 'normal'

  return {
    heartRate,
    bloodPressure,
    bodyTemp,
    respiratory,
    reflexes,
    immunity,
  }
}

// ─── Overall Health ────────────────────────────────────────────────────────────

/**
 * Compute overall health from all systems.
 *
 * @example
 * computeOverallHealth(systems)
 */
export function computeOverallHealth(systems: BodySystem[]): number {
  if (systems.length === 0) return 0
  const weights: Record<string, number> = {
    Skeletal: 0.15,
    Muscular: 0.25,
    Nervous: 0.15,
    Circulatory: 0.15,
    Immune: 0.15,
    Integumentary: 0.15,
  }
  let total = 0
  let totalWeight = 0
  for (const system of systems) {
    const w = weights[system.name] || (1 / systems.length)
    total += system.health * w
    totalWeight += w
  }
  return Math.round(total / totalWeight)
}

/**
 * Compute body mass index (avg lines per file).
 *
 * @example
 * computeBMI(files, contents)
 */
export function computeBMI(files: string[], contents: string[]): number {
  if (files.length === 0) return 0
  const totalLines = contents.reduce((s, c) => s + countLines(c), 0)
  return Math.round(totalLines / files.length)
}

/**
 * Estimate life expectancy.
 *
 * @example
 * estimateLifeExpectancy(85, vitalSigns) // 'Long-term maintainable'
 */
export function estimateLifeExpectancy(health: number, vitalSigns: VitalSigns): string {
  if (health >= 80 && vitalSigns.immunity >= 50) return 'Long-term maintainable (5+ years)'
  if (health >= 60 && vitalSigns.immunity >= 30) return 'Moderate lifespan (2-5 years)'
  if (health >= 40) return 'Needs attention (1-2 years without intervention)'
  return 'Critical — immediate care required (< 1 year)'
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate anatomy recommendations.
 *
 * @example
 * generateAnatomyRecommendations(systems, vitalSigns, stats)
 */
export function generateAnatomyRecommendations(systems: BodySystem[], vitalSigns: VitalSigns, _stats: AnatomyStats): string[] {
  const recs: string[] = []

  const critical = systems.filter((s) => s.status === 'critical-issues')
  if (critical.length > 0) {
    recs.push(`EMERGENCY: ${critical.map((s) => s.name).join(', ')} system${critical.length === 1 ? '' : 's'} in critical condition — immediate treatment required`)
  }

  if (vitalSigns.immunity < 30) {
    recs.push(`Low immunity (${vitalSigns.immunity}%) — add more test coverage to strengthen immune defenses`)
  }

  if (vitalSigns.bodyTemp > 70) {
    recs.push(`Elevated body temperature (${vitalSigns.bodyTemp}°) — reduce 'any' types and complexity to lower infection risk`)
  }

  if (vitalSigns.bloodPressure === 'critical') {
    recs.push('Critical blood pressure — reduce cyclomatic complexity across the codebase')
  } else if (vitalSigns.bloodPressure === 'high') {
    recs.push('Elevated blood pressure — consider simplifying complex functions')
  }

  if (vitalSigns.reflexes < 30) {
    recs.push(`Poor reflexes (${vitalSigns.reflexes}) — add more error handling (try/catch, throw) to improve nervous response`)
  }

  const weakOrgans = systems.flatMap((s) => s.organs).filter((o) => o.health < 30 && o.health > 0)
  if (weakOrgans.length > 0) {
    recs.push(`${weakOrgans.length} weak organ${weakOrgans.length === 1 ? '' : 's'} detected — strengthen through refactoring and documentation`)
  }

  const integSystem = systems.find((s) => s.name === 'Integumentary')
  if (integSystem && integSystem.health < 50) {
    recs.push('Integumentary system weak — add JSDoc documentation to protect the codebase surface')
  }

  if (recs.length === 0) {
    recs.push('Organism is healthy — all systems functioning within normal parameters')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete anatomy result.
 *
 * @example
 * buildAnatomyResult(['a.ts'], ['export const x = 1'], {})
 */
export function buildAnatomyResult(files: string[], contents: string[], _options: AnatomyOptions): AnatomyResult {
  const systems: BodySystem[] = [
    examineSkeletalSystem(files, contents),
    examineMuscularSystem(files, contents),
    examineNervousSystem(files, contents),
    examineCirculatorySystem(files, contents),
    examineImmuneSystem(files, contents),
    examineIntegumentarySystem(files, contents),
  ]

  const vitalSigns = measureVitalSigns(files, contents)
  const overallHealth = computeOverallHealth(systems)
  const bmi = computeBMI(files, contents)
  const lifeExpectancy = estimateLifeExpectancy(overallHealth, vitalSigns)

  const allOrgans = systems.flatMap((s) => s.organs)
  const totalOrgans = allOrgans.length
  const healthySystems = systems.filter((s) => s.status === 'healthy').length
  const criticalSystems = systems.filter((s) => s.status === 'critical-issues').length
  const avgSystemHealth = systems.length > 0 ? Math.round(systems.reduce((s, sys) => s + sys.health, 0) / systems.length) : 0

  const sortedBySize = [...allOrgans].sort((a, b) => b.size - a.size)
  const sortedByVitality = [...allOrgans].sort((a, b) => b.vitality - a.vitality)
  const sortedByHealth = [...allOrgans].sort((a, b) => a.health - b.health)

  const stats: AnatomyStats = {
    totalOrgans,
    healthySystems,
    criticalSystems,
    avgSystemHealth,
    largestOrgan: sortedBySize[0]?.name || '',
    smallestOrgan: sortedBySize[sortedBySize.length - 1]?.name || '',
    mostVital: sortedByVitality[0]?.name || '',
    weakestOrgan: sortedByHealth[0]?.name || '',
    overallHealth,
    bodyMassIndex: bmi,
    lifeExpectancy,
  }

  const recommendations = generateAnatomyRecommendations(systems, vitalSigns, stats)

  return { systems, vitalSigns, stats, recommendations }
}
