import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'

const DIALOG_FUNCTIONS = new Set(['alert', 'confirm', 'prompt'])

function isDialogCall(node: unknown): null | string {
  if (!node || typeof node !== 'object') return null
  const n = node as Record<string, unknown>
  if (n.type !== 'CallExpression') return null

  const {callee} = n
  if (!callee || typeof callee !== 'object') return null
  const c = callee as Record<string, unknown>

  // Direct call: alert(), confirm(), prompt()
  if (c.type === 'Identifier' && typeof c.name === 'string' && DIALOG_FUNCTIONS.has(c.name)) {
    return c.name
  }

  // Member call: window.alert(), globalThis.confirm()
  if (c.type === 'MemberExpression') {
    const obj = c.object as Record<string, unknown> | undefined
    const prop = c.property as Record<string, unknown> | undefined
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
