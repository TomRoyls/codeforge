import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

type DeclarationType = 'class' | 'interface' | 'function'

interface DeclarationInfo {
  type: DeclarationType
  name: string
  node: unknown
}

function getDeclarationName(node: unknown): { name: string; type: DeclarationType } | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>

  if (n.type === 'ClassDeclaration') {
    const id = n.id as Record<string, unknown> | undefined
    if (id && typeof id === 'object' && id.type === 'Identifier') {
      const name = typeof id.name === 'string' ? id.name : undefined
      if (name) {
        return { name, type: 'class' }
      }
    }
    return null
  }

  if (n.type === 'TSInterfaceDeclaration') {
    const id = n.id as Record<string, unknown> | undefined
    if (id && typeof id === 'object' && id.type === 'Identifier') {
      const name = typeof id.name === 'string' ? id.name : undefined
      if (name) {
        return { name, type: 'interface' }
      }
    }
    return null
  }

  if (n.type === 'FunctionDeclaration') {
    const id = n.id as Record<string, unknown> | undefined
    if (id && typeof id === 'object' && id.type === 'Identifier') {
      const name = typeof id.name === 'string' ? id.name : undefined
      if (name) {
        return { name, type: 'function' }
      }
    }
    return null
  }

  return null
}

function isUnsafeMerging(
  existingType: DeclarationType,
  newType: DeclarationType,
  name: string,
): string | null {
  if (
    (existingType === 'class' && newType === 'interface') ||
    (existingType === 'interface' && newType === 'class')
  ) {
    return `Unsafe declaration merging: '${name}' is declared as both a class and an interface. This can lead to unexpected type behavior.`
  }

  if (
    (existingType === 'function' && newType === 'interface') ||
    (existingType === 'interface' && newType === 'function')
  ) {
    return `Unsafe declaration merging: '${name}' is declared as both a function and an interface. Consider using a namespace instead.`
  }

  return null
}

export const noUnsafeDeclarationMergingRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description:
        'Disallow unsafe declaration merging between classes, interfaces, and functions. Declaration merging can lead to confusing code and unexpected type behavior.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unsafe-declaration-merging',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    const declarations: Map<string, DeclarationInfo> = new Map()

    function checkDeclaration(node: unknown, expectedType: DeclarationType): void {
      const declInfo = getDeclarationName(node)

      if (!declInfo || declInfo.type !== expectedType) {
        return
      }

      const existing = declarations.get(declInfo.name)

      if (existing) {
        const message = isUnsafeMerging(existing.type, declInfo.type, declInfo.name)

        if (message) {
          const location = extractLocation(node)

          context.report({
            message,
            loc: location,
          })
        }
      } else {
        declarations.set(declInfo.name, {
          type: declInfo.type,
          name: declInfo.name,
          node,
        })
      }
    }

    return {
      ClassDeclaration(node: unknown): void {
        checkDeclaration(node, 'class')
      },

      TSInterfaceDeclaration(node: unknown): void {
        checkDeclaration(node, 'interface')
      },

      FunctionDeclaration(node: unknown): void {
        checkDeclaration(node, 'function')
      },
    }
  },
}

export default noUnsafeDeclarationMergingRule
