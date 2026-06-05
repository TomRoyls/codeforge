export interface TodoComment {
  type: string
  text: string
  file: string
  line: number
  author?: string
  priority: 'high' | 'medium' | 'low'
}

export interface TodoResult {
  comments: TodoComment[]
  summary: {
    total: number
    byType: Record<string, number>
    byFile: Record<string, number>
    byPriority: Record<string, number>
  }
}

export function getPriorityForType(type: string): 'high' | 'medium' | 'low' {
  switch (type) {
    case 'BUG': {
      return 'high'
    }
    case 'FIXME':
    case 'HACK':
    case 'XXX': {
      return 'medium'
    }
    default: {
      return 'low'
    }
  }
}

export function scanFileForTodos(
  content: string,
  filePath: string,
  types: string[],
  extractAuthor: boolean,
): TodoComment[] {
  const comments: TodoComment[] = []
  const lines = content.split('\n')

  const typePattern = types.join('|')
  const regex = new RegExp(
    `(?:\/\/|\/\\*|\\*)\\s*\\b(${typePattern})\\b(?:\\(([^)]+)\\))?:?\\s*(.*)`,
    'i',
  )

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const match = regex.exec(line ?? '')
    if (match) {
      const matchedType = (match[1] ?? '').toUpperCase()
      const matchedAuthor = match[2] ?? undefined
      const matchedText = match[3]?.trim() ?? ''

      const comment: TodoComment = {
        file: filePath,
        line: i + 1,
        priority: getPriorityForType(matchedType),
        text: matchedText,
        type: matchedType,
      }

      if (extractAuthor && matchedAuthor) {
        comment.author = matchedAuthor
      }

      comments.push(comment)
    }
  }

  return comments
}

export function aggregateTodos(comments: TodoComment[]): TodoResult {
  const byType: Record<string, number> = {}
  const byFile: Record<string, number> = {}
  const byPriority: Record<string, number> = { high: 0, low: 0, medium: 0 }

  for (const comment of comments) {
    byType[comment.type] = (byType[comment.type] ?? 0) + 1
    byFile[comment.file] = (byFile[comment.file] ?? 0) + 1
    byPriority[comment.priority] = (byPriority[comment.priority] ?? 0) + 1
  }

  return {
    comments,
    summary: {
      byFile,
      byPriority,
      byType,
      total: comments.length,
    },
  }
}

export function sortTodos(result: TodoResult, sortBy: string): TodoResult {
  const sorted = result.comments.slice().sort((a, b) => {
    switch (sortBy) {
      case 'severity': {
        const order = { high: 0, medium: 1, low: 2 }
        return order[a.priority] - order[b.priority]
      }
      case 'type': {
        return a.type.localeCompare(b.type)
      }
      default: {
        return a.file.localeCompare(b.file) || a.line - b.line
      }
    }
  })

  return { ...result, comments: sorted }
}
