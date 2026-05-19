import chalk from 'chalk'

import type { FullReport, SummaryData } from './report-helpers.js'

// ─── Text formatting ────────────────────────────────────

/**
 * Formats a full report as a colored plain text string.
 *
 * @param report - The complete report data
 * @returns Formatted text output with chalk colors
 *
 * @example
 * formatReportText(report) // 'CodeForge Report — ./src — ...'
 */
export function formatReportText(report: FullReport): string {
  const lines: string[] = []
  const date = new Date(report.generatedAt).toLocaleString()

  lines.push(chalk.bold(`CodeForge Report — ${report.projectPath} — ${date}`))
  lines.push(chalk.dim('═'.repeat(60)))
  lines.push('')

  for (const section of report.sections) {
    lines.push(chalk.bold.cyan(`▸ ${section.title}`))
    lines.push(chalk.dim('─'.repeat(50)))
    lines.push(section.content)
    lines.push('')
  }

  lines.push(chalk.dim('─'.repeat(60)))
  lines.push(chalk.dim(`Generated at ${date}`))

  return lines.join('\n')
}

// ─── HTML formatting ────────────────────────────────────

/**
 * Formats a full report as a complete HTML document with inline styles.
 *
 * @param report - The complete report data
 * @returns Complete HTML string with embedded CSS
 *
 * @example
 * formatReportHtml(report) // '<!DOCTYPE html>...'
 */
export function formatReportHtml(report: FullReport): string {
  const date = new Date(report.generatedAt).toLocaleString()
  const rows: string[] = []

  rows.push('<!DOCTYPE html>')
  rows.push('<html lang="en">')
  rows.push('<head>')
  rows.push('<meta charset="UTF-8">')
  rows.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">')
  rows.push(`<title>CodeForge Report — ${escapeHtml(report.projectPath)}</title>`)
  rows.push('<style>')
  rows.push(buildCssStyles())
  rows.push('</style>')
  rows.push('</head>')
  rows.push('<body>')
  rows.push('<div class="container">')
  rows.push(`<header class="header">`)
  rows.push(`<h1>CodeForge Report</h1>`)
  rows.push(`<p class="subtitle">${escapeHtml(report.projectPath)} — ${escapeHtml(date)}</p>`)
  rows.push('</header>')

  rows.push(buildSummaryHtml(report.summary))
  rows.push(buildComplexityHtml(report))
  rows.push(buildTodosHtml(report))
  rows.push(buildDependenciesHtml(report))
  rows.push(buildSuggestionsHtml(report))

  rows.push('<footer class="footer">')
  rows.push(`<p>Generated at ${escapeHtml(date)}</p>`)
  rows.push('</footer>')
  rows.push('</div>')
  rows.push('</body>')
  rows.push('</html>')

  return rows.join('\n')
}

function buildCssStyles(): string {
  const rules: string[] = []
  rules.push('body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; color: #333; }')
  rules.push('.container { max-width: 960px; margin: 0 auto; }')
  rules.push('.header { background: #2c3e50; color: white; padding: 24px 32px; border-radius: 8px 8px 0 0; }')
  rules.push('.header h1 { margin: 0 0 4px 0; font-size: 24px; }')
  rules.push('.subtitle { margin: 0; opacity: 0.85; font-size: 14px; }')
  rules.push('.section { background: white; padding: 20px 24px; margin-bottom: 2px; }')
  rules.push('.section:last-of-type { border-radius: 0 0 8px 8px; }')
  rules.push('.section h2 { margin: 0 0 12px 0; font-size: 18px; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 6px; }')
  rules.push('table { width: 100%; border-collapse: collapse; margin: 8px 0; }')
  rules.push('th { text-align: left; background: #ecf0f1; padding: 8px 12px; font-size: 13px; }')
  rules.push('td { padding: 6px 12px; border-bottom: 1px solid #eee; font-size: 13px; }')
  rules.push('.stat-grid { display: flex; gap: 16px; flex-wrap: wrap; }')
  rules.push('.stat-card { background: #f8f9fa; border-radius: 6px; padding: 12px 16px; min-width: 140px; }')
  rules.push('.stat-card .value { font-size: 24px; font-weight: bold; color: #2c3e50; }')
  rules.push('.stat-card .label { font-size: 12px; color: #7f8c8d; text-transform: uppercase; }')
  rules.push('.severity-high { color: #e74c3c; font-weight: bold; }')
  rules.push('.severity-medium { color: #f39c12; font-weight: bold; }')
  rules.push('.severity-low { color: #27ae60; font-weight: bold; }')
  rules.push('.footer { text-align: center; padding: 16px; color: #95a5a6; font-size: 12px; }')
  rules.push('.lang-bar { display: flex; height: 20px; border-radius: 4px; overflow: hidden; margin: 8px 0; }')
  rules.push('.lang-bar-segment { height: 100%; }')
  rules.push('.bar-label { font-size: 12px; margin-top: 4px; }')
  return rules.join('\n')
}

function buildSummaryHtml(summary: SummaryData): string {
  const rows: string[] = []
  rows.push('<div class="section">')
  rows.push('<h2>Summary</h2>')
  rows.push('<div class="stat-grid">')
  rows.push(`<div class="stat-card"><div class="value">${summary.totalFiles}</div><div class="label">Files</div></div>`)
  rows.push(`<div class="stat-card"><div class="value">${summary.totalLines.toLocaleString()}</div><div class="label">Lines</div></div>`)
  rows.push(`<div class="stat-card"><div class="value">${formatSizeKb(summary.totalSize)}</div><div class="label">Size</div></div>`)
  rows.push('</div>')

  if (summary.languages.length > 0) {
    rows.push('<h3 style="margin-top:16px">Language Breakdown</h3>')
    rows.push('<table><tr><th>Language</th><th>Files</th><th>Lines</th><th>Percentage</th></tr>')
    for (const lang of summary.languages) {
      rows.push(`<tr><td>${escapeHtml(lang.lang)}</td><td>${lang.files}</td><td>${lang.lines.toLocaleString()}</td><td>${lang.percentage.toFixed(1)}%</td></tr>`)
    }
    rows.push('</table>')
    rows.push(buildLanguageBarHtml(summary.languages))
  }

  rows.push('</div>')
  return rows.join('\n')
}

function buildLanguageBarHtml(languages: { lang: string; percentage: number }[]): string {
  if (languages.length === 0) return ''
  const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e']
  const segments: string[] = []
  const labels: string[] = []

  for (let i = 0; i < languages.length; i++) {
    const lang = languages[i]
    if (lang.percentage <= 0) continue
    const color = colors[i % colors.length]
    segments.push(`<div class="lang-bar-segment" style="width:${lang.percentage}%;background:${color}" title="${escapeHtml(lang.lang)}: ${lang.percentage.toFixed(1)}%"></div>`)
    labels.push(`<span style="color:${color}">■</span> ${escapeHtml(lang.lang)} ${lang.percentage.toFixed(1)}%`)
  }

  const bar = `<div class="lang-bar">${segments.join('')}</div>`
  const labelRow = `<div class="bar-label">${labels.join(' | ')}</div>`
  return bar + '\n' + labelRow
}

function buildComplexityHtml(report: FullReport): string {
  const c = report.complexity
  const rows: string[] = []
  rows.push('<div class="section">')
  rows.push('<h2>Complexity</h2>')
  rows.push('<div class="stat-grid">')
  rows.push(`<div class="stat-card"><div class="value">${c.totalFunctions}</div><div class="label">Functions</div></div>`)
  rows.push(`<div class="stat-card"><div class="value">${c.averageComplexity}</div><div class="label">Avg Complexity</div></div>`)
  rows.push(`<div class="stat-card"><div class="value ${c.highRiskCount > 0 ? 'severity-high' : 'severity-low'}">${c.highRiskCount}</div><div class="label">High Risk</div></div>`)
  rows.push('</div>')

  if (c.topComplexFiles.length > 0) {
    rows.push('<h3 style="margin-top:16px">Top Complex Files</h3>')
    rows.push('<table><tr><th>File</th><th>Avg Complexity</th></tr>')
    for (const entry of c.topComplexFiles) {
      const cls = entry.avgComplexity > 10 ? 'severity-high' : entry.avgComplexity > 5 ? 'severity-medium' : 'severity-low'
      rows.push(`<tr><td>${escapeHtml(entry.file)}</td><td class="${cls}">${entry.avgComplexity}</td></tr>`)
    }
    rows.push('</table>')
  }

  rows.push('</div>')
  return rows.join('\n')
}

function buildTodosHtml(report: FullReport): string {
  const t = report.todos
  const rows: string[] = []
  rows.push('<div class="section">')
  rows.push('<h2>Todos</h2>')
  rows.push('<div class="stat-grid">')
  rows.push(`<div class="stat-card"><div class="value">${t.totalTodos}</div><div class="label">TODOs</div></div>`)
  rows.push(`<div class="stat-card"><div class="value">${t.totalFixmes}</div><div class="label">FIXMEs</div></div>`)
  rows.push(`<div class="stat-card"><div class="value">${t.totalHacks}</div><div class="label">HACKs</div></div>`)
  rows.push('</div>')

  if (t.byFile.length > 0) {
    rows.push('<table style="margin-top:12px"><tr><th>File</th><th>Count</th></tr>')
    for (const entry of t.byFile.slice(0, 10)) {
      rows.push(`<tr><td>${escapeHtml(entry.file)}</td><td>${entry.count}</td></tr>`)
    }
    rows.push('</table>')
  }

  rows.push('</div>')
  return rows.join('\n')
}

function buildDependenciesHtml(report: FullReport): string {
  const d = report.dependencies
  const rows: string[] = []
  rows.push('<div class="section">')
  rows.push('<h2>Dependencies</h2>')

  if (d.totalDeps === 0 && d.totalDevDeps === 0) {
    rows.push('<p>No package.json found or no dependencies.</p>')
  } else {
    rows.push('<div class="stat-grid">')
    rows.push(`<div class="stat-card"><div class="value">${d.totalDeps}</div><div class="label">Dependencies</div></div>`)
    rows.push(`<div class="stat-card"><div class="value">${d.totalDevDeps}</div><div class="label">Dev Dependencies</div></div>`)
    rows.push('</div>')

    if (d.versionTypes.length > 0) {
      rows.push('<table style="margin-top:12px"><tr><th>Version Type</th><th>Count</th></tr>')
      for (const vt of d.versionTypes) {
        rows.push(`<tr><td>${escapeHtml(vt.type)}</td><td>${vt.count}</td></tr>`)
      }
      rows.push('</table>')
    }
  }

  rows.push('</div>')
  return rows.join('\n')
}

function buildSuggestionsHtml(report: FullReport): string {
  const s = report.suggestions
  const rows: string[] = []
  rows.push('<div class="section">')
  rows.push('<h2>Suggestions</h2>')

  if (s.total === 0) {
    rows.push('<p class="severity-low">No suggestions found. Code looks clean!</p>')
  } else {
    rows.push('<div class="stat-grid">')
    rows.push(`<div class="stat-card"><div class="value">${s.total}</div><div class="label">Total</div></div>`)
    rows.push(`<div class="stat-card"><div class="value ${s.highSeverity > 0 ? 'severity-high' : 'severity-low'}">${s.highSeverity}</div><div class="label">High Severity</div></div>`)
    rows.push('</div>')

    if (s.byCategory.length > 0) {
      rows.push('<h3 style="margin-top:16px">By Category</h3>')
      rows.push('<table><tr><th>Category</th><th>Count</th></tr>')
      for (const cat of s.byCategory) {
        rows.push(`<tr><td>${escapeHtml(cat.category)}</td><td>${cat.count}</td></tr>`)
      }
      rows.push('</table>')
    }

    if (s.topSuggestions.length > 0) {
      rows.push('<h3 style="margin-top:16px">Top Rules</h3>')
      rows.push('<table><tr><th>Rule</th><th>Count</th></tr>')
      for (const sug of s.topSuggestions) {
        rows.push(`<tr><td>${escapeHtml(sug.rule)}</td><td>${sug.count}</td></tr>`)
      }
      rows.push('</table>')
    }
  }

  rows.push('</div>')
  return rows.join('\n')
}

// ─── Language bar ───────────────────────────────────────

/**
 * Generates a text-based language breakdown bar.
 *
 * @param languages - Array of language data with percentages
 * @param width - Total character width of the bar (default 40)
 * @returns Formatted language bar string
 *
 * @example
 * formatLanguageBar([{ lang: 'TypeScript', percentage: 65, files: 10, lines: 100 }], 40)
 * // 'TypeScript 65.0% | ... '
 */
export function formatLanguageBar(
  languages: { lang: string; percentage: number }[],
  width: number = 40,
): string {
  if (languages.length === 0) return ''

  const labels = languages
    .filter((l) => l.percentage > 0)
    .map((l) => `${l.lang} ${l.percentage.toFixed(1)}%`)

  if (labels.length === 0) return ''

  const filledWidth = Math.min(width, 60)
  const segments: string[] = []
  for (const lang of languages) {
    if (lang.percentage <= 0) continue
    const segmentWidth = Math.round((lang.percentage / 100) * filledWidth)
    segments.push('█'.repeat(Math.max(1, segmentWidth)))
  }

  const bar = `[${segments.join('')}]`
  return `${bar} ${labels.join(' | ')}`
}

// ─── Utility ────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatSizeKb(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}
