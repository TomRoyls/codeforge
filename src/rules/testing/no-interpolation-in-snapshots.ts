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

function hasInterpolation(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'TemplateLiteral') return false

  const expressions = n.expressions
  return Array.isArray(expressions) && expressions.length > 0
}

export const noInterpolationInSnapshotsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        if (!isMatchInlineSnapshotCall(node)) return

        const snapshotArg = findSnapshotArgument(node)
        if (snapshotArg === null) return

        // Literal strings are always safe — no interpolation possible
        const argNode = toASTNode(snapshotArg)
        if (!argNode) return

        if (argNode.type === 'Literal') return

        if (argNode.type === 'TemplateLiteral' && hasInterpolation(snapshotArg)) {
          context.report({
            loc: extractLocation(snapshotArg),
            message: 'Do not use template literal interpolation in inline snapshots. Snapshots should be static strings to avoid flaky tests.',
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
        'Disallow template literal interpolation in inline snapshots',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-interpolation-in-snapshots',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noInterpolationInSnapshotsRule
