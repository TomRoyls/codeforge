/**
 * @fileoverview Prefer readonly for arrays and objects that are never modified
 */

import type { RuleDefinition, RuleOptions } from '../types.js'
import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { SourceFile } from 'ts-morph'
import { Node, VariableDeclarationKind, SyntaxKind } from 'ts-morph'
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
  'push', 'pop', 'shift', 'unshift', 'splice', 
  'sort', 'reverse', 'fill', 'copyWithin'
])

function isAssignmentExpression(node: Node): boolean {
  if (!Node.isBinaryExpression(node)) return false
  return node.getOperatorToken().getKind() === SyntaxKind.EqualsToken
}

function isUpdateExpression(node: Node): boolean {
  return Node.isPrefixUnaryExpression(node) || Node.isPostfixUnaryExpression(node)
}

export const preferReadonlyRule: RuleDefinition<PreferReadonlyOptions> = {
  meta: {
    name: 'prefer-readonly',
    description: 'Require readonly for arrays and objects that are never modified',
    category: 'style',
    recommended: false,
    fixable: 'code',
  },
  defaultOptions: DEFAULT_OPTIONS,
  create: (options: PreferReadonlyOptions) => {
    const violations: RuleViolation[] = []
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
    const modifiedVariables = new Set<string>()
    const declaredVariables = new Map<string, { node: Node; name: string }>()

    return {
      visitor: {
        visitNode: (node: Node, _context: VisitorContext) => {
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
                  if (mergedOptions.ignorePattern) {
                    try {
                      const regex = new RegExp(mergedOptions.ignorePattern)
                      if (regex.test(name)) return
                    } catch { /* ignore invalid regex */ }
                  }
                  declaredVariables.set(name, { node, name })
                }
              }
            }
          }

          // Track modifications via assignment
          if (isAssignmentExpression(node)) {
            const left = (node as import("ts-morph").BinaryExpression).getLeft()
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
            const operand = (node as import("ts-morph").PrefixUnaryExpression | import("ts-morph").PostfixUnaryExpression).getOperand()
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
      onComplete: () => {
        for (const [name, { node }] of declaredVariables) {
          if (modifiedVariables.has(name)) continue
          
          const range = getNodeRange(node)
          violations.push({
            ruleId: 'prefer-readonly',
            severity: 'info',
            message: `Variable '${name}' is never modified. Consider using 'const' instead of 'let'.`,
            filePath: node.getSourceFile().getFilePath(),
            range,
            suggestion: 'Replace let with const for immutable variables.',
          })
        }
        return violations
      },
    }
  },
}

export function analyzePreferReadonly(
  sourceFile: SourceFile,
  options: PreferReadonlyOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
  const modifiedVariables = new Set<string>()
  const declaredVariables = new Map<string, { node: Node; name: string }>()

  traverseAST(
    sourceFile,
    {
      visitNode: (node: Node, _context: VisitorContext) => {
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
                if (mergedOptions.ignorePattern) {
                  try {
                    const regex = new RegExp(mergedOptions.ignorePattern)
                    if (regex.test(name)) return
                  } catch { /* ignore invalid regex */ }
                }
                declaredVariables.set(name, { node, name })
              }
            }
          }
        }

        // Track modifications via assignment
        if (isAssignmentExpression(node)) {
          const left = (node as import("ts-morph").BinaryExpression).getLeft()
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
          const operand = (node as import("ts-morph").PrefixUnaryExpression | import("ts-morph").PostfixUnaryExpression).getOperand()
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
    }
  )

  for (const [name, { node }] of declaredVariables) {
    if (modifiedVariables.has(name)) continue
    
    const range = getNodeRange(node)
    violations.push({
      ruleId: 'prefer-readonly',
      severity: 'info',
      message: `Variable '${name}' is never modified. Consider using 'const' instead of 'let'.`,
      filePath: sourceFile.getFilePath(),
      range,
      suggestion: 'Replace let with const for immutable variables.',
    })
  }

  return violations
}

export default preferReadonlyRule
