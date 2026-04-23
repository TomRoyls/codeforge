import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

type DeclarationType = 'class' | 'function' | 'interface'

interface DeclarationInfo {
  name: string
  node: unknown
  type: DeclarationType
}

function getDeclarationName(node: unknown): null | { name: string; type: DeclarationType } {
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
): null | string {
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
            loc: location,
            message,
          })
        }
      } else {
        declarations.set(declInfo.name, {
          name: declInfo.name,
          node,
          type: declInfo.type,
        })
      }
    }

    return {
      ClassDeclaration(node: unknown): void {
        checkDeclaration(node, 'class')
      },

      FunctionDeclaration(node: unknown): void {
        checkDeclaration(node, 'function')
      },

      TSInterfaceDeclaration(node: unknown): void {
        checkDeclaration(node, 'interface')
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow unsafe declaration merging between classes, interfaces, and functions. Declaration merging can lead to confusing code and unexpected type behavior.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unsafe-declaration-merging',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noUnsafeDeclarationMergingRule
