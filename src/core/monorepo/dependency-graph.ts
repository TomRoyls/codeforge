import type {
  DependencyGraph,
  PackageEdge,
  PackageRank,
  VersionMismatch,
  WorkspacePackage,
} from './types.js'
import { sortedByDesc } from '../../utils/array-helpers.js'

export interface RawPackageVersions {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

export class DependencyGraphBuilder {
  buildGraph(
    packages: WorkspacePackage[],
    rawVersions?: Map<string, RawPackageVersions>,
  ): DependencyGraph {
    const packageMap = new Map<string, WorkspacePackage>()
    for (const pkg of packages) {
      packageMap.set(pkg.name, pkg)
    }

    const edges: PackageEdge[] = []
    const workspaceNames = new Set(packageMap.keys())

    for (const pkg of packages) {
      const raw = rawVersions?.get(pkg.name)

      this.collectEdges(
        pkg,
        pkg.dependencies,
        'dependency',
        workspaceNames,
        raw?.dependencies,
        edges,
      )
      this.collectEdges(
        pkg,
        pkg.devDependencies,
        'devDependency',
        workspaceNames,
        raw?.devDependencies,
        edges,
      )
      this.collectEdges(
        pkg,
        pkg.peerDependencies,
        'peerDependency',
        workspaceNames,
        raw?.peerDependencies,
        edges,
      )
    }

    const graph: DependencyGraph = {
      packages: packageMap,
      edges,
      circular: [],
    }

    graph.circular = this.findCircularDependencies(graph)

    return graph
  }

  private collectEdges(
    pkg: WorkspacePackage,
    depNames: string[],
    type: PackageEdge['type'],
    workspaceNames: Set<string>,
    versionMap: Record<string, string> | undefined,
    edges: PackageEdge[],
  ): void {
    for (const depName of depNames) {
      if (!workspaceNames.has(depName)) continue

      edges.push({
        from: pkg.name,
        to: depName,
        type,
        version: versionMap?.[depName] ?? '*',
      })
    }
  }

  findCircularDependencies(graph: DependencyGraph): string[][] {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const cycles: string[][] = []

    for (const name of graph.packages.keys()) {
      this.dfsCycle(name, graph, visited, recursionStack, [], cycles)
    }

    return this.deduplicateCycles(cycles)
  }

  private dfsCycle(
    node: string,
    graph: DependencyGraph,
    visited: Set<string>,
    recursionStack: Set<string>,
    path: string[],
    cycles: string[][],
  ): void {
    if (recursionStack.has(node)) {
      const cycleStart = path.indexOf(node)
      if (cycleStart !== -1) {
        const cycle = [...path.slice(cycleStart), node]
        cycles.push(cycle)
      }
      return
    }

    if (visited.has(node)) return

    visited.add(node)
    recursionStack.add(node)
    path.push(node)

    const neighbors = this.outgoingNeighbors(node, graph)
    for (const neighbor of neighbors) {
      this.dfsCycle(neighbor, graph, visited, recursionStack, path, cycles)
    }

    recursionStack.delete(node)
    path.pop()
  }

  private outgoingNeighbors(node: string, graph: DependencyGraph): string[] {
    const neighbors: string[] = []
    for (const edge of graph.edges) {
      if (edge.from === node) {
        neighbors.push(edge.to)
      }
    }
    return neighbors
  }

  private deduplicateCycles(cycles: string[][]): string[][] {
    const seen = new Set<string>()
    const unique: string[][] = []

    for (const cycle of cycles) {
      const core = cycle.slice(0, -1).sort().join('|')
      if (!seen.has(core)) {
        seen.add(core)
        unique.push(cycle)
      }
    }

    return unique
  }

  getDependents(packageName: string, graph: DependencyGraph): string[] {
    const dependents = new Set<string>()
    for (const edge of graph.edges) {
      if (edge.to === packageName) {
        dependents.add(edge.from)
      }
    }
    return [...dependents]
  }

  getDependencies(packageName: string, graph: DependencyGraph): string[] {
    const deps = new Set<string>()
    for (const edge of graph.edges) {
      if (edge.from === packageName) {
        deps.add(edge.to)
      }
    }
    return [...deps]
  }

  getTopologicalOrder(graph: DependencyGraph): string[] {
    const outDegree = new Map<string, number>()
    for (const name of graph.packages.keys()) {
      outDegree.set(name, 0)
    }

    for (const edge of graph.edges) {
      const current = outDegree.get(edge.from) ?? 0
      outDegree.set(edge.from, current + 1)
    }

    const queue: string[] = []
    for (const [name, degree] of outDegree) {
      if (degree === 0) {
        queue.push(name)
      }
    }

    const result: string[] = []
    const processed = new Set<string>()

    while (queue.length > 0) {
      const node = queue.shift()!
      if (processed.has(node)) continue
      processed.add(node)
      result.push(node)

      for (const edge of graph.edges) {
        if (edge.to === node) {
          const deg = outDegree.get(edge.from) ?? 0
          outDegree.set(edge.from, deg - 1)
          if (deg - 1 === 0 && !processed.has(edge.from)) {
            queue.push(edge.from)
          }
        }
      }
    }

    for (const name of graph.packages.keys()) {
      if (!processed.has(name)) {
        result.push(name)
      }
    }

    return result
  }

  findOrphanPackages(graph: DependencyGraph): string[] {
    const dependedUpon = new Set<string>()
    for (const edge of graph.edges) {
      dependedUpon.add(edge.to)
    }

    const orphans: string[] = []
    for (const name of graph.packages.keys()) {
      if (!dependedUpon.has(name)) {
        orphans.push(name)
      }
    }

    return orphans
  }

  findHubPackages(graph: DependencyGraph, threshold: number = 2): PackageRank[] {
    const dependentCount = new Map<string, number>()
    for (const edge of graph.edges) {
      const current = dependentCount.get(edge.to) ?? 0
      dependentCount.set(edge.to, current + 1)
    }

    const hubs: PackageRank[] = []
    for (const [name, count] of dependentCount) {
      if (count >= threshold) {
        hubs.push({ name, dependents: count })
      }
    }

    return sortedByDesc(hubs, h => h.dependents)
  }

  detectVersionMismatches(
    packages: WorkspacePackage[],
    rawVersions?: Map<string, RawPackageVersions>,
  ): VersionMismatch[] {
    const depVersionMap = new Map<string, Map<string, string[]>>()

    for (const pkg of packages) {
      const raw = rawVersions?.get(pkg.name)

      this.collectVersionEntries(pkg.name, raw?.dependencies ?? {}, depVersionMap)
      this.collectVersionEntries(pkg.name, raw?.devDependencies ?? {}, depVersionMap)
      this.collectVersionEntries(pkg.name, raw?.peerDependencies ?? {}, depVersionMap)
    }

    const mismatches: VersionMismatch[] = []
    for (const [depName, versionMap] of depVersionMap) {
      if (versionMap.size > 1) {
        mismatches.push({
          dependency: depName,
          versions: versionMap,
        })
      }
    }

    return mismatches
  }

  private collectVersionEntries(
    packageName: string,
    deps: Record<string, string>,
    depVersionMap: Map<string, Map<string, string[]>>,
  ): void {
    for (const [depName, version] of Object.entries(deps)) {
      let versionMap = depVersionMap.get(depName)
      if (!versionMap) {
        versionMap = new Map()
        depVersionMap.set(depName, versionMap)
      }

      let pkgs = versionMap.get(version)
      if (!pkgs) {
        pkgs = []
        versionMap.set(version, pkgs)
      }
      pkgs.push(packageName)
    }
  }
}
