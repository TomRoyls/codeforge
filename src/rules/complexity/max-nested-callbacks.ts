import type { Node, SourceFile } from 'ts-morph'

import { Node as TsNode } from 'ts-morph'

import type { RuleDefinition, RuleOptions } from '../types.js'

import {
  type FunctionLikeNode,
  getFunctionName,
  getNodeRange,
  type RuleViolation,
  traverseAST,
} from '../../ast/visitor.js'

interface MaxNestedCallbacksOptions extends RuleOptions {
  max?: number
}

const ARROW_FUNCTION_KIND = 219
const FUNCTION_EXPRESSION_KIND = 218

function isCallbackLike(node: Node): boolean {
  return (
    TsNode.isArrowFunction(node) ||
    TsNode.isFunctionExpression(node) ||
    node.getKind() === ARROW_FUNCTION_KIND ||
    node.getKind() === FUNCTION_EXPRESSION_KIND
  )
}

function calculateCallbackNestingDepth(node: Node, currentDepth: number = 0): number {
  let maxDepth = currentDepth

  function visit(child: Node, depth: number): void {
    const isCallback = isCallbackLike(child)

    const newDepth = isCallback ? depth + 1 : depth
    maxDepth = Math.max(maxDepth, newDepth)

    child.forEachChild((grandchild) => {
      visit(grandchild, newDepth)
    })
  }

  node.forEachChild((child) => visit(child, currentDepth))
  return maxDepth
}

export const maxNestedCallbacksRule: RuleDefinition<MaxNestedCallbacksOptions> = {
  create(options: MaxNestedCallbacksOptions) {
    const violations: RuleViolation[] = []
    const maxDepth = options.max ?? 4

    return {
      onComplete: () => violations,
      visitor: {
        visitFunction(node: FunctionLikeNode) {
          const depth = calculateCallbackNestingDepth(node)
          const name = getFunctionName(node)

          if (depth > maxDepth) {
            const range = getNodeRange(node)
            violations.push({
              filePath: node.getSourceFile().getFilePath(),
              message: `Function '${name}' has a callback nesting depth of ${depth}. Maximum allowed is ${maxDepth}.`,
              range,
              ruleId: 'max-nested-callbacks',
              severity: 'warning',
              suggestion:
                'Refactor nested callbacks into separate functions or use async/await to flatten the structure.',
            })
          }
        },
      },
    }
  },
  defaultOptions: {
    max: 4,
  },
  meta: {
    category: 'complexity',
    description: 'Enforce a maximum nesting depth for callback functions',
    docs: { url: 'https://github.com/codeforge-dev/codeforge/blob/main/src/rules/complexity/max-nested-callbacks.ts' },
    fixable: 'code',
    name: 'max-nested-callbacks',
    recommended: true,
  },
}

export function analyzeNestedCallbacks(
  sourceFile: SourceFile,
  maxDepth: number = 4,
): RuleViolation[] {
  const violations: RuleViolation[] = []

  traverseAST(
    sourceFile,
    {
      visitFunction(node: FunctionLikeNode) {
        const depth = calculateCallbackNestingDepth(node)
        const name = getFunctionName(node)

        if (depth > maxDepth) {
          const range = getNodeRange(node)
          violations.push({
            filePath: sourceFile.getFilePath(),
            message: `Function '${name}' has a callback nesting depth of ${depth}. Maximum allowed is ${maxDepth}.`,
            range,
            ruleId: 'max-nested-callbacks',
            severity: 'warning',
            suggestion:
              'Refactor nested callbacks into separate functions or use async/await to flatten the structure.',
          })
        }
      },
    },
    violations,
  )

  return violations
}
