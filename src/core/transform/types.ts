export interface TextChange {
  startLine: number
  endLine: number
  original: string
  replacement: string
  description: string
}

export interface TransformResult {
  source: string
  changes: TextChange[]
  applied: boolean
  errors: string[]
}

export interface Transform {
  id: string
  name: string
  description: string
  category: 'refactor' | 'migration' | 'modernize' | 'safety'
  apply: (source: string, filePath: string) => TransformResult
}

export interface TransformRecipe {
  id: string
  name: string
  description: string
  transforms: string[]
  filePatterns: string[]
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
  maxFileSize: 100000,
}

export interface TransformReport {
  transformsApplied: number
  filesModified: number
  totalChanges: number
  results: Map<string, TransformResult[]>
}
