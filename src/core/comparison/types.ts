export interface FunctionInfo {
  name: string
  params: number
  returnType: string
  complexity: number
  loc: number
  isAsync: boolean
  isExported: boolean
}

export interface ClassInfo {
  name: string
  methods: number
  properties: number
  interfaces: string[]
  isAbstract: boolean
  isExported: boolean
}

export interface ImportInfo {
  module: string
  names: string[]
  isTypeOnly: boolean
}

export interface ExportInfo {
  name: string
  type: 'function' | 'class' | 'const' | 'type' | 'interface'
  isDefault: boolean
}

export interface CodeStructure {
  filePath: string
  functions: FunctionInfo[]
  classes: ClassInfo[]
  imports: ImportInfo[]
  exports: ExportInfo[]
  complexity: number
  loc: number
}

export interface StructureModification {
  filePath: string
  type:
    | 'function-added'
    | 'function-removed'
    | 'function-changed'
    | 'class-added'
    | 'class-removed'
    | 'class-changed'
    | 'import-changed'
    | 'export-changed'
  name: string
  details: string
}

export interface StructureDiff {
  added: CodeStructure[]
  removed: CodeStructure[]
  modified: StructureModification[]
  similarity: number
}

export interface ComparisonStats {
  totalLeft: number
  totalRight: number
  commonCount: number
  addedCount: number
  removedCount: number
  modifiedCount: number
  similarityIndex: number
}

export interface ComparisonResult {
  left: CodeStructure[]
  right: CodeStructure[]
  diff: StructureDiff
  statistics: ComparisonStats
}

export interface ComparisonConfig {
  ignoreExports: boolean
  ignoreImports: boolean
  ignorePrivate: boolean
  similarityThreshold: number
}

export interface LineDiff {
  type: 'add' | 'delete' | 'equal'
  content: string
  lineNumber: number
}

export interface WordDiff {
  type: 'add' | 'delete' | 'equal'
  text: string
  position: number
}
