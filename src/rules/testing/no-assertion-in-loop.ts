import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getExpectRootName, toASTNode } from '../../utils/ast-helpers.js'

const ITERATOR_METHODS = new Set(['forEach', 'map', 'filter', 'reduce', 'every', 'some'])

function isInLoopStack(stack: number[]): boolean {
  return stack.length > 0
}

export const noAssertionInLoopRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const loopDepthStack: number[] = []

    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        if (isInLoopStack(loopDepthStack)) {
          const rootName = getExpectRootName(n.callee)
          if (rootName === 'expect') {
            context.report({
              loc: extractLocation(node),
              message:
                'Unexpected assertion inside a loop. Loop assertions may silently pass if the loop body never executes. Use separate test cases or test the collected results instead.',
              node,
            })
          }
        }

        const callee = toASTNode(n.callee)
        if (
          callee?.type === 'MemberExpression' &&
          typeof (toASTNode(callee.property) as { name?: string } | null)?.name === 'string'
        ) {
          const propName = (toASTNode(callee.property) as { name: string }).name
          if (ITERATOR_METHODS.has(propName)) {
            loopDepthStack.push(1)
          }
        }
      },

      'CallExpression:exit'(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (
          callee?.type === 'MemberExpression' &&
          typeof (toASTNode(callee.property) as { name?: string } | null)?.name === 'string'
        ) {
          const propName = (toASTNode(callee.property) as { name: string }).name
          if (ITERATOR_METHODS.has(propName)) {
            loopDepthStack.pop()
          }
        }
      },

      DoWhileStatement(): void {
        loopDepthStack.push(1)
      },

      'DoWhileStatement:exit'(): void {
        loopDepthStack.pop()
      },

      ForInStatement(): void {
        loopDepthStack.push(1)
      },

      'ForInStatement:exit'(): void {
        loopDepthStack.pop()
      },

      ForOfStatement(): void {
        loopDepthStack.push(1)
      },

      'ForOfStatement:exit'(): void {
        loopDepthStack.pop()
      },

      ForStatement(): void {
        loopDepthStack.push(1)
      },

      'ForStatement:exit'(): void {
        loopDepthStack.pop()
      },

      WhileStatement(): void {
        loopDepthStack.push(1)
      },

      'WhileStatement:exit'(): void {
        loopDepthStack.pop()
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow assertions inside loops where they may silently pass if the loop body never executes',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-assertion-in-loop',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noAssertionInLoopRule
