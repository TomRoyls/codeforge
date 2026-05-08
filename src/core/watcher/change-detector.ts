import type { FileChangeEvent, FileState } from './types.js'

export class ChangeDetector {
  detectChange(filePath: string, currentState: FileState | null, newContent: string): FileChangeEvent | null {
    const newHash = this.computeHash(newContent)
    const now = Date.now()

    if (currentState === null) {
      return {
        type: 'add',
        filePath,
        timestamp: now,
        content: newContent,
      }
    }

    if (!currentState.exists) {
      return {
        type: 'add',
        filePath,
        timestamp: now,
        content: newContent,
      }
    }

    if (currentState.hash === newHash) {
      return null
    }

    return {
      type: 'change',
      filePath,
      timestamp: now,
      content: newContent,
      oldContent: currentState.hash,
    }
  }

  computeHash(content: string): string {
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash + char) | 0
    }
    return hash.toString(16)
  }

  getFileState(filePath: string, content: string): FileState {
    return {
      filePath,
      hash: this.computeHash(content),
      lastModified: Date.now(),
      size: content.length,
      exists: true,
    }
  }

  batchDetect(files: Map<string, string>, previousStates: Map<string, FileState>): FileChangeEvent[] {
    const events: FileChangeEvent[] = []
    const now = Date.now()

    for (const [filePath, content] of files) {
      const previous = previousStates.get(filePath)
      const change = this.detectChange(filePath, previous ?? null, content)
      if (change) {
        events.push(change)
      }
    }

    for (const [filePath, state] of previousStates) {
      if (!files.has(filePath) && state.exists) {
        events.push({
          type: 'unlink',
          filePath,
          timestamp: now,
        })
      }
    }

    return events
  }

  classifyChange(event: FileChangeEvent): 'major' | 'minor' | 'trivial' {
    if (event.type === 'add' || event.type === 'unlink') {
      return 'major'
    }

    if (event.type === 'addDir' || event.type === 'unlinkDir') {
      return 'major'
    }

    if (event.type === 'change') {
      if (event.content !== undefined && event.oldContent !== undefined) {
        return 'minor'
      }
      return 'minor'
    }

    return 'trivial'
  }
}
