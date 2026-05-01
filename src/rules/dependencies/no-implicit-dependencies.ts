import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

const BUILTIN_MODULES = new Set([
  'assert', 'buffer', 'child_process', 'cluster', 'console', 'constants',
  'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'https',
  'module', 'net', 'os', 'path', 'perf_hooks', 'process', 'punycode',
  'querystring', 'readline', 'repl', 'stream', 'string_decoder', 'sys',
  'timers', 'tls', 'tty', 'url', 'util', 'v8', 'vm', 'worker_threads', 'zlib',
])

export const noImplicitDependenciesRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        const n = toASTNode(node)
        if (!n || n.type !== 'Literal') return

        const value = (n as { value?: unknown }).value
        if (typeof value !== 'string') return

        if (value.startsWith('node:')) return
        if (value.startsWith('.') || value.startsWith('/')) return

        const moduleName = value.startsWith('@')
          ? value.split('/').slice(0, 2).join('/')
          : value.split('/')[0]

        if (!moduleName) return

        if (BUILTIN_MODULES.has(moduleName)) return

        context.report({
          loc: extractLocation(n),
          message: `Module \`${moduleName}\` is not explicitly listed as a dependency. Add it to your package.json dependencies.`,
          node: n,
        })
      },
    }
  },

  meta: {
    docs: {
      category: 'dependencies',
      description: 'Disallow importing modules that are not explicitly listed as dependencies',
      recommended: false,
      url: 'https://codeforge.dev/docs/rules/no-implicit-dependencies',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noImplicitDependenciesRule
