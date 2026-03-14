import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import {
  extractLocation,
  isCallExpression,
  isMemberExpression,
  getRange,
} from '../../utils/ast-helpers.js'

function getMethodName(node: unknown): string | null {
  if (!isMemberExpression(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  const property = n.property as Record<string, unknown> | undefined

  if (!property || property.type !== 'Identifier') {
    return null
  }

  return property.name as string
}

function isApplyCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee) {
    return false
  }

  return getMethodName(callee) === 'apply'
}

function isConcatCall(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee) {
    return false
  }

  return getMethodName(callee) === 'concat'
}

function getCalleeObject(node: unknown): unknown {
  if (!isCallExpression(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as Record<string, unknown> | undefined

  if (!callee || !isMemberExpression(callee)) {
    return null
  }

  const c = callee as Record<string, unknown>
  return c.object
}

function hasAcceptableApplyContext(node: unknown): boolean {
  if (!isCallExpression(node)) {
    return false
  }

  const n = node as Record<string, unknown>
  const args = n.arguments as unknown[] | undefined

  if (!args || args.length < 2) {
    return false
  }

  const thisArg = args[0] as Record<string, unknown> | undefined

  if (!thisArg) {
    return false
  }

  const isNullLiteral = thisArg.type === 'Literal' && thisArg.value === null
  const isUndefinedIdentifier = thisArg.type === 'Identifier' && thisArg.name === 'undefined'
  const isThisExpression = thisArg.type === 'ThisExpression'

  return isNullLiteral || isUndefinedIdentifier || isThisExpression
}

function getNodeText(node: unknown, source: string): string {
  const range = getRange(node)
  if (!range) {
    return ''
  }
  return source.slice(range[0], range[1])
}

function getApplyArgs(node: unknown): unknown[] {
  if (!isCallExpression(node)) {
    return []
  }
  const n = node as Record<string, unknown>
  const args = n.arguments as unknown[] | undefined
  if (!args || args.length < 2) {
    return []
  }
  return args.slice(1)
}

function getConcatArgs(node: unknown): unknown[] {
  if (!isCallExpression(node)) {
    return []
  }
  const n = node as Record<string, unknown>
  const args = n.arguments as unknown[] | undefined
  return args ?? []
}

export const preferSpreadRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Prefer spread syntax over .apply() and .concat(). Use ...args instead of fn.apply(this, args), and [...arr1, ...arr2] instead of arr1.concat(arr2).',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-spread',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isCallExpression(node)) {
          return
        }

        if (isApplyCall(node) && hasAcceptableApplyContext(node)) {
          const calleeObject = getCalleeObject(node)
          const location = extractLocation(node)
          const calleeName =
            calleeObject &&
            typeof calleeObject === 'object' &&
            (calleeObject as Record<string, unknown>).type === 'Identifier'
              ? ((calleeObject as Record<string, unknown>).name as string)
              : 'function'

          let fix: { range: readonly [number, number]; text: string } | undefined
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
            message: `Prefer spread syntax over .apply(). Use ${calleeName}(...args) instead of ${calleeName}.apply().`,
            loc: location,
            fix,
          })
          return
        }

        if (isConcatCall(node)) {
          const location = extractLocation(node)
          const calleeObject = getCalleeObject(node)
          const calleeName =
            calleeObject &&
            typeof calleeObject === 'object' &&
            (calleeObject as Record<string, unknown>).type === 'Identifier'
              ? ((calleeObject as Record<string, unknown>).name as string)
              : 'array'

          let fix: { range: readonly [number, number]; text: string } | undefined
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
            message: `Prefer spread syntax over .concat(). Use [...${calleeName}, ...other] instead of ${calleeName}.concat(other).`,
            loc: location,
            fix,
          })
        }
      },
    }
  },
}

export default preferSpreadRule
