import type { SourceFile } from 'ts-morph'

import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../types.js'

import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface ExplicitReturnTypeOptions extends RuleOptions {
  checkArrowFunctions?: boolean
  checkExpressions?: boolean
  checkFunctionDeclarations?: boolean
  checkMethodDeclarations?: boolean
}

const DEFAULT_OPTIONS: ExplicitReturnTypeOptions = {
  checkArrowFunctions: true,
  checkExpressions: true,
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
  create(options: ExplicitReturnTypeOptions) {
    const violations: RuleViolation[] = []
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

    return {
      onComplete: () => violations,
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          // Check arrow functions
          if (mergedOptions.checkArrowFunctions && Node.isArrowFunction(node) && !hasExplicitReturnType(node)) {
              const range = getNodeRange(node)
              violations.push({
                filePath: node.getSourceFile().getFilePath(),
                message: 'Arrow function should have an explicit return type.',
                range,
                ruleId: 'explicit-return-type',
                severity: 'warning',
                suggestion: 'Add a return type annotation.',
              })
            }

          // Check function declarations
          if (mergedOptions.checkFunctionDeclarations && Node.isFunctionDeclaration(node) && !hasExplicitReturnType(node) && !node.isAsync()) {
              const range = getNodeRange(node)
              violations.push({
                filePath: node.getSourceFile().getFilePath(),
                message: 'Function declaration should have an explicit return type.',
                range,
                ruleId: 'explicit-return-type',
                severity: 'warning',
                suggestion: 'Add a return type annotation.',
              })
            }

          // Check method declarations
          if (mergedOptions.checkMethodDeclarations && Node.isMethodDeclaration(node) && !hasExplicitReturnType(node)) {
              const range = getNodeRange(node)
              violations.push({
                filePath: node.getSourceFile().getFilePath(),
                message: 'Method declaration should have an explicit return type.',
                range,
                ruleId: 'explicit-return-type',
                severity: 'warning',
                suggestion: 'Add a return type annotation.',
              })
            }
        },
      },
    }
  },
  defaultOptions: DEFAULT_OPTIONS,
  meta: {
    category: 'style',
    description: 'Require explicit return types on functions',
    fixable: undefined,
    name: 'explicit-return-type',
    recommended: false,
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
      visitNode(node: Node, _context: VisitorContext) {
        // Check arrow functions
        if (mergedOptions.checkArrowFunctions && Node.isArrowFunction(node) && !hasExplicitReturnType(node)) {
            const range = getNodeRange(node)
            violations.push({
              filePath: sourceFile.getFilePath(),
              message: 'Arrow function should have an explicit return type.',
              range,
              ruleId: 'explicit-return-type',
              severity: 'warning',
              suggestion: 'Add a return type annotation.',
            })
          }

        // Check function declarations
        if (mergedOptions.checkFunctionDeclarations && Node.isFunctionDeclaration(node) && !hasExplicitReturnType(node) && !node.isAsync()) {
            const range = getNodeRange(node)
            violations.push({
              filePath: sourceFile.getFilePath(),
              message: 'Function declaration should have an explicit return type.',
              range,
              ruleId: 'explicit-return-type',
              severity: 'warning',
              suggestion: 'Add a return type annotation.',
            })
          }

        // Check method declarations
        if (mergedOptions.checkMethodDeclarations && Node.isMethodDeclaration(node) && !hasExplicitReturnType(node)) {
            const range = getNodeRange(node)
            violations.push({
              filePath: sourceFile.getFilePath(),
              message: 'Method declaration should have an explicit return type.',
              range,
              ruleId: 'explicit-return-type',
              severity: 'warning',
              suggestion: 'Add a return type annotation.',
            })
          }
      },
    },
    violations,
  )

  return violations
}
