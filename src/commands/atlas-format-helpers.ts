import chalk from 'chalk'
import type { AtlasRegion, AtlasResult, AtlasStats } from './atlas-helpers.js'

// ─── Health Indicators ────────────────────────────────────────────────────────

export function healthIndicator(score: number): string {
  if (score >= 80) return chalk.rgb(100, 220, 100)(`● ${score}`)
  if (score >= 50) return chalk.rgb(255, 215, 0)(`◐ ${score}`)
  return chalk.rgb(255, 80, 80)(`○ ${score}`)
}

export function healthBar(score: number): string {
  const filled = Math.round((score / 100) * 10)
  const empty = 10 - filled
  const color = score >= 80 ? chalk.rgb(100, 220, 100)
    : score >= 50 ? chalk.rgb(255, 215, 0)
    : chalk.rgb(255, 80, 80)
  return color('█'.repeat(filled)) + chalk.rgb(60, 60, 60)('░'.repeat(empty))
}

// ─── Region Card ──────────────────────────────────────────────────────────────

export function formatRegionCard(region: AtlasRegion, indent: string = ''): string {
  const name = chalk.bold(region.name)
  const health = healthIndicator(region.healthScore)
  const files = chalk.rgb(180, 180, 180)(`${region.files} file(s)`)
  const lines = chalk.rgb(180, 180, 180)(`${region.totalLines} lines`)
  const desc = chalk.rgb(140, 140, 140)(region.description)

  const lines_arr: string[] = []
  lines_arr.push(`${indent}${name}  ${health}  ${files}  ${lines}`)
  lines_arr.push(`${indent}  ${desc}`)

  return lines_arr.join('\n')
}

// ─── Tree Map ─────────────────────────────────────────────────────────────────

export function formatRegionTree(region: AtlasRegion, prefix: string = '', isLast: boolean = true): string {
  const connector = isLast ? '└── ' : '├── '
  const childPrefix = isLast ? '    ' : '│   '

  const name = chalk.bold(region.name)
  const health = healthIndicator(region.healthScore)
  const summary = chalk.rgb(150, 150, 150)(`${region.files}F ${region.totalLines}L`)

  const lines: string[] = []
  lines.push(`${prefix}${connector}${name}  ${health}  ${summary}`)

  for (let i = 0; i < region.subregions.length; i++) {
    const child = region.subregions[i]
    const childIsLast = i === region.subregions.length - 1
    lines.push(formatRegionTree(child, prefix + childPrefix, childIsLast))
  }

  return lines.join('\n')
}

export function formatFullTree(root: AtlasRegion): string {
  const lines: string[] = []
  lines.push(chalk.bold(root.name) + '  ' + healthIndicator(root.healthScore) + '  ' + chalk.rgb(150, 150, 150)(`${root.files}F ${root.totalLines}L`))

  for (let i = 0; i < root.subregions.length; i++) {
    const child = root.subregions[i]
    const isLast = i === root.subregions.length - 1
    lines.push(formatRegionTree(child, '', isLast))
  }

  return lines.join('\n')
}

// ─── Region Table ─────────────────────────────────────────────────────────────

export function formatRegionRow(region: AtlasRegion): string {
  const health = healthBar(region.healthScore)
  return `${chalk.bold(region.path.padEnd(25))}  ${health} ${region.healthScore}  ${String(region.files).padStart(4)}F  ${String(region.totalLines).padStart(6)}L  ${String(region.exports).padStart(3)}E  ${String(region.testFiles).padStart(3)}T  ${chalk.rgb(140, 140, 140)(region.description)}`
}

export function formatRegionTable(regions: AtlasRegion[]): string {
  const header = [
    chalk.bold('Path'.padEnd(25)),
    chalk.bold('Health'),
    chalk.bold('Files'),
    chalk.bold('Lines'),
    chalk.bold('Exp'),
    chalk.bold('Tst'),
    chalk.bold('Description'),
  ].join('  ')

  const rows = regions.map(formatRegionRow)
  return [header, ...rows].join('\n')
}

// ─── Stats Dashboard ──────────────────────────────────────────────────────────

export function formatStats(stats: AtlasStats): string {
  const lines = [
    chalk.bold('Codebase Atlas — Dashboard'),
    '',
    `  Total Regions:    ${stats.totalRegions}`,
    `  Total Files:      ${stats.totalFiles}`,
    `  Total Lines:      ${stats.totalLines.toLocaleString()}`,
    `  Average Health:   ${stats.averageHealth}`,
    '',
    `  Largest:          ${chalk.rgb(100, 200, 255)(stats.largestRegion)}`,
    `  Smallest:         ${chalk.rgb(150, 200, 150)(stats.smallestRegion)}`,
    `  Most Complex:     ${chalk.rgb(255, 165, 0)(stats.mostComplexRegion)}`,
    `  Healthiest:       ${chalk.rgb(100, 220, 100)(stats.healthiestRegion)}`,
    `  Unhealthiest:     ${chalk.rgb(255, 80, 80)(stats.unhealthiestRegion)}`,
  ]
  return lines.join('\n')
}

// ─── Legend ────────────────────────────────────────────────────────────────────

export function formatLegend(legend: string[]): string {
  const lines = [chalk.bold('Legend')]
  legend.forEach((l) => {
    lines.push(`  ${chalk.rgb(180, 180, 220)(l)}`)
  })
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export function formatRecommendations(recommendations: string[]): string {
  const lines = [chalk.bold('Recommendations')]
  recommendations.forEach((r, i) => {
    lines.push(`  ${i + 1}. ${chalk.rgb(255, 220, 150)(r)}`)
  })
  return lines.join('\n')
}

// ─── Full Report ──────────────────────────────────────────────────────────────

export function formatAtlasReport(result: AtlasResult, verbose: boolean): string {
  const sections: string[] = []

  sections.push(formatStats(result.stats))
  sections.push('')

  sections.push(chalk.bold('Project Tree'))
  sections.push(formatFullTree(result.root))
  sections.push('')

  if (verbose && result.regions.length > 0) {
    sections.push(chalk.bold('Region Details'))
    sections.push(formatRegionTable(result.regions))
    sections.push('')
  } else {
    const leafRegions = result.regions.filter((r) => r.subregions.length === 0)
    if (leafRegions.length > 0) {
      sections.push(chalk.bold('Region Summary'))
      sections.push(formatRegionTable(leafRegions.slice(0, 20)))
      sections.push('')
    }
  }

  sections.push(formatLegend(result.legend))
  sections.push('')
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

export function formatAtlasJson(result: AtlasResult): string {
  return JSON.stringify(result, null, 2)
}
