/**
 * @file Detect usage of weak cryptographic algorithms and insecure random number generation
 * @module rules/security/no-weak-crypto
 */

import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
} from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

interface NoWeakCryptoOptions {
  readonly checkMathRandom?: boolean
  readonly ignoreAlgorithms?: readonly string[]
}

const WEAK_HASH_ALGORITHMS = new Set([
  'md5',
  'sha1',
])

const WEAK_CIPHER_ALGORITHMS = new Set([
  'aes-128-ecb',
  'aes-192-ecb',
  'aes-256-ecb',
  'arc4',
  'bf',
  'blowfish',
  'des',
  'des3',
  'des-ede3',
  'ecb',
  'rc4',
])

const DEPRECATED_CRYPTO_METHODS = new Set([
  'createCipher',
  'createDecipher',
])

const SECURE_CIPHER_ALGORITHMS = new Set([
  'aes-128-cbc',
  'aes-128-ccm',
  'aes-128-gcm',
  'aes-192-cbc',
  'aes-192-gcm',
  'aes-256-cbc',
  'aes-256-ccm',
  'aes-256-gcm',
  'chacha20-poly1305',
])

const SECURITY_VARIABLE_PATTERNS = /token|secret|password|key|hash|nonce|salt|id/i

const MIN_PBKDF2_ITERATIONS = 10_000

function normalizeAlgorithm(algo: string): string {
  return algo.toLowerCase().trim()
}

function isIgnored(algorithm: string, ignoreList: readonly string[]): boolean {
  const normalized = normalizeAlgorithm(algorithm)
  return ignoreList.some((ignored) => normalizeAlgorithm(ignored) === normalized)
}

function getCalleeMethodInfo(node: unknown): null | { methodName: string; objectName: string } {
  const n = toASTNode(node)
  if (!n) return null

  if (n.type !== 'CallExpression') return null

  const callee = toASTNode(n.callee)
  if (!callee) return null

  if (callee.type === 'MemberExpression') {
    const property = toASTNode(callee.property)
    const object = toASTNode(callee.object)
    if (
      property?.type === 'Identifier' &&
      typeof property.name === 'string' &&
      object?.type === 'Identifier' &&
      typeof object.name === 'string'
    ) {
      return { methodName: property.name, objectName: object.name }
    }
  }

  return null
}

function getFirstStringArgument(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n) return null

  const args = n.arguments
  if (!args || args.length === 0) return null

  const firstArg = toASTNode(args[0])
  if (firstArg?.type === 'Literal' && typeof firstArg.value === 'string') {
    return firstArg.value
  }

  return null
}

function getVariableNameFromParent(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n?.parent) return null

  const parent = toASTNode(n.parent)

  if (parent?.type === 'VariableDeclarator') {
    const id = toASTNode(parent.id)
    if (id?.type === 'Identifier' && typeof id.name === 'string') {
      return id.name
    }
  }

  if (parent?.type === 'AssignmentExpression') {
    const left = toASTNode(parent.left)
    if (left?.type === 'Identifier' && typeof left.name === 'string') {
      return left.name
    }
  }

  if (parent?.type === 'Property') {
    const key = toASTNode(parent.key)
    if (key?.type === 'Identifier' && typeof key.name === 'string') {
      return key.name
    }
  }

  return null
}

function isTestFile(filePath: string): boolean {
  return (
    filePath.includes('.test.') ||
    filePath.includes('.spec.') ||
    filePath.includes('__tests__') ||
    filePath.includes('__mocks__') ||
    filePath.includes('/test/') ||
    filePath.includes('/tests/') ||
    filePath.includes('/spec/')
  )
}

function checkWeakHash(
  node: unknown,
  context: RuleContext,
  algorithm: string,
  ignoreAlgorithms: readonly string[],
): void {
  const normalized = normalizeAlgorithm(algorithm)
  if (WEAK_HASH_ALGORITHMS.has(normalized) && !isIgnored(algorithm, ignoreAlgorithms)) {
    context.report({
      loc: extractLocation(node),
      message: `Weak hash algorithm "${algorithm}" detected. Use a stronger algorithm like SHA-256 or SHA-512.`,
      node,
    })
  }
}

function checkWeakCipher(
  node: unknown,
  context: RuleContext,
  algorithm: string,
  ignoreAlgorithms: readonly string[],
): void {
  const normalized = normalizeAlgorithm(algorithm)
  if (
    WEAK_CIPHER_ALGORITHMS.has(normalized) &&
    !SECURE_CIPHER_ALGORITHMS.has(normalized) &&
    !isIgnored(algorithm, ignoreAlgorithms)
  ) {
    context.report({
      loc: extractLocation(node),
      message: `Weak cipher algorithm "${algorithm}" detected. Use a stronger cipher like AES-256-GCM.`,
      node,
    })
  }
}

function checkPbkdf2Iterations(
  node: unknown,
  context: RuleContext,
  n: ReturnType<typeof toASTNode>,
  methodName: string,
): void {
  const args = n?.arguments
  if (!args || args.length < 3) return

  const iterationsArg = toASTNode(args[2])
  if (iterationsArg?.type === 'Literal' && typeof iterationsArg.value === 'number') {
    const iterations = iterationsArg.value
    if (iterations < MIN_PBKDF2_ITERATIONS) {
      context.report({
        loc: extractLocation(node),
        message: `${methodName}() called with ${iterations} iterations. Use at least ${MIN_PBKDF2_ITERATIONS} iterations for security.`,
        node,
      })
    }
  }
}

interface MemberCallCheckParams {
  readonly checkMathRandom: boolean
  readonly context: RuleContext
  readonly ignoreAlgorithms: readonly string[]
  readonly methodName: string
  readonly n: NonNullable<ReturnType<typeof toASTNode>>
  readonly node: unknown
  readonly objectName: string
}

function checkMemberCall(params: MemberCallCheckParams): void {
  const { checkMathRandom, context, ignoreAlgorithms, methodName, n, node, objectName } = params

  if (objectName !== 'crypto' && objectName !== 'Math') return

  if (objectName === 'crypto') {
    const algorithm = getFirstStringArgument(node)

    if (methodName === 'createHash' && algorithm) {
      checkWeakHash(node, context, algorithm, ignoreAlgorithms)
    }

    if ((methodName === 'createCipheriv' || methodName === 'createDecipheriv') && algorithm) {
      checkWeakCipher(node, context, algorithm, ignoreAlgorithms)
    }

    if (DEPRECATED_CRYPTO_METHODS.has(methodName)) {
      context.report({
        loc: extractLocation(node),
        message: `Deprecated crypto method "crypto.${methodName}()" detected. Use crypto.createCipheriv() or crypto.createDecipheriv() instead.`,
        node,
      })
    }

    if (methodName === 'pbkdf2' || methodName === 'pbkdf2Sync') {
      checkPbkdf2Iterations(node, context, n, `crypto.${methodName}`)
    }
  }

  if (checkMathRandom && objectName === 'Math' && methodName === 'random') {
    const varName = getVariableNameFromParent(node)
    if (varName && SECURITY_VARIABLE_PATTERNS.test(varName)) {
      context.report({
        loc: extractLocation(node),
        message: `Math.random() used for security-sensitive variable "${varName}". Use crypto.randomBytes() or crypto.getRandomValues() instead.`,
        node,
      })
    }
  }
}

function checkStandaloneCall(
  node: unknown,
  context: RuleContext,
  calleeName: string,
  ignoreAlgorithms: readonly string[],
  n: NonNullable<ReturnType<typeof toASTNode>>,
): void {
  const algorithm = getFirstStringArgument(node)

  if (calleeName === 'createHash' && algorithm) {
    checkWeakHash(node, context, algorithm, ignoreAlgorithms)
  }

  if ((calleeName === 'createCipheriv' || calleeName === 'createDecipheriv') && algorithm) {
    checkWeakCipher(node, context, algorithm, ignoreAlgorithms)
  }

  if (calleeName === 'createCipher' || calleeName === 'createDecipher') {
    context.report({
      loc: extractLocation(node),
      message: `Deprecated crypto method "${calleeName}()" detected. Use createCipheriv() or createDecipheriv() instead.`,
      node,
    })
  }

  if (calleeName === 'pbkdf2' || calleeName === 'pbkdf2Sync') {
    checkPbkdf2Iterations(node, context, n, calleeName)
  }
}

export const noWeakCryptoRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    const options = context.config.options?.[0] as NoWeakCryptoOptions | undefined
    const checkMathRandom = options?.checkMathRandom ?? true
    const ignoreAlgorithms: readonly string[] = options?.ignoreAlgorithms ?? []
    const filePath = context.getFilePath()

    return {
      CallExpression(node: unknown): void {
        const n = toASTNode(node)
        if (!n) return

        if (isTestFile(filePath)) return

        const methodInfo = getCalleeMethodInfo(node)
        if (methodInfo) {
          checkMemberCall({
            checkMathRandom,
            context,
            ignoreAlgorithms,
            methodName: methodInfo.methodName,
            n,
            node,
            objectName: methodInfo.objectName,
          })
        }

        // Standalone function calls (e.g. import { createHash } from 'crypto')
        const callee = toASTNode(n.callee)
        if (callee?.type === 'Identifier' && typeof callee.name === 'string') {
          checkStandaloneCall(node, context, callee.name, ignoreAlgorithms, n)
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'security',
      description:
        'Detect usage of weak cryptographic algorithms (MD5, SHA1, DES, RC4, Blowfish), insecure random number generation (Math.random in security contexts), deprecated crypto methods, and insufficient PBKDF2 iterations.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-weak-crypto',
    },
    fixable: undefined,
    schema: [
      {
        additionalProperties: false,
        properties: {
          checkMathRandom: {
            default: true,
            type: 'boolean',
          },
          ignoreAlgorithms: {
            default: [],
            items: {
              type: 'string',
            },
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

export default noWeakCryptoRule
