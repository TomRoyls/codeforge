import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function isAnyKeyword(node: unknown): boolean {
  return toASTNode(node)?.type === 'TSAnyKeyword'
}

function isObjectKeyword(node: unknown): boolean {
  return toASTNode(node)?.type === 'TSObjectKeyword'
}

function isEmptyTypeLiteral(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  if (n.type !== 'TSTypeLiteral') return false
  const {members} = n
  return Array.isArray(members) && members.length === 0
}

function isArrayOfAny(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  if (n.type !== 'TSArrayType') return false
  return isAnyKeyword(n.elementType)
}

function isRecordStringAny(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false
  if (n.type !== 'TSTypeReference') return false

  const typeNameNode = toASTNode(n.typeName)
  if (!typeNameNode || typeNameNode.name !== 'Record') return false

  const typeArgs = n.typeArguments
  const argsNode = toASTNode(typeArgs)
  if (!argsNode) return false

  const {params} = argsNode
  if (!Array.isArray(params) || params.length !== 2) return false

  const firstParam = toASTNode(params[0])
  if (!firstParam) return false
  const isFirstString =
    firstParam.type === 'TSStringKeyword' ||
    (firstParam.type === 'TSTypeReference' &&
      toASTNode(firstParam.typeName)?.name === 'string')

  return isFirstString && isAnyKeyword(params[1])
}

function getConstraintText(constraint: unknown): string {
  const n = toASTNode(constraint)
  if (!n) return 'unknown'

  switch (n.type) {
    case 'TSAnyKeyword': {
      return 'any'
    }

    case 'TSArrayType': {
      return 'any[]'
    }

    case 'TSObjectKeyword': {
      return 'object'
    }

    case 'TSTypeLiteral': {
      return '{}'
    }

    case 'TSTypeReference': {
      const typeName = toASTNode(n.typeName)
      if (typeName?.name === 'Record') return 'Record<string, any>'
      return typeName?.name ?? 'unknown'
    }

    default: {
      return n.type ?? 'unknown'
    }
  }
}

function isUnnecessaryConstraint(constraint: unknown): boolean {
  return (
    isAnyKeyword(constraint) ||
    isObjectKeyword(constraint) ||
    isEmptyTypeLiteral(constraint) ||
    isArrayOfAny(constraint) ||
    isRecordStringAny(constraint)
  )
}

export const noUnnecessaryTypeConstraintRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TSTypeParameter(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return
        if (n.type !== 'TSTypeParameter') return

        const {constraint} = n
        if (!constraint) return

        if (!isUnnecessaryConstraint(constraint)) return

        const nameNode = toASTNode(n.name)
        const paramName = nameNode?.name ?? 'T'
        const constraintText = getConstraintText(constraint)
        const location = extractLocation(node)

        context.report({
          loc: location,
          message: `Unnecessary type constraint '${constraintText}' on type parameter '${paramName}'. This constraint does not restrict the type.`,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow unnecessary type constraints on generic type parameters. Constraints like `extends any`, `extends object`, `extends {}`, or `extends Record<string, any>` are vacuous and can be removed.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-type-constraint',
    },
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryTypeConstraintRule
