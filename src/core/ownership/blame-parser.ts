import type { BlameLine } from './types.js'
import { isBlank } from '../../utils/string-helpers.js'

export class BlameParser {
  parseBlameOutput(output: string): BlameLine[] {
    if (isBlank(output)) {
      return []
    }

    const lines = output.split('\n')
    const result: BlameLine[] = []
    let currentCommit = ''
    let currentAuthor = ''
    let currentMail = ''
    let currentTimestamp = 0
    let lineNumber = 0

    for (const line of lines) {
      if (line.startsWith('\t')) {
        lineNumber++
        result.push({
          lineNumber,
          commit: currentCommit,
          author: currentAuthor,
          authorMail: currentMail,
          timestamp: currentTimestamp,
          content: line.slice(1),
        })
        continue
      }

      const commitMatch = line.match(/^([0-9a-f]{40})\s/)
      if (commitMatch) {
        currentCommit = this.parseCommitLine(line)
        continue
      }

      if (line.startsWith('author ')) {
        const parsed = this.parseAuthorLine(line)
        currentAuthor = parsed.author
        continue
      }

      if (line.startsWith('author-mail ')) {
        const mailMatch = line.match(/^author-mail <(.+)>$/)
        if (mailMatch) {
          currentMail = mailMatch[1]!
        }
        continue
      }

      if (line.startsWith('author-time ')) {
        currentTimestamp = this.parseTimestampLine(line)
        continue
      }
    }

    return result
  }

  parseAuthorLine(line: string): { author: string; email: string } {
    const authorMatch = line.match(/^author (.+)$/)
    const author = authorMatch?.[1] ?? ''
    return { author, email: '' }
  }

  parseTimestampLine(line: string): number {
    const match = line.match(/^author-time (\d+)$/)
    if (match?.[1]) {
      return parseInt(match[1], 10) * 1000
    }
    return 0
  }

  parseCommitLine(line: string): string {
    const match = line.match(/^([0-9a-f]{40})/)
    return match?.[1] ?? ''
  }

  createMockBlameOutput(
    entries: Array<{ author: string; email: string; lines: string[] }>,
  ): string {
    const parts: string[] = []
    let commitCounter = 1

    for (const entry of entries) {
      const commitHash = commitCounter.toString(16).padStart(40, 'a')

      for (const line of entry.lines) {
        parts.push(`${commitHash} 1 1`)
        parts.push(`author ${entry.author}`)
        parts.push(`author-mail <${entry.email}>`)
        parts.push('author-time 1700000000')
        parts.push('author-tz +0000')
        parts.push('summary mock commit')
        parts.push('filename mock.ts')
        parts.push(`\t${line}`)
      }

      commitCounter++
    }

    return parts.join('\n')
  }
}
