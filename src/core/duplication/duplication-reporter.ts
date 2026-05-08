import type { CloneGroup, DuplicationReport } from './types.js'
import { DuplicationType } from './types.js'

export class DuplicationReporter {
  formatConsole(report: DuplicationReport): string {
    const lines: string[] = []
    const sep = '─'.repeat(72)

    lines.push('')
    lines.push('  ╔════════════════════════════════════════════════════════════════════╗')
    lines.push('  ║                    CODE DUPLICATION REPORT                        ║')
    lines.push('  ╚════════════════════════════════════════════════════════════════════╝')
    lines.push('')
    lines.push(`  Total Duplicates:      ${report.totalDuplicates}`)
    lines.push(`  Duplicated Lines:      ${report.totalDuplicatedLines}`)
    lines.push(`  Duplication %:         ${report.duplicationPercentage.toFixed(2)}%`)
    lines.push(`  Clone Groups:          ${report.cloneGroups.length}`)
    lines.push(`  Files Analyzed:        ${report.summary.filesAnalyzed}`)
    lines.push(`  Files With Duplicates: ${report.summary.filesWithDuplicates}`)
    lines.push(`  Avg Clone Size:        ${report.summary.avgCloneSize} lines`)
    lines.push(`  Largest Clone:         ${report.summary.largestClone} lines`)
    lines.push('')

    if (report.summary.duplicateHotspots.length > 0) {
      lines.push(`  ${sep}`)
      lines.push('  DUPLICATE HOTSPOTS')
      lines.push(`  ${sep}`)
      for (const hotspot of report.summary.duplicateHotspots) {
        lines.push(`    • ${hotspot}`)
      }
      lines.push('')
    }

    for (const group of report.cloneGroups) {
      lines.push(`  ${sep}`)
      lines.push(`  Clone Group: ${group.id} (${group.type})`)
      lines.push(`  Similarity: ${(group.similarity * 100).toFixed(1)}%`)
      lines.push(`  ${sep}`)
      lines.push(this.formatCloneGroup(group))
      lines.push('')
    }

    return lines.join('\n')
  }

  formatJSON(report: DuplicationReport): string {
    return JSON.stringify(report, null, 2)
  }

  formatMarkdown(report: DuplicationReport): string {
    const lines: string[] = []

    lines.push('# Code Duplication Report')
    lines.push('')
    lines.push('## Summary')
    lines.push('')
    lines.push(`| Metric | Value |`)
    lines.push(`|--------|-------|`)
    lines.push(`| Total Duplicates | ${report.totalDuplicates} |`)
    lines.push(`| Duplicated Lines | ${report.totalDuplicatedLines} |`)
    lines.push(`| Duplication % | ${report.duplicationPercentage.toFixed(2)}% |`)
    lines.push(`| Clone Groups | ${report.cloneGroups.length} |`)
    lines.push(`| Files Analyzed | ${report.summary.filesAnalyzed} |`)
    lines.push(`| Files With Duplicates | ${report.summary.filesWithDuplicates} |`)
    lines.push(`| Avg Clone Size | ${report.summary.avgCloneSize} lines |`)
    lines.push(`| Largest Clone | ${report.summary.largestClone} lines |`)
    lines.push('')

    if (report.summary.duplicateHotspots.length > 0) {
      lines.push('## Duplicate Hotspots')
      lines.push('')
      for (const hotspot of report.summary.duplicateHotspots) {
        lines.push(`- \`${hotspot}\``)
      }
      lines.push('')
    }

    for (const group of report.cloneGroups) {
      lines.push(`## Clone Group: ${group.id}`)
      lines.push('')
      lines.push(`- **Type**: ${group.type}`)
      lines.push(`- **Similarity**: ${(group.similarity * 100).toFixed(1)}%`)
      lines.push(`- **Fingerprint**: \`${group.fingerprint.slice(0, 16)}...\``)
      lines.push('')

      for (const clone of group.clones) {
        lines.push(`### ${clone.filePath}:${clone.startLine}-${clone.endLine}`)
        lines.push('')
        lines.push('```' + this.getLangExtension(clone.filePath))
        lines.push(clone.content)
        lines.push('```')
        lines.push('')
      }
    }

    return lines.join('\n')
  }

  formatSummary(report: DuplicationReport): string {
    return [
      `${report.totalDuplicates} duplicates`,
      `${report.totalDuplicatedLines} duplicated lines`,
      `${report.duplicationPercentage.toFixed(2)}% duplication`,
      `${report.cloneGroups.length} clone groups`,
      `${report.summary.filesWithDuplicates}/${report.summary.filesAnalyzed} files affected`,
    ].join(' | ')
  }

  generateHTML(report: DuplicationReport): string {
    const groupSections = report.cloneGroups.map(group => {
      const typeLabel = this.getTypeLabel(group.type)
      const cloneEntries = group.clones.map(clone => {
        const escapedContent = this.escapeHTML(clone.content)
        return `<div class="clone-instance">
          <h4>${this.escapeHTML(clone.filePath)}:${clone.startLine}-${clone.endLine}</h4>
          <pre><code>${escapedContent}</code></pre>
        </div>`
      }).join('\n')

      return `<div class="clone-group" data-type="${group.type}">
        <h3>Clone Group: ${this.escapeHTML(group.id)}</h3>
        <p>Type: <span class="type-label">${typeLabel}</span> | Similarity: ${(group.similarity * 100).toFixed(1)}%</p>
        ${cloneEntries}
      </div>`
    }).join('\n')

    const hotspotItems = report.summary.duplicateHotspots
      .map(h => `<li>${this.escapeHTML(h)}</li>`)
      .join('\n')

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Duplication Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
    h1 { color: #333; border-bottom: 2px solid #e74c3c; padding-bottom: 10px; }
    .summary { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .summary table { width: 100%; border-collapse: collapse; }
    .summary td { padding: 8px 12px; border-bottom: 1px solid #eee; }
    .summary td:first-child { font-weight: 600; color: #555; }
    .clone-group { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #e74c3c; }
    .clone-group[data-type="structural"] { border-left-color: #f39c12; }
    .clone-group[data-type="semantic"] { border-left-color: #3498db; }
    .type-label { font-weight: 600; text-transform: uppercase; font-size: 0.85em; }
    .clone-instance { margin: 10px 0; }
    .clone-instance h4 { color: #666; margin: 5px 0; }
    pre { background: #2d2d2d; color: #f8f8f2; padding: 15px; border-radius: 4px; overflow-x: auto; }
    .hotspots { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .hotspots ul { list-style: none; padding: 0; }
    .hotspots li { padding: 5px 0; font-family: monospace; }
  </style>
</head>
<body>
  <h1>Code Duplication Report</h1>
  <div class="summary">
    <table>
      <tr><td>Total Duplicates</td><td>${report.totalDuplicates}</td></tr>
      <tr><td>Duplicated Lines</td><td>${report.totalDuplicatedLines}</td></tr>
      <tr><td>Duplication %</td><td>${report.duplicationPercentage.toFixed(2)}%</td></tr>
      <tr><td>Clone Groups</td><td>${report.cloneGroups.length}</td></tr>
      <tr><td>Files Analyzed</td><td>${report.summary.filesAnalyzed}</td></tr>
      <tr><td>Files With Duplicates</td><td>${report.summary.filesWithDuplicates}</td></tr>
    </table>
  </div>
  ${hotspotItems ? `<div class="hotspots"><h2>Duplicate Hotspots</h2><ul>${hotspotItems}</ul></div>` : ''}
  ${groupSections}
</body>
</html>`
  }

  formatCloneGroup(group: CloneGroup): string {
    const lines: string[] = []
    for (const clone of group.clones) {
      lines.push(`    ${clone.filePath}:${clone.startLine}-${clone.endLine} (${clone.endLine - clone.startLine + 1} lines)`)
    }
    return lines.join('\n')
  }

  calculateDuplicationHotspots(groups: CloneGroup[]): string[] {
    const counts = new Map<string, number>()
    for (const group of groups) {
      const filesInGroup = new Set(group.clones.map(c => c.filePath))
      for (const f of filesInGroup) {
        counts.set(f, (counts.get(f) ?? 0) + 1)
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([f]) => f)
  }

  private getTypeLabel(type: DuplicationType): string {
    switch (type) {
      case DuplicationType.EXACT: return 'Exact'
      case DuplicationType.STRUCTURAL: return 'Structural'
      case DuplicationType.SEMANTIC: return 'Semantic'
    }
  }

  private getLangExtension(filePath: string): string {
    if (filePath.endsWith('.tsx')) return 'tsx'
    if (filePath.endsWith('.jsx')) return 'jsx'
    if (filePath.endsWith('.ts')) return 'typescript'
    if (filePath.endsWith('.js')) return 'javascript'
    return ''
  }

  private escapeHTML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }
}
