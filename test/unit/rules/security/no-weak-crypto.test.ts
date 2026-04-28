import { describe, test, expect, vi } from 'vitest'
import { noWeakCryptoRule } from '../../../../src/rules/security/no-weak-crypto.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = 1;',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
      })
    },
    getFilePath: () => filePath,
    getAST: () => null,
    getSource: () => source,
    getTokens: () => [],
    getComments: () => [],
    config: { options: [options] },
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    workspaceRoot: '/src',
  } as unknown as RuleContext

  return { context, reports }
}

function createCryptoCall(
  methodName: string,
  args: unknown[] = [],
  objectName = 'crypto',
  line = 1,
  column = 0,
): unknown {
  const callee =
    objectName === ''
      ? { type: 'Identifier', name: methodName }
      : {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: objectName },
          property: { type: 'Identifier', name: methodName },
        }

  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 30 },
    },
  }
}

function createLiteralArg(value: unknown): unknown {
  return { type: 'Literal', value }
}

function createStandaloneCall(
  functionName: string,
  args: unknown[] = [],
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: functionName },
    arguments: args,
    loc: {
      start: { line, column },
      end: { line, column: column + 25 },
    },
  }
}

function createMathRandomCall(varName: string, line = 1, column = 0): unknown {
  const callNode: Record<string, unknown> = {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Math' },
      property: { type: 'Identifier', name: 'random' },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }

  callNode.parent = {
    type: 'VariableDeclarator',
    id: { type: 'Identifier', name: varName },
    init: callNode,
  }

  return callNode
}

function createMathRandomWithAssignment(varName: string, line = 1, column = 0): unknown {
  const callNode: Record<string, unknown> = {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Math' },
      property: { type: 'Identifier', name: 'random' },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }

  callNode.parent = {
    type: 'AssignmentExpression',
    operator: '=',
    left: { type: 'Identifier', name: varName },
    right: callNode,
  }

  return callNode
}

function createMathRandomWithProperty(varName: string, line = 1, column = 0): unknown {
  const callNode: Record<string, unknown> = {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Math' },
      property: { type: 'Identifier', name: 'random' },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }

  callNode.parent = {
    type: 'Property',
    key: { type: 'Identifier', name: varName },
    value: callNode,
  }

  return callNode
}

function createMathRandomWithoutParent(line = 1, column = 0): unknown {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'Math' },
      property: { type: 'Identifier', name: 'random' },
    },
    arguments: [],
    loc: {
      start: { line, column },
      end: { line, column: column + 15 },
    },
  }
}

describe('no-weak-crypto rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noWeakCryptoRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noWeakCryptoRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noWeakCryptoRule.meta.docs?.recommended).toBe(true)
    })

    test('should have correct category', () => {
      expect(noWeakCryptoRule.meta.docs?.category).toBe('security')
    })

    test('should have schema defined', () => {
      expect(noWeakCryptoRule.meta.schema).toBeDefined()
    })

    test('should have correct description mentioning cryptographic', () => {
      expect(noWeakCryptoRule.meta.docs?.description.toLowerCase()).toContain('cryptograph')
    })

    test('should mention security in description', () => {
      expect(noWeakCryptoRule.meta.docs?.description.toLowerCase()).toContain('security')
    })

    test('should have docs url', () => {
      expect(noWeakCryptoRule.meta.docs?.url).toBeDefined()
    })

    test('should have correct docs url', () => {
      expect(noWeakCryptoRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-weak-crypto',
      )
    })

    test('should not be fixable', () => {
      expect(noWeakCryptoRule.meta.fixable).toBeUndefined()
    })

    test('should have schema as array', () => {
      expect(Array.isArray(noWeakCryptoRule.meta.schema)).toBe(true)
    })

    test('should have checkMathRandom in schema', () => {
      const schema = noWeakCryptoRule.meta.schema as Array<Record<string, unknown>>
      const props = (schema[0] as Record<string, unknown>).properties as Record<string, unknown>
      expect(props).toHaveProperty('checkMathRandom')
    })

    test('should have ignoreAlgorithms in schema', () => {
      const schema = noWeakCryptoRule.meta.schema as Array<Record<string, unknown>>
      const props = (schema[0] as Record<string, unknown>).properties as Record<string, unknown>
      expect(props).toHaveProperty('ignoreAlgorithms')
    })

    test('should have checkMathRandom default true in schema', () => {
      const schema = noWeakCryptoRule.meta.schema as Array<Record<string, unknown>>
      const props = (schema[0] as Record<string, unknown>).properties as Record<
        string,
        Record<string, unknown>
      >
      expect(props.checkMathRandom.default).toBe(true)
    })

    test('should have ignoreAlgorithms default empty array in schema', () => {
      const schema = noWeakCryptoRule.meta.schema as Array<Record<string, unknown>>
      const props = (schema[0] as Record<string, unknown>).properties as Record<
        string,
        Record<string, unknown>
      >
      expect(props.ignoreAlgorithms.default).toEqual([])
    })

    test('should have description mentioning weak algorithms', () => {
      expect(noWeakCryptoRule.meta.docs?.description).toContain('MD5')
    })

    test('should have description mentioning SHA1', () => {
      expect(noWeakCryptoRule.meta.docs?.description).toContain('SHA1')
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      expect(visitor).toHaveProperty('CallExpression')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockContext()
      const visitor1 = noWeakCryptoRule.create(context)
      const visitor2 = noWeakCryptoRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('weak hash detection - crypto.createHash', () => {
    test('should report crypto.createHash("md5")', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('md5')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('md5')
      expect(reports[0].message).toContain('Weak hash')
    })

    test('should report crypto.createHash("sha1")', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('sha1')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('sha1')
    })

    test('should report crypto.createHash("MD5") (case insensitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('MD5')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report crypto.createHash("SHA1") (case insensitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('SHA1')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report crypto.createHash("sha256")', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('sha256')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report crypto.createHash("sha512")', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('sha512')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report crypto.createHash("sha-256")', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('sha-256')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should report correct location for createHash("md5")', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('md5')], 'crypto', 7, 3),
      )

      expect(reports[0].loc?.start.line).toBe(7)
      expect(reports[0].loc?.start.column).toBe(3)
    })

    test('should report standalone createHash("md5") call', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createStandaloneCall('createHash', [createLiteralArg('md5')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('md5')
    })
  })

  describe('weak cipher detection - crypto.createCipheriv', () => {
    test('should report crypto.createCipheriv("des", ...)', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createCipheriv', [createLiteralArg('des')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('des')
      expect(reports[0].message).toContain('Weak cipher')
    })

    test('should report crypto.createCipheriv("des3", ...)', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createCipheriv', [createLiteralArg('des3')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report crypto.createCipheriv("rc4", ...)', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createCipheriv', [createLiteralArg('rc4')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('rc4')
    })

    test('should report crypto.createCipheriv("blowfish", ...)', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createCipheriv', [createLiteralArg('blowfish')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report crypto.createCipheriv("aes-256-ecb", ...)', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createCipheriv', [createLiteralArg('aes-256-ecb')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('aes-256-ecb')
    })

    test('should not report crypto.createCipheriv("aes-256-gcm", ...)', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createCipheriv', [createLiteralArg('aes-256-gcm')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report crypto.createCipheriv("aes-256-cbc", ...)', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createCipheriv', [createLiteralArg('aes-256-cbc')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report crypto.createCipheriv("aes-128-gcm", ...)', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createCipheriv', [createLiteralArg('aes-128-gcm')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report crypto.createCipheriv("chacha20-poly1305", ...)', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createCipheriv', [createLiteralArg('chacha20-poly1305')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should report standalone createCipheriv("rc4", ...)', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createStandaloneCall('createCipheriv', [createLiteralArg('rc4')]),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('weak cipher detection - crypto.createDecipheriv', () => {
    test('should report crypto.createDecipheriv("des", ...)', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createDecipheriv', [createLiteralArg('des')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('des')
    })

    test('should report crypto.createDecipheriv("rc4", ...)', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createDecipheriv', [createLiteralArg('rc4')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report crypto.createDecipheriv("aes-256-gcm", ...)', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createDecipheriv', [createLiteralArg('aes-256-gcm')]),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('deprecated crypto methods', () => {
    test('should report crypto.createCipher()', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createCipher', [createLiteralArg('aes-256-cbc')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('createCipher')
      expect(reports[0].message).toContain('Deprecated')
      expect(reports[0].message).toContain('createCipheriv')
    })

    test('should report crypto.createDecipher()', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createDecipher', [createLiteralArg('aes-256-cbc')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('createDecipher')
      expect(reports[0].message).toContain('Deprecated')
    })

    test('should report standalone createCipher() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createStandaloneCall('createCipher', [createLiteralArg('aes-256-cbc')]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Deprecated')
    })

    test('should report standalone createDecipher() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createStandaloneCall('createDecipher', [createLiteralArg('aes-256-cbc')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report correct location for deprecated methods', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createCipher', [createLiteralArg('aes')], 'crypto', 12, 5),
      )

      expect(reports[0].loc?.start.line).toBe(12)
      expect(reports[0].loc?.start.column).toBe(5)
    })
  })

  describe('pbkdf2 insufficient iterations', () => {
    test('should report crypto.pbkdf2 with 100 iterations', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('pbkdf2', [
          createLiteralArg('password'),
          createLiteralArg('salt'),
          createLiteralArg(100),
          createLiteralArg(64),
          createLiteralArg('sha512'),
        ]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('100')
      expect(reports[0].message).toContain('10000')
    })

    test('should report crypto.pbkdf2 with 9999 iterations', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('pbkdf2', [
          createLiteralArg('password'),
          createLiteralArg('salt'),
          createLiteralArg(9999),
          createLiteralArg(64),
        ]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('9999')
    })

    test('should not report crypto.pbkdf2 with 10000 iterations', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('pbkdf2', [
          createLiteralArg('password'),
          createLiteralArg('salt'),
          createLiteralArg(10000),
          createLiteralArg(64),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report crypto.pbkdf2 with 50000 iterations', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('pbkdf2', [
          createLiteralArg('password'),
          createLiteralArg('salt'),
          createLiteralArg(50000),
          createLiteralArg(64),
        ]),
      )

      expect(reports.length).toBe(0)
    })

    test('should report crypto.pbkdf2Sync with low iterations', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('pbkdf2Sync', [
          createLiteralArg('password'),
          createLiteralArg('salt'),
          createLiteralArg(500),
          createLiteralArg(64),
        ]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('pbkdf2Sync')
    })

    test('should report standalone pbkdf2 with low iterations', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createStandaloneCall('pbkdf2', [
          createLiteralArg('password'),
          createLiteralArg('salt'),
          createLiteralArg(100),
          createLiteralArg(64),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report standalone pbkdf2Sync with low iterations', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createStandaloneCall('pbkdf2Sync', [
          createLiteralArg('password'),
          createLiteralArg('salt'),
          createLiteralArg(100),
          createLiteralArg(64),
        ]),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report pbkdf2 with variable iterations (non-literal)', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('pbkdf2', [
          createLiteralArg('password'),
          createLiteralArg('salt'),
          { type: 'Identifier', name: 'iterations' },
          createLiteralArg(64),
        ]),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('Math.random() in security contexts', () => {
    test('should report Math.random() assigned to variable named "token"', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(createMathRandomCall('token'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Math.random()')
      expect(reports[0].message).toContain('token')
      expect(reports[0].message).toContain('crypto.randomBytes()')
    })

    test('should report Math.random() assigned to variable named "secret"', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(createMathRandomCall('secret'))

      expect(reports.length).toBe(1)
    })

    test('should report Math.random() assigned to variable named "password"', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(createMathRandomCall('password'))

      expect(reports.length).toBe(1)
    })

    test('should report Math.random() assigned to variable named "apiKey"', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(createMathRandomCall('apiKey'))

      expect(reports.length).toBe(1)
    })

    test('should report Math.random() assigned to variable named "sessionHash"', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(createMathRandomCall('sessionHash'))

      expect(reports.length).toBe(1)
    })

    test('should report Math.random() assigned to variable named "nonce"', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(createMathRandomCall('nonce'))

      expect(reports.length).toBe(1)
    })

    test('should report Math.random() assigned to variable named "salt"', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(createMathRandomCall('salt'))

      expect(reports.length).toBe(1)
    })

    test('should report Math.random() assigned to variable named "sessionId"', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(createMathRandomCall('sessionId'))

      expect(reports.length).toBe(1)
    })

    test('should report Math.random() assigned via assignment expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(createMathRandomWithAssignment('secret'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('secret')
    })

    test('should report Math.random() in property with security name', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(createMathRandomWithProperty('token'))

      expect(reports.length).toBe(1)
    })

    test('should not report Math.random() without parent context', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(createMathRandomWithoutParent())

      expect(reports.length).toBe(0)
    })

    test('should not report Math.random() assigned to "randomValue"', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(createMathRandomCall('randomValue'))

      expect(reports.length).toBe(0)
    })

    test('should not report Math.random() assigned to "animationProgress"', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(createMathRandomCall('animationProgress'))

      expect(reports.length).toBe(0)
    })

    test('should not report Math.random() assigned to "shuffleIndex"', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(createMathRandomCall('shuffleIndex'))

      expect(reports.length).toBe(0)
    })

    test('should not report Math.random() assigned to "offset"', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(createMathRandomCall('offset'))

      expect(reports.length).toBe(0)
    })

    test('should not report Math.random() assigned to "x"', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(createMathRandomCall('x'))

      expect(reports.length).toBe(0)
    })
  })

  describe('secure crypto calls (should not report)', () => {
    test('should not report crypto.createHash("sha256")', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('sha256')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report crypto.createHash("sha384")', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('sha384')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report crypto.createHash("sha512")', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('sha512')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report crypto.randomBytes()', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('randomBytes', [createLiteralArg(32)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report crypto.getRandomValues()', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('getRandomValues', [{ type: 'Identifier', name: 'arr' }]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report crypto.createCipheriv("aes-256-gcm", ...)', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createCipheriv', [createLiteralArg('aes-256-gcm')]),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('test file exclusion', () => {
    test('should not report in .test.ts files', () => {
      const { context, reports } = createMockContext({}, '/src/file.test.ts')
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('md5')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report in .spec.ts files', () => {
      const { context, reports } = createMockContext({}, '/src/file.spec.ts')
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('md5')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report in __tests__ directory', () => {
      const { context, reports } = createMockContext({}, '/src/__tests__/file.ts')
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('md5')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report in __mocks__ directory', () => {
      const { context, reports } = createMockContext({}, '/src/__mocks__/file.ts')
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('md5')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report in /test/ path', () => {
      const { context, reports } = createMockContext({}, '/test/unit/file.ts')
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('md5')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report in /tests/ path', () => {
      const { context, reports } = createMockContext({}, '/tests/unit/file.ts')
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('md5')]),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('options: ignoreAlgorithms', () => {
    test('should not report md5 when ignored', () => {
      const { context, reports } = createMockContext({ ignoreAlgorithms: ['md5'] })
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('md5')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report sha1 when ignored', () => {
      const { context, reports } = createMockContext({ ignoreAlgorithms: ['sha1'] })
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('sha1')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should still report md5 when only sha1 is ignored', () => {
      const { context, reports } = createMockContext({ ignoreAlgorithms: ['sha1'] })
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('md5')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should ignore algorithm case-insensitively', () => {
      const { context, reports } = createMockContext({ ignoreAlgorithms: ['MD5'] })
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('md5')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should ignore cipher algorithms', () => {
      const { context, reports } = createMockContext({ ignoreAlgorithms: ['des'] })
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createCipheriv', [createLiteralArg('des')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should ignore multiple algorithms', () => {
      const { context, reports } = createMockContext({ ignoreAlgorithms: ['md5', 'sha1', 'rc4'] })
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('md5')]),
      )
      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('sha1')]),
      )
      visitor.CallExpression(
        createCryptoCall('createCipheriv', [createLiteralArg('rc4')]),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('options: checkMathRandom', () => {
    test('should not report Math.random() when checkMathRandom is false', () => {
      const { context, reports } = createMockContext({ checkMathRandom: false })
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(createMathRandomCall('token'))

      expect(reports.length).toBe(0)
    })

    test('should still report weak crypto when checkMathRandom is false', () => {
      const { context, reports } = createMockContext({ checkMathRandom: false })
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('md5')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should report Math.random() by default (checkMathRandom defaults to true)', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(createMathRandomCall('token'))

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      expect(() => visitor.CallExpression(undefined)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      expect(() => visitor.CallExpression('string')).not.toThrow()
      expect(() => visitor.CallExpression(123)).not.toThrow()
    })

    test('should handle node without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'crypto' },
          property: { type: 'Identifier', name: 'createHash' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle createHash with non-string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [{ type: 'Identifier', name: 'algo' }]),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle createHash with number argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg(123)]),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle node without callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      const node = {
        type: 'CallExpression',
        arguments: [createLiteralArg('md5')],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      const node = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'crypto' },
          property: { type: 'Identifier', name: 'createHash' },
        },
        arguments: [createLiteralArg('md5')],
      }

      expect(() => visitor.CallExpression(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle non-crypto object with createHash method', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('md5')], 'myModule'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report non-crypto related calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('log', [createLiteralArg('hello')], 'console'),
      )

      expect(reports.length).toBe(0)
    })

    test('should not report crypto methods that are not weak', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('sign', [createLiteralArg('data')]),
      )
      visitor.CallExpression(
        createCryptoCall('verify', [createLiteralArg('data')]),
      )
      visitor.CallExpression(
        createCryptoCall('generateKeyPair', [createLiteralArg('rsa')]),
      )

      expect(reports.length).toBe(0)
    })

    test('should handle node with empty options', () => {
      const { context, reports } = createMockContext({})
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('md5')]),
      )

      expect(reports.length).toBe(1)
    })

    test('should handle node with null options', () => {
      const reports: ReportDescriptor[] = []
      const context: RuleContext = {
        report: (descriptor: ReportDescriptor) => {
          reports.push({ message: descriptor.message, loc: descriptor.loc })
        },
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: { options: undefined },
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('md5')]),
      )

      expect(reports.length).toBe(1)
    })
  })

  describe('multiple detections', () => {
    test('should report multiple issues in one file', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('md5')]),
      )
      visitor.CallExpression(
        createCryptoCall('createCipheriv', [createLiteralArg('des')]),
      )
      visitor.CallExpression(createMathRandomCall('secret'))

      expect(reports.length).toBe(3)
    })

    test('should report at different line numbers', () => {
      const { context, reports } = createMockContext()
      const visitor = noWeakCryptoRule.create(context)

      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('md5')], 'crypto', 3, 0),
      )
      visitor.CallExpression(
        createCryptoCall('createHash', [createLiteralArg('sha1')], 'crypto', 7, 5),
      )

      expect(reports.length).toBe(2)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[1].loc?.start.line).toBe(7)
    })
  })
})
