/**
 * @file Circular dependency detection rule for CodeForge
 * Detects circular dependencies between files by building and analyzing a dependency graph
 * @module rules/dependencies/no-circular-deps
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'
import { extractRuleOptions } from '../../utils/options-helpers.js'

interface ImportInfo {
  readonly location: SourceLocation
  readonly modulePath: string
  readonly sourceFile: string
}

interface DependencyNode {
  readonly filePath: string
  readonly importDetails: Map<string, ImportInfo>
  readonly imports: Set<string>
}

interface DependencyGraph {
  readonly nodes: Map<string, DependencyNode>
}

interface CircularDependency {
  readonly cycle: readonly string[]
  readonly location: SourceLocation
}

interface CircularDepsOptions {
  readonly exclude?: readonly string[]
  readonly ignoreTypeOnly?: boolean
  readonly maxDepth?: number
}

class DependencyGraphBuilder {
  private readonly graph: DependencyGraph = { nodes: new Map() }

  addFile(filePath: string, imports: readonly ImportInfo[]): void {
    const node: DependencyNode = {
      filePath,
      importDetails: new Map(imports.map((i) => [i.modulePath, i])),
      imports: new Set(imports.map((i) => i.modulePath)),
    }
    this.graph.nodes.set(filePath, node)
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

  getGraph(): DependencyGraph {
    return this.graph
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

  const a = toASTNode(ast)
  if (!a) return imports

  const programBody = toASTNode(a.program)
  const body = Array.isArray(a.body)
    ? a.body
    : Array.isArray(programBody?.body)
      ? (programBody!.body as unknown[])
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
  const n = toASTNode(node)
  if (!n) return null

  const location = extractLocation(node)

  if (n.type === 'ImportDeclaration') {
    const sourceNode = toASTNode(n.source)
    if (sourceNode?.value && typeof sourceNode.value === 'string') {
      return {
        location,
        modulePath: sourceNode.value,
        sourceFile: filePath,
      }
    }
  }

  if (n.type === 'ExportNamedDeclaration' || n.type === 'ExportAllDeclaration') {
    const sourceNode = toASTNode(n.source)
    if (sourceNode?.value && typeof sourceNode.value === 'string') {
      return {
        location,
        modulePath: sourceNode.value,
        sourceFile: filePath,
      }
    }
  }

  if (n.type === 'VariableDeclaration' || n.type === 'ExpressionStatement') {
    const requireCall = findRequireCall(n)
    if (requireCall) {
      return {
        location,
        modulePath: requireCall.argument,
        sourceFile: filePath,
      }
    }
  }

  if (n.type === 'ExpressionStatement') {
    const {expression} = n
    if (isDynamicImport(expression)) {
      const importArg = getDynamicImportArgument(expression)
      if (importArg) {
        return {
          location,
          modulePath: importArg,
          sourceFile: filePath,
        }
      }
    }
  }

  return null
}

function findRequireCall(node: unknown): null | { argument: string } {
  const n = toASTNode(node)
  if (!n) return null

  if (n.type === 'VariableDeclaration') {
    const {declarations} = n
    if (Array.isArray(declarations)) {
      for (const decl of declarations) {
        const declNode = toASTNode(decl)
        if (!declNode) continue
        const {init} = declNode
        if (init && isRequireCall(init)) {
          const initNode = toASTNode(init)!
          const arguments_ = initNode.arguments
          const arg0 =
            Array.isArray(arguments_) && arguments_.length > 0
              ? toASTNode(arguments_[0])
              : undefined
          if (arg0?.value && typeof arg0.value === 'string') {
            return { argument: arg0.value }
          }
        }
      }
    }
  }

  if (n.type === 'ExpressionStatement') {
    const {expression} = n
    if (expression && isRequireCall(expression)) {
      const exprNode = toASTNode(expression)!
      const arguments_ = exprNode.arguments
      const arg0 =
        Array.isArray(arguments_) && arguments_.length > 0
          ? toASTNode(arguments_[0])
          : undefined
      if (arg0?.value && typeof arg0.value === 'string') {
        return { argument: arg0.value }
      }
    }
  }

  return null
}

function isRequireCall(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  const callee = toASTNode(n.callee)

  return n.type === 'CallExpression' && callee?.type === 'Identifier' && callee.name === 'require'
}

function isDynamicImport(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  const callee = toASTNode(n.callee)

  return n.type === 'CallExpression' && callee?.type === 'Import'
}

function getDynamicImportArgument(node: unknown): null | string {
  if (!isDynamicImport(node)) {
    return null
  }

  const n = toASTNode(node)!
  const arguments_ = n.arguments
  const arg0 =
    Array.isArray(arguments_) && arguments_.length > 0
      ? toASTNode(arguments_[0])
      : undefined

  if (
    arg0?.type === 'Literal' &&
    arg0.value &&
    typeof arg0.value === 'string'
  ) {
    return arg0.value
  }

  return null
}

/**
 * Rule: no-circular-deps
 * Detects circular dependencies between files by building a dependency graph
 */
export const noCircularDepsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = extractRuleOptions<CircularDepsOptions>(context.config.options, {
      exclude: [],
      ignoreTypeOnly: false,
      maxDepth: 50,
    })
    const maxDepth = options.maxDepth ?? 50
    const filePath = context.getFilePath()

    const fileImports = new Map<string, ImportInfo[]>()
    const builder = new DependencyGraphBuilder()

    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        if (isRequireCall(n)) {
          const arguments_ = n.arguments
          const arg0 =
            Array.isArray(arguments_) && arguments_.length > 0
              ? toASTNode(arguments_[0])
              : undefined
          if (arg0?.value && typeof arg0.value === 'string') {
            const modulePath = arg0.value
            const imports = fileImports.get(filePath) ?? []
            fileImports.set(filePath, [
              ...imports,
              {
                location: extractLocation(n),
                modulePath,
                sourceFile: filePath,
              },
            ])
          }
        }
      },

      ImportDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return
        const sourceNode = toASTNode(n.source)
        if (sourceNode?.value && typeof sourceNode.value === 'string') {
          const imports = fileImports.get(filePath) ?? []
          const modulePath = sourceNode.value

          const existingImports = fileImports.get(modulePath)
          if (existingImports) {
            const hasCycle = existingImports.some((imp) => imp.modulePath === filePath)

            if (hasCycle) {
              context.report({
                loc: extractLocation(n),
                message: `Circular dependency detected: ${filePath} -> ${modulePath} -> ${filePath}`,
                node,
              })
            }
          }

          fileImports.set(filePath, [
            ...imports,
            {
              location: extractLocation(n),
              modulePath,
              sourceFile: filePath,
            },
          ])
        }
      },

      Program(node: unknown): void {
        const ast = context.getAST() ?? node
        const imports = extractImports(ast, filePath)
        fileImports.set(filePath, imports)
        builder.addFile(filePath, imports)
      },

      'Program:exit'(): void {
        const cycles = builder.detectCycles(maxDepth)

        for (const cycle of cycles) {
          const cyclePath = cycle.cycle.join(' -> ')
          context.report({
            loc: cycle.location,
            message: `Circular dependency detected: ${cyclePath}`,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'dependencies',
      description:
        'Disallow circular dependencies between modules. Circular dependencies can lead to runtime issues, make code harder to understand, and can cause problems with bundlers and tree-shaking.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-circular-deps',
    },
    fixable: 'code',
    schema: [
      {
        additionalProperties: false,
        properties: {
          exclude: {
            items: { type: 'string' },
            type: 'array',
          },
          ignoreTypeOnly: {
            default: false,
            type: 'boolean',
          },
          maxDepth: {
            default: 50,
            maximum: 100,
            minimum: 1,
            type: 'number',
          },
        },
        type: 'object',
      },
    ],
    severity: 'error',
    type: 'problem',
  },
}

export default noCircularDepsRule
