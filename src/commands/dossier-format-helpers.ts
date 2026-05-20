import chalk from 'chalk'

import type { Agent, DossierResult, DossierStats, ThreatMatrix, Vulnerability } from './dossier-helpers.js'

// ─── Classified Header ─────────────────────────────────────────────────────────

/**
 * Format classified header.
 *
 * @example
 * formatClassifiedHeader('TOP SECRET', 12)
 */
export function formatClassifiedHeader(level: string, count: number): string {
  const stamp = level === 'critical' ? chalk.rgb(244, 67, 54)('⛔ CLASSIFIED') : chalk.rgb(255, 193, 7)('🔒 CLASSIFIED')
  return `\n  ${stamp} — DOSSIER ON ${count} AGENT${count === 1 ? '' : 'S'}\n  ${chalk.gray('═'.repeat(50))}`
}

// ─── Agent Roster ──────────────────────────────────────────────────────────────

/**
 * Format agent roster.
 *
 * @example
 * formatAgentRoster(agents)
 */
export function formatAgentRoster(agents: Agent[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(244, 67, 54)('\n  Agent Roster'))
  lines.push(chalk.gray('  ─'.repeat(30)))

  if (agents.length === 0) {
    lines.push(chalk.gray('  No agents identified'))
    return lines.join('\n')
  }

  const sorted = [...agents].sort((a, b) => b.strategicValue - a.strategicValue)
  for (const agent of sorted.slice(0, 20)) {
    const statusIcon = statusBadge(agent.status)
    const clearanceIcon = clearanceBadge(agent.clearance)
    const threatIcon = threatBadge(agent.threatLevel)
    lines.push(`  ${statusIcon} ${chalk.bold(agent.codename.padEnd(16))} ${clearanceIcon} ${threatIcon}  val:${String(agent.strategicValue).padStart(3)}  rel:${String(agent.reliability).padStart(3)}  net:${String(agent.network.length).padStart(2)}`)
    lines.push(chalk.gray(`    ${agent.file}`))
  }

  if (agents.length > 20) {
    lines.push(chalk.gray(`  ... and ${agents.length - 20} more agents`))
  }

  return lines.join('\n')
}

function statusBadge(s: string): string {
  switch (s) {
    case 'active': return chalk.rgb(76, 175, 80)('●')
    case 'dormant': return chalk.rgb(255, 193, 7)('○')
    case 'compromised': return chalk.rgb(244, 67, 54)('✗')
    case 'retired': return chalk.gray('·')
    default: return chalk.gray('?')
  }
}

function clearanceBadge(c: string): string {
  switch (c) {
    case 'top-secret': return chalk.rgb(244, 67, 54)('TS')
    case 'secret': return chalk.rgb(255, 152, 0)('S')
    case 'confidential': return chalk.rgb(255, 193, 7)('C')
    case 'public': return chalk.rgb(76, 175, 80)('P')
    default: return chalk.gray('?')
  }
}

function threatBadge(t: string): string {
  switch (t) {
    case 'critical': return chalk.rgb(244, 67, 54)('◆CRT')
    case 'high': return chalk.rgb(255, 87, 34)('◆HI')
    case 'moderate': return chalk.rgb(255, 193, 7)('◇MOD')
    case 'low': return chalk.rgb(76, 175, 80)('○LO')
    case 'negligible': return chalk.gray('·NEG')
    default: return chalk.gray('?')
  }
}

// ─── Threat Matrix ──────────────────────────────────────────────────────────────

/**
 * Format threat matrix.
 *
 * @example
 * formatThreatMatrix(matrix)
 */
export function formatThreatMatrix(matrix: ThreatMatrix): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(244, 67, 54)('\n  Threat Matrix'))
  lines.push(chalk.gray('  ─'.repeat(50)))

  lines.push(`  High-Value Targets: ${matrix.highValue.length > 0 ? chalk.rgb(255, 215, 0)(String(matrix.highValue.length)) : chalk.gray('0')}`)
  for (const f of matrix.highValue.slice(0, 5)) {
    lines.push(chalk.gray(`    ★ ${f}`))
  }

  lines.push(`  High-Risk Assets: ${matrix.highRisk.length > 0 ? chalk.rgb(244, 67, 54)(String(matrix.highRisk.length)) : chalk.gray('0')}`)
  for (const f of matrix.highRisk.slice(0, 5)) {
    lines.push(chalk.rgb(244, 67, 54)(`    ⚠ ${f}`))
  }

  lines.push(`  Vulnerable: ${matrix.vulnerable.length > 0 ? chalk.rgb(255, 152, 0)(String(matrix.vulnerable.length)) : chalk.gray('0')}`)
  lines.push(`  Blind Spots: ${matrix.blindSpots.length > 0 ? chalk.rgb(156, 39, 176)(String(matrix.blindSpots.length)) : chalk.gray('0')}`)
  lines.push(`  Sleeper Agents: ${matrix.sleeperAgents.length > 0 ? chalk.rgb(255, 193, 7)(String(matrix.sleeperAgents.length)) : chalk.gray('0')}`)

  return lines.join('\n')
}

// ─── Vulnerability Catalog ─────────────────────────────────────────────────────

/**
 * Format vulnerability catalog.
 *
 * @example
 * formatVulnCatalog(agents)
 */
export function formatVulnCatalog(agents: Agent[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(244, 67, 54)('\n  Vulnerability Catalog'))
  lines.push(chalk.gray('  ─'.repeat(50)))

  const allVulns: { file: string; vuln: Vulnerability }[] = []
  for (const agent of agents) {
    for (const v of agent.vulnerabilities) {
      allVulns.push({ file: agent.file, vuln: v })
    }
  }

  if (allVulns.length === 0) {
    lines.push(chalk.rgb(76, 175, 80)('  ✓ No vulnerabilities detected'))
    return lines.join('\n')
  }

  const sorted = allVulns.sort((a, b) => vulnScore(b.vuln.severity) - vulnScore(a.vuln.severity))
  for (const { file, vuln } of sorted.slice(0, 15)) {
    const sev = severityBadge(vuln.severity)
    lines.push(`  ${sev} ${vuln.type.padEnd(20)} ${chalk.gray(file)}`)
    lines.push(chalk.gray(`    ${vuln.description}`))
  }

  if (allVulns.length > 15) {
    lines.push(chalk.gray(`  ... and ${allVulns.length - 15} more vulnerabilities`))
  }

  return lines.join('\n')
}

function vulnScore(s: string): number {
  switch (s) {
    case 'critical': return 4
    case 'high': return 3
    case 'medium': return 2
    case 'low': return 1
    default: return 0
  }
}

function severityBadge(s: string): string {
  switch (s) {
    case 'critical': return chalk.rgb(244, 67, 54)('◆')
    case 'high': return chalk.rgb(255, 87, 34)('▲')
    case 'medium': return chalk.rgb(255, 193, 7)('●')
    case 'low': return chalk.rgb(76, 175, 80)('○')
    default: return chalk.gray('·')
  }
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format dossier statistics.
 *
 * @example
 * formatDossierStats(stats)
 */
export function formatDossierStats(stats: DossierStats): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(244, 67, 54)('\n  Intelligence Summary'))
  lines.push(chalk.gray('  ─'.repeat(40)))
  lines.push(`  Agents: ${stats.totalAgents}  Active: ${stats.activeCount}  Dormant: ${stats.dormantCount}  Compromised: ${stats.compromisedCount}`)
  lines.push(`  Top Secret: ${stats.topSecretCount}  Critical Threats: ${stats.criticalThreatCount}  High Threats: ${stats.highThreatCount}`)
  lines.push(`  Vulnerabilities: ${stats.vulnerabilityCount}  Critical: ${stats.criticalVulnerabilities}`)
  lines.push(`  Avg Reliability: ${stats.avgReliability}%  Avg Strategic Value: ${stats.avgStrategicValue}%`)
  lines.push(`  Highest Value Target: ${stats.highestValueTarget}`)
  lines.push(`  Biggest Threat: ${stats.biggestThreat}`)
  lines.push(`  Overall Threat: ${overallThreatBadge(stats.overallThreatLevel)}`)
  lines.push(`  Network Density: ${stats.networkDensity}%`)
  return lines.join('\n')
}

function overallThreatBadge(t: string): string {
  switch (t) {
    case 'critical': return chalk.rgb(244, 67, 54).bold('⛔ CRITICAL')
    case 'high': return chalk.rgb(255, 87, 34)('▲ HIGH')
    case 'moderate': return chalk.rgb(255, 193, 7)('● MODERATE')
    case 'low': return chalk.rgb(76, 175, 80)('○ LOW')
    default: return chalk.gray('· UNKNOWN')
  }
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatDossierRecommendations(['Fix critical vulns'])
 */
export function formatDossierRecommendations(recs: string[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(244, 67, 54)('\n  Recommended Actions'))
  lines.push(chalk.gray('  ─'.repeat(50)))
  for (const rec of recs) {
    lines.push(`  → ${rec}`)
  }
  return lines.join('\n')
}

// ─── JSON Format ───────────────────────────────────────────────────────────────

/**
 * Format as JSON.
 *
 * @example
 * formatDossierJson(result)
 */
export function formatDossierJson(result: DossierResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Format ──────────────────────────────────────────────────────────────

/**
 * Format as table.
 *
 * @example
 * formatDossierTable(result)
 */
export function formatDossierTable(result: DossierResult): string {
  const parts: string[] = []
  parts.push(formatClassifiedHeader(result.stats.overallThreatLevel, result.stats.totalAgents))
  parts.push(formatAgentRoster(result.agents))
  parts.push(formatThreatMatrix(result.threatMatrix))
  parts.push(formatVulnCatalog(result.agents))
  parts.push(formatDossierStats(result.stats))
  parts.push(formatDossierRecommendations(result.recommendations))
  return parts.join('\n')
}
