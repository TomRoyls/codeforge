import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, getRange } from '../../utils/ast-helpers.js'

interface TSInterfaceDeclaration {
  type: 'TSInterfaceDeclaration'
  id: { name: string; type: 'Identifier' }
  body: { type: 'TSInterfaceBody'; body: unknown[] }
  typeParameters?: unknown
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  range?: [number, number]
}

interface TSCallSignatureDeclaration {
  type: 'TSCallSignatureDeclaration'
  params: unknown[]
  returnType?: unknown
  typeParameters?: unknown
}

function isTSInterfaceDeclaration(node: unknown): node is TSInterfaceDeclaration {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'TSInterfaceDeclaration'
}

function isTSCallSignatureDeclaration(node: unknown): node is TSCallSignatureDeclaration {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'TSCallSignatureDeclaration'
}

/**
 * Checks if the interface body contains only call signatures.
 * An interface that only has call signatures can be simplified to a function type.
 */
function hasOnlyCallSignatures(body: unknown[]): boolean {
  if (body.length === 0) {
    return false
  }

  return body.every((member) => isTSCallSignatureDeclaration(member))
}

/**
 * Extracts the function type representation from call signatures.
 * For simplicity, returns a basic function type string.
 */
function buildFunctionTypeFromCallSignatures(
  interfaceName: string,
  callSignatures: TSCallSignatureDeclaration[],
): string {
  if (callSignatures.length === 0) {
    return `type ${interfaceName} = () => void`
  }

  const signature = callSignatures[0]!
  const params = (signature.params as Array<{ type?: string; name?: string }> | undefined) ?? []

  // Build params string - simplified representation
  const paramsStr = params
    .map((p, i) => {
      if (p.type === 'Identifier' && p.name) {
        return p.name
      }
      if (p.type === 'RestElement') {
        return `...args`
      }
      return `param${i + 1}`
    })
    .join(', ')

  // Determine return type
  let returnTypeStr = 'void'
  if (signature.returnType && typeof signature.returnType === 'object') {
    const rt = signature.returnType as Record<string, unknown>
    if (rt.type === 'TSTypeAnnotation' && rt.typeAnnotation) {
      const typeAnnotation = rt.typeAnnotation as Record<string, unknown>
      if (typeAnnotation.type === 'TSStringKeyword') {
        returnTypeStr = 'string'
      } else if (typeAnnotation.type === 'TSNumberKeyword') {
        returnTypeStr = 'number'
      } else if (typeAnnotation.type === 'TSBooleanKeyword') {
        returnTypeStr = 'boolean'
      } else if (typeAnnotation.type === 'TSAnyKeyword') {
        returnTypeStr = 'any'
      } else if (typeAnnotation.type === 'TSVoidKeyword') {
        returnTypeStr = 'void'
      } else if (typeAnnotation.type === 'TSTypeReference') {
        // Try to extract the type name
        if (typeAnnotation.typeName && typeof typeAnnotation.typeName === 'object') {
          const typeName = typeAnnotation.typeName as Record<string, unknown>
          if (typeName.name) {
            returnTypeStr = typeName.name as string
          }
        }
      }
    }
  }

  return `type ${interfaceName} = (${paramsStr}) => ${returnTypeStr}`
}

export const preferFunctionTypeRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Prefer function type over interface with a single call signature. Function types are more concise and idiomatic for callable types.',
      category: 'patterns',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/prefer-function-type',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      TSInterfaceDeclaration(node: unknown): void {
        if (!isTSInterfaceDeclaration(node)) {
          return
        }

        const bodyMembers = node.body.body

        // Check if the interface only has call signatures
        if (!hasOnlyCallSignatures(bodyMembers)) {
          return
        }

        const interfaceName = node.id.name
        const callSignatures = bodyMembers.filter(isTSCallSignatureDeclaration)
        const location = extractLocation(node)
        const range = getRange(node)

        // Build suggested function type
        const suggestedType = buildFunctionTypeFromCallSignatures(interfaceName, callSignatures)

        context.report({
          message: `Interface '${interfaceName}' has only a call signature. Use a function type instead: \`${suggestedType}\``,
          loc: location,
          fix: range
            ? {
                range,
                text: suggestedType,
              }
            : undefined,
        })
      },
    }
  },
}

export default preferFunctionTypeRule
