export interface ModuleExport {
  name: string
  kind: 'class' | 'const' | 'enum' | 'function' | 'interface' | 'type' | 'value'
  isDefault: boolean
  isReExport: boolean
  reExportFrom?: string
  isTypeOnly: boolean
}

export interface ModuleImport {
  name: string
  fromModule: string
  isDefault: boolean
  isTypeOnly: boolean
  isNamespace: boolean
  isDynamic: boolean
  line: number
}

export interface ModuleInfo {
  filePath: string
  imports: ModuleImport[]
  exports: ModuleExport[]
  isBarrel: boolean
  isEntryPoint: boolean
  dependencies: Set<string>
  dependents: Set<string>
  depth: number
}

export interface ImportGraph {
  modules: Map<string, ModuleInfo>
  edges: ImportEdge[]
}

export interface ImportEdge {
  from: string
  to: string
  imports: ModuleImport[]
  weight: number
}

export type CrossFileIssueType =
  | 'dead-module'
  | 'unused-export'
  | 're-export-chain'
  | 'barrel-bloat'
  | 'circular-dependency'
  | 'deep-import'
  | 'module-coupling'

export interface CrossFileIssue {
  type: CrossFileIssueType
  severity: 'error' | 'info' | 'warning'
  filePath: string
  message: string
  details: Record<string, unknown>
  suggestion?: string
}

export interface CouplingMetrics {
  filePath: string
  afferentCoupling: number
  efferentCoupling: number
  instability: number
  abstractness: number
  distance: number
}

export interface ImpactAnalysis {
  changedFile: string
  directlyAffected: string[]
  transitivelyAffected: string[]
  totalAffected: number
  affectedExports: string[]
}

export interface ReExportChain {
  source: string
  target: string
  intermediaries: string[]
  chainLength: number
}

export interface CrossFileAnalysisResult {
  graph: ImportGraph
  issues: CrossFileIssue[]
  couplingMetrics: CouplingMetrics[]
  orphanModules: string[]
  summary: {
    totalModules: number
    totalImports: number
    totalExports: number
    averageCoupling: number
    issueCount: number
    orphanCount: number
  }
}

export function createEmptyModuleInfo(filePath: string): ModuleInfo {
  return {
    filePath,
    imports: [],
    exports: [],
    isBarrel: false,
    isEntryPoint: false,
    dependencies: new Set<string>(),
    dependents: new Set<string>(),
    depth: 0,
  }
}

export function createEmptyImportGraph(): ImportGraph {
  return {
    modules: new Map<string, ModuleInfo>(),
    edges: [],
  }
}
