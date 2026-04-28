import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const POLYFILL_SOURCES: ReadonlySet<string> = new Set([
  '@babel/polyfill',
  '@babel/runtime/regenerator',
  'core-js',
  'core-js-compat',
  'core-js-pure',
  'core-js/features',
  'core-js/proposals',
  'core-js/shim',
  'core-js/stable',
  'core-js/web',
  'polyfill-library',
  'regenerator-runtime',
])

const LEGACY_POLYFILL_SOURCES: ReadonlySet<string> = new Set([
  '@babel/polyfill',
  'core-js',
])

function getImportSource(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n) return null

  if ((n.type === 'ImportDeclaration' || n.type === 'TSImportEqualsDeclaration') && typeof n.source === 'object' && n.source !== null) {
      const src = toASTNode(n.source)
      if (src?.type === 'Literal' && typeof src.value === 'string') {
        return src.value
      }
    }

  if (n.type === 'CallExpression') {
    const callee = toASTNode(n.callee)
    if (callee?.type === 'Identifier' && callee.name === 'require') {
      const args = n.arguments
      if (Array.isArray(args) && args.length > 0) {
        const firstArg = toASTNode(args[0])
        if (firstArg?.type === 'Literal' && typeof firstArg.value === 'string') {
          return firstArg.value
        }
      }
    }
  }

  return null
}

function isPolyfillSource(source: string): boolean {
  const base = source.startsWith('@') ? source : source.split('/')[0] ?? source
  return POLYFILL_SOURCES.has(base) || POLYFILL_SOURCES.has(source)
}

function isLegacyPolyfill(source: string): boolean {
  return LEGACY_POLYFILL_SOURCES.has(source) || source.startsWith('core-js/')
}

export const noUnnecessaryPolyfillsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        const callee = toASTNode(n.callee)
        if (callee?.type !== 'Identifier' || callee.name !== 'require') return

        const source = getImportSource(node)
        if (source === null || !isPolyfillSource(source)) return

        context.report({
          loc: extractLocation(node),
          message: isLegacyPolyfill(source)
            ? `Unexpected polyfill import '${source}'. Modern JavaScript engines support most ES2015+ features natively. Remove this polyfill or configure your build tool to only include needed polyfills.`
            : `Unnecessary polyfill '${source}'. Consider using native APIs or configuring your bundler for targeted polyfill injection.`,
        })
      },

      ImportDeclaration(node: unknown): void {
        const source = getImportSource(node)
        if (source === null || !isPolyfillSource(source)) return

        context.report({
          loc: extractLocation(node),
          message: isLegacyPolyfill(source)
            ? `Unexpected polyfill import '${source}'. Modern JavaScript engines support most ES2015+ features natively. Remove this polyfill or configure your build tool to only include needed polyfills.`
            : `Unnecessary polyfill '${source}'. Consider using native APIs or configuring your bundler for targeted polyfill injection.`,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow unnecessary polyfill imports. Modern JavaScript engines support most ES2015+ features natively, making many polyfills redundant.',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-unnecessary-polyfills',
    },
    fixable: undefined,
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noUnnecessaryPolyfillsRule
