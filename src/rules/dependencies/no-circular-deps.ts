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
} from '../../plugins/types.js'
import { extractLocation } from '../../ast/location-utils.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface ImportInfo {
  readonly sourceFile: string
  readonly modulePath: string
  readonly location: SourceLocation
}

interface DependencyNode {
  readonly filePath: string
  readonly imports: Set<string>
  readonly importDetails: Map<string, ImportInfo>
}

interface DependencyGraph {
  readonly nodes: Map<string, DependencyNode>
}

interface CircularDependency {
  readonly cycle: readonly string[]
  readonly location: SourceLocation
}

interface CircularDepsOptions {
  readonly maxDepth?: number
  readonly ignoreTypeOnly?: boolean
  readonly exclude?: readonly string[]
}

class DependencyGraphBuilder {
  private readonly graph: DependencyGraph = { nodes: new Map() }

  addFile(filePath: string, imports: readonly ImportInfo[]): void {
    const node: DependencyNode = {
      filePath,
      imports: new Set(imports.map((i) => i.modulePath)),
      importDetails: new Map(imports.map((i) => [i.modulePath, i])),
    }
    this.graph.nodes.set(filePath, node)
  }

  getGraph(): DependencyGraph {
    return this.graph
  }

  detectCycles(maxDepth: number = 50): CircularDependency[] {
    const cycles: CircularDependency[] = []
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    for (const filePath of this.graph.nodes.keys()) {
      this.detectCyclesFromNode(filePath, [], visited, recursionStack, cycles, maxDepth)
    }

    return this.deduplicateCycles(cycles)
  }

  private detectCyclesFromNode(
    currentPath: string,
    path: string[],
    visited: Set<string>,
    recursionStack: Set<string>,
    cycles: CircularDependency[],
    maxDepth: number,
  ): void {
    if (path.length > maxDepth) {
      return
    }

    visited.add(currentPath)
    recursionStack.add(currentPath)
    path.push(currentPath)

    const node = this.graph.nodes.get(currentPath)
    if (node) {
      for (const dependency of node.imports) {
        if (!visited.has(dependency)) {
          this.detectCyclesFromNode(
            dependency,
            [...path],
            visited,
            recursionStack,
            cycles,
            maxDepth,
          )
        } else if (recursionStack.has(dependency)) {
          const cycleStartIndex = path.indexOf(dependency)
          const cycle = [...path.slice(cycleStartIndex), dependency]

          const importDetail = node.importDetails.get(dependency)
          if (importDetail) {
            cycles.push({
              cycle,
              location: importDetail.location,
            })
          }
        }
      }
    }

    path.pop()
    recursionStack.delete(currentPath)
  }

  private deduplicateCycles(cycles: CircularDependency[]): CircularDependency[] {
    const seen = new Set<string>()
    const unique: CircularDependency[] = []

    for (const cycle of cycles) {
      const normalized = this.normalizeCycle(cycle.cycle)
      const key = normalized.join('->')

      if (!seen.has(key)) {
        seen.add(key)
        unique.push(cycle)
      }
    }

    return unique
  }

  private normalizeCycle(cycle: readonly string[]): string[] {
    const withoutLast = cycle.slice(0, -1)
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
}

function extractImports(ast: unknown, filePath: string): ImportInfo[] {
  const imports: ImportInfo[] = []

  if (!ast || typeof ast !== 'object') {
    return imports
  }

  const a = ast as Record<string, unknown>
  const body = Array.isArray(a.body)
    ? a.body
    : Array.isArray((a.program as Record<string, unknown> | undefined)?.body)
      ? ((a.program as Record<string, unknown>).body as unknown[])
      : []

  for (const node of body) {
    const importInfo = extractImportFromNode(node, filePath)
    if (importInfo) {
      imports.push(importInfo)
    }
  }

  return imports
}

function extractImportFromNode(node: unknown, filePath: string): ImportInfo | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  const location = extractLocation(node)
  const n = node as Record<string, unknown>

  if (n.type === 'ImportDeclaration') {
    const sourceNode = n.source as Record<string, unknown> | undefined
    if (sourceNode?.value && typeof sourceNode.value === 'string') {
      return {
        sourceFile: filePath,
        modulePath: sourceNode.value,
        location,
      }
    }
  }

  if (n.type === 'ExportNamedDeclaration' || n.type === 'ExportAllDeclaration') {
    const sourceNode = n.source as Record<string, unknown> | undefined
    if (sourceNode?.value && typeof sourceNode.value === 'string') {
      return {
        sourceFile: filePath,
        modulePath: sourceNode.value,
        location,
      }
    }
  }

  if (n.type === 'VariableDeclaration' || n.type === 'ExpressionStatement') {
    const requireCall = findRequireCall(n)
    if (requireCall) {
      return {
        sourceFile: filePath,
        modulePath: requireCall.argument,
        location,
      }
    }
  }

  if (n.type === 'ExpressionStatement') {
    const expression = n.expression
    if (isDynamicImport(expression)) {
      const importArg = getDynamicImportArgument(expression)
      if (importArg) {
        return {
          sourceFile: filePath,
          modulePath: importArg,
          location,
        }
      }
    }
  }

  return null
}

function findRequireCall(node: unknown): { argument: string } | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>

  if (n.type === 'VariableDeclaration') {
    const declarations = n.declarations
    if (Array.isArray(declarations)) {
      for (const decl of declarations) {
        if (!decl || typeof decl !== 'object') continue
        const declNode = decl as Record<string, unknown>
        const init = declNode.init
        if (init && isRequireCall(init)) {
          const initNode = init as Record<string, unknown>
          const arguments_ = initNode.arguments as unknown[] | undefined
          const arg0 =
            Array.isArray(arguments_) && arguments_.length > 0
              ? (arguments_[0] as Record<string, unknown> | undefined)
              : undefined
          if (arg0?.value && typeof arg0.value === 'string') {
            return { argument: arg0.value }
          }
        }
      }
    }
  }

  if (n.type === 'ExpressionStatement') {
    const expression = n.expression
    if (expression && isRequireCall(expression)) {
      const exprNode = expression as Record<string, unknown>
      const arguments_ = exprNode.arguments as unknown[] | undefined
      const arg0 =
        Array.isArray(arguments_) && arguments_.length > 0
          ? (arguments_[0] as Record<string, unknown> | undefined)
          : undefined
      if (arg0?.value && typeof arg0.value === 'string') {
        return { argument: arg0.value }
      }
    }
  }

  return null
}

function isRequireCall(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as Record<string, unknown> | undefined

  return n.type === 'CallExpression' && callee?.type === 'Identifier' && callee.name === 'require'
}

function isDynamicImport(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as Record<string, unknown> | undefined

  return n.type === 'CallExpression' && callee?.type === 'Import'
}

function getDynamicImportArgument(node: unknown): string | null {
  if (!isDynamicImport(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  const arguments_ = n.arguments as unknown[] | undefined
  const arg0 =
    Array.isArray(arguments_) && arguments_.length > 0
      ? (arguments_[0] as Record<string, unknown> | undefined)
      : undefined

  if (arg0?.type === 'StringLiteral' && arg0.value && typeof arg0.value === 'string') {
    return arg0.value
  }

  return null
}

/**
 * Rule: no-circular-deps
 * Detects circular dependencies between files by building a dependency graph
 */
export const noCircularDepsRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'error',
    fixable: 'code',
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
    const options = extractRuleOptions<CircularDepsOptions>(context.config.options, {
      maxDepth: 50,
      ignoreTypeOnly: false,
      exclude: [],
    })
    const maxDepth = options.maxDepth ?? 50
    const filePath = context.getFilePath()

    const fileImports = new Map<string, ImportInfo[]>()
    const builder = new DependencyGraphBuilder()

    return {
      Program(node: unknown): void {
        const ast = context.getAST() ?? node
        const imports = extractImports(ast, filePath)
        fileImports.set(filePath, imports)
        builder.addFile(filePath, imports)
      },

      ImportDeclaration(node: unknown): void {
        const n = node as Record<string, unknown>
        const sourceNode = n.source as Record<string, unknown> | undefined
        if (sourceNode?.value && typeof sourceNode.value === 'string') {
          const imports = fileImports.get(filePath) ?? []
          const modulePath = sourceNode.value

          const existingImports = fileImports.get(modulePath)
          if (existingImports) {
            const hasCycle = existingImports.some((imp) => imp.modulePath === filePath)

            if (hasCycle) {
              context.report({
                node,
                message: `Circular dependency detected: ${filePath} -> ${modulePath} -> ${filePath}`,
                loc: extractLocation(n),
              })
            }
          }

          fileImports.set(filePath, [
            ...imports,
            {
              sourceFile: filePath,
              modulePath,
              location: extractLocation(n),
            },
          ])
        }
      },

      CallExpression(node: unknown): void {
        const n = node as Record<string, unknown>

        if (isRequireCall(n)) {
          const arguments_ = n.arguments as unknown[] | undefined
          const arg0 =
            Array.isArray(arguments_) && arguments_.length > 0
              ? (arguments_[0] as Record<string, unknown> | undefined)
              : undefined
          if (arg0?.value && typeof arg0.value === 'string') {
            const modulePath = arg0.value
            const imports = fileImports.get(filePath) ?? []
            fileImports.set(filePath, [
              ...imports,
              {
                sourceFile: filePath,
                modulePath,
                location: extractLocation(n),
              },
            ])
          }
        }
      },

      'Program:exit'(): void {
        const cycles = builder.detectCycles(maxDepth)

        for (const cycle of cycles) {
          const cyclePath = cycle.cycle.join(' -> ')
          context.report({
            message: `Circular dependency detected: ${cyclePath}`,
            loc: cycle.location,
          })
        }
      },
    }
  },
}

export default noCircularDepsRule
