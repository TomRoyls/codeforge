import type { RuleDefinition, RuleOptions } from '../types.js'
import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { SourceFile } from 'ts-morph'
import { Node } from 'ts-morph'
import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface ExplicitReturnTypeOptions extends RuleOptions {
  checkExpressions?: boolean
  checkArrowFunctions?: boolean
  checkFunctionDeclarations?: boolean
  checkMethodDeclarations?: boolean
}

const DEFAULT_OPTIONS: ExplicitReturnTypeOptions = {
  checkExpressions: true,
  checkArrowFunctions: true,
  checkFunctionDeclarations: true,
  checkMethodDeclarations: true,
}

function hasExplicitReturnType(node: Node): boolean {
  if (Node.isArrowFunction(node) || Node.isFunctionDeclaration(node) || Node.isMethodDeclaration(node)) {
    return node.getReturnTypeNode() !== undefined
  }
  return true
}

export const explicitReturnTypeRule: RuleDefinition<ExplicitReturnTypeOptions> = {
  meta: {
    name: 'explicit-return-type',
    description: 'Require explicit return types on functions',
    category: 'style',
    recommended: false,
    fixable: undefined,
  },
  defaultOptions: DEFAULT_OPTIONS,
  create: (options: ExplicitReturnTypeOptions) => {
    const violations: RuleViolation[] = []
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

    return {
      visitor: {
        visitNode: (node: Node, _context: VisitorContext) => {
          // Check arrow functions
          if (mergedOptions.checkArrowFunctions && Node.isArrowFunction(node)) {
            if (!hasExplicitReturnType(node)) {
              const range = getNodeRange(node)
              violations.push({
                ruleId: 'explicit-return-type',
                severity: 'warning',
                message: 'Arrow function should have an explicit return type.',
                filePath: node.getSourceFile().getFilePath(),
                range,
                suggestion: 'Add a return type annotation.',
              })
            }
          }

          // Check function declarations
          if (mergedOptions.checkFunctionDeclarations && Node.isFunctionDeclaration(node)) {
            if (!hasExplicitReturnType(node) && !node.isAsync()) {
              const range = getNodeRange(node)
              violations.push({
                ruleId: 'explicit-return-type',
                severity: 'warning',
                message: 'Function declaration should have an explicit return type.',
                filePath: node.getSourceFile().getFilePath(),
                range,
                suggestion: 'Add a return type annotation.',
              })
            }
          }

          // Check method declarations
          if (mergedOptions.checkMethodDeclarations && Node.isMethodDeclaration(node)) {
            if (!hasExplicitReturnType(node)) {
              const range = getNodeRange(node)
              violations.push({
                ruleId: 'explicit-return-type',
                severity: 'warning',
                message: 'Method declaration should have an explicit return type.',
                filePath: node.getSourceFile().getFilePath(),
                range,
                suggestion: 'Add a return type annotation.',
              })
            }
          }
        },
      },
      onComplete: () => violations,
    }
  },
}

export function analyzeExplicitReturnType(
  sourceFile: SourceFile,
  options: ExplicitReturnTypeOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

  traverseAST(
    sourceFile,
    {
      visitNode: (node: Node, _context: VisitorContext) => {
        // Check arrow functions
        if (mergedOptions.checkArrowFunctions && Node.isArrowFunction(node)) {
          if (!hasExplicitReturnType(node)) {
            const range = getNodeRange(node)
            violations.push({
              ruleId: 'explicit-return-type',
              severity: 'warning',
              message: 'Arrow function should have an explicit return type.',
              filePath: sourceFile.getFilePath(),
              range,
              suggestion: 'Add a return type annotation.',
            })
          }
        }

        // Check function declarations
        if (mergedOptions.checkFunctionDeclarations && Node.isFunctionDeclaration(node)) {
          if (!hasExplicitReturnType(node) && !node.isAsync()) {
            const range = getNodeRange(node)
            violations.push({
              ruleId: 'explicit-return-type',
              severity: 'warning',
              message: 'Function declaration should have an explicit return type.',
              filePath: sourceFile.getFilePath(),
              range,
              suggestion: 'Add a return type annotation.',
            })
          }
        }

        // Check method declarations
        if (mergedOptions.checkMethodDeclarations && Node.isMethodDeclaration(node)) {
          if (!hasExplicitReturnType(node)) {
            const range = getNodeRange(node)
            violations.push({
              ruleId: 'explicit-return-type',
              severity: 'warning',
              message: 'Method declaration should have an explicit return type.',
              filePath: sourceFile.getFilePath(),
              range,
              suggestion: 'Add a return type annotation.',
            })
          }
        }
      },
    },
    violations,
  )

  return violations
}
