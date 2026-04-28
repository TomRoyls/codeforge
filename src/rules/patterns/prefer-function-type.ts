import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getRange, toASTNode } from '../../utils/ast-helpers.js'

function isTSInterfaceDeclaration(node: unknown): boolean {
  return toASTNode(node)?.type === 'TSInterfaceDeclaration'
}

function isTSCallSignatureDeclaration(node: unknown): boolean {
  return toASTNode(node)?.type === 'TSCallSignatureDeclaration'
}

function hasOnlyCallSignatures(body: unknown[]): boolean {
  if (body.length === 0) return false
  return body.every((member) => isTSCallSignatureDeclaration(member))
}

function buildFunctionTypeFromCallSignatures(
  interfaceName: string,
  callSignatures: unknown[],
): string {
  if (callSignatures.length === 0) {
    return `type ${interfaceName} = () => void`
  }

  const sig = toASTNode(callSignatures[0])
  const params = (sig?.params ?? []) as Array<{ name?: string; type?: string }>

  const paramsStr = params
    .map((p, i) => {
      if (p.type === 'Identifier' && p.name) return p.name
      if (p.type === 'RestElement') return `...args`
      return `param${i + 1}`
    })
    .join(', ')

  let returnTypeStr = 'void'
  const rt = toASTNode(sig?.returnType)
  if (rt?.type === 'TSTypeAnnotation' && rt.typeAnnotation) {
    const typeAnnotation = toASTNode(rt.typeAnnotation)
    switch (typeAnnotation?.type) {
      case 'TSAnyKeyword': {
        returnTypeStr = 'any'
        break
      }

      case 'TSBooleanKeyword': {
        returnTypeStr = 'boolean'
        break
      }

      case 'TSNumberKeyword': {
        returnTypeStr = 'number'
        break
      }

      case 'TSStringKeyword': {
        returnTypeStr = 'string'
        break
      }

      case 'TSTypeReference': {
        const typeName = toASTNode(typeAnnotation.typeName)
        if (typeName?.name) {
          returnTypeStr = typeName.name
        }

        break
      }

      case 'TSVoidKeyword': {
        returnTypeStr = 'void'
        break
      }
      // No default
    }
  }

  return `type ${interfaceName} = (${paramsStr}) => ${returnTypeStr}`
}

export const preferFunctionTypeRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      TSInterfaceDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!isTSInterfaceDeclaration(node) || !n) return

        const bodyNode = toASTNode(n.body)
        const bodyMembers = bodyNode?.body

        if (!Array.isArray(bodyMembers)) return
        if (!hasOnlyCallSignatures(bodyMembers)) return

        const idNode = toASTNode(n.id)
        const interfaceName = idNode?.name
        if (!interfaceName) return

        const callSignatures = bodyMembers.filter((m) => isTSCallSignatureDeclaration(m))
        const location = extractLocation(node)
        const range = getRange(node)

        const suggestedType = buildFunctionTypeFromCallSignatures(interfaceName, callSignatures)

        context.report({
          fix: range ? { range, text: suggestedType } : undefined,
          loc: location,
          message: `Interface '${interfaceName}' has only a call signature. Use a function type instead: \`${suggestedType}\``,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Prefer function type over interface with a single call signature. Function types are more concise and idiomatic for callable types.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-function-type',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default preferFunctionTypeRule
