import { describe, it, expect } from 'vitest';
import { ImpactType } from '../../src/core/impact/types.js';
import type { Change, ChangeSet, ImpactGraph } from '../../src/core/impact/types.js';
import {
  ChangeSetBuilder,
  extractImports,
  extractExports,
  getChangedSymbols,
  fromDiff,
  fromFileList,
  mergeChangeSets,
  filterByPattern,
} from '../../src/core/impact/change-set.js';
import { ImpactAnalyzer } from '../../src/core/impact/impact-analyzer.js';
import { RiskAssessor } from '../../src/core/impact/risk-assessor.js';

function makeChange(overrides: Partial<Change> = {}): Change {
  return {
    filePath: 'src/foo.ts',
    type: 'modified',
    additions: 10,
    deletions: 5,
    imports: [],
    exports: [],
    ...overrides,
  };
}

function makeChangeSet(changes: Change[] = [makeChange()]): ChangeSet {
  return { changes, timestamp: Date.now() };
}

function makeDepMap(entries: Array<[string, string[]]> = []): Map<string, string[]> {
  return new Map(entries);
}

describe('ChangeSetBuilder', () => {
  describe('fromDiff', () => {
    it('should parse a unified diff with added files', () => {
      const diff = [
        'diff --git a/src/new.ts b/src/new.ts',
        'new file mode 100644',
        '--- /dev/null',
        '+++ b/src/new.ts',
        '@@ -0,0 +1,3 @@',
        '+import { foo } from "./bar";',
        '+export function hello() {}',
        '+export const x = 1;',
      ].join('\n');
      const result = fromDiff(diff);
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0]!.filePath).toBe('src/new.ts');
      expect(result.changes[0]!.type).toBe('added');
      expect(result.changes[0]!.additions).toBe(3);
      expect(result.changes[0]!.imports).toContain('./bar');
      expect(result.changes[0]!.exports).toContain('hello');
      expect(result.changes[0]!.exports).toContain('x');
    });

    it('should parse a unified diff with modified files', () => {
      const diff = [
        'diff --git a/src/foo.ts b/src/foo.ts',
        '--- a/src/foo.ts',
        '+++ b/src/foo.ts',
        '@@ -1,3 +1,4 @@',
        ' import { bar } from "./baz";',
        '-const old = 1;',
        '+const new = 2;',
        '+const extra = 3;',
      ].join('\n');
      const result = fromDiff(diff);
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0]!.filePath).toBe('src/foo.ts');
      expect(result.changes[0]!.type).toBe('modified');
      expect(result.changes[0]!.additions).toBe(2);
      expect(result.changes[0]!.deletions).toBe(1);
    });

    it('should parse a diff with deleted files', () => {
      const diff = [
        'diff --git a/src/old.ts b/src/old.ts',
        'deleted file mode 100644',
        '--- a/src/old.ts',
        '+++ /dev/null',
        '@@ -1,2 +0,0 @@',
        '-export const gone = true;',
        '-export function removed() {}',
      ].join('\n');
      const result = fromDiff(diff);
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0]!.filePath).toBe('src/old.ts');
      expect(result.changes[0]!.type).toBe('deleted');
      expect(result.changes[0]!.deletions).toBe(2);
    });

    it('should handle empty diff', () => {
      const result = fromDiff('');
      expect(result.changes).toHaveLength(0);
    });

    it('should parse multiple files in a single diff', () => {
      const diff = [
        'diff --git a/src/a.ts b/src/a.ts',
        '--- a/src/a.ts',
        '+++ b/src/a.ts',
        '@@ -1 +1,2 @@',
        '+new line',
        'diff --git a/src/b.ts b/src/b.ts',
        '--- a/src/b.ts',
        '+++ b/src/b.ts',
        '@@ -1 +1,2 @@',
        '+another line',
      ].join('\n');
      const result = fromDiff(diff);
      expect(result.changes).toHaveLength(2);
      expect(result.changes[0]!.filePath).toBe('src/a.ts');
      expect(result.changes[1]!.filePath).toBe('src/b.ts');
    });
  });

  describe('fromFileList', () => {
    it('should create a ChangeSet from file list with added type', () => {
      const result = fromFileList(['src/a.ts', 'src/b.ts'], 'added');
      expect(result.changes).toHaveLength(2);
      expect(result.changes[0]!.type).toBe('added');
      expect(result.changes[0]!.additions).toBe(1);
      expect(result.changes[0]!.deletions).toBe(0);
    });

    it('should create a ChangeSet from file list with deleted type', () => {
      const result = fromFileList(['src/old.ts'], 'deleted');
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0]!.type).toBe('deleted');
      expect(result.changes[0]!.additions).toBe(0);
      expect(result.changes[0]!.deletions).toBe(1);
    });
  });

  describe('extractImports', () => {
    it('should extract ES module imports', () => {
      const content = 'import { foo } from "./bar";\nimport baz from "./qux";';
      const result = extractImports(content);
      expect(result).toContain('./bar');
      expect(result).toContain('./qux');
    });

    it('should extract side-effect imports', () => {
      const content = 'import "./polyfill";';
      const result = extractImports(content);
      expect(result).toContain('./polyfill');
    });

    it('should extract dynamic imports', () => {
      const content = 'const mod = import("./dynamic");';
      const result = extractImports(content);
      expect(result).toContain('./dynamic');
    });

    it('should deduplicate imports', () => {
      const content = 'import { a } from "./same";\nimport { b } from "./same";';
      const result = extractImports(content);
      expect(result.filter((i) => i === './same')).toHaveLength(1);
    });

    it('should extract require calls', () => {
      const content = 'const fs = require("fs");';
      const result = extractImports(content);
      expect(result).toContain('fs');
    });

    it('should handle empty content', () => {
      expect(extractImports('')).toEqual([]);
    });
  });

  describe('extractExports', () => {
    it('should extract named function exports', () => {
      const content = 'export function myFunc() {}';
      const result = extractExports(content);
      expect(result).toContain('myFunc');
    });

    it('should extract class exports', () => {
      const content = 'export class MyClass {}';
      const result = extractExports(content);
      expect(result).toContain('MyClass');
    });

    it('should extract interface exports', () => {
      const content = 'export interface MyInterface {}';
      const result = extractExports(content);
      expect(result).toContain('MyInterface');
    });

    it('should extract type exports', () => {
      const content = 'export type MyType = string;';
      const result = extractExports(content);
      expect(result).toContain('MyType');
    });

    it('should extract enum exports', () => {
      const content = 'export enum MyEnum { A, B }';
      const result = extractExports(content);
      expect(result).toContain('MyEnum');
    });

    it('should extract const exports', () => {
      const content = 'export const MY_CONST = 42;';
      const result = extractExports(content);
      expect(result).toContain('MY_CONST');
    });

    it('should extract named export lists', () => {
      const content = 'export { foo, bar, baz as qux };';
      const result = extractExports(content);
      expect(result).toContain('foo');
      expect(result).toContain('bar');
      expect(result).toContain('baz');
    });

    it('should deduplicate exports', () => {
      const content = 'export function foo() {}\nexport { foo };';
      const result = extractExports(content);
      expect(result.filter((e) => e === 'foo')).toHaveLength(1);
    });
  });

  describe('getChangedSymbols', () => {
    it('should extract function and class names', () => {
      const content = 'function helper() {}\nclass MyComponent {}';
      const result = getChangedSymbols(content);
      expect(result).toContain('helper');
      expect(result).toContain('MyComponent');
    });

    it('should extract interfaces and types', () => {
      const content = 'interface Config {}\ntype Result = string;';
      const result = getChangedSymbols(content);
      expect(result).toContain('Config');
      expect(result).toContain('Result');
    });

    it('should extract const and let declarations', () => {
      const content = 'const MAX = 100;\nlet count = 0;';
      const result = getChangedSymbols(content);
      expect(result).toContain('MAX');
      expect(result).toContain('count');
    });
  });

  describe('mergeChangeSets', () => {
    it('should merge multiple change sets', () => {
      const set1 = makeChangeSet([makeChange({ filePath: 'src/a.ts' })]);
      const set2 = makeChangeSet([makeChange({ filePath: 'src/b.ts' })]);
      const result = mergeChangeSets([set1, set2]);
      expect(result.changes).toHaveLength(2);
    });

    it('should merge changes to same file', () => {
      const set1 = makeChangeSet([makeChange({ filePath: 'src/a.ts', additions: 5 })]);
      const set2 = makeChangeSet([makeChange({ filePath: 'src/a.ts', additions: 3 })]);
      const result = mergeChangeSets([set1, set2]);
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0]!.additions).toBe(8);
    });

    it('should handle empty array', () => {
      const result = mergeChangeSets([]);
      expect(result.changes).toHaveLength(0);
    });
  });

  describe('filterByPattern', () => {
    it('should filter changes by glob pattern', () => {
      const set = makeChangeSet([
        makeChange({ filePath: 'src/core/foo.ts' }),
        makeChange({ filePath: 'src/utils/bar.ts' }),
        makeChange({ filePath: 'test/baz.ts' }),
      ]);
      const result = filterByPattern(set, 'src/**/*.ts');
      expect(result.changes).toHaveLength(2);
    });

    it('should preserve metadata when filtering', () => {
      const set: ChangeSet = {
        changes: [makeChange()],
        timestamp: 12345,
        branch: 'main',
        author: 'dev',
      };
      const result = filterByPattern(set, '**/*.ts');
      expect(result.timestamp).toBe(12345);
      expect(result.branch).toBe('main');
      expect(result.author).toBe('dev');
    });

    it('should return empty for non-matching pattern', () => {
      const set = makeChangeSet([makeChange({ filePath: 'src/foo.ts' })]);
      const result = filterByPattern(set, '*.js');
      expect(result.changes).toHaveLength(0);
    });
  });

  describe('ChangeSetBuilder class', () => {
    it('should build a ChangeSet with fluent API', () => {
      const result = new ChangeSetBuilder()
        .addChange(makeChange({ filePath: 'src/a.ts' }))
        .branch('feature')
        .author('dev')
        .description('test')
        .build();
      expect(result.changes).toHaveLength(1);
      expect(result.branch).toBe('feature');
      expect(result.author).toBe('dev');
      expect(result.description).toBe('test');
    });

    it('should support static methods', () => {
      const result = ChangeSetBuilder.fromFileList(['a.ts'], 'added');
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0]!.type).toBe('added');
    });
  });
});

describe('ImpactAnalyzer', () => {
  describe('analyze', () => {
    it('should analyze a simple change set', () => {
      const depMap = makeDepMap([
        ['src/consumer.ts', ['src/core/lib.ts']],
      ]);
      const analyzer = new ImpactAnalyzer(depMap);
      const changeSet = makeChangeSet([makeChange({ filePath: 'src/core/lib.ts' })]);
      const graph = analyzer.analyze(changeSet);

      expect(graph.rootChanges).toContain('src/core/lib.ts');
      expect(graph.nodes.has('src/core/lib.ts')).toBe(true);
    });

    it('should detect transitive dependencies', () => {
      const depMap = makeDepMap([
        ['src/a.ts', ['src/core.ts']],
        ['src/b.ts', ['src/a.ts']],
      ]);
      const analyzer = new ImpactAnalyzer(depMap);
      const changeSet = makeChangeSet([makeChange({ filePath: 'src/core.ts' })]);
      const graph = analyzer.analyze(changeSet);

      const impactedFiles = new Set<string>();
      for (const nodes of graph.nodes.values()) {
        for (const node of nodes) {
          impactedFiles.add(node.filePath);
        }
      }
      expect(impactedFiles).toContain('src/a.ts');
      expect(impactedFiles).toContain('src/b.ts');
    });

    it('should find test files', () => {
      const depMap = makeDepMap();
      const allFiles = ['src/foo.ts', 'src/foo.test.ts', 'src/bar.ts'];
      const analyzer = new ImpactAnalyzer(depMap, allFiles);
      const changeSet = makeChangeSet([makeChange({ filePath: 'src/foo.ts' })]);
      const graph = analyzer.analyze(changeSet);

      const nodes = graph.nodes.get('src/foo.ts') ?? [];
      const testNodes = nodes.filter((n) => n.impactType === ImpactType.TEST_COVERAGE);
      expect(testNodes.length).toBeGreaterThan(0);
      expect(testNodes.some((n) => n.filePath === 'src/foo.test.ts')).toBe(true);
    });
  });

  describe('traceDirectImpact', () => {
    it('should find files that directly import changed file', () => {
      const depMap = makeDepMap([
        ['src/a.ts', ['src/core.ts']],
        ['src/b.ts', ['src/core.ts']],
        ['src/c.ts', ['src/other.ts']],
      ]);
      const analyzer = new ImpactAnalyzer(depMap);
      const result = analyzer.traceDirectImpact(
        makeChange({ filePath: 'src/core.ts' }),
        depMap,
      );
      expect(result).toHaveLength(2);
      const paths = result.map((n) => n.filePath);
      expect(paths).toContain('src/a.ts');
      expect(paths).toContain('src/b.ts');
      expect(paths).not.toContain('src/c.ts');
    });

    it('should return empty for files with no dependents', () => {
      const depMap = makeDepMap([
        ['src/a.ts', ['src/b.ts']],
      ]);
      const analyzer = new ImpactAnalyzer(depMap);
      const result = analyzer.traceDirectImpact(
        makeChange({ filePath: 'src/c.ts' }),
        depMap,
      );
      expect(result).toHaveLength(0);
    });
  });

  describe('traceTransitiveImpact', () => {
    it('should find transitive dependencies via BFS', () => {
      const depMap = makeDepMap([
        ['src/a.ts', ['src/core.ts']],
        ['src/b.ts', ['src/a.ts']],
        ['src/c.ts', ['src/b.ts']],
      ]);
      const analyzer = new ImpactAnalyzer(depMap);
      const result = analyzer.traceTransitiveImpact('src/core.ts', depMap, 10);
      const paths = result.map((n) => n.filePath);
      expect(paths).toContain('src/a.ts');
      expect(paths).toContain('src/b.ts');
      expect(paths).toContain('src/c.ts');
    });

    it('should respect depth limit', () => {
      const depMap = makeDepMap([
        ['src/a.ts', ['src/core.ts']],
        ['src/b.ts', ['src/a.ts']],
        ['src/c.ts', ['src/b.ts']],
      ]);
      const analyzer = new ImpactAnalyzer(depMap);
      const result = analyzer.traceTransitiveImpact('src/core.ts', depMap, 1);
      const paths = result.map((n) => n.filePath);
      expect(paths).toContain('src/a.ts');
      expect(paths).not.toContain('src/c.ts');
    });

    it('should handle circular dependencies', () => {
      const depMap = makeDepMap([
        ['src/a.ts', ['src/b.ts']],
        ['src/b.ts', ['src/a.ts']],
      ]);
      const analyzer = new ImpactAnalyzer(depMap);
      const result = analyzer.traceTransitiveImpact('src/b.ts', depMap, 10);
      const paths = result.map((n) => n.filePath);
      expect(paths).toContain('src/a.ts');
      const countA = paths.filter((p) => p === 'src/a.ts').length;
      expect(countA).toBe(1);
    });
  });

  describe('findTestFiles', () => {
    it('should find test files by convention', () => {
      const analyzer = new ImpactAnalyzer(makeDepMap());
      const allFiles = ['src/utils.ts', 'src/utils.test.ts', 'src/utils.spec.ts', 'src/other.ts'];
      const result = analyzer.findTestFiles('src/utils.ts', allFiles);
      expect(result).toContain('src/utils.test.ts');
      expect(result).toContain('src/utils.spec.ts');
      expect(result).not.toContain('src/other.ts');
    });

    it('should return empty when no test files exist', () => {
      const analyzer = new ImpactAnalyzer(makeDepMap());
      const result = analyzer.findTestFiles('src/utils.ts', ['src/utils.ts', 'src/other.ts']);
      expect(result).toHaveLength(0);
    });
  });

  describe('calculateBlastRadius', () => {
    it('should count total impacted files', () => {
      const graph: ImpactGraph = {
        nodes: new Map([
          ['src/a.ts', [
            { filePath: 'src/b.ts', impactType: ImpactType.DIRECT_DEPENDENCY, depth: 1, reason: '', confidence: 0.9 },
            { filePath: 'src/c.ts', impactType: ImpactType.TRANSITIVE_DEPENDENCY, depth: 2, reason: '', confidence: 0.7 },
          ]],
        ]),
        edges: [],
        rootChanges: ['src/a.ts'],
      };
      const analyzer = new ImpactAnalyzer(makeDepMap());
      expect(analyzer.calculateBlastRadius(graph)).toBe(2);
    });

    it('should return 0 for graph with no impacts', () => {
      const graph: ImpactGraph = {
        nodes: new Map(),
        edges: [],
        rootChanges: [],
      };
      const analyzer = new ImpactAnalyzer(makeDepMap());
      expect(analyzer.calculateBlastRadius(graph)).toBe(0);
    });
  });

  describe('getImpactChain', () => {
    it('should find shortest path between two files', () => {
      const graph: ImpactGraph = {
        nodes: new Map(),
        edges: [
          { from: 'src/a.ts', to: 'src/b.ts', type: ImpactType.DIRECT_DEPENDENCY, weight: 0.9 },
          { from: 'src/b.ts', to: 'src/c.ts', type: ImpactType.TRANSITIVE_DEPENDENCY, weight: 0.7 },
        ],
        rootChanges: ['src/a.ts'],
      };
      const analyzer = new ImpactAnalyzer(makeDepMap());
      const chain = analyzer.getImpactChain('src/a.ts', 'src/c.ts', graph);
      expect(chain).toEqual(['src/a.ts', 'src/b.ts', 'src/c.ts']);
    });

    it('should return empty when no path exists', () => {
      const graph: ImpactGraph = {
        nodes: new Map(),
        edges: [
          { from: 'src/a.ts', to: 'src/b.ts', type: ImpactType.DIRECT_DEPENDENCY, weight: 0.9 },
        ],
        rootChanges: ['src/a.ts'],
      };
      const analyzer = new ImpactAnalyzer(makeDepMap());
      const chain = analyzer.getImpactChain('src/a.ts', 'src/z.ts', graph);
      expect(chain).toEqual([]);
    });

    it('should return single element when from equals to', () => {
      const graph: ImpactGraph = {
        nodes: new Map(),
        edges: [],
        rootChanges: [],
      };
      const analyzer = new ImpactAnalyzer(makeDepMap());
      const chain = analyzer.getImpactChain('src/a.ts', 'src/a.ts', graph);
      expect(chain).toEqual(['src/a.ts']);
    });
  });

  describe('findReExporters', () => {
    it('should find files that re-export from changed file', () => {
      const allExports = new Map([
        ['src/index.ts', ['src/core/lib.ts', 'src/utils/helper.ts']],
        ['src/barrel.ts', ['src/core/lib.ts']],
      ]);
      const analyzer = new ImpactAnalyzer(makeDepMap(), [], allExports);
      const result = analyzer.findReExporters('src/core/lib.ts', allExports);
      expect(result).toContain('src/index.ts');
      expect(result).toContain('src/barrel.ts');
    });

    it('should return empty when no re-exporters', () => {
      const allExports = new Map([
        ['src/index.ts', ['src/other.ts']],
      ]);
      const analyzer = new ImpactAnalyzer(makeDepMap(), [], allExports);
      const result = analyzer.findReExporters('src/core/lib.ts', allExports);
      expect(result).toHaveLength(0);
    });
  });
});

describe('RiskAssessor', () => {
  const makeAssessor = (areaMap?: Map<string, string>) => new RiskAssessor(areaMap);

  function makeSimpleGraph(): ImpactGraph {
    return {
      nodes: new Map([
        ['src/core/lib.ts', [
          { filePath: 'src/a.ts', impactType: ImpactType.DIRECT_DEPENDENCY, depth: 1, reason: '', confidence: 0.9 },
        ]],
      ]),
      edges: [
        { from: 'src/core/lib.ts', to: 'src/a.ts', type: ImpactType.DIRECT_DEPENDENCY, weight: 0.9 },
      ],
      rootChanges: ['src/core/lib.ts'],
    };
  }

  describe('assess', () => {
    it('should produce a full risk assessment', () => {
      const graph = makeSimpleGraph();
      const changeSet = makeChangeSet([makeChange({ filePath: 'src/core/lib.ts', exports: ['foo'] })]);
      const result = makeAssessor().assess(graph, changeSet);

      expect(result.overallRisk).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.factors.length).toBeGreaterThan(0);
      expect(result.estimatedEffort).toBeDefined();
    });

    it('should assess minimal risk for small changes with no dependencies', () => {
      const graph: ImpactGraph = { nodes: new Map(), edges: [], rootChanges: ['src/minor.ts'] };
      const changeSet = makeChangeSet([makeChange({ filePath: 'src/minor.ts', additions: 2, deletions: 1 })]);
      const result = makeAssessor().assess(graph, changeSet);
      expect(result.score).toBeLessThan(20);
    });

    it('should assess high risk for large core changes', () => {
      const graph: ImpactGraph = {
        nodes: new Map([
          ['src/core/engine.ts', [
            { filePath: 'src/consumer.ts', impactType: ImpactType.DIRECT_DEPENDENCY, depth: 1, reason: '', confidence: 0.9 },
          ]],
        ]),
        edges: [
          { from: 'src/core/engine.ts', to: 'src/consumer.ts', type: ImpactType.DIRECT_DEPENDENCY, weight: 0.9 },
        ],
        rootChanges: ['src/core/engine.ts'],
      };
      const changeSet = makeChangeSet([
        makeChange({
          filePath: 'src/core/engine.ts',
          additions: 150,
          deletions: 80,
          exports: ['main', 'config'],
        }),
      ]);
      const result = makeAssessor().assess(graph, changeSet);
      expect(result.score).toBeGreaterThan(30);
    });
  });

  describe('calculateRiskScore', () => {
    it('should score 0 for empty changes', () => {
      const graph: ImpactGraph = { nodes: new Map(), edges: [], rootChanges: [] };
      const changeSet = makeChangeSet([]);
      const result = makeAssessor().calculateRiskScore(graph, changeSet);
      expect(result).toBe(0);
    });

    it('should increase score for large changes', () => {
      const graph: ImpactGraph = { nodes: new Map(), edges: [], rootChanges: ['src/a.ts'] };
      const small = makeChangeSet([makeChange({ additions: 5, deletions: 2 })]);
      const large = makeChangeSet([makeChange({ additions: 150, deletions: 100 })]);
      const smallScore = makeAssessor().calculateRiskScore(graph, small);
      const largeScore = makeAssessor().calculateRiskScore(graph, large);
      expect(largeScore).toBeGreaterThan(smallScore);
    });

    it('should increase score for core module changes', () => {
      const graph: ImpactGraph = { nodes: new Map(), edges: [], rootChanges: [] };
      const coreChange = makeChangeSet([makeChange({ filePath: 'src/core/engine.ts', additions: 10, deletions: 5 })]);
      const utilChange = makeChangeSet([makeChange({ filePath: 'src/feature/button.ts', additions: 10, deletions: 5 })]);
      const coreScore = makeAssessor().calculateRiskScore(graph, coreChange);
      const utilScore = makeAssessor().calculateRiskScore(graph, utilChange);
      expect(coreScore).toBeGreaterThan(utilScore);
    });

    it('should cap score at 100', () => {
      const graph: ImpactGraph = { nodes: new Map(), edges: [], rootChanges: [] };
      const massive = makeChangeSet([
        makeChange({
          filePath: 'src/core/engine.ts',
          additions: 500,
          deletions: 300,
          exports: ['a', 'b', 'c'],
        }),
        makeChange({
          filePath: 'src/core/config.ts',
          additions: 200,
          deletions: 100,
          exports: ['d'],
        }),
      ]);
      const score = makeAssessor().calculateRiskScore(graph, massive);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('identifyRiskFactors', () => {
    it('should identify core module change factor', () => {
      const graph: ImpactGraph = { nodes: new Map(), edges: [], rootChanges: [] };
      const changeSet = makeChangeSet([makeChange({ filePath: 'src/core/engine.ts' })]);
      const factors = makeAssessor().identifyRiskFactors(graph, changeSet);
      expect(factors.some((f) => f.name === 'Core module change')).toBe(true);
    });

    it('should identify interface/type change factor', () => {
      const graph: ImpactGraph = { nodes: new Map(), edges: [], rootChanges: [] };
      const changeSet = makeChangeSet([makeChange({ exports: ['MyInterface'] })]);
      const factors = makeAssessor().identifyRiskFactors(graph, changeSet);
      expect(factors.some((f) => f.name === 'Interface/type change')).toBe(true);
    });

    it('should identify large change factor', () => {
      const graph: ImpactGraph = { nodes: new Map(), edges: [], rootChanges: [] };
      const changeSet = makeChangeSet([makeChange({ additions: 150, deletions: 100 })]);
      const factors = makeAssessor().identifyRiskFactors(graph, changeSet);
      expect(factors.some((f) => f.name === 'Large change')).toBe(true);
    });

    it('should identify cross-cutting concern factor', () => {
      const graph: ImpactGraph = { nodes: new Map(), edges: [], rootChanges: [] };
      const changeSet = makeChangeSet([makeChange({ filePath: 'src/utils/helpers.ts' })]);
      const factors = makeAssessor().identifyRiskFactors(graph, changeSet);
      expect(factors.some((f) => f.name === 'Cross-cutting concern')).toBe(true);
    });

    it('should identify configuration change factor', () => {
      const graph: ImpactGraph = { nodes: new Map(), edges: [], rootChanges: [] };
      const changeSet = makeChangeSet([makeChange({ filePath: 'tsconfig.json' })]);
      const factors = makeAssessor().identifyRiskFactors(graph, changeSet);
      expect(factors.some((f) => f.name === 'Configuration change')).toBe(true);
    });

    it('should identify no test coverage factor', () => {
      const graph: ImpactGraph = { nodes: new Map(), edges: [], rootChanges: [] };
      const changeSet = makeChangeSet([makeChange({ filePath: 'src/no-tests.ts' })]);
      const factors = makeAssessor().identifyRiskFactors(graph, changeSet);
      expect(factors.some((f) => f.name === 'No test coverage')).toBe(true);
    });

    it('should not duplicate same factor for same file', () => {
      const graph: ImpactGraph = { nodes: new Map(), edges: [], rootChanges: [] };
      const changeSet = makeChangeSet([
        makeChange({ filePath: 'src/core/a.ts' }),
      ]);
      const factors = makeAssessor().identifyRiskFactors(graph, changeSet);
      const coreFactors = factors.filter(
        (f) => f.name === 'Core module change' && f.description.includes('src/core/a.ts'),
      );
      expect(coreFactors.length).toBe(1);
    });
  });

  describe('suggestTestStrategy', () => {
    it('should suggest must-test strategies for high risk', () => {
      const assessment = {
        overallRisk: 'high' as const,
        score: 75,
        factors: [
          { name: 'Core module change', description: 'Core modified', severity: 'high' as const, weight: 0.9, mitigation: 'test' },
        ],
        affectedAreas: ['core'],
        recommendedTests: ['src/core.test.ts'],
        estimatedEffort: { minHours: 1, maxHours: 3, confidence: 0.8, breakdown: {} },
      };
      const strategies = makeAssessor().suggestTestStrategy(assessment);
      expect(strategies.some((s) => s.priority === 'must')).toBe(true);
    });

    it('should suggest integration testing for high scores', () => {
      const assessment = {
        overallRisk: 'high' as const,
        score: 75,
        factors: [],
        affectedAreas: ['core', 'api'],
        recommendedTests: [],
        estimatedEffort: { minHours: 1, maxHours: 3, confidence: 0.8, breakdown: {} },
      };
      const strategies = makeAssessor().suggestTestStrategy(assessment);
      expect(strategies.some((s) => s.type === 'integration')).toBe(true);
    });

    it('should suggest e2e testing for very high scores', () => {
      const assessment = {
        overallRisk: 'critical' as const,
        score: 85,
        factors: [],
        affectedAreas: ['core'],
        recommendedTests: [],
        estimatedEffort: { minHours: 1, maxHours: 3, confidence: 0.8, breakdown: {} },
      };
      const strategies = makeAssessor().suggestTestStrategy(assessment);
      expect(strategies.some((s) => s.type === 'e2e')).toBe(true);
    });

    it('should suggest minimal testing for low risk', () => {
      const assessment = {
        overallRisk: 'minimal' as const,
        score: 10,
        factors: [],
        affectedAreas: [],
        recommendedTests: [],
        estimatedEffort: { minHours: 0.5, maxHours: 1, confidence: 0.9, breakdown: {} },
      };
      const strategies = makeAssessor().suggestTestStrategy(assessment);
      expect(strategies.some((s) => s.priority === 'could')).toBe(true);
    });
  });

  describe('estimateEffort', () => {
    it('should estimate higher effort for higher scores', () => {
      const low = {
        overallRisk: 'low' as const,
        score: 20,
        factors: [],
        affectedAreas: ['one'],
        recommendedTests: [],
        estimatedEffort: { minHours: 0, maxHours: 0, confidence: 0, breakdown: {} },
      };
      const high = {
        overallRisk: 'high' as const,
        score: 75,
        factors: [
          { name: 'Core change', description: 'core', severity: 'high' as const, weight: 0.9, mitigation: 'test' },
        ],
        affectedAreas: ['core', 'api', 'utils'],
        recommendedTests: ['a.test.ts'],
        estimatedEffort: { minHours: 0, maxHours: 0, confidence: 0, breakdown: {} },
      };
      const lowEffort = makeAssessor().estimateEffort(low);
      const highEffort = makeAssessor().estimateEffort(high);
      expect(highEffort.maxHours).toBeGreaterThan(lowEffort.maxHours);
    });

    it('should include breakdown', () => {
      const assessment = {
        overallRisk: 'medium' as const,
        score: 50,
        factors: [
          { name: 'Core change', description: 'core', severity: 'high' as const, weight: 0.9, mitigation: 'test' },
        ],
        affectedAreas: ['core'],
        recommendedTests: [],
        estimatedEffort: { minHours: 0, maxHours: 0, confidence: 0, breakdown: {} },
      };
      const effort = makeAssessor().estimateEffort(assessment);
      expect(effort.breakdown).toHaveProperty('unit-testing');
      expect(effort.breakdown).toHaveProperty('integration-testing');
      expect(effort.breakdown).toHaveProperty('code-review');
    });
  });

  describe('classifyChange', () => {
    it('should classify core module deletions as critical', () => {
      const change = makeChange({
        filePath: 'src/core/engine.ts',
        type: 'deleted',
        exports: ['main'],
        additions: 0,
        deletions: 200,
      });
      expect(makeAssessor().classifyChange(change)).toBe('critical');
    });

    it('should classify small utility changes as low or minimal', () => {
      const change = makeChange({
        filePath: 'src/feature/button.ts',
        additions: 5,
        deletions: 2,
      });
      const level = makeAssessor().classifyChange(change);
      expect(['low', 'minimal']).toContain(level);
    });

    it('should classify cross-cutting changes as high or critical', () => {
      const change = makeChange({
        filePath: 'src/utils/logger.ts',
        type: 'deleted',
        exports: ['Logger'],
        additions: 0,
        deletions: 50,
      });
      const level = makeAssessor().classifyChange(change);
      expect(['high', 'critical']).toContain(level);
    });

    it('should classify configuration changes', () => {
      const change = makeChange({
        filePath: 'webpack.config.ts',
        additions: 20,
        deletions: 10,
      });
      const level = makeAssessor().classifyChange(change);
      expect(['low', 'medium', 'high']).toContain(level);
    });

    it('should classify minimal changes', () => {
      const change = makeChange({
        filePath: 'src/feature/small.ts',
        additions: 1,
        deletions: 0,
      });
      expect(makeAssessor().classifyChange(change)).toBe('minimal');
    });
  });

  describe('getAffectedAreas', () => {
    it('should map files to business areas', () => {
      const areaMap = new Map([
        ['src/core/lib.ts', 'infrastructure'],
        ['src/api/routes.ts', 'api'],
      ]);
      const graph: ImpactGraph = {
        nodes: new Map([
          ['src/core/lib.ts', [
            { filePath: 'src/api/routes.ts', impactType: ImpactType.DIRECT_DEPENDENCY, depth: 1, reason: '', confidence: 0.9 },
          ]],
        ]),
        edges: [],
        rootChanges: ['src/core/lib.ts'],
      };
      const result = makeAssessor(areaMap).getAffectedAreas(graph, areaMap);
      expect(result).toContain('infrastructure');
      expect(result).toContain('api');
    });

    it('should return empty when no area map provided', () => {
      const graph: ImpactGraph = {
        nodes: new Map(),
        edges: [],
        rootChanges: ['src/unknown.ts'],
      };
      const result = makeAssessor().getAffectedAreas(graph, new Map());
      expect(result).toHaveLength(0);
    });
  });
});

describe('Edge cases', () => {
  it('should handle empty change set', () => {
    const analyzer = new ImpactAnalyzer(makeDepMap());
    const graph = analyzer.analyze(makeChangeSet([]));
    expect(graph.rootChanges).toHaveLength(0);
    expect(graph.nodes.size).toBe(0);
    expect(graph.edges).toHaveLength(0);

    const assessor = new RiskAssessor();
    const assessment = assessor.assess(graph, makeChangeSet([]));
    expect(assessment.score).toBe(0);
    expect(assessment.overallRisk).toBe('minimal');
  });

  it('should handle no dependencies', () => {
    const analyzer = new ImpactAnalyzer(makeDepMap());
    const changeSet = makeChangeSet([makeChange({ filePath: 'src/isolated.ts' })]);
    const graph = analyzer.analyze(changeSet);
    expect(graph.rootChanges).toContain('src/isolated.ts');
    expect(analyzer.calculateBlastRadius(graph)).toBe(0);
  });

  it('should handle circular dependencies in analysis', () => {
    const depMap = makeDepMap([
      ['src/a.ts', ['src/b.ts']],
      ['src/b.ts', ['src/c.ts']],
      ['src/c.ts', ['src/a.ts']],
    ]);
    const analyzer = new ImpactAnalyzer(depMap);
    const changeSet = makeChangeSet([makeChange({ filePath: 'src/a.ts' })]);
    const graph = analyzer.analyze(changeSet);
    expect(graph.rootChanges).toContain('src/a.ts');
    const impacted = new Set<string>();
    for (const nodes of graph.nodes.values()) {
      for (const node of nodes) {
        impacted.add(node.filePath);
      }
    }
    expect(impacted).toContain('src/b.ts');
    expect(impacted).toContain('src/c.ts');
  });

  it('should handle deeply nested dependency chains', () => {
    const entries: Array<[string, string[]]> = [];
    for (let i = 0; i < 20; i++) {
      entries.push([`src/level${i}.ts`, [`src/level${i - 1}.ts`]]);
    }
    const depMap = makeDepMap(entries);
    const analyzer = new ImpactAnalyzer(depMap);
    const result = analyzer.traceTransitiveImpact('src/level-1.ts', depMap, 20);
    expect(result.length).toBeGreaterThan(10);
  });

  it('should handle deeply nested impact chain', () => {
    const edges: Array<{ from: string; to: string; type: ImpactType; weight: number }> = [];
    for (let i = 0; i < 10; i++) {
      edges.push({
        from: `src/${i}.ts`,
        to: `src/${i + 1}.ts`,
        type: ImpactType.DIRECT_DEPENDENCY,
        weight: 0.9,
      });
    }
    const graph: ImpactGraph = {
      nodes: new Map(),
      edges,
      rootChanges: ['src/0.ts'],
    };
    const analyzer = new ImpactAnalyzer(makeDepMap());
    const chain = analyzer.getImpactChain('src/0.ts', 'src/9.ts', graph);
    expect(chain).toHaveLength(10);
    expect(chain[0]).toBe('src/0.ts');
    expect(chain[9]).toBe('src/9.ts');
  });

  it('should handle merge of overlapping change sets', () => {
    const set1 = makeChangeSet([
      makeChange({ filePath: 'src/a.ts', additions: 5, exports: ['foo'] }),
    ]);
    const set2 = makeChangeSet([
      makeChange({ filePath: 'src/a.ts', additions: 3, exports: ['bar'] }),
    ]);
    const merged = mergeChangeSets([set1, set2]);
    expect(merged.changes).toHaveLength(1);
    expect(merged.changes[0]!.additions).toBe(8);
    expect(merged.changes[0]!.exports).toContain('foo');
    expect(merged.changes[0]!.exports).toContain('bar');
  });

  it('should handle risk assessment with no factors', () => {
    const graph: ImpactGraph = { nodes: new Map(), edges: [], rootChanges: [] };
    const changeSet = makeChangeSet([makeChange({ filePath: 'docs/readme.md', additions: 1, deletions: 0 })]);
    const result = new RiskAssessor().assess(graph, changeSet);
    expect(result.score).toBeLessThan(20);
  });

  it('should deduplicate test strategies', () => {
    const assessment = {
      overallRisk: 'high' as const,
      score: 75,
      factors: [
        { name: 'f1', description: 'd1', severity: 'high' as const, weight: 0.9, mitigation: 'm1' },
        { name: 'f2', description: 'd2', severity: 'high' as const, weight: 0.8, mitigation: 'm2' },
      ],
      affectedAreas: ['core'],
      recommendedTests: [],
      estimatedEffort: { minHours: 1, maxHours: 3, confidence: 0.8, breakdown: {} },
    };
    const strategies = new RiskAssessor().suggestTestStrategy(assessment);
    const keys = strategies.map((s) => `${s.priority}:${s.type}:${s.target}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
