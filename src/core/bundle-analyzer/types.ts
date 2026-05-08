export interface ModuleInfo {
  name: string
  path: string
  size: number
  dependencies: string[]
  exports: string[]
  usedExports: string[]
  isExternal: boolean
}

export interface BundleModule {
  name: string
  path: string
  size: number
  dependencies: string[]
  exports: string[]
  usedExports: string[]
  isExternal: boolean
  imported: boolean
  depth: number
  cost: number
}

export interface TreeShakeOpportunity {
  module: string
  unusedExports: string[]
  potentialSavings: number
}

export interface BundleReport {
  totalSize: number
  moduleCount: number
  externalCount: number
  modules: BundleModule[]
  treeShakeOpportunities: TreeShakeOpportunity[]
  duplicateDependencies: string[][]
  largestModules: BundleModule[]
  estimatedGzipSize: number
}

export interface AnalyzeConfig {
  entryPoint: string
  excludeExternals: boolean
  maxDepth: number
  gzipEstimate: boolean
}

export const DEFAULT_ANALYZE_CONFIG: AnalyzeConfig = {
  entryPoint: '',
  excludeExternals: false,
  maxDepth: 10,
  gzipEstimate: true,
}
