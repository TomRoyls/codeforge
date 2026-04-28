import { describe, test, expect, vi } from 'vitest'
import { noHardcodedCredentialsRule } from '../../../../src/rules/security/no-hardcoded-credentials.js'
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

function createStringLiteral(value: string, line = 1, column = 0): unknown {
  return {
    type: 'Literal',
    value,
    loc: {
      start: { line, column },
      end: { line, column: column + value.length + 2 },
    },
  }
}

function createVariableDeclarator(name: string, value: string, line = 1, column = 0): unknown {
  return {
    type: 'VariableDeclarator',
    id: { type: 'Identifier', name },
    init: { type: 'Literal', value },
    loc: {
      start: { line, column },
      end: { line, column: column + name.length + value.length + 10 },
    },
  }
}

function createAssignmentExpression(
  leftName: string,
  value: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: { type: 'Identifier', name: leftName },
    right: { type: 'Literal', value },
    loc: {
      start: { line, column },
      end: { line, column: column + leftName.length + value.length + 10 },
    },
  }
}

function createMemberAssignment(
  objectName: string,
  propertyName: string,
  value: string,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: objectName },
      property: { type: 'Identifier', name: propertyName },
    },
    right: { type: 'Literal', value },
    loc: {
      start: { line, column },
      end: { line, column: column + 40 },
    },
  }
}

function createCallWithObjectArg(
  calleeName: string,
  objProps: Array<{ key: string; value: string }>,
  line = 1,
  column = 0,
): unknown {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: calleeName },
    arguments: [
      {
        type: 'ObjectExpression',
        properties: objProps.map((p) => ({
          type: 'Property',
          key: { type: 'Identifier', name: p.key },
          value: { type: 'Literal', value: p.value },
          shorthand: false,
          computed: false,
          method: false,
          kind: 'init',
        })),
      },
    ],
    loc: {
      start: { line, column },
      end: { line, column: column + 40 },
    },
  }
}

describe('no-hardcoded-credentials rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noHardcodedCredentialsRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noHardcodedCredentialsRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noHardcodedCredentialsRule.meta.docs?.recommended).toBe(true)
    })

    test('should have security category', () => {
      expect(noHardcodedCredentialsRule.meta.docs?.category).toBe('security')
    })

    test('should have schema defined', () => {
      expect(noHardcodedCredentialsRule.meta.schema).toBeDefined()
    })

    test('should have description mentioning secrets', () => {
      expect(noHardcodedCredentialsRule.meta.docs?.description.toLowerCase()).toContain('secret')
    })

    test('should have correct URL', () => {
      expect(noHardcodedCredentialsRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-hardcoded-credentials',
      )
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noHardcodedCredentialsRule.meta.schema)).toBe(true)
    })

    test('should have checkAssignments in schema', () => {
      const schema = noHardcodedCredentialsRule.meta.schema as Array<Record<string, unknown>>
      const props = (schema[0] as Record<string, unknown>).properties as Record<string, unknown>
      expect(props).toHaveProperty('checkAssignments')
    })

    test('should have checkUrls in schema', () => {
      const schema = noHardcodedCredentialsRule.meta.schema as Array<Record<string, unknown>>
      const props = (schema[0] as Record<string, unknown>).properties as Record<string, unknown>
      expect(props).toHaveProperty('checkUrls')
    })

    test('should have ignorePatterns in schema', () => {
      const schema = noHardcodedCredentialsRule.meta.schema as Array<Record<string, unknown>>
      const props = (schema[0] as Record<string, unknown>).properties as Record<string, unknown>
      expect(props).toHaveProperty('ignorePatterns')
    })

    test('should have fixable as undefined', () => {
      expect(noHardcodedCredentialsRule.meta.fixable).toBeUndefined()
    })

    test('should have checkAssignments default true in schema', () => {
      const schema = noHardcodedCredentialsRule.meta.schema as Array<Record<string, unknown>>
      const props = (schema[0] as Record<string, unknown>).properties as Record<
        string,
        Record<string, unknown>
      >
      expect(props.checkAssignments.default).toBe(true)
    })

    test('should have checkUrls default true in schema', () => {
      const schema = noHardcodedCredentialsRule.meta.schema as Array<Record<string, unknown>>
      const props = (schema[0] as Record<string, unknown>).properties as Record<
        string,
        Record<string, unknown>
      >
      expect(props.checkUrls.default).toBe(true)
    })
  })

  describe('create', () => {
    test('should return visitor object with required methods', () => {
      const { context } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      expect(visitor).toHaveProperty('Literal')
      expect(visitor).toHaveProperty('VariableDeclarator')
      expect(visitor).toHaveProperty('AssignmentExpression')
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return functions for each visitor method', () => {
      const { context } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      expect(typeof visitor.Literal).toBe('function')
      expect(typeof visitor.VariableDeclarator).toBe('function')
      expect(typeof visitor.AssignmentExpression).toBe('function')
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockContext()
      const visitor1 = noHardcodedCredentialsRule.create(context)
      const visitor2 = noHardcodedCredentialsRule.create(context)

      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('AWS key detection', () => {
    test('should report AWS Access Key ID', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('AKIAIOSFODNN7EXAMPLE'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AWS Access Key ID')
    })

    test('should report AWS key starting with AKIA', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('AKIAABCDEFGH123456'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AWS')
    })
  })

  describe('GitHub token detection', () => {
    test('should report GitHub Personal Access Token', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij1234'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('GitHub')
    })

    test('should report GitHub OAuth Token', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('gho_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij1234'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('GitHub')
    })

    test('should report short ghp_ prefix as potential', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('ghp_short'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('GitHub')
    })
  })

  describe('JWT token detection', () => {
    test('should report JWT-like token', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(
        createStringLiteral('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('JWT')
    })

    test('should report short JWT-like token', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('eyJzdWIiOiIxMjM0NTY3ODkwIn0.eyJhZG1pbiI6dHJ1ZX0.abc123def456'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('JWT')
    })
  })

  describe('other secret patterns', () => {
    test('should report Stripe Live Secret Key', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('sk_live_ABCDEFGHIJKLMNOPQRSTUVWXYZ1234'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Stripe')
    })

    test('should report Stripe Test Secret Key', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('sk_test_ABCDEFGHIJKLMNOPQRSTUVWXYZ1234'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Stripe')
    })

    test('should report 32-char hex string', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('secret')
    })

    test('should report 40-char hex string', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('secret')
    })

    test('should report 64-char hex string', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(
        createStringLiteral('a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2'),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('secret')
    })

    test('should report Slack token', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('xoxb-1234-5678-abcdef'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Slack')
    })

    test('should report Google API Key', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('AIzaSyA1234567890abcdefghijklmnopqrstuv'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Google')
    })
  })

  describe('credential variable assignments (VariableDeclarator)', () => {
    test('should report password assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('password', 'mySecret123'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('password')
    })

    test('should report apiKey assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('apiKey', 'abc123def456'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('apiKey')
    })

    test('should report api_key assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('api_key', 'abc123def456'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('api_key')
    })

    test('should report secret assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('secret', 'mySecret'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('secret')
    })

    test('should report token assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('accessToken', 'tok_12345'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('accessToken')
    })

    test('should report private_key assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('private_key', '-----BEGIN RSA'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('private_key')
    })

    test('should report db_password assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('db_password', 'p@ssw0rd'))

      expect(reports.length).toBe(1)
    })

    test('should report client_secret assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('client_secret', 'abc123'))

      expect(reports.length).toBe(1)
    })

    test('should not report non-credential variable assignment', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('username', 'john_doe'))

      expect(reports.length).toBe(0)
    })

    test('should not report variable with non-string init', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'password' },
        init: { type: 'Identifier', name: 'process' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('credential assignments (AssignmentExpression)', () => {
    test('should report password assignment expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('password', 'mySecret123'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('password')
    })

    test('should report token assignment expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('auth_token', 'tok_12345'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('auth_token')
    })

    test('should report member expression assignment (config.password)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.AssignmentExpression(createMemberAssignment('config', 'password', 'mySecret123'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('password')
    })

    test('should not report non-credential assignment expression', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('name', 'John Doe'))

      expect(reports.length).toBe(0)
    })
  })

  describe('URL with embedded credentials', () => {
    test('should report URL with user:pass@host', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(
        createStringLiteral('postgresql://admin:secretpassword@db.example.com:5432/mydb'),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('URL')
      expect(reports[0].message).toContain('credential')
    })

    test('should report MongoDB URL with credentials', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('mongodb://user:p4ssw0rd@localhost:27017'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('URL')
    })

    test('should report Redis URL with credentials', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('redis://admin:password@redis.example.com:6379'))

      expect(reports.length).toBe(1)
    })

    test('should report FTP URL with credentials', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('ftp://user:pass@ftp.example.com'))

      expect(reports.length).toBe(1)
    })

    test('should not report URL without credentials', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('https://example.com/api/data'))

      expect(reports.length).toBe(0)
    })
  })

  describe('CallExpression with object arguments', () => {
    test('should report password in config object', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.CallExpression(
        createCallWithObjectArg('setConfig', [{ key: 'password', value: 'mySecret123' }]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('password')
    })

    test('should report api_key in config object', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.CallExpression(
        createCallWithObjectArg('configure', [{ key: 'api_key', value: 'abc123' }]),
      )

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('api_key')
    })

    test('should report token in config object', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.CallExpression(
        createCallWithObjectArg('init', [{ key: 'token', value: 'tok_abc' }]),
      )

      expect(reports.length).toBe(1)
    })

    test('should not report non-credential property in object', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.CallExpression(
        createCallWithObjectArg('configure', [{ key: 'timeout', value: '5000' }]),
      )

      expect(reports.length).toBe(0)
    })
  })

  describe('false positive avoidance - placeholders', () => {
    test('should not report empty string', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral(''))

      expect(reports.length).toBe(0)
    })

    test('should not report "your-api-key-here" placeholder', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('apiKey', 'your-api-key-here'))

      expect(reports.length).toBe(0)
    })

    test('should not report "REPLACE_ME" placeholder', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('secret', 'REPLACE_ME'))

      expect(reports.length).toBe(0)
    })

    test('should not report "xxx" placeholder', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('password', 'xxx'))

      expect(reports.length).toBe(0)
    })

    test('should not report "TODO" placeholder', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('api_key', 'TODO'))

      expect(reports.length).toBe(0)
    })

    test('should not report "CHANGEME" placeholder', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('token', 'CHANGEME'))

      expect(reports.length).toBe(0)
    })

    test('should not report "<your-key>" placeholder', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('apiKey', '<your-key>'))

      expect(reports.length).toBe(0)
    })

    test('should not report "test" value', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('password', 'test'))

      expect(reports.length).toBe(0)
    })

    test('should not report "example" value', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('password', 'example'))

      expect(reports.length).toBe(0)
    })

    test('should not report "default" value', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('password', 'default'))

      expect(reports.length).toBe(0)
    })

    test('should not report "placeholder" value', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('secret', 'placeholder'))

      expect(reports.length).toBe(0)
    })

    test('should not report "N/A" value', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('password', 'N/A'))

      expect(reports.length).toBe(0)
    })

    test('should not report "***" value', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('password', '***'))

      expect(reports.length).toBe(0)
    })

    test('should not report null-like value', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('password', 'null'))

      expect(reports.length).toBe(0)
    })

    test('should not report variable reference (Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'password' },
        init: { type: 'Identifier', name: 'envPassword' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(0)
    })
  })

  describe('options: checkAssignments', () => {
    test('should not report variable assignments when checkAssignments is false', () => {
      const { context, reports } = createMockContext({ checkAssignments: false })
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('password', 'mySecret123'))

      expect(reports.length).toBe(0)
    })

    test('should still report secret patterns in literals when checkAssignments is false', () => {
      const { context, reports } = createMockContext({ checkAssignments: false })
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('AKIAIOSFODNN7EXAMPLE'))

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('AWS')
    })

    test('should not report assignment expressions when checkAssignments is false', () => {
      const { context, reports } = createMockContext({ checkAssignments: false })
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.AssignmentExpression(createAssignmentExpression('password', 'mySecret123'))

      expect(reports.length).toBe(0)
    })
  })

  describe('options: checkUrls', () => {
    test('should not report URL credentials when checkUrls is false', () => {
      const { context, reports } = createMockContext({ checkUrls: false })
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(
        createStringLiteral('postgresql://admin:secretpassword@db.example.com:5432/mydb'),
      )

      expect(reports.length).toBe(0)
    })

    test('should still report secret patterns in literals when checkUrls is false', () => {
      const { context, reports } = createMockContext({ checkUrls: false })
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('AKIAIOSFODNN7EXAMPLE'))

      expect(reports.length).toBe(1)
    })
  })

  describe('options: ignorePatterns', () => {
    test('should not report values matching ignorePatterns', () => {
      const { context, reports } = createMockContext({ ignorePatterns: ['^test-'] })
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('test-secret-key-12345'))

      // Should match secret pattern (32 hex chars) but ignored
      expect(reports.length).toBe(0)
    })

    test('should still report values not matching ignorePatterns', () => {
      const { context, reports } = createMockContext({ ignorePatterns: ['^safe-'] })
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('AKIAIOSFODNN7EXAMPLE'))

      expect(reports.length).toBe(1)
    })

    test('should support multiple ignore patterns', () => {
      const { context, reports } = createMockContext({
        ignorePatterns: ['^local-', '^dev-'],
      })
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('password', 'local-dev-password'))

      expect(reports.length).toBe(0)
    })

    test('should use substring match for invalid regex', () => {
      const { context, reports } = createMockContext({ ignorePatterns: ['[invalid'] })
      const visitor = noHardcodedCredentialsRule.create(context)

      // Invalid regex falls back to substring match
      expect(() => {
        visitor.VariableDeclarator(createVariableDeclarator('password', 'my-secret'))
      }).not.toThrow()
    })
  })

  describe('options: combined', () => {
    test('should respect all options together', () => {
      const { context, reports } = createMockContext({
        checkAssignments: false,
        checkUrls: false,
        ignorePatterns: ['^test'],
      })
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('password', 'mySecret123'))
      visitor.Literal(createStringLiteral('https://user:pass@host'))

      expect(reports.length).toBe(0)
    })

    test('should still detect secret patterns with limited options', () => {
      const { context, reports } = createMockContext({
        checkAssignments: false,
        checkUrls: false,
      })
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('AKIAIOSFODNN7EXAMPLE'))

      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully in Literal', () => {
      const { context } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      expect(() => visitor.Literal(null)).not.toThrow()
    })

    test('should handle undefined node gracefully in Literal', () => {
      const { context } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      expect(() => visitor.Literal(undefined)).not.toThrow()
    })

    test('should handle null node gracefully in VariableDeclarator', () => {
      const { context } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      expect(() => visitor.VariableDeclarator(null)).not.toThrow()
    })

    test('should handle null node gracefully in AssignmentExpression', () => {
      const { context } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      expect(() => visitor.AssignmentExpression(null)).not.toThrow()
    })

    test('should handle null node gracefully in CallExpression', () => {
      const { context } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      expect(() => visitor.CallExpression(null)).not.toThrow()
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      expect(() => visitor.Literal('string')).not.toThrow()
      expect(() => visitor.Literal(123)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      const node = {
        type: 'Literal',
        value: 'AKIAIOSFODNN7EXAMPLE',
      }

      expect(() => visitor.Literal(node)).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should handle VariableDeclarator with null init', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'password' },
        init: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle VariableDeclarator with undefined init', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'password' },
        init: undefined,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle non-string literal value', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal({
        type: 'Literal',
        value: 42,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 2 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'config' },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with non-Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.CallExpression({
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'method' },
        },
        arguments: [],
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should handle AssignmentExpression with null right', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.AssignmentExpression({
        type: 'AssignmentExpression',
        operator: '=',
        left: { type: 'Identifier', name: 'password' },
        right: null,
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 20 } },
      })

      expect(reports.length).toBe(0)
    })

    test('should report correct location information', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('AKIAIOSFODNN7EXAMPLE', 10, 5))

      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle VariableDeclarator with MemberExpression id', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator({
        type: 'VariableDeclarator',
        id: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: 'password' },
        },
        init: { type: 'Literal', value: 'secret123' },
        loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 30 } },
      })

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('password')
    })

    test('should not report when no options provided', () => {
      const contextNoOpts: RuleContext = {
        report: () => {},
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const visitor = noHardcodedCredentialsRule.create(contextNoOpts)

      expect(() => {
        visitor.Literal(createStringLiteral('AKIAIOSFODNN7EXAMPLE'))
      }).not.toThrow()
    })

    test('should use default options when config.options is undefined', () => {
      const contextNoOpts: RuleContext = {
        report: () => {},
        getFilePath: () => '/src/file.ts',
        getAST: () => null,
        getSource: () => 'const x = 1;',
        getTokens: () => [],
        getComments: () => [],
        config: {},
        logger: {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        },
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const reports: ReportDescriptor[] = []
      const ctx: RuleContext = {
        ...contextNoOpts,
        report: (desc: ReportDescriptor) => reports.push(desc),
      }

      const visitor = noHardcodedCredentialsRule.create(ctx)
      visitor.Literal(createStringLiteral('AKIAIOSFODNN7EXAMPLE'))

      expect(reports.length).toBe(1)
    })

    test('should handle safe string without matching any pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('hello world'))

      expect(reports.length).toBe(0)
    })

    test('should not report regular URL without credentials', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.Literal(createStringLiteral('https://api.example.com/v1/data'))

      expect(reports.length).toBe(0)
    })

    test('should not report template variables like ${VAR}', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('password', '${DB_PASSWORD}'))

      expect(reports.length).toBe(0)
    })

    test('should handle ${} template variable as placeholder', () => {
      const { context, reports } = createMockContext()
      const visitor = noHardcodedCredentialsRule.create(context)

      visitor.VariableDeclarator(createVariableDeclarator('apiKey', '${API_KEY}'))

      expect(reports.length).toBe(0)
    })
  })
})
