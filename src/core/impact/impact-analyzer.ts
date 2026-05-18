import type { Change, ChangeSet, ImpactEdge, ImpactGraph, ImpactNode } from './types.js';
import { ImpactType } from './types.js';
import { unique } from '../../utils/array-helpers.js';

export class ImpactAnalyzer {
  private depMap: Map<string, string[]>;
  private allFiles: string[];
  private allExports: Map<string, string[]>;

  constructor(
    depMap: Map<string, string[]>,
    allFiles: string[] = [],
    allExports: Map<string, string[]> = new Map(),
  ) {
    this.depMap = depMap;
    this.allFiles = allFiles;
    this.allExports = allExports;
  }

  analyze(changeSet: ChangeSet): ImpactGraph {
    const nodes = new Map<string, ImpactNode[]>();
    const edges: ImpactEdge[] = [];
    const rootChanges: string[] = [];

    for (const change of changeSet.changes) {
      rootChanges.push(change.filePath);

      const directNodes = this.traceDirectImpact(change, this.depMap);
      for (const node of directNodes) {
        const existing = nodes.get(change.filePath) ?? [];
        existing.push(node);
        nodes.set(change.filePath, existing);
        edges.push({
          from: change.filePath,
          to: node.filePath,
          type: node.impactType,
          weight: node.confidence,
        });
      }

      const transitiveNodes = this.traceTransitiveImpact(change.filePath, this.depMap, 10);
      for (const node of transitiveNodes) {
        const existing = nodes.get(change.filePath) ?? [];
        if (!existing.some((n) => n.filePath === node.filePath)) {
          existing.push(node);
          nodes.set(change.filePath, existing);
          edges.push({
            from: change.filePath,
            to: node.filePath,
            type: node.impactType,
            weight: node.confidence * 0.8,
          });
        }
      }

      const testFiles = this.findTestFiles(change.filePath, this.allFiles);
      for (const testFile of testFiles) {
        const existing = nodes.get(change.filePath) ?? [];
        if (!existing.some((n) => n.filePath === testFile)) {
          existing.push({
            filePath: testFile,
            impactType: ImpactType.TEST_COVERAGE,
            depth: 1,
            reason: `Test file for ${change.filePath}`,
            confidence: 0.9,
          });
          nodes.set(change.filePath, existing);
          edges.push({
            from: change.filePath,
            to: testFile,
            type: ImpactType.TEST_COVERAGE,
            weight: 0.9,
          });
        }
      }

      const reExporters = this.findReExporters(change.filePath, this.allExports);
      for (const reExporter of reExporters) {
        const existing = nodes.get(change.filePath) ?? [];
        if (!existing.some((n) => n.filePath === reExporter)) {
          existing.push({
            filePath: reExporter,
            impactType: ImpactType.RE_EXPORT,
            depth: 1,
            reason: `Re-exports from ${change.filePath}`,
            confidence: 0.85,
          });
          nodes.set(change.filePath, existing);
          edges.push({
            from: change.filePath,
            to: reExporter,
            type: ImpactType.RE_EXPORT,
            weight: 0.85,
          });
        }
      }
    }

    return { nodes, edges, rootChanges };
  }

  traceDirectImpact(change: Change, depMap: Map<string, string[]>): ImpactNode[] {
    const result: ImpactNode[] = [];
    for (const [filePath, imports] of depMap) {
      if (filePath === change.filePath) continue;
      if (imports.includes(change.filePath)) {
        result.push({
          filePath,
          impactType: ImpactType.DIRECT_DEPENDENCY,
          depth: 1,
          reason: `Directly imports ${change.filePath}`,
          confidence: 0.95,
        });
      }
    }
    return result;
  }

  traceTransitiveImpact(filePath: string, depMap: Map<string, string[]>, depth: number): ImpactNode[] {
    const result: ImpactNode[] = [];
    const visited = new Set<string>();
    visited.add(filePath);
    const queue: Array<{ file: string; currentDepth: number }> = [];

    const directDeps = this.findDirectDependents(filePath, depMap);
    for (const dep of directDeps) {
      queue.push({ file: dep, currentDepth: 1 });
      visited.add(dep);
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push({
        filePath: current.file,
        impactType:
          current.currentDepth === 1
            ? ImpactType.DIRECT_DEPENDENCY
            : ImpactType.TRANSITIVE_DEPENDENCY,
        depth: current.currentDepth,
        reason: `Dependent at depth ${current.currentDepth} of ${filePath}`,
        confidence: Math.max(0.3, 1 - current.currentDepth * 0.15),
      });

      if (current.currentDepth < depth) {
        const nextDeps = this.findDirectDependents(current.file, depMap);
        for (const dep of nextDeps) {
          if (!visited.has(dep)) {
            visited.add(dep);
            queue.push({ file: dep, currentDepth: current.currentDepth + 1 });
          }
        }
      }
    }

    return result;
  }

  findTestFiles(filePath: string, allFiles: string[]): string[] {
    const baseName = filePath.replace(/\.\w+$/, '');
    const testPatterns = [
      `${baseName}.test.`,
      `${baseName}.spec.`,
      `${baseName}.test`,
      `${baseName}.spec`,
    ];
    const result: string[] = [];
    for (const file of allFiles) {
      for (const pattern of testPatterns) {
        if (file.startsWith(pattern) || file.includes(pattern)) {
          result.push(file);
          break;
        }
      }
      const fileName = filePath.split('/').pop() ?? '';
      const testName = fileName.replace(/(\.\w+)$/, '.test$1');
      const specName = fileName.replace(/(\.\w+)$/, '.spec$1');
      if (file.endsWith(testName) || file.endsWith(specName)) {
        if (!result.includes(file)) {
          result.push(file);
        }
      }
    }
    return unique(result);
  }

  findReExporters(filePath: string, allExports: Map<string, string[]>): string[] {
    const result: string[] = [];
    const fileName = filePath.replace(/\.\w+$/, '');
    for (const [exporterFile, exports] of allExports) {
      if (exporterFile === filePath) continue;
      for (const exp of exports) {
        if (exp === filePath || exp === fileName || exp.includes(fileName)) {
          result.push(exporterFile);
          break;
        }
      }
    }
    return result;
  }

  calculateBlastRadius(graph: ImpactGraph): number {
    const allImpacted = new Set<string>();
    for (const nodes of graph.nodes.values()) {
      for (const node of nodes) {
        allImpacted.add(node.filePath);
      }
    }
    return allImpacted.size;
  }

  getImpactChain(from: string, to: string, graph: ImpactGraph): string[] {
    if (from === to) return [from];

    const adjacency = new Map<string, string[]>();
    for (const edge of graph.edges) {
      const list = adjacency.get(edge.from) ?? [];
      list.push(edge.to);
      adjacency.set(edge.from, list);
    }

    const queue: Array<{ file: string; path: string[] }> = [{ file: from, path: [from] }];
    const visited = new Set<string>([from]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = adjacency.get(current.file) ?? [];
      for (const neighbor of neighbors) {
        if (neighbor === to) {
          return [...current.path, neighbor];
        }
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ file: neighbor, path: [...current.path, neighbor] });
        }
      }
    }

    return [];
  }

  private findDirectDependents(filePath: string, depMap: Map<string, string[]>): string[] {
    const result: string[] = [];
    for (const [file, imports] of depMap) {
      if (imports.includes(filePath)) {
        result.push(file);
      }
    }
    return result;
  }
}
