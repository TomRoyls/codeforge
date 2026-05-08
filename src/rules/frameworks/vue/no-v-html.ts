import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { getNodeRange } from '../../../ast/visitor.js'

interface NoVHtmlOptions extends RuleOptions {}

export const noVHtmlRule: RuleDefinition<NoVHtmlOptions> = {
  create(_options: NoVHtmlOptions) {
    const violations: RuleViolation[] = []

    return {
      onComplete() {
        return violations
      },
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          if (Node.isStringLiteral(node)) {
            const text = node.getLiteralText()
            if (text.includes('v-html')) {
              const range = getNodeRange(node)
              violations.push({
                filePath: node.getSourceFile().getFilePath(),
                message: 'Use of v-html directive detected. This can lead to XSS vulnerabilities.',
                range,
                ruleId: 'vue/no-v-html',
                severity: 'warning',
                suggestion: 'Use v-text or a sanitization library to safely render HTML content.',
              })
            }
          }

          if (Node.isJsxAttribute(node)) {
            const nameNode = node.getNameNode()
            if (nameNode.getText() === 'v-html') {
              const range = getNodeRange(node)
              violations.push({
                filePath: node.getSourceFile().getFilePath(),
                message: 'Use of v-html directive detected. This can lead to XSS vulnerabilities.',
                range,
                ruleId: 'vue/no-v-html',
                severity: 'warning',
                suggestion: 'Use v-text or a sanitization library to safely render HTML content.',
              })
            }
          }

          if (Node.isTemplateExpression(node)) {
            const text = node.getText()
            if (text.includes('v-html')) {
              const range = getNodeRange(node)
              violations.push({
                filePath: node.getSourceFile().getFilePath(),
                message: 'Use of v-html directive detected. This can lead to XSS vulnerabilities.',
                range,
                ruleId: 'vue/no-v-html',
                severity: 'warning',
                suggestion: 'Use v-text or a sanitization library to safely render HTML content.',
              })
            }
          }
        },
      },
    }
  },
  defaultOptions: {},
  meta: {
    category: 'security',
    description: 'Detects use of v-html directive which can lead to XSS vulnerabilities',
    name: 'vue/no-v-html',
    recommended: true,
    severity: 'warning',
  },
}

export default noVHtmlRule
