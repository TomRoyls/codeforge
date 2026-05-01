import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getPropertyName,
  hasNotChain,
  toASTNode,
} from '../../utils/ast-helpers.js'

function getExpectArg(node: unknown): unknown | null {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return null

  const callee = toASTNode(n.callee)
  if (!callee) return null

  if (callee.type === 'MemberExpression') {
    const prop = getPropertyName(callee.property)
    if (prop === 'not' || prop === 'resolves' || prop === 'rejects') {
      const obj = toASTNode(callee.object)
      if (obj && obj.type === 'CallExpression') {
        return getExpectArg(obj)
      }
    }
  }

  if (callee.type === 'Identifier' && typeof callee.name === 'string' && callee.name === 'expect') {
    const args = n.arguments
    if (Array.isArray(args) && args.length > 0) {
      return args[0]
    }
  }

  return null
}

function getLiteralValue(node: unknown): boolean | null {
  const n = toASTNode(node)
  if (!n) return null
  if (n.type === 'Literal') {
    if (typeof n.value === 'boolean') return n.value
  }
  return null
}

function getArgText(arg: unknown): string {
  const n = toASTNode(arg)
  if (!n) return ''

  if (n.type === 'Identifier' && typeof n.name === 'string') {
    return n.name
  }
  if (n.type === 'Literal') {
    if (typeof n.value === 'string') return `'${n.value}'`
    return String(n.value)
  }
  if (n.type === 'CallExpression') {
    const callee = toASTNode(n.callee)
    if (callee?.type === 'Identifier' && typeof callee.name === 'string') {
      return `${callee.name}(...)`
    }
  }
  return '...'
}

export const preferToContainRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = toASTNode(n.callee)
        if (!callee || callee.type !== 'MemberExpression') return

        const matcherName = getPropertyName(callee.property)
        if (matcherName !== 'toBe' && matcherName !== 'toEqual' && matcherName !== 'toStrictEqual') return

        const matcherArg = Array.isArray(n.arguments) && n.arguments.length > 0 ? n.arguments[0] : null
        const matcherArgValue = getLiteralValue(matcherArg)
        if (matcherArgValue === null) return

        const notUsed = hasNotChain(callee.object)

        const expectArg = getExpectArg(callee.object)
        if (expectArg === null) return

        const expectArgNode = toASTNode(expectArg)

        // Check for .includes() pattern
        if (expectArgNode?.type === 'CallExpression') {
          const includesCallee = toASTNode(expectArgNode.callee)
          if (includesCallee?.type === 'MemberExpression') {
            const includesMethod = getPropertyName(includesCallee.property)
            if (includesMethod === 'includes') {
              const includesArgs = expectArgNode.arguments
              const argText = Array.isArray(includesArgs) && includesArgs.length > 0
                ? getArgText(includesArgs[0])
                : '...'

              // Determine if we should suggest .not.toContain()
              //toBe(true) or toEqual(true) → toContain
              //toBe(false) or toEqual(false) → not.toContain
              //not.toBe(true) → not.toContain
              //not.toBe(false) → toContain
              const suggestNot = (matcherArgValue === false && !notUsed) || (matcherArgValue === true && notUsed)

              if (suggestNot) {
                context.report({
                  loc: extractLocation(node),
                  message: `Use \`expect(...).not.toContain(${argText})\` instead of checking the return value of \`includes()\``,
                  node,
                })
              } else {
                context.report({
                  loc: extractLocation(node),
                  message: `Use \`toContain(${argText})\` instead of checking the return value of \`includes()\``,
                  node,
                })
              }
              return
            }
          }
        }

        // Check for .indexOf() patterns like > -1, >= 0, !== -1, === -1
        if (expectArgNode?.type === 'BinaryExpression') {
          const left = toASTNode(expectArgNode.left)
          const right = toASTNode(expectArgNode.right)
          const operator = expectArgNode.operator

          let indexOfArg: unknown = null
          let negateResult = false

          if (left?.type === 'CallExpression') {
            const leftCallee = toASTNode(left.callee)
            if (leftCallee?.type === 'MemberExpression') {
              const method = getPropertyName(leftCallee.property)
              if (method === 'indexOf') {
                indexOfArg = Array.isArray(left.arguments) && left.arguments.length > 0 ? left.arguments[0] : null

                if (operator === '>' && right?.type === 'Literal' && right.value === -1) {
                  // indexOf(x) > -1 → toContain
                  negateResult = false
                } else if (operator === '>=' && right?.type === 'Literal' && right.value === 0) {
                  // indexOf(x) >= 0 → toContain
                  negateResult = false
                } else if (operator === '!==' && right?.type === 'Literal' && right.value === -1) {
                  // indexOf(x) !== -1 → toContain
                  negateResult = false
                } else if (operator === '===' && right?.type === 'Literal' && right.value === -1) {
                  // indexOf(x) === -1 → not.toContain
                  negateResult = true
                } else {
                  return
                }

                const argText = indexOfArg ? getArgText(indexOfArg) : '...'

                const combinedNegate = negateResult !== matcherArgValue

                if (combinedNegate) {
                  context.report({
                    loc: extractLocation(node),
                    message: `Use \`expect(...).not.toContain(${argText})\` instead of checking the return value of \`indexOf()\``,
                    node,
                  })
                } else {
                  context.report({
                    loc: extractLocation(node),
                    message: `Use \`toContain(${argText})\` instead of checking the return value of \`indexOf()\``,
                    node,
                  })
                }
              }
            }
          }
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Suggest using toContain() for array/string inclusion instead of manual checks with includes() or indexOf()',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-to-contain',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferToContainRule
