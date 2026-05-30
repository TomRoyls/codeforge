// ─── Types ─────────────────────────────────────────────────────────────────────

export type Clearance = 'public' | 'confidential' | 'secret' | 'top-secret'
export type ThreatLevel = 'negligible' | 'low' | 'moderate' | 'high' | 'critical'
export type AgentStatus = 'active' | 'dormant' | 'compromised' | 'retired'
export type VulnType = 'complexity-bomb' | 'coupling-risk' | 'documentation-gap' | 'type-weakness' | 'stability-threat'
export type VulnSeverity = 'low' | 'medium' | 'high' | 'critical'
export type OverallThreat = 'low' | 'moderate' | 'high' | 'critical'

export interface Vulnerability {
  type: VulnType
  severity: VulnSeverity
  description: string
  exploit: string
  mitigation: string
}

export interface Agent {
  file: string
  codename: string
  clearance: Clearance
  reliability: number
  threatLevel: ThreatLevel
  network: string[]
  strategicValue: number
  vulnerabilities: Vulnerability[]
  lastActivity: string
  status: AgentStatus
}

export interface ThreatMatrix {
  highValue: string[]
  highRisk: string[]
  vulnerable: string[]
  blindSpots: string[]
  sleeperAgents: string[]
}

export interface DossierStats {
  totalAgents: number
  activeCount: number
  dormantCount: number
  compromisedCount: number
  topSecretCount: number
  criticalThreatCount: number
  highThreatCount: number
  vulnerabilityCount: number
  criticalVulnerabilities: number
  avgReliability: number
  avgStrategicValue: number
  highestValueTarget: string
  biggestThreat: string
  overallThreatLevel: OverallThreat
  networkDensity: number
}

export interface DossierResult {
  agents: Agent[]
  threatMatrix: ThreatMatrix
  stats: DossierStats
  recommendations: string[]
}

export interface DossierOptions {
  verbose?: boolean
}

// ─── Codename Generation ───────────────────────────────────────────────────────

const ADJECTIVES = ['Shadow', 'Dark', 'Silent', 'Ghost', 'Iron', 'Steel', 'Crimson', 'Phantom', 'Stealth', 'Cipher', 'Venom', 'Frost', 'Raven', 'Storm', 'Viper']
const NOUNS = ['Wolf', 'Eagle', 'Hawk', 'Viper', 'Fox', 'Bear', 'Tiger', 'Falcon', 'Cobra', 'Panther', 'Raven', 'Shark', 'Lynx', 'Mantis', 'Owl']

/**
 * Generate a spy-style codename from file path.
 *
 * @example
 * generateCodename('src/commands/run.ts') // 'Shadow Eagle'
 */
export function generateCodename(file: string): string {
  let hash = 0
  for (let i = 0; i < file.length; i++) {
    hash = ((hash << 5) - hash) + file.charCodeAt(i)
    hash |= 0
  }
  const adj = ADJECTIVES[Math.abs(hash) % ADJECTIVES.length]
  const noun = NOUNS[Math.abs(hash >> 4) % NOUNS.length]
  return `${adj} ${noun}`
}

// ─── Clearance ──────────────────────────────────────────────────────────────────

/**
 * Assign clearance level based on content and strategic value.
 *
 * @example
 * assignClearance('complex code...', 90) // 'top-secret'
 */
export function assignClearance(_content: string, strategicValue: number): Clearance {
  if (strategicValue >= 80) return 'top-secret'
  if (strategicValue >= 50) return 'secret'
  if (strategicValue >= 20) return 'confidential'
  return 'public'
}

// ─── Threat Level ───────────────────────────────────────────────────────────────

/**
 * Assess threat level from complexity and coupling.
 *
 * @example
 * assessThreatLevel('if(x){for(...){while(...){}}}', 10, 5) // 'critical'
 */
export function assessThreatLevel(content: string, imports: number, importedBy: number): ThreatLevel {
  const complexity = computeCyclomaticComplexity(content)
  const coupling = imports + importedBy

  let score = 0
  if (complexity > 20) score += 4
  else if (complexity > 10) score += 3
  else if (complexity > 5) score += 2
  else if (complexity > 2) score += 1

  if (coupling > 15) score += 3
  else if (coupling > 10) score += 2
  else if (coupling > 5) score += 1

  const anyCount = (content.match(/:\s*any\b/g) || []).length
  if (anyCount > 3) score += 2
  else if (anyCount > 0) score += 1

  if (score >= 7) return 'critical'
  if (score >= 5) return 'high'
  if (score >= 3) return 'moderate'
  if (score >= 1) return 'low'
  return 'negligible'
}

// ─── Strategic Value ────────────────────────────────────────────────────────────

/**
 * Assess strategic value (importance) 0-100.
 *
 * @example
 * assessStrategicValue(10, 5) // high value
 */
export function assessStrategicValue(importedBy: number, exports: number): number {
  const value = Math.min(importedBy * 10, 60) + Math.min(exports * 5, 40)
  return Math.max(0, Math.min(100, value))
}

// ─── Agent Status ───────────────────────────────────────────────────────────────

/**
 * Classify agent status.
 *
 * @example
 * classifyAgentStatus(content, date, 3, 5) // 'active'
 */
export function classifyAgentStatus(
  content: string,
  _lastModified: string,
  imports: number,
  exports: number,
): AgentStatus {
  const hasExports = exports > 0
  const hasImports = imports > 0
  const complexity = computeCyclomaticComplexity(content)
  const hasDocs = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length > 0

  if (!hasExports && !hasImports) return 'retired'
  if (complexity > 20 && !hasDocs) return 'compromised'
  const anyCount = (content.match(/:\s*any\b/g) || []).length
  if (anyCount > 3 && complexity > 10) return 'compromised'
  if (hasExports && hasImports) return 'active'
  if (hasExports || hasImports) return 'dormant'
  return 'active'
}

// ─── Reliability ────────────────────────────────────────────────────────────────

/**
 * Compute reliability score (code quality) 0-100.
 *
 * @example
 * computeReliability('export function foo() { return 1 }')
 */
export function computeReliability(content: string): number {
  if (!content || content.trim().length === 0) return 0

  const docComments = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
  const jsdocParams = (content.match(/@param|@returns|@example/g) || []).length
  const complexity = computeCyclomaticComplexity(content)
  const anyTypes = (content.match(/:\s*any\b/g) || []).length
  const tsIgnore = (content.match(/\/\/\s*@ts-ignore|\/\/\s*@ts-expect-error/g) || []).length

  let score = 50
  score += Math.min(docComments * 5, 15)
  score += Math.min(jsdocParams * 3, 10)
  score -= complexity > 15 ? 20 : complexity > 10 ? 10 : complexity > 5 ? 5 : 0
  score -= anyTypes * 5
  score -= tsIgnore * 8

  return Math.max(0, Math.min(100, score))
}

// ─── Vulnerability Scanning ────────────────────────────────────────────────────

/**
 * Scan content for vulnerabilities.
 *
 * @example
 * scanVulnerabilities('complex code...', 'file.ts')
 */
export function scanVulnerabilities(content: string, file: string): Vulnerability[] {
  const vulns: Vulnerability[] = []

  const complexity = computeCyclomaticComplexity(content)
  if (complexity > 20) {
    vulns.push({
      type: 'complexity-bomb',
      severity: complexity > 40 ? 'critical' : 'high',
      description: `Cyclomatic complexity ${complexity} exceeds threshold (20)`,
      exploit: 'Changes risk introducing defects; hard to test and reason about',
      mitigation: 'Refactor into smaller functions with single responsibility',
    })
  }

  const imports = countImports(content)
  if (imports > 10) {
    vulns.push({
      type: 'coupling-risk',
      severity: imports > 20 ? 'critical' : 'high',
      description: `High fan-out with ${imports} imports`,
      exploit: 'Changes in any dependency could break this module',
      mitigation: 'Reduce dependencies; introduce abstraction layers',
    })
  }

  const exportCount = countExports(content)
  const hasDocOnExport = /\/\*\*[\s\S]*?\*\/\s*export/.test(content) || /export\s+(function|class|const).*\/\*\*/.test(content)
  if (exportCount > 0 && !hasDocOnExport && !file.includes('.test.') && !file.includes('.spec.')) {
    const docComments = (content.match(/\/\*\*/g) || []).length
    if (docComments === 0) {
      vulns.push({
        type: 'documentation-gap',
        severity: exportCount > 5 ? 'high' : 'medium',
        description: `${exportCount} exports with no JSDoc documentation`,
        exploit: 'Consumers may misuse the API; maintenance burden increases',
        mitigation: 'Add JSDoc comments to all exported functions and types',
      })
    }
  }

  const anyCount = (content.match(/:\s*any\b/g) || []).length
  if (anyCount > 0) {
    vulns.push({
      type: 'type-weakness',
      severity: anyCount > 5 ? 'critical' : anyCount > 2 ? 'high' : 'medium',
      description: `${anyCount} usage(s) of 'any' type`,
      exploit: 'Type safety bypassed; runtime errors may go undetected',
      mitigation: 'Replace with proper type annotations',
    })
  }

  const lines = content.split('\n').length
  if (lines > 300) {
    vulns.push({
      type: 'stability-threat',
      severity: lines > 500 ? 'high' : 'medium',
      description: `Large file with ${lines} lines`,
      exploit: 'High churn probability; merge conflicts; scope creep',
      mitigation: 'Split into focused modules with clear boundaries',
    })
  }

  return vulns
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Compute cyclomatic complexity.
 *
 * @example
 * computeCyclomaticComplexity('if (x) { for (let i = 0; i < 10; i++) {} }') // 2
 */
export function computeCyclomaticComplexity(content: string): number {
  const branches = (content.match(/\bif\b|\belse\b|\bfor\b|\bwhile\b|\bswitch\b|\bcatch\b|\?\?|&&|\|\||\?\./g) || []).length
  return 1 + branches
}

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
 * Count imports in content.
 *
 * @example
 * countImports("import { a } from './x'\nimport { b } from './y'") // 2
 */
export function countImports(content: string): number {
  return extractImports(content).length
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
 * Resolve import path to known file.
 *
 * @example
 * resolveImportPath('./utils', new Set(['utils.ts'])) // 'utils.ts'
 */
export function resolveImportPath(importPath: string, knownFiles: Set<string>): string | null {
  const stripped = importPath.replace(/^\.\//, '')
  for (const ext of ['', '.ts', '.js', '.tsx', '.jsx', '/index.ts', '/index.js']) {
    const candidate = stripped + ext
    if (knownFiles.has(candidate)) return candidate
  }
  return null
}

// ─── Network Building ──────────────────────────────────────────────────────────

/**
 * Build agent network (imports + imported-by connections).
 *
 * @example
 * buildNetwork('a.ts', files, contents)
 */
export function buildNetwork(file: string, files: string[], contents: string[]): string[] {
  const knownSet = new Set(files)
  const network: Set<string> = new Set()

  const idx = files.indexOf(file)
  if (idx >= 0) {
    const content = contents[idx] || ''
    for (const imp of extractImports(content)) {
      const resolved = resolveImportPath(imp, knownSet)
      if (resolved) network.add(resolved)
    }
  }

  for (let i = 0; i < files.length; i++) {
    if (files[i] === file) continue
    const content = contents[i] || ''
    for (const imp of extractImports(content)) {
      const resolved = resolveImportPath(imp, knownSet)
      if (resolved === file) network.add(files[i] ?? '')
    }
  }

  return [...network]
}

// ─── Threat Matrix ──────────────────────────────────────────────────────────────

/**
 * Build threat matrix from agents.
 *
 * @example
 * buildThreatMatrix(agents)
 */
export function buildThreatMatrix(agents: Agent[]): ThreatMatrix {
  return {
    highValue: agents.filter((a) => a.strategicValue > 80).map((a) => a.file),
    highRisk: agents.filter((a) => a.threatLevel === 'high' || a.threatLevel === 'critical').map((a) => a.file),
    vulnerable: agents.filter((a) => a.vulnerabilities.length > 0).map((a) => a.file),
    blindSpots: agents.filter((a) => a.vulnerabilities.some((v) => v.type === 'documentation-gap')).map((a) => a.file),
    sleeperAgents: agents.filter((a) => a.status === 'dormant' && a.strategicValue > 50).map((a) => a.file),
  }
}

// ─── Network Density ────────────────────────────────────────────────────────────

/**
 * Compute network density 0-100.
 *
 * @example
 * computeNetworkDensity(agents)
 */
export function computeNetworkDensity(agents: Agent[]): number {
  if (agents.length <= 1) return 0

  let totalConnections = 0
  for (const agent of agents) {
    totalConnections += agent.network.length
  }

  const maxPossible = agents.length * (agents.length - 1)
  if (maxPossible === 0) return 0

  return Math.round((totalConnections / maxPossible) * 100)
}

// ─── Overall Threat Level ──────────────────────────────────────────────────────

/**
 * Compute overall threat level from agents and matrix.
 *
 * @example
 * computeOverallThreatLevel(agents, matrix)
 */
export function computeOverallThreatLevel(agents: Agent[], matrix: ThreatMatrix): OverallThreat {
  if (agents.length === 0) return 'low'

  const criticalCount = agents.filter((a) => a.threatLevel === 'critical').length
  const highCount = agents.filter((a) => a.threatLevel === 'high').length
  const compromised = agents.filter((a) => a.status === 'compromised').length
  const criticalVulns = agents.reduce((s, a) => s + a.vulnerabilities.filter((v) => v.severity === 'critical').length, 0)
  const ratio = agents.length > 0 ? (criticalCount + highCount + compromised) / agents.length : 0

  if (criticalVulns > 0 || ratio > 0.5) return 'critical'
  if (highCount > 3 || ratio > 0.3) return 'high'
  if (highCount > 0 || ratio > 0.1 || matrix.vulnerable.length > agents.length * 0.5) return 'moderate'
  return 'low'
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate dossier recommendations.
 *
 * @example
 * generateDossierRecommendations(agents, matrix, stats)
 */
export function generateDossierRecommendations(_agents: Agent[], matrix: ThreatMatrix, stats: DossierStats): string[] {
  const recs: string[] = []

  if (stats.criticalVulnerabilities > 0) {
    recs.push(`IMMEDIATE ACTION: ${stats.criticalVulnerabilities} critical vulnerabilit${stats.criticalVulnerabilities === 1 ? 'y' : 'ies'} detected — prioritize remediation`)
  }

  if (stats.compromisedCount > 0) {
    recs.push(`${stats.compromisedCount} compromised agent${stats.compromisedCount === 1 ? '' : 's'} — rehabilitate through refactoring and documentation`)
  }

  if (matrix.blindSpots.length > 0) {
    recs.push(`${matrix.blindSpots.length} intelligence gap${matrix.blindSpots.length === 1 ? '' : 's'} — gather documentation on undocumented exports`)
  }

  if (matrix.highValue.length > 0) {
    recs.push(`Protect ${matrix.highValue.length} high-value target${matrix.highValue.length === 1 ? '' : 's'} — ensure tests and documentation are comprehensive`)
  }

  if (matrix.sleeperAgents.length > 0) {
    recs.push(`${matrix.sleeperAgents.length} sleeper agent${matrix.sleeperAgents.length === 1 ? '' : 's'} — dormant but strategically important; verify still needed`)
  }

  if (stats.avgReliability < 50) {
    recs.push(`Average reliability ${stats.avgReliability}% — below acceptable threshold; improve code quality across the board`)
  }

  if (recs.length === 0) {
    recs.push('All agents operational — threat level is low and codebase is well-maintained')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete dossier result.
 *
 * @example
 * buildDossierResult(['a.ts'], ['export const x = 1'], {})
 */
export function buildDossierResult(files: string[], contents: string[], _options: DossierOptions): DossierResult {
  const knownSet = new Set(files)

  const importedByCounts: Record<string, number> = {}
  for (let i = 0; i < files.length; i++) {
    const content = contents[i] || ''
    for (const imp of extractImports(content)) {
      const resolved = resolveImportPath(imp, knownSet)
      if (resolved) importedByCounts[resolved] = (importedByCounts[resolved] || 0) + 1
    }
  }

  const agents: Agent[] = files.map((file, i) => {
    const content = contents[i] || ''
    const codename = generateCodename(file)
    const importCount = countImports(content)
    const exportCount = countExports(content)
    const importedBy = importedByCounts[file] || 0
    const strategicValue = assessStrategicValue(importedBy, exportCount)
    const clearance = assignClearance(content, strategicValue)
    const reliability = computeReliability(content)
    const threatLevel = assessThreatLevel(content, importCount, importedBy)
    const network = buildNetwork(file, files, contents)
    const vulnerabilities = scanVulnerabilities(content, file)
    const lastActivity = new Date().toISOString().split('T')[0] ?? ''
    const status = classifyAgentStatus(content, lastActivity ?? '', importCount, exportCount)

    return { file, codename, clearance, reliability, threatLevel, network, strategicValue, vulnerabilities, lastActivity, status }
  })

  const threatMatrix = buildThreatMatrix(agents)
  const networkDensity = computeNetworkDensity(agents)

  const totalAgents = agents.length
  const activeCount = agents.filter((a) => a.status === 'active').length
  const dormantCount = agents.filter((a) => a.status === 'dormant').length
  const compromisedCount = agents.filter((a) => a.status === 'compromised').length
  const topSecretCount = agents.filter((a) => a.clearance === 'top-secret').length
  const criticalThreatCount = agents.filter((a) => a.threatLevel === 'critical').length
  const highThreatCount = agents.filter((a) => a.threatLevel === 'high').length
  const vulnerabilityCount = agents.reduce((s, a) => s + a.vulnerabilities.length, 0)
  const criticalVulnerabilities = agents.reduce((s, a) => s + a.vulnerabilities.filter((v) => v.severity === 'critical').length, 0)
  const avgReliability = totalAgents > 0 ? Math.round(agents.reduce((s, a) => s + a.reliability, 0) / totalAgents) : 0
  const avgStrategicValue = totalAgents > 0 ? Math.round(agents.reduce((s, a) => s + a.strategicValue, 0) / totalAgents) : 0
  const sortedByValue = [...agents].sort((a, b) => b.strategicValue - a.strategicValue)
  const sortedByThreat = [...agents].sort((a, b) => threatScore(b.threatLevel) - threatScore(a.threatLevel))
  const overallThreatLevel = computeOverallThreatLevel(agents, threatMatrix)

  const stats: DossierStats = {
    totalAgents,
    activeCount,
    dormantCount,
    compromisedCount,
    topSecretCount,
    criticalThreatCount,
    highThreatCount,
    vulnerabilityCount,
    criticalVulnerabilities,
    avgReliability,
    avgStrategicValue,
    highestValueTarget: sortedByValue[0]?.file || '',
    biggestThreat: sortedByThreat[0]?.file || '',
    overallThreatLevel,
    networkDensity,
  }

  const recommendations = generateDossierRecommendations(agents, threatMatrix, stats)

  return { agents, threatMatrix, stats, recommendations }
}

function threatScore(t: ThreatLevel): number {
  switch (t) {
    case 'critical': return 4
    case 'high': return 3
    case 'moderate': return 2
    case 'low': return 1
    case 'negligible': return 0
  }
}
