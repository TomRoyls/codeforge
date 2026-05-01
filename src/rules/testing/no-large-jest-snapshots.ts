import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import {
  getPropertyName,
  toASTNode,
} from '../../utils/ast-helpers.js'

interface NoLargeSnapshotsOptions {
  maxSize?: number
}

const DEFAULT_MAX_SIZE = 50

function getOptions(context: RuleContext): NoLargeSnapshotsOptions {
  const options = context.config?.options
  if (Array.isArray(options) && options.length > 0 && typeof options[0] === 'object' && options[0] !== null) {
    return options[0] as NoLargeSnapshotsOptions
  }
  return {}
}

function countLines(str: string): number {
  if (str.length === 0) return 1
  let count = 1
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '\n') {
      count++
    }
  }
  return count
}

function extractStringValue(arg: unknown): null | string {
  const n = toASTNode(arg)
  if (!n) return null

  if (n.type === 'Literal' && typeof n.value === 'string') {
    return n.value
  }

  if (n.type === 'TemplateLiteral') {
    const quasis = n.quasis
    if (!Array.isArray(quasis) || quasis.length === 0) return null

    if (quasis.length === 1) {
      const quasi = toASTNode(quasis[0])
      if (quasi && typeof quasi.value === 'object' && quasi.value !== null) {
        const valueObj = quasi.value as Record<string, unknown>
        const cooked = valueObj.cooked
        if (typeof cooked === 'string') {
          return cooked
        }
      }
    }

    return null
  }

  return null
}

function isMatchInlineSnapshotCall(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee || callee.type !== 'MemberExpression') return false

  const propertyName = getPropertyName(callee.property)
  return propertyName === 'toMatchInlineSnapshot'
}

function findSnapshotArgument(node: unknown): unknown {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return null

  const args = n.arguments
  if (!Array.isArray(args) || args.length === 0) return null

  // toMatchInlineSnapshot can have propertyMatchers before the snapshot string
  // The snapshot string is the first string Literal or TemplateLiteral argument
  for (const arg of args) {
    const argNode = toASTNode(arg)
    if (!argNode) continue

    if (argNode.type === 'Literal' && typeof argNode.value === 'string') {
      return arg
    }

    if (argNode.type === 'TemplateLiteral') {
      return arg
    }
  }

  return null
}

export const noLargeJestSnapshotsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = getOptions(context)
    const maxSize = typeof options.maxSize === 'number' ? options.maxSize : DEFAULT_MAX_SIZE

    return {
      CallExpression(node: unknown): void {
        if (!isMatchInlineSnapshotCall(node)) return

        const snapshotArg = findSnapshotArgument(node)
        if (snapshotArg === null) return

        const stringValue = extractStringValue(snapshotArg)
        if (stringValue === null) return

        const lineCount = countLines(stringValue)

        if (lineCount > maxSize) {
          context.report({
            loc: extractLocation(node),
            message: `Inline snapshot exceeds maximum size of ${maxSize} lines (${lineCount} lines). Consider externalizing this snapshot.`,
            node,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'testing',
      description:
        'Disallow large inline snapshots that should be externalized',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-large-jest-snapshots',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          maxSize: {
            type: 'number',
          },
        },
        type: 'object',
      },
    ],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noLargeJestSnapshotsRule
