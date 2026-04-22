interface ImportInfo {
  location: { column: number; end: number; line: number }
  modulePath: string
  sourceFile: string
}

interface DependencyNode {
  filePath: string
  importDetails: Map<string, ImportInfo>
  imports: Set<string>
}

interface DependencyGraph {
  nodes: Map<string, DependencyNode>
}

interface CircularDependency {
  cycle: readonly string[]
  location: ImportInfo['location']
}

interface DependenciesReport {
  circularDependencies: CircularDependency[]
  externalModules: string[]
  filesAnalyzed: number
  graph: { edges: [string, string][]; nodes: string[] }
  internalModules: string[]
  orphanFiles: string[]
}

interface CycleDetectionContext {
  cycles: CircularDependency[]
  graph: DependencyGraph
  maxDepth: number
  path: string[]
  recursionStack: Set<string>
  visited: Set<string>
}

export type {
  CircularDependency,
  CycleDetectionContext,
  DependenciesReport,
  DependencyGraph,
  DependencyNode,
  ImportInfo,
}

export function extractImports(sourceCode: string, filePath: string): ImportInfo[] {
  const imports: ImportInfo[] = []
  const lines = sourceCode.split('\n')

  for (const [lineIndex, line] of lines.entries()) {
    const trimmedLine = line.trim()

    const importMatch = trimmedLine.match(
      /^import\s+(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/,
    )

    const dynamicMatch = trimmedLine.match(/import\s*\(\s*['"]([^'"]+)['"]/)

    const requireMatch = trimmedLine.match(/require\s*\(\s*['"]([^'"]+)['"]/)

    if (importMatch) {
      const modulePath = importMatch[1]

      if (modulePath) {
        imports.push({
          location: { column: 1, end: line.length, line: lineIndex + 1 },
          modulePath,
          sourceFile: filePath,
        })
      }
    } else if (dynamicMatch) {
      const modulePath = dynamicMatch[1]

      if (modulePath) {
        imports.push({
          location: { column: 1, end: line.length, line: lineIndex + 1 },
          modulePath,
          sourceFile: filePath,
        })
      }
    } else if (requireMatch) {
      const modulePath = requireMatch[1]

      if (modulePath) {
        imports.push({
          location: { column: 1, end: line.length, line: lineIndex + 1 },
          modulePath,
          sourceFile: filePath,
        })
      }
    }
  }

  return imports
}

export function findOrphanFiles(graph: DependencyGraph): string[] {
  const importedFiles = new Set<string>()

  for (const node of graph.nodes.values()) {
    for (const imp of node.imports) {
      if (imp.startsWith('.')) {
        importedFiles.add(imp)
      }
    }
  }

  const orphans: string[] = []

  for (const filePath of graph.nodes.keys()) {
    if (!importedFiles.has(filePath)) {
      orphans.push(filePath)
    }
  }

  return orphans
}

export {
  deduplicateCycles,
  detectCircularDependencies,
  detectCyclesFromNode,
  finishNodeVisit,
  normalizeCycle,
  processDependency,
  recordCycle,
} from './dependencies-cycle-helpers.js'

export {
  displayCircularDependencies,
  displayDependencyTree,
  displayDotFormat,
  displayExternalModules,
  displayFullReport,
  formatOutput,
  graphToDotFormat,
} from './dependencies-display-helpers.js'
