import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const RESTRICTED_MODULES = [
  'eval',
  'child_process',
  'fs/promises',
  'crypto',
  'os',
  'path',
  'url',
  'vm',
  'cluster',
  'dgram',
  'net',
  'tls',
  'https',
  'http',
  'dns',
]

const RESTRICTED_PATTERNS = [
  /\beval\b/,
  /child_process/,
]

function isRestrictedSource(source: string): boolean {
  const bare = source.replace(/^node:/, '')
  if (RESTRICTED_MODULES.includes(bare)) return true
  for (const pattern of RESTRICTED_PATTERNS) {
    if (pattern.test(bare)) return true
  }
  return false
}

function getReason(source: string): string {
  const bare = source.replace(/^node:/, '')
  if (bare === 'eval') return "'eval' is a security risk. Avoid importing or requiring eval-related modules."
  if (bare === 'child_process') return "'child_process' allows executing shell commands which can lead to command injection vulnerabilities."
  if (bare === 'vm') return "'vm' module can be used to execute arbitrary code. Use safer alternatives."
  return "'" + source + "' is a restricted module. Consider whether this import is necessary and properly secured."
}

export const noRestrictedImportsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ImportDeclaration(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'ImportDeclaration') return

        const source = (n as { source?: unknown }).source
        if (!source || (source as { type?: string }).type !== 'StringLiteral') return

        const value = (source as { value?: string }).value
        if (!value || typeof value !== 'string') return

        if (isRestrictedSource(value)) {
          context.report({
            loc: extractLocation(source as Record<string, unknown>),
            message: getReason(value),
            node: source as Record<string, unknown>,
          })
        }
      },
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'CallExpression') return

        const callee = (n as { callee?: unknown }).callee
        if (!callee || (callee as { type?: string }).type !== 'Identifier') return

        const name = (callee as { name?: string }).name
        if (name !== 'require') return

        const args = (n as { arguments?: unknown[] }).arguments
        if (!args || args.length === 0) return

        const firstArg = args[0]
        if (!firstArg || (firstArg as { type?: string }).type !== 'StringLiteral') return

        const value = (firstArg as { value?: string }).value
        if (!value || typeof value !== 'string') return

        if (isRestrictedSource(value)) {
          context.report({
            loc: extractLocation(n),
            message: getReason(value),
            node: n,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'security',
      description: 'Disallow imports from restricted or dangerous modules',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-restricted-imports',
    },
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noRestrictedImportsRule
