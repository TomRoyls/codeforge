import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'
import { extractLocation } from '../../utils/ast-helpers.js'

interface PrivateMemberInfo {
  name: string
  used: boolean
  location: SourceLocation
  type: 'property' | 'method'
}

interface ClassInfo {
  privateMembers: Map<string, PrivateMemberInfo>
}

function isPrivateIdentifier(node: unknown): node is { type: 'PrivateIdentifier'; name: string } {
  return (
    node !== null &&
    typeof node === 'object' &&
    (node as Record<string, unknown>).type === 'PrivateIdentifier'
  )
}

function getNodeProperty<T>(node: unknown, prop: string): T | undefined {
  if (!node || typeof node !== 'object') {
    return undefined
  }
  return (node as Record<string, unknown>)[prop] as T | undefined
}

export const noUnusedPrivateMembersRule: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description:
        'Disallow unused private class members. Private properties and methods that are declared but never used within the class may indicate dead code or incomplete implementation.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unused-private-members',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    const classStack: ClassInfo[] = []

    function currentClass(): ClassInfo | undefined {
      return classStack[classStack.length - 1]
    }

    function pushClass(): void {
      classStack.push({ privateMembers: new Map() })
    }

    function popClass(): void {
      const classInfo = classStack.pop()
      if (!classInfo) {
        return
      }

      for (const [, member] of classInfo.privateMembers) {
        if (!member.used) {
          context.report({
            message: `${member.type === 'method' ? 'Private method' : 'Private property'} '#${member.name}' is declared but never used.`,
            loc: member.location,
          })
        }
      }
    }

    function registerPrivateMember(
      name: string,
      location: SourceLocation,
      type: 'property' | 'method',
    ): void {
      const classInfo = currentClass()
      if (!classInfo) {
        return
      }
      classInfo.privateMembers.set(name, {
        name,
        used: false,
        location,
        type,
      })
    }

    function markPrivateMemberUsed(name: string): void {
      const classInfo = currentClass()
      if (!classInfo) {
        return
      }
      const member = classInfo.privateMembers.get(name)
      if (member) {
        member.used = true
      }
    }

    return {
      ClassDeclaration(): void {
        pushClass()
      },

      'ClassDeclaration:exit'(): void {
        popClass()
      },

      ClassExpression(): void {
        pushClass()
      },

      'ClassExpression:exit'(): void {
        popClass()
      },

      PropertyDefinition(node: unknown): void {
        const key = getNodeProperty<unknown>(node, 'key')
        if (isPrivateIdentifier(key)) {
          registerPrivateMember(key.name, extractLocation(node), 'property')
        }
      },

      MethodDefinition(node: unknown): void {
        const key = getNodeProperty<unknown>(node, 'key')
        if (isPrivateIdentifier(key)) {
          registerPrivateMember(key.name, extractLocation(node), 'method')
        }
      },

      MemberExpression(node: unknown): void {
        const property = getNodeProperty<unknown>(node, 'property')
        if (isPrivateIdentifier(property)) {
          markPrivateMemberUsed(property.name)
        }
      },

      CallExpression(node: unknown): void {
        const callee = getNodeProperty<unknown>(node, 'callee')
        if (isMemberExpression(callee)) {
          const property = getNodeProperty<unknown>(callee, 'property')
          if (isPrivateIdentifier(property)) {
            markPrivateMemberUsed(property.name)
          }
        }
      },

      BinaryExpression(node: unknown): void {
        const left = getNodeProperty<unknown>(node, 'left')
        const operator = getNodeProperty<string>(node, 'operator')
        if (operator === 'in' && isPrivateIdentifier(left)) {
          markPrivateMemberUsed(left.name)
        }
      },
    }
  },
}

function isMemberExpression(node: unknown): boolean {
  return (
    node !== null &&
    typeof node === 'object' &&
    (node as Record<string, unknown>).type === 'MemberExpression'
  )
}

export default noUnusedPrivateMembersRule
