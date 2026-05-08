import type { ReviewResult, ReviewComment, GitHubComment } from './types.js'

const SEVERITY_ICONS: Record<string, string> = {
  blocker: '🚫',
  critical: '🔴',
  major: '🟠',
  minor: '🟡',
  info: '🔵',
}

export class ReviewFormatter {
  formatConsole(result: ReviewResult): string {
    const lines: string[] = []
    const { summary } = result

    lines.push('═'.repeat(60))
    lines.push('  CODE REVIEW RESULTS')
    lines.push('═'.repeat(60))
    lines.push('')
    lines.push(`  Score: ${result.score}/100 ${result.approved ? '✅ APPROVED' : '❌ NOT APPROVED'}`)
    lines.push('')
    lines.push(`  Files reviewed: ${summary.filesReviewed}`)
    lines.push(`  Files with issues: ${summary.filesWithIssues}`)
    lines.push(`  Total comments: ${summary.totalComments}`)
    lines.push('')

    if (summary.totalComments > 0) {
      lines.push('  Issues by severity:')
      if (summary.blockerCount > 0) lines.push(`    🚫 Blocker: ${summary.blockerCount}`)
      if (summary.criticalCount > 0) lines.push(`    🔴 Critical: ${summary.criticalCount}`)
      if (summary.majorCount > 0) lines.push(`    🟠 Major: ${summary.majorCount}`)
      if (summary.minorCount > 0) lines.push(`    🟡 Minor: ${summary.minorCount}`)
      if (summary.infoCount > 0) lines.push(`    🔵 Info: ${summary.infoCount}`)
      lines.push('')

      if (Object.keys(summary.categories).length > 0) {
        lines.push('  Issues by category:')
        for (const [category, count] of Object.entries(summary.categories)) {
          lines.push(`    ${category}: ${count}`)
        }
        lines.push('')
      }

      lines.push('  ─'.repeat(56))
      lines.push('')

      for (const comment of result.comments) {
        const icon = SEVERITY_ICONS[comment.severity] ?? '•'
        lines.push(`  ${icon} [${comment.severity.toUpperCase()}] ${comment.filePath}:${comment.line}`)
        lines.push(`    ${comment.message}`)
        if (comment.suggestion) {
          lines.push(`    💡 ${comment.suggestion}`)
        }
        if (comment.ruleId) {
          lines.push(`    Rule: ${comment.ruleId}`)
        }
        lines.push('')
      }
    } else {
      lines.push('  ✅ No issues found!')
    }

    lines.push('═'.repeat(60))
    return lines.join('\n')
  }

  formatMarkdown(result: ReviewResult): string {
    const lines: string[] = []
    const { summary } = result

    lines.push('## Code Review Results')
    lines.push('')
    lines.push(`**Score:** ${result.score}/100 ${result.approved ? '✅ **APPROVED**' : '❌ **NOT APPROVED**'}`)
    lines.push('')

    lines.push('### Summary')
    lines.push('')
    lines.push('| Metric | Value |')
    lines.push('|--------|-------|')
    lines.push(`| Files reviewed | ${summary.filesReviewed} |`)
    lines.push(`| Files with issues | ${summary.filesWithIssues} |`)
    lines.push(`| Total comments | ${summary.totalComments} |`)
    lines.push(`| Blocker | ${summary.blockerCount} |`)
    lines.push(`| Critical | ${summary.criticalCount} |`)
    lines.push(`| Major | ${summary.majorCount} |`)
    lines.push(`| Minor | ${summary.minorCount} |`)
    lines.push(`| Info | ${summary.infoCount} |`)
    lines.push('')

    if (summary.totalComments > 0) {
      lines.push('### Issues')
      lines.push('')

      lines.push('| Severity | File | Line | Message | Rule |')
      lines.push('|----------|------|------|---------|------|')

      for (const comment of result.comments) {
        const severity = comment.severity.toUpperCase()
        lines.push(`| ${severity} | \`${comment.filePath}\` | ${comment.line} | ${comment.message} | ${comment.ruleId ?? '-'} |`)
      }

      lines.push('')

      if (Object.keys(summary.categories).length > 0) {
        lines.push('### Categories')
        lines.push('')
        lines.push('| Category | Count |')
        lines.push('|----------|-------|')
        for (const [category, count] of Object.entries(summary.categories)) {
          lines.push(`| ${category} | ${count} |`)
        }
        lines.push('')
      }
    }

    return lines.join('\n')
  }

  formatJSON(result: ReviewResult): string {
    return JSON.stringify(result, null, 2)
  }

  formatGitHubComments(result: ReviewResult): GitHubComment[] {
    return result.comments.map((comment, index) => ({
      path: comment.filePath,
      position: index + 1,
      body: this.formatCommentBody(comment),
      side: comment.side,
      line: comment.line,
    }))
  }

  formatSummary(result: ReviewResult): string {
    const status = result.approved ? 'APPROVED' : 'NOT APPROVED'
    return `Review: ${result.score}/100 - ${status} (${result.summary.totalComments} issues: ${result.summary.blockerCount} blockers, ${result.summary.criticalCount} critical, ${result.summary.majorCount} major, ${result.summary.minorCount} minor, ${result.summary.infoCount} info)`
  }

  formatDiffWithComments(diff: string, comments: ReviewComment[]): string {
    const lines = diff.split('\n')
    const commentMap = new Map<number, ReviewComment[]>()

    for (const comment of comments) {
      const existing = commentMap.get(comment.line) ?? []
      existing.push(comment)
      commentMap.set(comment.line, existing)
    }

    const output: string[] = []
    let currentLine = 0

    for (const line of lines) {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        currentLine++
      }
      output.push(line)

      if (currentLine > 0) {
        const lineComments = commentMap.get(currentLine)
        if (lineComments) {
          for (const comment of lineComments) {
            const icon = SEVERITY_ICONS[comment.severity] ?? '•'
            output.push(`  ${icon} REVIEW [${comment.severity.toUpperCase()}]: ${comment.message}`)
            if (comment.suggestion) {
              output.push(`    SUGGESTION: ${comment.suggestion}`)
            }
          }
        }
      }
    }

    return output.join('\n')
  }

  private formatCommentBody(comment: ReviewComment): string {
    const lines: string[] = []
    const icon = SEVERITY_ICONS[comment.severity] ?? '•'

    lines.push(`${icon} **${comment.severity.toUpperCase()}**`)
    lines.push('')
    lines.push(comment.message)
    if (comment.suggestion) {
      lines.push('')
      lines.push(`💡 **Suggestion:** ${comment.suggestion}`)
    }
    if (comment.ruleId) {
      lines.push('')
      lines.push(`*Rule: ${comment.ruleId}*`)
    }

    return lines.join('\n')
  }
}
