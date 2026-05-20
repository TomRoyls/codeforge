import chalk from 'chalk'

import type { ArchaeologistResult, ArchaeologistStats, Artifact, Era, FaultLine, Stratum } from './archaeologist-helpers.js'

// ─── Stratigraphic Column ─────────────────────────────────────────────────────

/**
 * Format stratigraphic column.
 *
 * @example
 * formatStratigraphicColumn(strata)
 */
export function formatStratigraphicColumn(strata: Stratum[]): string {
  if (strata.length === 0) return chalk.gray('  No strata layers found')

  const lines: string[] = []
  lines.push(chalk.bold('  Stratigraphic Column'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const s of strata.slice(0, 20)) {
    const typeColor = s.type === 'settlement'
      ? chalk.rgb(100, 200, 100)
      : s.type === 'expansion'
        ? chalk.rgb(100, 150, 255)
        : s.type === 'renovation'
          ? chalk.rgb(255, 200, 50)
          : s.type === 'destruction'
            ? chalk.rgb(220, 50, 50)
            : chalk.rgb(200, 150, 255)

    const thickness = Math.min(10, Math.max(1, Math.floor((s.insertions + s.deletions) / 20)))
    const bar = '█'.repeat(thickness)
    lines.push(`  L${String(s.layer).padStart(3)} ${typeColor(bar)} ${chalk.dim(s.hash.slice(0, 7))} ${s.message.slice(0, 40)}`)
  }

  if (strata.length > 20) {
    lines.push(`  ${chalk.dim(`... ${strata.length - 20} more layers`)}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Artifact Catalog ─────────────────────────────────────────────────────────

/**
 * Format artifact catalog.
 *
 * @example
 * formatArtifactCatalog(artifacts)
 */
export function formatArtifactCatalog(artifacts: Artifact[]): string {
  if (artifacts.length === 0) return chalk.gray('  No artifacts discovered')

  const lines: string[] = []
  lines.push(chalk.bold('  Artifact Catalog'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  const typeColor: Record<string, (s: string) => string> = {
    relic: chalk.rgb(200, 180, 100),
    fossil: chalk.rgb(150, 150, 150),
    treasure: chalk.rgb(255, 215, 0),
    potsherd: chalk.rgb(180, 130, 80),
  }

  for (const a of artifacts) {
    const color = typeColor[a.type] ?? chalk.white
    const sigColor = a.significance === 'high' ? chalk.rgb(220, 50, 50) : a.significance === 'medium' ? chalk.rgb(255, 165, 0) : chalk.dim
    lines.push(`  ${color(a.type.padEnd(10))} ${chalk.bold(a.file)} ${sigColor(`[${a.significance}]`)}`)
    lines.push(`    ${chalk.dim(a.description)}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Fault Line Map ────────────────────────────────────────────────────────────

/**
 * Format fault line map.
 *
 * @example
 * formatFaultLineMap(faultLines)
 */
export function formatFaultLineMap(faultLines: FaultLine[]): string {
  if (faultLines.length === 0) return chalk.gray('  No fault lines detected')

  const lines: string[] = []
  lines.push(chalk.bold('  Fault Line Map'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const f of faultLines) {
    const sevColor = f.severity === 'catastrophic'
      ? chalk.rgb(220, 50, 50)
      : f.severity === 'major'
        ? chalk.rgb(255, 140, 0)
        : chalk.rgb(255, 200, 50)

    lines.push(`  ${sevColor(`⚡ ${f.severity}`)} ${chalk.dim(f.commitHash.slice(0, 7))} ${f.type}`)
    lines.push(`    ${f.description.slice(0, 60)}`)
    lines.push(`    Files: ${f.filesAffected}  Lines: ${f.linesChanged}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Era Timeline ──────────────────────────────────────────────────────────────

/**
 * Format era timeline.
 *
 * @example
 * formatEraTimeline(eras)
 */
export function formatEraTimeline(eras: Era[]): string {
  if (eras.length === 0) return chalk.gray('  No eras identified')

  const lines: string[] = []
  lines.push(chalk.bold('  Era Timeline'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const e of eras) {
    const typeColor = e.dominantType === 'settlement'
      ? chalk.rgb(100, 200, 100)
      : e.dominantType === 'expansion'
        ? chalk.rgb(100, 150, 255)
        : e.dominantType === 'renovation'
          ? chalk.rgb(255, 200, 50)
          : e.dominantType === 'destruction'
            ? chalk.rgb(220, 50, 50)
            : chalk.rgb(200, 150, 255)

    lines.push(`  ${typeColor(e.name)} (${e.commits} commits)`)
    lines.push(`    ${chalk.dim(`${e.startDate} → ${e.endDate}`)}`)
    lines.push(`    ${chalk.dim(e.characteristics.join(', '))}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format archaeologist stats.
 *
 * @example
 * formatArchaeologistStats(stats)
 */
export function formatArchaeologistStats(stats: ArchaeologistStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Archaeological Stats'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))
  lines.push(`  Total layers:       ${stats.totalLayers}`)
  lines.push(`  Artifacts found:     ${stats.totalArtifacts}`)
  lines.push(`  Fault lines:        ${stats.faultLineCount}`)
  lines.push(`  Eras identified:    ${stats.eraCount}`)
  lines.push(`  Oldest layer:       ${stats.oldestLayer}`)
  lines.push(`  Deepest dig:        ${stats.deepestDig}`)
  lines.push(`  Artifact density:   ${stats.artifactDensity}/layer`)
  lines.push(`  Avg layer size:     ${stats.averageLayerThickness} lines`)
  lines.push(`  Seismic activity:   ${stats.seismicActivity}/100`)
  lines.push('')
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Clean up fossils'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('  No recommendations')

  const lines: string[] = []
  lines.push(chalk.bold('  Recommendations'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${chalk.bold(`${i + 1}.`)} ${recs[i]}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format full archaeologist table.
 *
 * @example
 * formatArchaeologistTable(result)
 */
export function formatArchaeologistTable(result: ArchaeologistResult): string {
  const parts: string[] = []
  parts.push(formatStratigraphicColumn(result.strata))
  parts.push(formatArtifactCatalog(result.artifacts))
  parts.push(formatFaultLineMap(result.faultLines))
  parts.push(formatEraTimeline(result.eras))
  parts.push(formatArchaeologistStats(result.stats))
  parts.push(formatRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format archaeologist result as JSON.
 *
 * @example
 * formatArchaeologistJSON(result)
 */
export function formatArchaeologistJSON(result: ArchaeologistResult): string {
  return JSON.stringify(result, null, 2)
}
