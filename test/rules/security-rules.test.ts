import { describe, expect, it, vi } from 'vitest'

import type { ReportDescriptor, RuleContext, RuleVisitor } from '../../src/plugins/types.js'

import { noUnsafeRegexRule } from '../../src/rules/security/no-unsafe-regex.js'
import { noWeakCryptoRule } from '../../src/rules/security/no-weak-crypto.js'
import { noHardcodedCredentialsRule } from '../../src/rules/security/no-hardcoded-credentials.js'
import { noUnsafeHtmlRule } from '../../src/rules/security/no-unsafe-html.js'
import { noSqlInjectionRule } from '../../src/rules/security/no-sql-injection.js'

// ─── Mock context factory ───

function createMockContext(
  options: Record<string, unknown> = {},
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    config: { options },
    getAST: () => null,
    getComments: () => [],
    getFilePath: () => 'test.ts',
    getSource: () => '',
    getTokens: () => [],
    logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
    report(descriptor: ReportDescriptor) {
      reports.push(descriptor)
    },
    workspaceRoot: '/test',
  }

  return { context, reports }
}

function createMockContextWithFile(
  filePath: string,
  options: Record<string, unknown> = {},
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    config: { options },
    getAST: () => null,
    getComments: () => [],
    getFilePath: () => filePath,
    getSource: () => '',
    getTokens: () => [],
    logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
    report(descriptor: ReportDescriptor) {
      reports.push(descriptor)
    },
    workspaceRoot: '/test',
  }

  return { context, reports }
}

// ─── Synthetic node helpers ───

function withLoc(node: Record<string, unknown>, line = 1, column = 0) {
  return {
    ...node,
    loc: {
      end: { column: column + 1, line },
      start: { column, line },
    },
  }
}

function literal(value: unknown, line = 1, column = 0) {
  return withLoc({ type: 'Literal', value }, line, column)
}

function identifier(name: string, line = 1, column = 0) {
  return withLoc({ name, type: 'Identifier' }, line, column)
}

function memberExpr(
  object: Record<string, unknown>,
  property: Record<string, unknown>,
  line = 1,
  column = 0,
) {
  return withLoc({ computed: false, object, property, type: 'MemberExpression' }, line, column)
}

function callExpr(
  callee: Record<string, unknown>,
  args: Record<string, unknown>[] = [],
  line = 1,
  column = 0,
) {
  return withLoc({ arguments: args, callee, type: 'CallExpression' }, line, column)
}

function newExpr(
  callee: Record<string, unknown>,
  args: Record<string, unknown>[] = [],
  line = 1,
  column = 0,
) {
  return withLoc({ arguments: args, callee, type: 'NewExpression' }, line, column)
}

function regexLiteral(pattern: string, flags = '', line = 1, column = 0) {
  return withLoc({ regex: { flags, pattern }, type: 'Literal' }, line, column)
}

function binaryExpr(
  operator: string,
  left: Record<string, unknown>,
  right: Record<string, unknown>,
  line = 1,
  column = 0,
) {
  return withLoc({ left, operator, right, type: 'BinaryExpression' }, line, column)
}

function templateLiteral(
  quasis: Record<string, unknown>[],
  expressions: Record<string, unknown>[] = [],
  line = 1,
  column = 0,
) {
  return withLoc({ expressions, quasis, type: 'TemplateLiteral' }, line, column)
}

function templateElement(
  raw: string,
  cooked: string,
  line = 1,
  column = 0,
) {
  return withLoc(
    { tail: true, type: 'TemplateElement', value: { cooked, raw } },
    line,
    column,
  )
}

function assignmentExpr(
  left: Record<string, unknown>,
  right: Record<string, unknown>,
  operator = '=',
  line = 1,
  column = 0,
) {
  return withLoc({ left, operator, right, type: 'AssignmentExpression' }, line, column)
}

function varDeclarator(
  id: Record<string, unknown>,
  init: Record<string, unknown>,
  line = 1,
  column = 0,
) {
  return withLoc({ id, init, type: 'VariableDeclarator' }, line, column)
}

function arrayExpr(
  elements: (Record<string, unknown> | null)[],
  line = 1,
  column = 0,
) {
  return withLoc({ elements, type: 'ArrayExpression' }, line, column)
}

function objExpr(
  properties: Record<string, unknown>[],
  line = 1,
  column = 0,
) {
  return withLoc({ properties, type: 'ObjectExpression' }, line, column)
}

function property(
  key: Record<string, unknown>,
  value: Record<string, unknown>,
  line = 1,
  column = 0,
) {
  return withLoc({ key, kind: 'init', method: false, shorthand: false, type: 'Property', value }, line, column)
}

// ─── Section: no-unsafe-regex ───

describe('no-unsafe-regex rule', () => {
  it('reports regex literal with nested quantifiers', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeRegexRule.create(context)

    // (a+)+ has nested quantifiers
    visitor.Literal!(regexLiteral('(a+)+'))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Unsafe regex pattern')
    expect(reports[0]!.message).toContain('nested quantifiers')
  })

  it('reports regex literal with complex alternation', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeRegexRule.create(context)

    // (a|b|c|d) has 3 alternations in a group
    visitor.Literal!(regexLiteral('(a|b|c|d)'))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Unsafe regex pattern')
    expect(reports[0]!.message).toContain('complex alternation')
  })

  it('does not report safe regex literal', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeRegexRule.create(context)

    visitor.Literal!(regexLiteral('abc'))

    expect(reports).toHaveLength(0)
  })

  it('reports new RegExp() with unsafe pattern string', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeRegexRule.create(context)

    visitor.NewExpression!(newExpr(
      identifier('RegExp'),
      [literal('(a+)+')],
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Unsafe regex pattern')
  })

  it('reports new RegExp() with dynamic Identifier input', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeRegexRule.create(context)

    visitor.NewExpression!(newExpr(
      identifier('RegExp'),
      [identifier('userInput')],
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('dynamic input')
  })

  it('reports new RegExp() with dynamic MemberExpression input', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeRegexRule.create(context)

    visitor.NewExpression!(newExpr(
      identifier('RegExp'),
      [memberExpr(identifier('req'), identifier('body'))],
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('dynamic input')
  })

  it('reports RegExp() call expression with unsafe pattern', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeRegexRule.create(context)

    visitor.CallExpression!(callExpr(
      identifier('RegExp'),
      [literal('(x+)+')],
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Unsafe regex pattern')
  })

  it('does not report dynamic input when checkInjection is false', () => {
    const { context, reports } = createMockContext([{ checkInjection: false }])
    const visitor: RuleVisitor = noUnsafeRegexRule.create(context)

    visitor.NewExpression!(newExpr(
      identifier('RegExp'),
      [identifier('userInput')],
    ))

    expect(reports).toHaveLength(0)
  })

  it('does not report unsafe pattern when checkReDoS is false', () => {
    const { context, reports } = createMockContext([{ checkReDoS: false }])
    const visitor: RuleVisitor = noUnsafeRegexRule.create(context)

    visitor.Literal!(regexLiteral('(a+)+'))

    expect(reports).toHaveLength(0)
  })

  it('does not report non-RegExp new expression', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeRegexRule.create(context)

    visitor.NewExpression!(newExpr(
      identifier('Date'),
      [literal('2024-01-01')],
    ))

    expect(reports).toHaveLength(0)
  })

  it('does not report non-RegExp call expression', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeRegexRule.create(context)

    visitor.CallExpression!(callExpr(
      identifier('parseInt'),
      [literal('42')],
    ))

    expect(reports).toHaveLength(0)
  })

  it('does not report non-regex literal', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeRegexRule.create(context)

    visitor.Literal!(literal('just a string'))

    expect(reports).toHaveLength(0)
  })

  it('reports multiple violations independently', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeRegexRule.create(context)

    visitor.Literal!(regexLiteral('(a+)+', '', 1, 0))
    visitor.NewExpression!(newExpr(identifier('RegExp'), [identifier('x')], 3, 0))
    visitor.CallExpression!(callExpr(identifier('RegExp'), [literal('(b|c|d|e)')], 5, 0))

    expect(reports).toHaveLength(3)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noUnsafeRegexRule.meta.docs?.category).toBe('security')
    expect(noUnsafeRegexRule.meta.docs?.recommended).toBe(true)
    expect(noUnsafeRegexRule.meta.severity).toBe('warn')
    expect(noUnsafeRegexRule.meta.type).toBe('problem')
  })
})

// ─── Section: no-weak-crypto ───

describe('no-weak-crypto rule', () => {
  it('reports crypto.createHash("md5")', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noWeakCryptoRule.create(context)

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('crypto'), identifier('createHash')),
      [literal('md5')],
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Weak hash algorithm')
    expect(reports[0]!.message).toContain('md5')
  })

  it('reports crypto.createHash("sha1")', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noWeakCryptoRule.create(context)

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('crypto'), identifier('createHash')),
      [literal('sha1')],
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('sha1')
  })

  it('does not report crypto.createHash("sha256")', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noWeakCryptoRule.create(context)

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('crypto'), identifier('createHash')),
      [literal('sha256')],
    ))

    expect(reports).toHaveLength(0)
  })

  it('reports crypto.createCipheriv("des", ...)', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noWeakCryptoRule.create(context)

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('crypto'), identifier('createCipheriv')),
      [literal('des'), literal('key'), literal('iv')],
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Weak cipher algorithm')
    expect(reports[0]!.message).toContain('des')
  })

  it('does not report crypto.createCipheriv("aes-256-gcm", ...)', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noWeakCryptoRule.create(context)

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('crypto'), identifier('createCipheriv')),
      [literal('aes-256-gcm'), literal('key'), literal('iv')],
    ))

    expect(reports).toHaveLength(0)
  })

  it('reports deprecated crypto.createCipher()', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noWeakCryptoRule.create(context)

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('crypto'), identifier('createCipher')),
      [literal('aes')],
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Deprecated crypto method')
    expect(reports[0]!.message).toContain('createCipher')
  })

  it('reports deprecated crypto.createDecipher()', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noWeakCryptoRule.create(context)

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('crypto'), identifier('createDecipher')),
      [literal('aes')],
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Deprecated crypto method')
  })

  it('reports Math.random() assigned to security-sensitive variable', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noWeakCryptoRule.create(context)

    const mathRandomCall = callExpr(
      memberExpr(identifier('Math'), identifier('random')),
      [],
    )
    // Set parent to simulate VariableDeclarator assignment
    const varDecl = varDeclarator(identifier('token'), mathRandomCall)
    ;(mathRandomCall as Record<string, unknown>).parent = varDecl

    visitor.CallExpression!(mathRandomCall)

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Math.random()')
    expect(reports[0]!.message).toContain('token')
  })

  it('does not report Math.random() assigned to non-sensitive variable', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noWeakCryptoRule.create(context)

    const mathRandomCall = callExpr(
      memberExpr(identifier('Math'), identifier('random')),
      [],
    )
    const varDecl = varDeclarator(identifier('index'), mathRandomCall)
    ;(mathRandomCall as Record<string, unknown>).parent = varDecl

    visitor.CallExpression!(mathRandomCall)

    expect(reports).toHaveLength(0)
  })

  it('does not report Math.random() when checkMathRandom is false', () => {
    const { context, reports } = createMockContext([{ checkMathRandom: false }])
    const visitor: RuleVisitor = noWeakCryptoRule.create(context)

    const mathRandomCall = callExpr(
      memberExpr(identifier('Math'), identifier('random')),
      [],
    )
    const varDecl = varDeclarator(identifier('token'), mathRandomCall)
    ;(mathRandomCall as Record<string, unknown>).parent = varDecl

    visitor.CallExpression!(mathRandomCall)

    expect(reports).toHaveLength(0)
  })

  it('reports pbkdf2 with low iterations', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noWeakCryptoRule.create(context)

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('crypto'), identifier('pbkdf2')),
      [literal('password'), literal('salt'), literal(1000), literal(32)],
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('pbkdf2')
    expect(reports[0]!.message).toContain('1000')
    expect(reports[0]!.message).toContain('10000')
  })

  it('does not report pbkdf2 with sufficient iterations', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noWeakCryptoRule.create(context)

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('crypto'), identifier('pbkdf2')),
      [literal('password'), literal('salt'), literal(100_000), literal(32)],
    ))

    expect(reports).toHaveLength(0)
  })

  it('reports standalone createHash("md5") call (imported function)', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noWeakCryptoRule.create(context)

    visitor.CallExpression!(callExpr(
      identifier('createHash'),
      [literal('md5')],
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Weak hash algorithm')
  })

  it('skips analysis in test files', () => {
    const { context, reports } = createMockContextWithFile('src/app.test.ts')
    const visitor: RuleVisitor = noWeakCryptoRule.create(context)

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('crypto'), identifier('createHash')),
      [literal('md5')],
    ))

    expect(reports).toHaveLength(0)
  })

  it('ignores algorithms in ignoreAlgorithms list', () => {
    const { context, reports } = createMockContext([{ ignoreAlgorithms: ['md5'] }])
    const visitor: RuleVisitor = noWeakCryptoRule.create(context)

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('crypto'), identifier('createHash')),
      [literal('md5')],
    ))

    expect(reports).toHaveLength(0)
  })

  it('does not report non-crypto member call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noWeakCryptoRule.create(context)

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('fs'), identifier('readFile')),
      [literal('file.txt')],
    ))

    expect(reports).toHaveLength(0)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noWeakCryptoRule.meta.docs?.category).toBe('security')
    expect(noWeakCryptoRule.meta.docs?.recommended).toBe(true)
    expect(noWeakCryptoRule.meta.severity).toBe('error')
    expect(noWeakCryptoRule.meta.type).toBe('problem')
  })
})

// ─── Section: no-hardcoded-credentials ───

describe('no-hardcoded-credentials rule', () => {
  it('reports variable declaration with credential name and string value', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noHardcodedCredentialsRule.create(context)

    visitor.VariableDeclarator!(varDeclarator(
      identifier('password'),
      literal('mySecret123'),
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('hardcoded secret')
    expect(reports[0]!.message).toContain('password')
  })

  it('reports variable declaration for api_key', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noHardcodedCredentialsRule.create(context)

    visitor.VariableDeclarator!(varDeclarator(
      identifier('api_key'),
      literal('sk-abc123def456'),
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('api_key')
  })

  it('does not report variable declaration with non-credential name', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noHardcodedCredentialsRule.create(context)

    visitor.VariableDeclarator!(varDeclarator(
      identifier('username'),
      literal('john_doe'),
    ))

    expect(reports).toHaveLength(0)
  })

  it('reports assignment expression with credential name', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noHardcodedCredentialsRule.create(context)

    visitor.AssignmentExpression!(assignmentExpr(
      identifier('secret'),
      literal('superSecretValue'),
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('secret')
  })

  it('does not report assignment when checkAssignments is false', () => {
    const { context, reports } = createMockContext([{ checkAssignments: false }])
    const visitor: RuleVisitor = noHardcodedCredentialsRule.create(context)

    visitor.AssignmentExpression!(assignmentExpr(
      identifier('password'),
      literal('mySecret123'),
    ))

    expect(reports).toHaveLength(0)
  })

  it('reports Literal matching known secret pattern (AWS key)', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noHardcodedCredentialsRule.create(context)

    visitor.Literal!(literal('AKIAIOSFODNN7EXAMPLE'))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('AWS Access Key ID')
  })

  it('reports Literal matching JWT token pattern', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noHardcodedCredentialsRule.create(context)

    visitor.Literal!(literal('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abc123def456'))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('JWT')
  })

  it('reports URL with embedded credentials', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noHardcodedCredentialsRule.create(context)

    visitor.Literal!(literal('postgres://admin:pass123@db.example.com:5432/mydb'))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('URL with embedded credentials')
  })

  it('does not report URL with embedded credentials when checkUrls is false', () => {
    const { context, reports } = createMockContext([{ checkUrls: false }])
    const visitor: RuleVisitor = noHardcodedCredentialsRule.create(context)

    visitor.Literal!(literal('postgres://admin:pass123@db.example.com:5432/mydb'))

    expect(reports).toHaveLength(0)
  })

  it('does not report placeholder values', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noHardcodedCredentialsRule.create(context)

    visitor.VariableDeclarator!(varDeclarator(
      identifier('password'),
      literal('CHANGEME'),
    ))

    expect(reports).toHaveLength(0)
  })

  it('does not report empty string credential', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noHardcodedCredentialsRule.create(context)

    visitor.VariableDeclarator!(varDeclarator(
      identifier('token'),
      literal(''),
    ))

    expect(reports).toHaveLength(0)
  })

  it('does not report process.env values', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noHardcodedCredentialsRule.create(context)

    visitor.VariableDeclarator!(varDeclarator(
      identifier('password'),
      literal('process.env.PASSWORD'),
    ))

    expect(reports).toHaveLength(0)
  })

  it('does not report template variable values', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noHardcodedCredentialsRule.create(context)

    visitor.VariableDeclarator!(varDeclarator(
      identifier('token'),
      literal('${TOKEN}'),
    ))

    expect(reports).toHaveLength(0)
  })

  it('ignores values matching ignorePatterns', () => {
    const { context, reports } = createMockContext([{ ignorePatterns: ['^test-'] }])
    const visitor: RuleVisitor = noHardcodedCredentialsRule.create(context)

    visitor.VariableDeclarator!(varDeclarator(
      identifier('api_key'),
      literal('test-key-12345'),
    ))

    expect(reports).toHaveLength(0)
  })

  it('reports credential in object literal passed to function call', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noHardcodedCredentialsRule.create(context)

    const obj = objExpr([
      property(identifier('password'), literal('mySecret123')),
    ])

    visitor.CallExpression!(callExpr(
      identifier('connect'),
      [obj],
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('password')
    expect(reports[0]!.message).toContain('connect')
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noHardcodedCredentialsRule.meta.docs?.category).toBe('security')
    expect(noHardcodedCredentialsRule.meta.docs?.recommended).toBe(true)
    expect(noHardcodedCredentialsRule.meta.severity).toBe('error')
    expect(noHardcodedCredentialsRule.meta.type).toBe('problem')
  })
})

// ─── Section: no-unsafe-html ───

describe('no-unsafe-html rule', () => {
  it('reports innerHTML assignment with string value', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeHtmlRule.create(context)

    visitor.AssignmentExpression!(assignmentExpr(
      memberExpr(identifier('el'), identifier('innerHTML')),
      literal('<b>hello</b>'),
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('innerHTML')
    expect(reports[0]!.message).toContain('XSS')
  })

  it('reports outerHTML assignment with string value', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeHtmlRule.create(context)

    visitor.AssignmentExpression!(assignmentExpr(
      memberExpr(identifier('el'), identifier('outerHTML')),
      literal('<div>content</div>'),
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('outerHTML')
  })

  it('does not report textContent assignment', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeHtmlRule.create(context)

    visitor.AssignmentExpression!(assignmentExpr(
      memberExpr(identifier('el'), identifier('textContent')),
      literal('safe text'),
    ))

    expect(reports).toHaveLength(0)
  })

  it('does not report innerText assignment', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeHtmlRule.create(context)

    visitor.AssignmentExpression!(assignmentExpr(
      memberExpr(identifier('el'), identifier('innerText')),
      literal('safe text'),
    ))

    expect(reports).toHaveLength(0)
  })

  it('does not report innerHTML with number literal', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeHtmlRule.create(context)

    visitor.AssignmentExpression!(assignmentExpr(
      memberExpr(identifier('el'), identifier('innerHTML')),
      literal(42),
    ))

    expect(reports).toHaveLength(0)
  })

  it('does not report innerHTML with boolean literal', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeHtmlRule.create(context)

    visitor.AssignmentExpression!(assignmentExpr(
      memberExpr(identifier('el'), identifier('innerHTML')),
      literal(true),
    ))

    expect(reports).toHaveLength(0)
  })

  it('reports innerHTML with dynamic value (Identifier)', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeHtmlRule.create(context)

    visitor.AssignmentExpression!(assignmentExpr(
      memberExpr(identifier('el'), identifier('innerHTML')),
      identifier('userInput'),
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('dynamic value')
  })

  it('reports innerHTML assignment with plain string (no HTML tags)', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeHtmlRule.create(context)

    visitor.AssignmentExpression!(assignmentExpr(
      memberExpr(identifier('el'), identifier('innerHTML')),
      literal('just a string'),
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Unsafe assignment')
  })

  it('does not report innerHTML with DOMPurify.sanitize() value', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeHtmlRule.create(context)

    const sanitizedCall = callExpr(
      memberExpr(identifier('DOMPurify'), identifier('sanitize')),
      [identifier('dirty')],
    )

    visitor.AssignmentExpression!(assignmentExpr(
      memberExpr(identifier('el'), identifier('innerHTML')),
      sanitizedCall,
    ))

    expect(reports).toHaveLength(0)
  })

  it('does not report innerHTML wrapped in safe method (escape)', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeHtmlRule.create(context)

    const escapeCall = callExpr(
      identifier('escape'),
      [identifier('input')],
    )

    visitor.AssignmentExpression!(assignmentExpr(
      memberExpr(identifier('el'), identifier('innerHTML')),
      escapeCall,
    ))

    expect(reports).toHaveLength(0)
  })

  it('reports document.write() with string argument', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeHtmlRule.create(context)

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('document'), identifier('write')),
      [literal('<script>alert(1)</script>')],
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('document.write()')
  })

  it('does not report document.write() with no arguments', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeHtmlRule.create(context)

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('document'), identifier('write')),
      [],
    ))

    expect(reports).toHaveLength(0)
  })

  it('reports insertAdjacentHTML() with string argument', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeHtmlRule.create(context)

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('el'), identifier('insertAdjacentHTML')),
      [literal('beforeend'), literal('<b>bold</b>')],
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('insertAdjacentHTML()')
  })

  it('does not report insertAdjacentHTML() with fewer than 2 arguments', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeHtmlRule.create(context)

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('el'), identifier('insertAdjacentHTML')),
      [literal('beforeend')],
    ))

    expect(reports).toHaveLength(0)
  })

  it('reports jQuery-style .html() with string argument', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeHtmlRule.create(context)

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('$'), identifier('html')),
      [literal('<em>text</em>')],
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('.html()')
  })

  it('does not report jQuery-style .html() with no arguments', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeHtmlRule.create(context)

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('$'), identifier('html')),
      [],
    ))

    expect(reports).toHaveLength(0)
  })

  it('does not report non-+= assignment operator', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noUnsafeHtmlRule.create(context)

    visitor.AssignmentExpression!(assignmentExpr(
      memberExpr(identifier('el'), identifier('innerHTML')),
      literal('<p>text</p>'),
      '+=',
    ))

    expect(reports).toHaveLength(0)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noUnsafeHtmlRule.meta.docs?.category).toBe('security')
    expect(noUnsafeHtmlRule.meta.docs?.recommended).toBe(true)
    expect(noUnsafeHtmlRule.meta.severity).toBe('warn')
    expect(noUnsafeHtmlRule.meta.type).toBe('problem')
  })
})

// ─── Section: no-sql-injection ───

describe('no-sql-injection rule', () => {
  it('reports string concatenation in db.query()', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noSqlInjectionRule.create(context)

    const concatArg = binaryExpr(
      '+',
      literal('SELECT * FROM users WHERE id = '),
      identifier('userId'),
    )

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('db'), identifier('query')),
      [concatArg],
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('string concatenation')
    expect(reports[0]!.message).toContain('SQL')
  })

  it('reports template literal interpolation in connection.execute()', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noSqlInjectionRule.create(context)

    const tplArg = templateLiteral(
      [templateElement('SELECT * FROM users WHERE id = ', 'SELECT * FROM users WHERE id = ')],
      [identifier('id')],
    )
    // Set tail on last quasi
    ;(tplArg.quasis[0] as Record<string, unknown>).tail = false
    tplArg.quasis.push(templateElement('', ''))

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('connection'), identifier('execute')),
      [tplArg],
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('template literal')
  })

  it('does not report safe parameterized query', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noSqlInjectionRule.create(context)

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('db'), identifier('query')),
      [literal('SELECT * FROM users WHERE id = ?'), identifier('userId')],
    ))

    expect(reports).toHaveLength(0)
  })

  it('reports eval() with SQL-related string', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noSqlInjectionRule.create(context)

    visitor.CallExpression!(callExpr(
      identifier('eval'),
      [literal('SELECT * FROM users')],
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('eval()')
    expect(reports[0]!.message).toContain('SQL')
  })

  it('does not report eval() with non-SQL string', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noSqlInjectionRule.create(context)

    visitor.CallExpression!(callExpr(
      identifier('eval'),
      [literal('some non-sql code')],
    ))

    expect(reports).toHaveLength(0)
  })

  it('reports Array.join() building SQL query', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noSqlInjectionRule.create(context)

    const joinArg = callExpr(
      memberExpr(
        arrayExpr([literal('SELECT * FROM users'), literal('WHERE 1=1')]),
        identifier('join'),
      ),
      [literal(' ')],
    )

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('db'), identifier('query')),
      [joinArg],
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('Array.join()')
  })

  it('reports SQL method on non-SQL object when method name matches', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noSqlInjectionRule.create(context)

    const concatArg = binaryExpr(
      '+',
      literal('SELECT * FROM users WHERE id = '),
      identifier('userId'),
    )

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('logger'), identifier('query')),
      [concatArg],
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('string concatenation')
  })

  it('does not report when method is in ignoreMethods', () => {
    const { context, reports } = createMockContext([{ ignoreMethods: ['query'] }])
    const visitor: RuleVisitor = noSqlInjectionRule.create(context)

    const concatArg = binaryExpr(
      '+',
      literal('SELECT * FROM users WHERE id = '),
      identifier('userId'),
    )

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('db'), identifier('query')),
      [concatArg],
    ))

    expect(reports).toHaveLength(0)
  })

  it('skips analysis in test files', () => {
    const { context, reports } = createMockContextWithFile('src/app.test.ts')
    const visitor: RuleVisitor = noSqlInjectionRule.create(context)

    const concatArg = binaryExpr(
      '+',
      literal('SELECT * FROM users WHERE id = '),
      identifier('userId'),
    )

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('db'), identifier('query')),
      [concatArg],
    ))

    expect(reports).toHaveLength(0)
  })

  it('does not report template literal when checkTemplateLiterals is false', () => {
    const { context, reports } = createMockContext([{ checkTemplateLiterals: false }])
    const visitor: RuleVisitor = noSqlInjectionRule.create(context)

    const tplArg = templateLiteral(
      [templateElement('SELECT * FROM users WHERE id = ', 'SELECT * FROM users WHERE id = ')],
      [identifier('id')],
    )
    ;(tplArg.quasis[0] as Record<string, unknown>).tail = false
    tplArg.quasis.push(templateElement('', ''))

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('db'), identifier('query')),
      [tplArg],
    ))

    expect(reports).toHaveLength(0)
  })

  it('does not report call with no arguments', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noSqlInjectionRule.create(context)

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('db'), identifier('query')),
      [],
    ))

    expect(reports).toHaveLength(0)
  })

  it('reports standalone query() call on no object', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noSqlInjectionRule.create(context)

    const concatArg = binaryExpr(
      '+',
      literal('SELECT * FROM users WHERE id = '),
      identifier('userId'),
    )

    visitor.CallExpression!(callExpr(
      identifier('query'),
      [concatArg],
    ))

    expect(reports).toHaveLength(1)
    expect(reports[0]!.message).toContain('string concatenation')
  })

  it('reports SQL method on recognized SQL object name (pg)', () => {
    const { context, reports } = createMockContext()
    const visitor: RuleVisitor = noSqlInjectionRule.create(context)

    const concatArg = binaryExpr(
      '+',
      literal('SELECT * FROM users WHERE name = '),
      identifier('name'),
    )

    visitor.CallExpression!(callExpr(
      memberExpr(identifier('pg'), identifier('query')),
      [concatArg],
    ))

    expect(reports).toHaveLength(1)
  })

  // ─── Meta ───

  it('has correct meta properties', () => {
    expect(noSqlInjectionRule.meta.docs?.category).toBe('security')
    expect(noSqlInjectionRule.meta.docs?.recommended).toBe(true)
    expect(noSqlInjectionRule.meta.severity).toBe('error')
    expect(noSqlInjectionRule.meta.type).toBe('problem')
  })
})
