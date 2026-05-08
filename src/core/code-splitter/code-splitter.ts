import { ChunkStrategy } from './chunk-strategy.js'
import { DEFAULT_SPLIT_OPTIONS } from './types.js'
import type { CodeChunk, SplitOptions, SplitResult, ChunkType } from './types.js'

let chunkCounter = 0

function generateChunkId(): string {
  chunkCounter++
  return `chunk_${chunkCounter.toString(36).padStart(6, '0')}_${Date.now().toString(36)}`
}

export function resetChunkCounter(): void {
  chunkCounter = 0
}

export class CodeSplitter {
  private options: SplitOptions
  private strategy: ChunkStrategy
  private chunkMap: Map<string, CodeChunk>

  constructor(options?: Partial<SplitOptions>) {
    this.options = { ...DEFAULT_SPLIT_OPTIONS, ...options }
    this.strategy = new ChunkStrategy()
    this.chunkMap = new Map()
  }

  split(source: string, options?: Partial<SplitOptions>): SplitResult {
    const mergedOptions: SplitOptions = { ...this.options, ...options }
    const lines = source.split('\n')
    let chunks: CodeChunk[]

    switch (mergedOptions.granularity) {
      case 'line':
        chunks = this.splitByLines(source, mergedOptions.maxChunkSize)
        break
      case 'statement':
        chunks = this.splitByStatements(source)
        break
      case 'function':
        chunks = this.splitByFunctions(source)
        break
      case 'class':
        chunks = this.splitByClasses(source)
        break
      case 'module':
        chunks = this.splitByModules(source)
        break
      case 'paragraph':
        chunks = this.splitByParagraphs(source)
        break
      default:
        chunks = this.splitByFunctions(source)
    }

    if (mergedOptions.overlapLines > 0) {
      chunks = this.applyOverlap(chunks, source, mergedOptions.overlapLines)
    }

    if (mergedOptions.maxChunkSize > 0) {
      chunks = this.enforceMaxSize(chunks, mergedOptions.maxChunkSize)
    }

    if (mergedOptions.minChunkSize > 1) {
      chunks = this.mergeSmallChunks(chunks, mergedOptions.minChunkSize)
    }

    for (const chunk of chunks) {
      chunk.language = mergedOptions.language
      this.chunkMap.set(chunk.id, chunk)
    }

    const totalChunkLines = chunks.reduce((sum, c) => sum + (c.endLine - c.startLine + 1), 0)
    const avgChunkSize = chunks.length > 0 ? totalChunkLines / chunks.length : 0

    return {
      chunks,
      totalLines: lines.length,
      totalChunks: chunks.length,
      avgChunkSize: Math.round(avgChunkSize * 100) / 100,
      language: mergedOptions.language,
      source,
    }
  }

  splitByLines(source: string, chunkSize: number): CodeChunk[] {
    const lines = source.split('\n')
    const chunks: CodeChunk[] = []

    for (let i = 0; i < lines.length; i += chunkSize) {
      const slice = lines.slice(i, Math.min(i + chunkSize, lines.length))
      const content = slice.join('\n')
      const startLine = i + 1
      const endLine = i + slice.length

      const startChar = source.split('\n').slice(0, i).join('\n').length + (i > 0 ? 1 : 0)
      const endChar = startChar + content.length

      const chunk = this.createChunk({
        type: 'block',
        content,
        startLine,
        endLine,
        startChar,
        endChar,
        language: this.options.language,
      })

      chunks.push(chunk)
    }

    return chunks
  }

  splitByFunctions(source: string): CodeChunk[] {
    const chunks: CodeChunk[] = []
    const lines = source.split('\n')

    const functionRegex = /^(\s*)(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*[^{]*\{/gm
    const arrowRegex = /^(\s*)(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>\s*(?:\{|[^;\n]*[;\n])/gm

    const boundaries: Array<{ start: number; name: string }> = []

    let match: RegExpExecArray | null
    functionRegex.lastIndex = 0
    while ((match = functionRegex.exec(source)) !== null) {
      const lineNum = source.substring(0, match.index).split('\n').length
      boundaries.push({ start: lineNum, name: match[2]! })
    }

    arrowRegex.lastIndex = 0
    while ((match = arrowRegex.exec(source)) !== null) {
      const lineNum = source.substring(0, match.index).split('\n').length
      boundaries.push({ start: lineNum, name: match[2]! })
    }

    boundaries.sort((a, b) => a.start - b.start)

    if (boundaries.length === 0) {
      return [this.createChunk({
        type: 'module',
        content: source,
        startLine: 1,
        endLine: lines.length,
        startChar: 0,
        endChar: source.length,
        language: this.options.language,
      })]
    }

    const leadingLines = boundaries[0]!.start - 1
    if (leadingLines > 0) {
      const leadingContent = lines.slice(0, leadingLines).join('\n')
      chunks.push(this.createChunk({
        type: this.detectLeadingChunkType(leadingContent),
        content: leadingContent,
        startLine: 1,
        endLine: leadingLines,
        startChar: 0,
        endChar: leadingContent.length,
        language: this.options.language,
      }))
    }

    for (let i = 0; i < boundaries.length; i++) {
      const startIdx = boundaries[i]!.start - 1
      const endIdx = i + 1 < boundaries.length ? boundaries[i + 1]!.start - 1 : lines.length
      const content = lines.slice(startIdx, endIdx).join('\n')

      chunks.push(this.createChunk({
        type: 'function',
        content,
        startLine: boundaries[i]!.start,
        endLine: endIdx,
        startChar: lines.slice(0, startIdx).join('\n').length + (startIdx > 0 ? 1 : 0),
        endChar: lines.slice(0, endIdx).join('\n').length,
        name: boundaries[i]!.name,
        language: this.options.language,
      }))
    }

    return chunks
  }

  splitByClasses(source: string): CodeChunk[] {
    const chunks: CodeChunk[] = []
    const lines = source.split('\n')

    const classRegex = /^(\s*)(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/gm
    const boundaries: Array<{ start: number; name: string }> = []

    let match: RegExpExecArray | null
    while ((match = classRegex.exec(source)) !== null) {
      const lineNum = source.substring(0, match.index).split('\n').length
      boundaries.push({ start: lineNum, name: match[2]! })
    }

    boundaries.sort((a, b) => a.start - b.start)

    if (boundaries.length === 0) {
      return [this.createChunk({
        type: 'module',
        content: source,
        startLine: 1,
        endLine: lines.length,
        startChar: 0,
        endChar: source.length,
        language: this.options.language,
      })]
    }

    const leadingLines = boundaries[0]!.start - 1
    if (leadingLines > 0) {
      const leadingContent = lines.slice(0, leadingLines).join('\n')
      chunks.push(this.createChunk({
        type: this.detectLeadingChunkType(leadingContent),
        content: leadingContent,
        startLine: 1,
        endLine: leadingLines,
        startChar: 0,
        endChar: leadingContent.length,
        language: this.options.language,
      }))
    }

    for (let i = 0; i < boundaries.length; i++) {
      const startIdx = boundaries[i]!.start - 1
      const endIdx = i + 1 < boundaries.length ? boundaries[i + 1]!.start - 1 : lines.length
      const content = lines.slice(startIdx, endIdx).join('\n')

      chunks.push(this.createChunk({
        type: 'class',
        content,
        startLine: boundaries[i]!.start,
        endLine: endIdx,
        startChar: lines.slice(0, startIdx).join('\n').length + (startIdx > 0 ? 1 : 0),
        endChar: lines.slice(0, endIdx).join('\n').length,
        name: boundaries[i]!.name,
        language: this.options.language,
      }))
    }

    return chunks
  }

  splitByModules(source: string): CodeChunk[] {
    const lines = source.split('\n')
    return [this.createChunk({
      type: 'module',
      content: source,
      startLine: 1,
      endLine: lines.length,
      startChar: 0,
      endChar: source.length,
      language: this.options.language,
    })]
  }

  splitByStatements(source: string): CodeChunk[] {
    const chunks: CodeChunk[] = []
    const lines = source.split('\n')
    let currentStatement: string[] = []
    let startLine = 1
    let braceDepth = 0
    let charOffset = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      const trimmed = line.trim()

      if (trimmed.length === 0) {
        if (currentStatement.length > 0) {
          chunks.push(this.buildStatementChunk(currentStatement, startLine, i, charOffset, lines))
          currentStatement = []
          startLine = i + 2
          charOffset = lines.slice(0, i + 1).join('\n').length + 1
        }
        continue
      }

      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        if (currentStatement.length > 0) {
          chunks.push(this.buildStatementChunk(currentStatement, startLine, i, charOffset, lines))
          currentStatement = []
          startLine = i + 2
          charOffset = lines.slice(0, i + 1).join('\n').length + 1
        }
        continue
      }

      if (currentStatement.length === 0) {
        startLine = i + 1
        charOffset = lines.slice(0, i).join('\n').length + (i > 0 ? 1 : 0)
      }

      currentStatement.push(line)

      for (const ch of line) {
        if (ch === '{') braceDepth++
        else if (ch === '}') braceDepth--
      }

      if (braceDepth <= 0 && (trimmed.endsWith(';') || trimmed.endsWith('}') || trimmed.endsWith(':'))) {
        chunks.push(this.buildStatementChunk(currentStatement, startLine, i + 1, charOffset, lines))
        currentStatement = []
        startLine = i + 2
        charOffset = lines.slice(0, i + 1).join('\n').length + 1
        braceDepth = 0
      }
    }

    if (currentStatement.length > 0) {
      chunks.push(this.buildStatementChunk(currentStatement, startLine, lines.length, charOffset, lines))
    }

    return chunks
  }

  splitByParagraphs(source: string): CodeChunk[] {
    const chunks: CodeChunk[] = []
    const paragraphs = source.split(/\n\s*\n/)
    let currentLine = 1
    let currentChar = 0

    for (const para of paragraphs) {
      const trimmed = para.trim()
      if (trimmed.length === 0) {
        const newlineCount = para.split('\n').length
        currentLine += newlineCount
        currentChar += para.length + 2
        continue
      }

      const paraLines = trimmed.split('\n')
      const startLine = currentLine
      const endLine = currentLine + paraLines.length - 1
      const startChar = currentChar
      const endChar = currentChar + trimmed.length

      chunks.push(this.createChunk({
        type: 'block',
        content: trimmed,
        startLine,
        endLine,
        startChar,
        endChar,
        language: this.options.language,
      }))

      currentLine = endLine + 2
      currentChar = endChar + 2
    }

    return chunks
  }

  getChunk(_source: string, chunkId: string): CodeChunk | null {
    return this.chunkMap.get(chunkId) ?? null
  }

  reconstruct(chunks: CodeChunk[]): string {
    const sorted = [...chunks].sort((a, b) => a.startLine - b.startLine)
    const lines: string[] = []
    let lastLine = 0

    for (const chunk of sorted) {
      const chunkLines = chunk.content.split('\n')
      const gap = chunk.startLine - lastLine - 1
      for (let i = 0; i < gap; i++) {
        lines.push('')
      }
      lines.push(...chunkLines)
      lastLine = chunk.endLine
    }

    return lines.join('\n')
  }

  merge(chunks: CodeChunk[], maxChunkSize: number): CodeChunk[] {
    if (chunks.length === 0) return []

    const result: CodeChunk[] = []
    let current = { ...chunks[0]!, children: [...chunks[0]!.children] }

    for (let i = 1; i < chunks.length; i++) {
      const next = chunks[i]!
      const mergedLines = next.endLine - current.startLine + 1

      if (mergedLines <= maxChunkSize) {
        current.content = current.content + '\n' + next.content
        current.endLine = next.endLine
        current.endChar = next.endChar
        current.children = [...current.children, ...next.children]
      } else {
        result.push(current)
        current = { ...next, children: [...next.children] }
      }
    }

    result.push(current)
    return result
  }

  getOptions(): SplitOptions {
    return { ...this.options }
  }

  private createChunk(params: {
    type: ChunkType
    content: string
    startLine: number
    endLine: number
    startChar: number
    endChar: number
    name?: string
    parentId?: string
    language: string
  }): CodeChunk {
    return {
      id: generateChunkId(),
      type: params.type,
      content: params.content,
      startLine: params.startLine,
      endLine: params.endLine,
      startChar: params.startChar,
      endChar: params.endChar,
      name: params.name,
      parentId: params.parentId,
      children: [],
      metadata: {},
      language: params.language,
      hash: this.strategy.calculateHash(params.content),
    }
  }

  private buildStatementChunk(
    statementLines: string[],
    startLine: number,
    endLine: number,
    startChar: number,
    _allLines: string[],
  ): CodeChunk {
    const content = statementLines.join('\n')
    const endChar = startChar + content.length
    const type = this.detectStatementType(content)

    return this.createChunk({
      type,
      content,
      startLine,
      endLine,
      startChar,
      endChar,
      language: this.options.language,
    })
  }

  private detectStatementType(content: string): ChunkType {
    const trimmed = content.trim()
    if (/^import\s/.test(trimmed)) return 'import'
    if (/^export\s/.test(trimmed)) return 'export'
    if (/^\/\//.test(trimmed) || /^\/\*/.test(trimmed)) return 'comment'
    if (/^(?:async\s+)?function\s/.test(trimmed)) return 'function'
    if (/^class\s/.test(trimmed)) return 'class'
    if (/^interface\s/.test(trimmed)) return 'interface'
    if (/^type\s/.test(trimmed)) return 'type'
    return 'statement'
  }

  private detectLeadingChunkType(content: string): ChunkType {
    const trimmed = content.trim()
    if (trimmed.length === 0) return 'block'
    if (/^import\s/m.test(trimmed)) return 'import'
    if (/^\/\//.test(trimmed) || /^\/\*/.test(trimmed)) return 'comment'
    return 'block'
  }

  private applyOverlap(chunks: CodeChunk[], source: string, overlapLines: number): CodeChunk[] {
    if (overlapLines <= 0 || chunks.length <= 1) return chunks

    const lines = source.split('\n')
    const result: CodeChunk[] = []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]!
      const overlapStart = Math.max(0, chunk.startLine - 1 - overlapLines)
      const overlapContent = lines.slice(overlapStart, chunk.startLine - 1).join('\n')

      const newContent = overlapContent.length > 0
        ? overlapContent + '\n' + chunk.content
        : chunk.content

      result.push({
        ...chunk,
        content: newContent,
        startLine: overlapStart + 1,
        startChar: lines.slice(0, overlapStart).join('\n').length + (overlapStart > 0 ? 1 : 0),
        hash: this.strategy.calculateHash(newContent),
      })
    }

    return result
  }

  private enforceMaxSize(chunks: CodeChunk[], maxSize: number): CodeChunk[] {
    const result: CodeChunk[] = []

    for (const chunk of chunks) {
      const lines = chunk.content.split('\n')
      if (lines.length <= maxSize) {
        result.push(chunk)
        continue
      }

      for (let i = 0; i < lines.length; i += maxSize) {
        const slice = lines.slice(i, Math.min(i + maxSize, lines.length))
        const content = slice.join('\n')
        const startLine = chunk.startLine + i
        const endLine = startLine + slice.length - 1

        result.push(this.createChunk({
          type: chunk.type,
          content,
          startLine,
          endLine,
          startChar: chunk.startChar + lines.slice(0, i).join('\n').length + (i > 0 ? 1 : 0),
          endChar: chunk.startChar + lines.slice(0, i + slice.length).join('\n').length,
          name: chunk.name,
          parentId: chunk.id,
          language: chunk.language,
        }))
      }
    }

    return result
  }

  private mergeSmallChunks(chunks: CodeChunk[], minSize: number): CodeChunk[] {
    if (chunks.length === 0) return []

    const result: CodeChunk[] = []
    let current = { ...chunks[0]!, children: [...chunks[0]!.children] }

    for (let i = 1; i < chunks.length; i++) {
      const next = chunks[i]!
      const currentLines = current.content.split('\n').length

      if (currentLines < minSize) {
        current.content = current.content + '\n' + next.content
        current.endLine = next.endLine
        current.endChar = next.endChar
        current.children = [...current.children, next.id]
        current.hash = this.strategy.calculateHash(current.content)
      } else {
        result.push(current)
        current = { ...next, children: [...next.children] }
      }
    }

    result.push(current)
    return result
  }
}
