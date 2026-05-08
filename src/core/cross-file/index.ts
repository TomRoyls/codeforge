export type {
  ModuleExport,
  ModuleImport,
  ModuleInfo,
  ImportGraph,
  ImportEdge,
  CrossFileIssueType,
  CrossFileIssue,
  CouplingMetrics,
  ImpactAnalysis,
  ReExportChain,
  CrossFileAnalysisResult,
} from './types.js'

export { createEmptyModuleInfo, createEmptyImportGraph } from './types.js'
export { ImportGraphBuilder } from './import-graph-builder.js'
export { CrossFileAnalyzer } from './cross-file-analyzer.js'
