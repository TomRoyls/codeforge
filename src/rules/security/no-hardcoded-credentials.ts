/**
 * @file Detect hardcoded secrets, API keys, passwords, and tokens in source code
 * @module rules/security/no-hardcoded-credentials
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

interface NoHardcodedCredentialsOptions {
  readonly checkAssignments?: boolean
  readonly checkUrls?: boolean
  readonly ignorePatterns?: string[]
}

/** Known secret prefix patterns */
const SECRET_PATTERNS: ReadonlyArray<readonly [RegExp, string]> = [
  [/^AKIA[0-9A-Z]{16}$/, 'AWS Access Key ID'],
  [/^AKIA/, 'AWS Access Key ID (potential)'],
  [/^ghp_[A-Za-z0-9_]{36,}$/, 'GitHub Personal Access Token'],
  [/^ghp_/, 'GitHub Personal Access Token (potential)'],
  [/^gho_[A-Za-z0-9_]{36,}$/, 'GitHub OAuth Token'],
  [/^gho_/, 'GitHub OAuth Token (potential)'],
  [/^ghu_[A-Za-z0-9_]{36,}$/, 'GitHub User-to-Server Token'],
  [/^ghs_[A-Za-z0-9_]{36,}$/, 'GitHub Server-to-Server Token'],
  [/^ghc_[A-Za-z0-9_]{36,}$/, 'GitHub Refresh Token'],
  [/^sk_live_[A-Za-z0-9]{24,}$/, 'Stripe Live Secret Key'],
  [/^sk_test_[A-Za-z0-9]{24,}$/, 'Stripe Test Secret Key'],
  [/^rk_live_[A-Za-z0-9]{24,}$/, 'Stripe Live Restricted Key'],
  [/^sk-ant-[A-Za-z0-9_-]{95,}$/, 'Anthropic API Key'],
  [/^xox[bpors]-[A-Za-z0-9-]+$/, 'Slack Token'],
  [/^hooks\.slack\.com\/services\/T/, 'Slack Webhook URL'],
  [/^eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}$/, 'JWT Token'],
  [/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/, 'JWT-like Token'],
  [/^AIza[A-Za-z0-9_-]{35}$/, 'Google API Key'],
  [/^[0-9a-f]{32}$/, 'Possible MD5 hash / secret key (32 hex chars)'],
  [/^[0-9a-f]{40}$/, 'Possible SHA-1 hash / secret (40 hex chars)'],
  [/^[0-9a-f]{64}$/, 'Possible SHA-256 hash / secret (64 hex chars)'],
]

/** Variable name patterns that suggest credential storage */
const CREDENTIAL_VARIABLE_PATTERNS: ReadonlyArray<RegExp> = [
  /password/i,
  /passwd/i,
  /pass_word/i,
  /secret/i,
  /api_?key/i,
  /apikey/i,
  /auth_?token/i,
  /access_?token/i,
  /refresh_?token/i,
  /private_?key/i,
  /secret_?key/i,
  /client_?secret/i,
  /consumer_?secret/i,
  /db_?password/i,
  /database_?password/i,
  /redis_?password/i,
  /mongo_?password/i,
  /mysql_?password/i,
  /postgres_?password/i,
  /smtp_?password/i,
  /ftp_?password/i,
  /ssh_?key/i,
  /token/i,
]

/** Placeholder patterns that should NOT be flagged */
const PLACEHOLDER_PATTERNS: ReadonlyArray<RegExp> = [
  /^$/,
  /^(your[_-]?)?(api[_-]?key|secret|password|token)[-_](here|placeholder|value)$/i,
  /^(xxx+|<[^>]+>|\[.*\]|\{.*\}|REPLACE[_-]?ME|TODO|CHANGEME|INSERT[_-]?.*HERE)$/i,
  /^(example|sample|test|demo|dummy|fake|mock|default|placeholder|your[_-]?.+here)$/i,
  /^(N\/A|null|undefined|none|empty|\*\*\*+|\.\.\.)$/i,
  /^(process\.env|import\.meta|CONFIG|config)\./i,
  /^\$\{.*\}$/,  // template variable like ${VAR}
  /^(https?:\/\/)(user|username|admin|name|key)(:|%3A)(pass|password|secret|token|key)(@|%40)/i,
]

/** URL credential pattern: protocol://user:pass@host */
const URL_CREDENTIAL_PATTERN = /[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^:@\s]+:[^:@\s]+@/

function isPlaceholder(value: string): boolean {
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value.trim()))
}

function matchesSecretPattern(value: string): null | string {
  for (const [pattern, name] of SECRET_PATTERNS) {
    if (pattern.test(value)) {
      return name
    }
  }

  return null
}

function hasCredentialInUrl(value: string): boolean {
  return URL_CREDENTIAL_PATTERN.test(value)
}

function isCredentialVariableName(name: string): boolean {
  return CREDENTIAL_VARIABLE_PATTERNS.some((pattern) => pattern.test(name))
}

function isIgnored(value: string, ignorePatterns: readonly string[]): boolean {
  return ignorePatterns.some((pattern) => {
    try {
      return new RegExp(pattern).test(value)
    } catch {
      return value.includes(pattern)
    }
  })
}

function getStringValue(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n) return null

  if (n.type === 'Literal' && typeof n.value === 'string') {
    return n.value
  }

  if (n.type === 'TemplateLiteral' && n.quasis && n.quasis.length === 1) {
    const quasi = toASTNode(n.quasis[0])
    if (quasi?.value && typeof (quasi.value as Record<string, unknown>).cooked === 'string') {
      return (quasi.value as Record<string, unknown>).cooked as string
    }

    if (typeof quasi?.raw === 'string' && !/\$\{/.test(quasi.raw)) {
      return quasi.raw
    }
  }

  return null
}

function getVariableName(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n) return null

  if (n.type === 'Identifier' && typeof n.name === 'string') {
    return n.name
  }

  // For MemberExpression, get the property name (e.g., config.password)
  if (n.type === 'MemberExpression') {
    const property = toASTNode(n.property)
    if (property?.type === 'Identifier' && typeof property.name === 'string') {
      return property.name
    }
  }

  return null
}

interface ScanContext {
  checkAssignments: boolean
  checkUrls: boolean
  context: RuleContext
  options: NoHardcodedCredentialsOptions
}

function scanObjectArgForCredentials(
  n: ReturnType<typeof toASTNode> & { arguments?: unknown[] },
  node: unknown,
  calleeName: string,
  scanCtx: ScanContext,
): void {
  if (!n.arguments || n.arguments.length === 0) return

  const firstArg = toASTNode(n.arguments[0])
  if (firstArg?.type !== 'ObjectExpression' || !firstArg.properties) return

  for (const prop of firstArg.properties) {
    const p = toASTNode(prop)
    if (!p || p.type !== 'Property') continue

    const keyName = getVariableName(p.key)
    if (!keyName || !isCredentialVariableName(keyName)) continue

    const value = getStringValue(p.value)
    if (value !== null) {
      checkAndReport(value, node, scanCtx.context, { ...scanCtx.options, checkAssignments: scanCtx.checkAssignments, checkUrls: scanCtx.checkUrls }, `credential passed as '${keyName}' to '${calleeName}'`)
    }
  }
}

function checkAndReport(
  value: string,
  node: unknown,
  context: RuleContext,
  options: NoHardcodedCredentialsOptions,
  reason: string,
): void {
  if (isPlaceholder(value)) return

  const ignorePatterns = options.ignorePatterns ?? []
  if (isIgnored(value, ignorePatterns)) return

  const location = extractLocation(node)
  context.report({
    loc: location,
    message: `Potential hardcoded secret detected: ${reason}. Use environment variables or a secrets manager instead.`,
    node,
  })
}

export const noHardcodedCredentialsRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = context.config.options?.[0] as NoHardcodedCredentialsOptions | undefined
    const checkAssignments = options?.checkAssignments ?? true
    const checkUrls = options?.checkUrls ?? true

    return {
      AssignmentExpression(node: unknown): void {
        if (!checkAssignments) return

        const n = toASTNode(node)
        if (!n) return

        const varName = getVariableName(n.left)
        if (!varName || !isCredentialVariableName(varName)) return

        const value = getStringValue(n.right)
        if (value === null) return

        checkAndReport(value, node, context, { ...options, checkAssignments, checkUrls }, `credential assigned to variable '${varName}'`)
      },

      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        // Check for environment variable defaults with secrets
        const callee = toASTNode(n.callee)
        if (!callee) return

        // Detect process.env.VARIABLE || 'secret_default' pattern
        // and calls like config({ password: 'hardcoded' })
        if (callee.type === 'Identifier' && typeof callee.name === 'string') {
          const calleeName = callee.name
          scanObjectArgForCredentials(n, node, calleeName, { checkAssignments, checkUrls, context, options: options ?? {} })
        }
      },

      Literal(node: unknown): void {
        const value = getStringValue(node)
        if (value === null) return

        // Check for known secret patterns
        const matchedPattern = matchesSecretPattern(value)
        if (matchedPattern) {
          checkAndReport(value, node, context, { ...options, checkAssignments, checkUrls }, matchedPattern)
          return
        }

        // Check for URLs with embedded credentials
        if (checkUrls && hasCredentialInUrl(value)) {
          checkAndReport(value, node, context, { ...options, checkAssignments, checkUrls }, 'URL with embedded credentials')
          
        }
      },

      VariableDeclarator(node: unknown): void {
        if (!checkAssignments) return

        const n = toASTNode(node)
        if (!n) return

        const varName = getVariableName(n.id)
        if (!varName || !isCredentialVariableName(varName)) return

        const value = getStringValue(n.init)
        if (value === null) return

        checkAndReport(value, node, context, { ...options, checkAssignments, checkUrls }, `credential assigned to variable '${varName}'`)
      },
    }
  },

  meta: {
    docs: {
      category: 'security',
      description:
        'Detect hardcoded secrets, API keys, passwords, and tokens in source code. These values should be stored in environment variables or secrets managers.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-hardcoded-credentials',
    },
    fixable: undefined,
    schema: [
      {
        additionalProperties: false,
        properties: {
          checkAssignments: {
            default: true,
            type: 'boolean',
          },
          checkUrls: {
            default: true,
            type: 'boolean',
          },
          ignorePatterns: {
            default: [],
            items: { type: 'string' },
            type: 'array',
          },
        },
        type: 'object',
      },
    ],
    severity: 'error',
    type: 'problem',
  },
}

export default noHardcodedCredentialsRule
