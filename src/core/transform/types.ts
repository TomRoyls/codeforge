export interface TextChange {
  description: string
  endLine: number
  original: string
  replacement: string
  startLine: number
}

export interface TransformResult {
  applied: boolean
  changes: TextChange[]
  errors: string[]
  source: string
}

export interface Transform {
  apply: (source: string, filePath: string) => TransformResult
  category: 'migration' | 'modernize' | 'refactor' | 'safety'
  description: string
  id: string
  name: string
}

export interface TransformRecipe {
  description: string
  filePatterns: string[]
  id: string
  name: string
  transforms: string[]
}

export interface TransformConfig {
  dryRun: boolean
  filePatterns: string[]
  ignorePatterns: string[]
  maxFileSize: number
}

export const DEFAULT_TRANSFORM_CONFIG: TransformConfig = {
  dryRun: false,
  filePatterns: ['**/*.ts', '**/*.js'],
  ignorePatterns: ['node_modules/**', 'dist/**'],
  maxFileSize: 100_000,
}

export interface TransformReport {
  filesModified: number
  results: Map<string, TransformResult[]>
  totalChanges: number
  transformsApplied: number
}
