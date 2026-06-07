import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { getNodeFilePath, getNodeRange } from '../../../ast/visitor.js'

interface PreferInlineHandlerOptions extends RuleOptions {}

export const preferInlineHandlerRule: RuleDefinition<PreferInlineHandlerOptions> = {
  create(_options: PreferInlineHandlerOptions) {
    const violations: RuleViolation[] = []

    return {
      onComplete() {
        return violations
      },
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          if (Node.isStringLiteral(node)) {
            const text = node.getLiteralValue()
            const handlerPattern = /\bon:(\w+)=\{?\s*\(\)\s*=>\s*(\w+)\(\)\s*\}?\s*/g
            let match
            while ((match = handlerPattern.exec(text)) !== null) {
              const range = getNodeRange(node)
              violations.push({
                filePath: getNodeFilePath(node),
                message: `Event handler '${match[1]}' uses an arrow function wrapper for a simple call to '${match[2]}'.`,
                range,
                ruleId: 'svelte/prefer-inline-handler',
                severity: 'info',
                suggestion: `Use on:${match[1]}={${match[2]}} instead of wrapping in an arrow function.`,
              })
            }
          }

          if (Node.isJsxAttribute(node)) {
            const nameNode = node.getNameNode()
            const name = nameNode.getText()
            if (!name.startsWith('on:')) return

            const initializer = node.getInitializer()
            if (!initializer) return

            if (Node.isJsxExpression(initializer)) {
              const expression = initializer.getExpression()
              if (!expression) return

              if (Node.isArrowFunction(expression)) {
                const params = expression.getParameters()
                if (params.length !== 0) return

                const body = expression.getBody()
                if (Node.isCallExpression(body)) {
                  const args = body.getArguments()
                  if (args.length === 0) {
                    const callee = body.getExpression()
                    if (Node.isIdentifier(callee)) {
                      const range = getNodeRange(expression)
                      violations.push({
                        filePath: getNodeFilePath(node),
                        message: `Event handler '${name}' uses an arrow function wrapper for a simple call to '${callee.getText()}'.`,
                        range,
                        ruleId: 'svelte/prefer-inline-handler',
                        severity: 'info',
                        suggestion: `Use ${name}={${callee.getText()}} instead of wrapping in an arrow function.`,
                      })
                    }
                  }
                }
              }
            }
          }
        },
      },
    }
  },
  defaultOptions: {},
  meta: {
    category: 'patterns',
    description: 'Suggests inline event handlers for simple expressions in Svelte',
    name: 'svelte/prefer-inline-handler',
    recommended: true,
    severity: 'info',
  },
}

export default preferInlineHandlerRule
