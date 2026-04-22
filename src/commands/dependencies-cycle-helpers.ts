import type {
  CircularDependency,
  CycleDetectionContext,
  DependencyGraph,
  DependencyNode,
} from './dependencies-helpers.js'

export function finishNodeVisit(
  currentPath: string,
  path: string[],
  recursionStack: Set<string>,
): void {
  path.pop()
  recursionStack.delete(currentPath)
}

export function normalizeCycle(cycle: readonly string[]): string[] {
  const withoutLast = cycle.slice(0, -1)

  if (withoutLast.length === 0) return [...cycle] as string[]

  let minIndex = 0

  for (let i = 1; i < withoutLast.length; i++) {
    const current = withoutLast[i]
    const min = withoutLast[minIndex]

    if (current !== undefined && min !== undefined && current < min) {
      minIndex = i
    }
  }

  const minElement = withoutLast[minIndex]

  if (minElement === undefined) {
    return [...withoutLast] as string[]
  }

  const rotated = [...withoutLast.slice(minIndex), ...withoutLast.slice(0, minIndex), minElement]
  return rotated.filter((item): item is string => item !== undefined)
}

export function deduplicateCycles(cycles: CircularDependency[]): CircularDependency[] {
  const seen = new Set<string>()
  const unique: CircularDependency[] = []

  for (const cycle of cycles) {
    const normalized = normalizeCycle(cycle.cycle)
    const key = normalized.join('->')

    if (!seen.has(key)) {
      seen.add(key)
      unique.push(cycle)
    }
  }

  return unique
}

export function recordCycle(
  dependency: string,
  node: DependencyNode,
  context: { cycles: CircularDependency[]; path: string[] },
): void {
  const cycleStartIndex = context.path.indexOf(dependency)
  const cycle = [...context.path.slice(cycleStartIndex), dependency]
  const importDetail = node.importDetails.get(dependency)

  if (importDetail) {
    context.cycles.push({
      cycle,
      location: importDetail.location,
    })
  }
}

export function processDependency(
  dependency: string,
  node: DependencyNode,
  context: CycleDetectionContext,
): void {
  const depNode = context.graph.nodes.get(dependency)
  if (!depNode) return

  if (!context.visited.has(dependency)) {
    detectCyclesFromNode(dependency, {
      ...context,
      path: [...context.path],
    })
  } else if (context.recursionStack.has(dependency)) {
    recordCycle(dependency, node, context)
  }
}

export function detectCyclesFromNode(currentPath: string, context: CycleDetectionContext): void {
  const { graph, maxDepth, path, recursionStack, visited } = context

  if (path.length > maxDepth) return

  visited.add(currentPath)
  recursionStack.add(currentPath)
  path.push(currentPath)

  const node = graph.nodes.get(currentPath)
  if (!node) {
    finishNodeVisit(currentPath, path, recursionStack)
    return
  }

  for (const dependency of node.imports) {
    processDependency(dependency, node, context)
  }

  finishNodeVisit(currentPath, path, recursionStack)
}

export function detectCircularDependencies(graph: DependencyGraph): CircularDependency[] {
  const cycles: CircularDependency[] = []
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  for (const filePath of graph.nodes.keys()) {
    detectCyclesFromNode(filePath, {
      cycles,
      graph,
      maxDepth: 50,
      path: [],
      recursionStack,
      visited,
    })
  }

  return deduplicateCycles(cycles)
}
