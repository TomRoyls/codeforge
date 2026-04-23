/**
 * @file Prefer readonly for arrays and objects that are never modified
 */

import type { SourceFile } from 'ts-morph'

import { Node, SyntaxKind, VariableDeclarationKind } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../types.js'

import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferReadonlyOptions extends RuleOptions {
  ignoreLocal?: boolean
  ignorePattern?: string
}

const DEFAULT_OPTIONS: PreferReadonlyOptions = {
  ignoreLocal: false,
  ignorePattern: '',
}

const MUTATING_ARRAY_METHODS = new Set([
  'copyWithin',
  'fill',
  'pop',
  'push',
  'reverse',
  'shift',
  'sort',
  'splice',
  'unshift',
])

function isAssignmentExpression(node: Node): boolean {
  if (!Node.isBinaryExpression(node)) return false
  return node.getOperatorToken().getKind() === SyntaxKind.EqualsToken
}

function isUpdateExpression(node: Node): boolean {
  return Node.isPrefixUnaryExpression(node) || Node.isPostfixUnaryExpression(node)
}

function matchesIgnorePattern(name: string, ignorePattern: string | undefined): boolean {
  if (!ignorePattern) return false
  try {
    return new RegExp(ignorePattern).test(name)
  } catch {
    return false
  }
}

export const preferReadonlyRule: RuleDefinition<PreferReadonlyOptions> = {
  create(options: PreferReadonlyOptions) {
    const violations: RuleViolation[] = []
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
    const modifiedVariables = new Set<string>()
    const declaredVariables = new Map<string, { name: string; node: Node }>()

    return {
      onComplete() {
        for (const [name, { node }] of declaredVariables) {
          if (modifiedVariables.has(name)) continue

          const range = getNodeRange(node)
          violations.push({
            filePath: node.getSourceFile().getFilePath(),
            message: `Variable '${name}' is never modified. Consider using 'const' instead of 'let'.`,
            range,
            ruleId: 'prefer-readonly',
            severity: 'info',
            suggestion: 'Replace let with const for immutable variables.',
          })
        }

        return violations
      },
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          // Track let declarations
          if (Node.isVariableDeclaration(node)) {
            const parent = node.getParent()
            if (Node.isVariableDeclarationList(parent)) {
              const declarationKind = parent.getDeclarationKind()
              if (declarationKind === VariableDeclarationKind.Let) {
                const nameNode = node.getNameNode()
                if (Node.isIdentifier(nameNode)) {
                  const name = nameNode.getText()
                  // Check ignorePattern
                  if (matchesIgnorePattern(name, mergedOptions.ignorePattern)) return

                  declaredVariables.set(name, { name, node })
                }
              }
            }
          }

          // Track modifications via assignment
          if (isAssignmentExpression(node)) {
            const left = (node as import('ts-morph').BinaryExpression).getLeft()
            if (Node.isIdentifier(left)) {
              modifiedVariables.add(left.getText())
            } else if (Node.isPropertyAccessExpression(left)) {
              const obj = left.getExpression()
              if (Node.isIdentifier(obj)) {
                modifiedVariables.add(obj.getText())
              }
            }
          }

          // Track modifications via update expressions
          if (isUpdateExpression(node)) {
            const operand = (
              node as
                | import('ts-morph').PostfixUnaryExpression
                | import('ts-morph').PrefixUnaryExpression
            ).getOperand()
            if (Node.isIdentifier(operand)) {
              modifiedVariables.add(operand.getText())
            }
          }

          // Track mutating array methods
          if (Node.isCallExpression(node)) {
            const expression = node.getExpression()
            if (Node.isPropertyAccessExpression(expression)) {
              const methodName = expression.getName()
              if (MUTATING_ARRAY_METHODS.has(methodName)) {
                const obj = expression.getExpression()
                if (Node.isIdentifier(obj)) {
                  modifiedVariables.add(obj.getText())
                }
              }
            }
          }
        },
      },
    }
  },
  defaultOptions: DEFAULT_OPTIONS,
  meta: {
    category: 'style',
    description: 'Require readonly for arrays and objects that are never modified',
    fixable: 'code',
    name: 'prefer-readonly',
    recommended: false,
  },
}

export function analyzePreferReadonly(
  sourceFile: SourceFile,
  options: PreferReadonlyOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
  const modifiedVariables = new Set<string>()
  const declaredVariables = new Map<string, { name: string; node: Node }>()

  traverseAST(sourceFile, {
    visitNode(node: Node, _context: VisitorContext) {
      // Track let declarations
      if (Node.isVariableDeclaration(node)) {
        const parent = node.getParent()
        if (Node.isVariableDeclarationList(parent)) {
          const declarationKind = parent.getDeclarationKind()
          if (declarationKind === VariableDeclarationKind.Let) {
            const nameNode = node.getNameNode()
            if (Node.isIdentifier(nameNode)) {
              const name = nameNode.getText()
              // Check ignorePattern
              if (matchesIgnorePattern(name, mergedOptions.ignorePattern)) return

              declaredVariables.set(name, { name, node })
            }
          }
        }
      }

      // Track modifications via assignment
      if (isAssignmentExpression(node)) {
        const left = (node as import('ts-morph').BinaryExpression).getLeft()
        if (Node.isIdentifier(left)) {
          modifiedVariables.add(left.getText())
        } else if (Node.isPropertyAccessExpression(left)) {
          const obj = left.getExpression()
          if (Node.isIdentifier(obj)) {
            modifiedVariables.add(obj.getText())
          }
        }
      }

      // Track modifications via update expressions
      if (isUpdateExpression(node)) {
        const operand = (
          node as
            | import('ts-morph').PostfixUnaryExpression
            | import('ts-morph').PrefixUnaryExpression
        ).getOperand()
        if (Node.isIdentifier(operand)) {
          modifiedVariables.add(operand.getText())
        }
      }

      // Track mutating array methods
      if (Node.isCallExpression(node)) {
        const expression = node.getExpression()
        if (Node.isPropertyAccessExpression(expression)) {
          const methodName = expression.getName()
          if (MUTATING_ARRAY_METHODS.has(methodName)) {
            const obj = expression.getExpression()
            if (Node.isIdentifier(obj)) {
              modifiedVariables.add(obj.getText())
            }
          }
        }
      }
    },
  })

  for (const [name, { node }] of declaredVariables) {
    if (modifiedVariables.has(name)) continue

    const range = getNodeRange(node)
    violations.push({
      filePath: sourceFile.getFilePath(),
      message: `Variable '${name}' is never modified. Consider using 'const' instead of 'let'.`,
      range,
      ruleId: 'prefer-readonly',
      severity: 'info',
      suggestion: 'Replace let with const for immutable variables.',
    })
  }

  return violations
}

export default preferReadonlyRule
