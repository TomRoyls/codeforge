export enum DuplicationType {
  EXACT = 'exact',
  STRUCTURAL = 'structural',
  SEMANTIC = 'semantic',
}

export interface CloneInstance {
  filePath: string
  startLine: number
  endLine: number
  startCol: number
  endCol: number
  content: string
  hash: string
  tokens: string[]
}

export interface CloneGroup {
  id: string
  clones: CloneInstance[]
  similarity: number
  type: DuplicationType
  fingerprint: string
}

export interface DuplicationConfig {
  minLines: number
  minTokens: number
  similarityThreshold: number
  filePatterns: string[]
  ignorePatterns: string[]
  maxResults: number
}

export interface DuplicationSummary {
  filesAnalyzed: number
  filesWithDuplicates: number
  avgCloneSize: number
  largestClone: number
  duplicateHotspots: string[]
}

export interface DuplicationReport {
  totalDuplicates: number
  totalDuplicatedLines: number
  duplicationPercentage: number
  cloneGroups: CloneGroup[]
  summary: DuplicationSummary
}

export const DEFAULT_DUPLICATION_CONFIG: DuplicationConfig = {
  minLines: 6,
  minTokens: 50,
  similarityThreshold: 0.8,
  filePatterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
  ignorePatterns: ['**/node_modules/**', '**/dist/**', '**/*.d.ts'],
  maxResults: 100,
}
