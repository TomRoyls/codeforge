import type { SourceFile } from 'ts-morph'

import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../types.js'

import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferArrowCallbackOptions extends RuleOptions {
  allowNamedFunctions?: boolean
}

const DEFAULT_OPTIONS: PreferArrowCallbackOptions = {
  allowNamedFunctions: true,
}


function isCallbackContext(node: Node): boolean {
  const parent = node.getParent()
  if (!parent) return false

  // Check if it's being passed as an argument
  if (Node.isCallExpression(parent)) {
    const args = parent.getArguments()
    return args.includes(node)
  }

  // Check if it's assigned to a variable or property
  if (Node.isVariableDeclaration(parent) || Node.isPropertyAssignment(parent)) {
    return true
  }

  // Check if it's in an array literal
  if (Node.isArrayLiteralExpression(parent)) {
    return true
  }

  return false
}

export const preferArrowCallbackRule: RuleDefinition<PreferArrowCallbackOptions> = {
  create(options: PreferArrowCallbackOptions) {
    const violations: RuleViolation[] = []
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

    return {
      onComplete: () => violations,
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          // Check for function expressions used as callbacks
          if (!Node.isFunctionExpression(node) && !Node.isFunctionDeclaration(node)) return

          // Skip if named functions are allowed and this has a name
          if (mergedOptions.allowNamedFunctions) {
            if (Node.isFunctionDeclaration(node) && node.getName()) {
              return
            }

            if (Node.isFunctionExpression(node) && node.getName()) {
              return
            }
          }

          // Check if this is being used as a callback
          if (!isCallbackContext(node)) return

          // Flag if it's not an arrow function
          if (!Node.isArrowFunction(node)) {
            const range = getNodeRange(node)
            violations.push({
              filePath: node.getSourceFile().getFilePath(),
              message: 'Use arrow function for callback instead of function expression.',
              range,
              ruleId: 'prefer-arrow-callback',
              severity: 'info',
              suggestion: 'Convert to arrow function: (args) => { ... }',
            })
          }
        },
      },
    }
  },
  defaultOptions: DEFAULT_OPTIONS,
  meta: {
    category: 'style',
    description: 'Enforce using arrow functions for callbacks',
    fixable: 'code',
    name: 'prefer-arrow-callback',
    recommended: false,
  },
}

export function analyzePreferArrowCallback(
  sourceFile: SourceFile,
  options: PreferArrowCallbackOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []
  const mergedOptions: PreferArrowCallbackOptions = { ...DEFAULT_OPTIONS, ...options }

  traverseAST(
    sourceFile,
    {
      visitNode(node: Node, _context: VisitorContext) {
        if (!Node.isFunctionExpression(node) && !Node.isFunctionDeclaration(node)) return

        if (mergedOptions.allowNamedFunctions) {
          if (Node.isFunctionDeclaration(node) && node.getName()) {
            return
          }

          if (Node.isFunctionExpression(node) && node.getName()) {
            return
          }
        }

        if (!isCallbackContext(node)) return

        if (!Node.isArrowFunction(node)) {
          const range = getNodeRange(node)
          violations.push({
            filePath: sourceFile.getFilePath(),
            message: 'Use arrow function for callback instead of function expression.',
            range,
            ruleId: 'prefer-arrow-callback',
            severity: 'info',
            suggestion: 'Convert to arrow function: (args) => { ... }',
          })
        }
      },
    },
    violations,
  )

  return violations
}
