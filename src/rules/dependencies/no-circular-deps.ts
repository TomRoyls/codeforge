/**
 * @fileoverview Circular dependency detection rule for CodeForge
 * Detects circular dependencies between files by building and analyzing a dependency graph
 * @module rules/dependencies/no-circular-deps
 */

import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js';
import { extractLocation } from '../../ast/location-utils.js';

interface ImportInfo {
  readonly sourceFile: string;
  readonly modulePath: string;
  readonly location: SourceLocation;
}

interface DependencyNode {
  readonly filePath: string;
  readonly imports: Set<string>;
  readonly importDetails: Map<string, ImportInfo>;
}

interface DependencyGraph {
  readonly nodes: Map<string, DependencyNode>;
}

interface CircularDependency {
  readonly cycle: readonly string[];
  readonly location: SourceLocation;
}

interface CircularDepsOptions {
  readonly maxDepth?: number;
  readonly ignoreTypeOnly?: boolean;
  readonly exclude?: readonly string[];
}

class DependencyGraphBuilder {
  private readonly graph: DependencyGraph = { nodes: new Map() };

  addFile(
    filePath: string,
    imports: readonly ImportInfo[]
  ): void {
    const node: DependencyNode = {
      filePath,
      imports: new Set(imports.map((i) => i.modulePath)),
      importDetails: new Map(imports.map((i) => [i.modulePath, i])),
    };
    this.graph.nodes.set(filePath, node);
  }

  getGraph(): DependencyGraph {
    return this.graph;
  }

  detectCycles(maxDepth: number = 50): CircularDependency[] {
    const cycles: CircularDependency[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const filePath of this.graph.nodes.keys()) {
      this.detectCyclesFromNode(
        filePath,
        [],
        visited,
        recursionStack,
        cycles,
        maxDepth
      );
    }

    return this.deduplicateCycles(cycles);
  }

  private detectCyclesFromNode(
    currentPath: string,
    path: string[],
    visited: Set<string>,
    recursionStack: Set<string>,
    cycles: CircularDependency[],
    maxDepth: number
  ): void {
    if (path.length > maxDepth) {
      return;
    }

    visited.add(currentPath);
    recursionStack.add(currentPath);
    path.push(currentPath);

    const node = this.graph.nodes.get(currentPath);
    if (node) {
      for (const dependency of node.imports) {
        if (!visited.has(dependency)) {
          this.detectCyclesFromNode(
            dependency,
            [...path],
            visited,
            recursionStack,
            cycles,
            maxDepth
          );
        } else if (recursionStack.has(dependency)) {
          const cycleStartIndex = path.indexOf(dependency);
          const cycle = [...path.slice(cycleStartIndex), dependency];
          
          const importDetail = node.importDetails.get(dependency);
          if (importDetail) {
            cycles.push({
              cycle,
              location: importDetail.location,
            });
          }
        }
      }
    }

    path.pop();
    recursionStack.delete(currentPath);
  }

  private deduplicateCycles(cycles: CircularDependency[]): CircularDependency[] {
    const seen = new Set<string>();
    const unique: CircularDependency[] = [];

    for (const cycle of cycles) {
      const normalized = this.normalizeCycle(cycle.cycle);
      const key = normalized.join('->');

      if (!seen.has(key)) {
        seen.add(key);
        unique.push(cycle);
      }
    }

    return unique;
  }

  private normalizeCycle(cycle: readonly string[]): string[] {
    const withoutLast = cycle.slice(0, -1);
    let minIndex = 0;

    for (let i = 1; i < withoutLast.length; i++) {
      const current = withoutLast[i];
      const min = withoutLast[minIndex];
      if (current !== undefined && min !== undefined && current < min) {
        minIndex = i;
      }
    }

    const minElement = withoutLast[minIndex];
    if (minElement === undefined) {
      return [...withoutLast] as string[];
    }

    const rotated = [
      ...withoutLast.slice(minIndex),
      ...withoutLast.slice(0, minIndex),
      minElement,
    ];

    return rotated.filter((item): item is string => item !== undefined);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImports(ast: any, filePath: string): ImportInfo[] {
  const imports: ImportInfo[] = [];

  if (!ast || typeof ast !== 'object') {
    return imports;
  }

  const body = ast.body ?? ast.program?.body ?? [];
  
  for (const node of body) {
    const importInfo = extractImportFromNode(node, filePath);
    if (importInfo) {
      imports.push(importInfo);
    }
  }

  return imports;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImportFromNode(node: any, filePath: string): ImportInfo | null {
  if (!node || typeof node !== 'object') {
    return null;
  }

  const location = extractLocation(node);

  if (node.type === 'ImportDeclaration' && node.source?.value) {
    return {
      sourceFile: filePath,
      modulePath: node.source.value,
      location,
    };
  }

  if (
    (node.type === 'ExportNamedDeclaration' ||
      node.type === 'ExportAllDeclaration') &&
    node.source?.value
  ) {
    return {
      sourceFile: filePath,
      modulePath: node.source.value,
      location,
    };
  }

  if (
    node.type === 'VariableDeclaration' ||
    node.type === 'ExpressionStatement'
  ) {
    const requireCall = findRequireCall(node);
    if (requireCall) {
      return {
        sourceFile: filePath,
        modulePath: requireCall.argument,
        location,
      };
    }
  }

  if (node.type === 'ExpressionStatement' && isDynamicImport(node.expression)) {
    const importArg = getDynamicImportArgument(node.expression);
    if (importArg) {
      return {
        sourceFile: filePath,
        modulePath: importArg,
        location,
      };
    }
  }

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findRequireCall(node: any): { argument: string } | null {
  if (!node || typeof node !== 'object') {
    return null;
  }

  if (node.type === 'VariableDeclaration') {
    for (const decl of node.declarations ?? []) {
      if (decl.init && isRequireCall(decl.init)) {
        const arg = decl.init.arguments?.[0]?.value;
        if (typeof arg === 'string') {
          return { argument: arg };
        }
      }
    }
  }

  if (node.type === 'ExpressionStatement' && isRequireCall(node.expression)) {
    const arg = node.expression.arguments?.[0]?.value;
    if (typeof arg === 'string') {
      return { argument: arg };
    }
  }

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRequireCall(node: any): boolean {
  return (
    node.type === 'CallExpression' &&
    node.callee?.type === 'Identifier' &&
    node.callee.name === 'require'
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isDynamicImport(node: any): boolean {
  return node?.type === 'CallExpression' && node?.callee?.type === 'Import';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDynamicImportArgument(node: any): string | null {
  if (isDynamicImport(node) && node.arguments?.[0]?.type === 'StringLiteral') {
    const val = node.arguments[0].value;
    return typeof val === 'string' ? val : null;
  }
  return null;
}

/**
 * Rule: no-circular-deps
 * Detects circular dependencies between files by building a dependency graph
 */
export const noCircularDepsRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    docs: {
      description:
        'Disallow circular dependencies between modules. Circular dependencies can lead to runtime issues, make code harder to understand, and can cause problems with bundlers and tree-shaking.',
      category: 'dependencies',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-circular-deps',
    },
    schema: [
      {
        type: 'object',
        properties: {
          maxDepth: {
            type: 'number',
            minimum: 1,
            maximum: 100,
            default: 50,
          },
          ignoreTypeOnly: {
            type: 'boolean',
            default: false,
          },
          exclude: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context: RuleContext): RuleVisitor {
    const rawOptions = context.config.options;
    const options: CircularDepsOptions = (
      Array.isArray(rawOptions) && rawOptions.length > 0
        ? rawOptions[0]
        : {}
    ) as CircularDepsOptions;
    const maxDepth = options.maxDepth ?? 50;
    const filePath = context.getFilePath();

    const fileImports = new Map<string, ImportInfo[]>();
    const builder = new DependencyGraphBuilder();

    return {
      Program(node: unknown): void {
        const ast = context.getAST() ?? node;
        const imports = extractImports(ast, filePath);
        fileImports.set(filePath, imports);
        builder.addFile(filePath, imports);
      },

      ImportDeclaration(node: unknown): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const n = node as any;
        if (n.source?.value) {
          const imports = fileImports.get(filePath) ?? [];
          const modulePath = n.source.value;
          
          const existingImports = fileImports.get(modulePath);
          if (existingImports) {
            const hasCycle = existingImports.some(
              (imp) => imp.modulePath === filePath
            );
            
            if (hasCycle) {
              context.report({
                node,
                message: `Circular dependency detected: ${filePath} -> ${modulePath} -> ${filePath}`,
                loc: extractLocation(n),
              });
            }
          }
          
          fileImports.set(filePath, [
            ...imports,
            {
              sourceFile: filePath,
              modulePath,
              location: extractLocation(n),
            },
          ]);
        }
      },

      CallExpression(node: unknown): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const n = node as any;
        
        if (isRequireCall(n)) {
          const modulePath = n.arguments?.[0]?.value;
          if (typeof modulePath === 'string') {
            const imports = fileImports.get(filePath) ?? [];
            fileImports.set(filePath, [
              ...imports,
              {
                sourceFile: filePath,
                modulePath,
                location: extractLocation(n),
              },
            ]);
          }
        }
      },

      'Program:exit'(): void {
        const cycles = builder.detectCycles(maxDepth);
        
        for (const cycle of cycles) {
          const cyclePath = cycle.cycle.join(' -> ');
          context.report({
            message: `Circular dependency detected: ${cyclePath}`,
            loc: cycle.location,
          });
        }
      },
    };
  },
};

export default noCircularDepsRule;
