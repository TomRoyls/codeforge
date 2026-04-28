import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

interface PrivateMemberInfo {
  location: SourceLocation
  name: string
  type: 'method' | 'property'
  used: boolean
}

interface ClassInfo {
  privateMembers: Map<string, PrivateMemberInfo>
}

function isPrivateIdentifier(node: unknown): node is { name: string; type: 'PrivateIdentifier'; } {
  return toASTNode(node)?.type === 'PrivateIdentifier'
}

export const noUnusedPrivateMembersRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const classStack: ClassInfo[] = []

    function currentClass(): ClassInfo | undefined {
      return classStack.at(-1)
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
            loc: member.location,
            message: `${member.type === 'method' ? 'Private method' : 'Private property'} '#${member.name}' is declared but never used.`,
          })
        }
      }
    }

    function registerPrivateMember(
      name: string,
      location: SourceLocation,
      type: 'method' | 'property',
    ): void {
      const classInfo = currentClass()
      if (!classInfo) {
        return
      }

      classInfo.privateMembers.set(name, {
        location,
        name,
        type,
        used: false,
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
      BinaryExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.operator !== 'in') return
        if (isPrivateIdentifier(n.left)) {
          markPrivateMemberUsed(n.left.name)
        }
      },

      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return
        const callee = toASTNode(n.callee)
        if (callee?.type === 'MemberExpression') {
          const prop = toASTNode(callee.property)
          if (isPrivateIdentifier(prop)) {
            markPrivateMemberUsed(prop.name)
          }
        }
      },

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

      MemberExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return
        if (isPrivateIdentifier(n.property)) {
          markPrivateMemberUsed(n.property.name)
        }
      },

      MethodDefinition(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return
        if (isPrivateIdentifier(n.key)) {
          registerPrivateMember(n.key.name, extractLocation(node), 'method')
        }
      },

      PropertyDefinition(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return
        if (isPrivateIdentifier(n.key)) {
          registerPrivateMember(n.key.name, extractLocation(node), 'property')
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow unused private class members. Private properties and methods that are declared but never used within the class may indicate dead code or incomplete implementation.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-unused-private-members',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'problem',
  },
}

export default noUnusedPrivateMembersRule
