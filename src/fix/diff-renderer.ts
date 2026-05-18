import chalk from 'chalk'

import type { TextChange } from './types.js'
import { sortedBy } from '../utils/array-helpers.js'

export interface DiffLine {
  content: string
  type: 'add' | 'context' | 'remove'
}

export interface FileDiff {
  filePath: string
  hunks: DiffHunk[]
}

export interface DiffHunk {
  changes: DiffLine[]
  header: string
}

export function renderTextChangesAsDiff(changes: TextChange[], filePath: string): FileDiff {
  if (changes.length === 0) {
    return { filePath, hunks: [] }
  }

  const sorted = sortedBy(changes, c => c.start)
  const hunks: DiffHunk[] = []

  for (const change of sorted) {
    const beforeLines = change.oldText.split('\n')
    const afterLines = change.newText.split('\n')

    const diffLines: DiffLine[] = []

    for (const line of beforeLines) {
      diffLines.push({ content: line, type: 'remove' })
    }

    for (const line of afterLines) {
      diffLines.push({ content: line, type: 'add' })
    }

    hunks.push({
      changes: diffLines,
      header: `@@ -${change.start},+${change.end} @@`,
    })
  }

  return { filePath, hunks }
}

export function formatDiffForConsole(diff: FileDiff): string {
  if (diff.hunks.length === 0) {
    return ''
  }

  const parts: string[] = []
  parts.push(
    '',
    chalk.cyan(`--- ${diff.filePath}`),
    chalk.cyan(`+++ ${diff.filePath} (fix preview)`),
  )

  for (const hunk of diff.hunks) {
    parts.push(chalk.dim(hunk.header))

    for (const change of hunk.changes) {
      switch (change.type) {
        case 'add': {
          parts.push(chalk.green(`+ ${change.content}`))
          break
        }

        case 'context': {
          parts.push(chalk.dim(`  ${change.content}`))
          break
        }

        case 'remove': {
          parts.push(chalk.red(`- ${change.content}`))
          break
        }
      }
    }
  }

  return parts.join('\n')
}
