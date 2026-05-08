export type SplitGranularity = 'line' | 'statement' | 'function' | 'class' | 'module' | 'paragraph'

export type ChunkType =
  | 'function'
  | 'class'
  | 'interface'
  | 'type'
  | 'import'
  | 'export'
  | 'comment'
  | 'statement'
  | 'block'
  | 'module'

export interface CodeChunk {
  id: string
  type: ChunkType
  content: string
  startLine: number
  endLine: number
  startChar: number
  endChar: number
  name?: string
  parentId?: string
  children: string[]
  metadata: Record<string, unknown>
  language: string
  hash: string
}

export interface SplitOptions {
  granularity: SplitGranularity
  maxChunkSize: number
  minChunkSize: number
  overlapLines: number
  preserveImports: boolean
  preserveComments: boolean
  includeMetadata: boolean
  language: string
}

export interface SplitResult {
  chunks: CodeChunk[]
  totalLines: number
  totalChunks: number
  avgChunkSize: number
  language: string
  source: string
}

export const DEFAULT_SPLIT_OPTIONS: SplitOptions = {
  granularity: 'function',
  maxChunkSize: 500,
  minChunkSize: 1,
  overlapLines: 0,
  preserveImports: true,
  preserveComments: true,
  includeMetadata: true,
  language: 'typescript',
}
