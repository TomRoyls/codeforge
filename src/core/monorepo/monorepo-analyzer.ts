import type {
  MonorepoHealth,
  MonorepoReport,
  PackageHealth,
  PackageRank,
  WorkspaceConfig,
  WorkspacePackage,
} from './types.js'
import { DependencyGraphBuilder } from './dependency-graph.js'
import type { RawPackageVersions } from './dependency-graph.js'
import { sortedByDesc } from '../../utils/array-helpers.js'

export class MonorepoAnalyzer {
  private graphBuilder: DependencyGraphBuilder
  private _rootPath: string

  constructor(rootPath: string) {
    this._rootPath = rootPath
    this.graphBuilder = new DependencyGraphBuilder()
  }

  analyze(
    packages: WorkspacePackage[],
    workspaceConfig: WorkspaceConfig,
    rawVersions?: Map<string, RawPackageVersions>,
  ): MonorepoReport {
    void this._rootPath
    const graph = this.graphBuilder.buildGraph(packages, rawVersions)

    const health = this.calculateHealth(packages, graph, rawVersions)

    return {
      workspace: workspaceConfig,
      packages,
      graph,
      health,
    }
  }

  getPackageHealth(
    packageName: string,
    report: MonorepoReport,
  ): PackageHealth {
    const pkg = report.graph.packages.get(packageName)
    if (!pkg) {
      return {
        packageName,
        dependencyCount: 0,
        dependentCount: 0,
        hasCircular: false,
        outdatedCount: 0,
        score: 0,
      }
    }

    const dependencyCount = this.graphBuilder.getDependencies(
      packageName,
      report.graph,
    ).length
    const dependentCount = this.graphBuilder.getDependents(
      packageName,
      report.graph,
    ).length

    const hasCircular = report.graph.circular.some((cycle) =>
      cycle.includes(packageName),
    )

    const score = this.calculatePackageScore(
      dependencyCount,
      dependentCount,
      hasCircular,
    )

    return {
      packageName,
      dependencyCount,
      dependentCount,
      hasCircular,
      outdatedCount: 0,
      score,
    }
  }

  suggestBuildOrder(report: MonorepoReport): string[] {
    return this.graphBuilder.getTopologicalOrder(report.graph)
  }

  identifySharedDeps(report: MonorepoReport): Map<string, number> {
    const sharedDeps = new Map<string, number>()

    for (const pkg of report.packages) {
      const allDeps = new Set([
        ...pkg.dependencies,
        ...pkg.devDependencies,
        ...pkg.peerDependencies,
      ])

      for (const dep of allDeps) {
        const current = sharedDeps.get(dep) ?? 0
        sharedDeps.set(dep, current + 1)
      }
    }

    const filtered = new Map<string, number>()
    for (const [dep, count] of sharedDeps) {
      if (count > 1) {
        filtered.set(dep, count)
      }
    }

    return new Map(
      [...filtered.entries()].sort((a, b) => b[1] - a[1]),
    )
  }

  calculateCouplingScore(report: MonorepoReport): number {
    const totalPackages = report.packages.length
    if (totalPackages <= 1) return 0

    const internalEdges = report.graph.edges.length
    const maxEdges = totalPackages * (totalPackages - 1)
    if (maxEdges === 0) return 0

    return Math.round((internalEdges / maxEdges) * 100)
  }

  findUnusedPackages(report: MonorepoReport): string[] {
    return this.graphBuilder.findOrphanPackages(report.graph)
  }

  private calculateHealth(
    packages: WorkspacePackage[],
    graph: import('./types.js').DependencyGraph,
    rawVersions?: Map<string, RawPackageVersions>,
  ): MonorepoHealth {
    const totalPackages = packages.length
    const privatePackages = packages.filter((p) => p.private).length
    const publicPackages = totalPackages - privatePackages

    const totalDeps = packages.reduce(
      (sum, p) => sum + p.dependencies.length + p.devDependencies.length,
      0,
    )
    const avgDepsPerPackage =
      totalPackages > 0 ? totalDeps / totalPackages : 0

    const topDepended = this.calculateTopDepended(graph)
    const inconsistentVersions = rawVersions
      ? this.graphBuilder.detectVersionMismatches(packages, rawVersions)
      : []

    return {
      totalPackages,
      outdatedDeps: 0,
      circularDeps: graph.circular.length,
      privatePackages,
      publicPackages,
      avgDepsPerPackage,
      topDepended,
      inconsistentVersions,
    }
  }

  private calculateTopDepended(
    graph: import('./types.js').DependencyGraph,
  ): PackageRank[] {
    const dependentCount = new Map<string, number>()
    for (const edge of graph.edges) {
      const current = dependentCount.get(edge.to) ?? 0
      dependentCount.set(edge.to, current + 1)
    }

    const entries = [...dependentCount.entries()]
      .map(([name, dependents]) => ({ name, dependents }))
    return sortedByDesc(entries, e => e.dependents)
      .slice(0, 10)
  }

  private calculatePackageScore(
    dependencyCount: number,
    _dependentCount: number,
    hasCircular: boolean,
  ): number {
    let score = 100

    score -= Math.min(dependencyCount * 2, 30)

    if (hasCircular) {
      score -= 25
    }

    return Math.max(0, score)
  }
}
