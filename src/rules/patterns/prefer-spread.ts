import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getNodeText,
  getRange,
  isCallExpression,
  isMemberExpression,
  toASTNode,
} from '../../utils/ast-helpers.js'

function getMethodName(node: unknown): null | string {
  if (!isMemberExpression(node)) {
    return null
  }

  const n = toASTNode(node)
  if (!n) return null

  const property = toASTNode(n.property)
  if (!property || property.type !== 'Identifier') {
    return null
  }

  return property.name ?? null
}

function isApplyCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = toASTNode(node)
  if (!n) return false

  const callee = toASTNode(n.callee)
  if (!callee) {
    return false
  }

  return getMethodName(callee) === 'apply'
}

function isConcatCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = toASTNode(node)
  if (!n) return false

  const callee = toASTNode(n.callee)
  if (!callee) {
    return false
  }

  return getMethodName(callee) === 'concat'
}

function getCalleeObject(node: unknown): unknown {
  if (!isCallExpression(node)) {
    return null
  }

  const n = toASTNode(node)
  if (!n) return null

  const callee = toASTNode(n.callee)
  if (!callee || !isMemberExpression(callee)) {
    return null
  }

  return callee.object
}

function hasAcceptableApplyContext(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = toASTNode(node)
  if (!n) return false

  const args = n.arguments
  if (!args || args.length < 2) {
    return false
  }

  const thisArg = toASTNode(args[0])
  if (!thisArg) {
    return false
  }

  const isNullLiteral = thisArg.type === 'Literal' && thisArg.value === null
  const isUndefinedIdentifier = thisArg.type === 'Identifier' && thisArg.name === 'undefined'
  const isThisExpression = thisArg.type === 'ThisExpression'

  return isNullLiteral || isUndefinedIdentifier || isThisExpression
}

function getApplyArgs(node: unknown): unknown[] {
  if (!isCallExpression(node)) {
    return []
  }

  const n = toASTNode(node)
  if (!n) return []

  const args = n.arguments
  if (!args || args.length < 2) {
    return []
  }

  return args.slice(1)
}

function getConcatArgs(node: unknown): unknown[] {
  if (!isCallExpression(node)) {
    return []
  }

  const n = toASTNode(node)
  if (!n) return []

  const args = n.arguments
  return args ?? []
}

export const preferSpreadRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isCallExpression(node)) {
          return
        }

        if (isApplyCall(node) && hasAcceptableApplyContext(node)) {
          const calleeObject = getCalleeObject(node)
          const location = extractLocation(node)
          const calleeNode = toASTNode(calleeObject)
          const calleeName =
            calleeNode?.type === 'Identifier'
              ? (calleeNode.name ?? 'function')
              : 'function'

          let fix: undefined | { range: readonly [number, number]; text: string }
          const nodeRange = getRange(node)
          if (nodeRange) {
            const source = context.getSource()
            const calleeObjectText = getNodeText(calleeObject, source)
            const applyArgs = getApplyArgs(node)
            const spreadArgs = applyArgs
              .map((arg) => {
                const argText = getNodeText(arg, source)
                return argText ? `...${argText}` : ''
              })
              .filter(Boolean)
              .join(', ')

            if (calleeObjectText && spreadArgs) {
              fix = {
                range: nodeRange,
                text: `${calleeObjectText}(${spreadArgs})`,
              }
            }
          }

          context.report({
            fix,
            loc: location,
            message: `Prefer spread syntax over .apply(). Use ${calleeName}(...args) instead of ${calleeName}.apply().`,
          })
          return
        }

        if (isConcatCall(node)) {
          const location = extractLocation(node)
          const calleeObject = getCalleeObject(node)
          const calleeNode = toASTNode(calleeObject)
          const calleeName =
            calleeNode?.type === 'Identifier'
              ? (calleeNode.name ?? 'array')
              : 'array'

          let fix: undefined | { range: readonly [number, number]; text: string }
          const nodeRange = getRange(node)
          if (nodeRange) {
            const source = context.getSource()
            const calleeObjectText = getNodeText(calleeObject, source)
            const concatArgs = getConcatArgs(node)
            const spreadArgs = concatArgs
              .map((arg) => {
                const argText = getNodeText(arg, source)
                return argText ? `...${argText}` : ''
              })
              .filter(Boolean)

            if (calleeObjectText) {
              const allElements = [`...${calleeObjectText}`, ...spreadArgs]
              fix = {
                range: nodeRange,
                text: `[${allElements.join(', ')}]`,
              }
            }
          }

          context.report({
            fix,
            loc: location,
            message: `Prefer spread syntax over .concat(). Use [...${calleeName}, ...other] instead of ${calleeName}.concat(other).`,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Prefer spread syntax over .apply() and .concat(). Use ...args instead of fn.apply(this, args), and [...arr1, ...arr2] instead of arr1.concat(arr2).',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-spread',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferSpreadRule
