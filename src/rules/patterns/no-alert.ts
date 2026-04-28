import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const DIALOG_FUNCTIONS = new Set(['alert', 'confirm', 'prompt'])

function isDialogCall(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return null

  const callee = toASTNode(n.callee)
  if (!callee) return null

  // Direct call: alert(), confirm(), prompt()
  if (callee.type === 'Identifier' && typeof callee.name === 'string' && DIALOG_FUNCTIONS.has(callee.name)) {
    return callee.name
  }

  // Member call: window.alert(), globalThis.confirm()
  if (callee.type === 'MemberExpression') {
    const obj = toASTNode(callee.object)
    const prop = toASTNode(callee.property)
    if (
      obj?.type === 'Identifier' &&
      (obj.name === 'window' || obj.name === 'globalThis') &&
      prop?.type === 'Identifier' &&
      typeof prop.name === 'string' &&
      DIALOG_FUNCTIONS.has(prop.name)
    ) {
      return prop.name
    }
  }

  return null
}

export const noAlertRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const funcName = isDialogCall(node)
        if (funcName) {
          context.report({
            loc: extractLocation(node),
            message: `Unexpected browser dialog function '${funcName}'. Use a custom user-friendly notification instead.`,
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'patterns',
      description: 'Disallow the use of alert, confirm, and prompt browser dialogs.',
      recommended: true,
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}
export default noAlertRule
