import { describe, expect, test, vi } from 'vitest'

import type { RuleContext } from '../../../../src/plugins/types.js'

import { noSqlInjectionRule } from '../../../../src/rules/security/no-sql-injection.js'

interface ReportDescriptor {
  loc?: { end: { column: number; line: number }; start: { column: number; line: number } }
  message: string
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.ts',
  source = 'const x = 1;',
): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    config: { options: [options] },
    getAST: () => null,
    getComments: () => [],
    getFilePath: () => filePath,
    getSource: () => source,
    getTokens: () => [],
    logger: {
      debug: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    },
    report(descriptor: ReportDescriptor) {
      reports.push({
        loc: descriptor.loc,
        message: descriptor.message,
      })
    },
    workspaceRoot: '/src',
  } as unknown as RuleContext

  return { context, reports }
}

function createStringLiteral(value: string): unknown {
  return {
    loc: {
      end: { column: value.length + 2, line: 1 },
      start: { column: 0, line: 1 },
    },
    type: 'Literal',
    value,
  }
}

function createIdentifier(name: string): unknown {
  return { name, type: 'Identifier' }
}

function createBinaryExpression(left: unknown, operator: string, right: unknown): unknown {
  return {
    left,
    loc: {
      end: { column: 40, line: 1 },
      start: { column: 0, line: 1 },
    },
    operator,
    right,
    type: 'BinaryExpression',
  }
}

function createBinaryExpressionWithLoc(
  left: unknown,
  operator: string,
  right: unknown,
  loc: { end: { column: number; line: number }; start: { column: number; line: number } },
): unknown {
  return { left, loc, operator, right, type: 'BinaryExpression' }
}

function createTemplateLiteral(quasis: string[], expressions: unknown[]): unknown {
  return {
    expressions,
    loc: {
      end: { column: 40, line: 1 },
      start: { column: 0, line: 1 },
    },
    quasis: quasis.map((q) => ({
      type: 'TemplateElement',
      value: { cooked: q, raw: q },
    })),
    type: 'TemplateLiteral',
  }
}

function createCallExpression(calleeName: string, args: unknown[]): unknown {
  return {
    arguments: args,
    callee: { name: calleeName, type: 'Identifier' },
    loc: {
      end: { column: 50, line: 1 },
      start: { column: 0, line: 1 },
    },
    type: 'CallExpression',
  }
}

function createCallExpressionWithLoc(
  calleeName: string,
  args: unknown[],
  loc: { end: { column: number; line: number }; start: { column: number; line: number } },
): unknown {
  return {
    arguments: args,
    callee: { name: calleeName, type: 'Identifier' },
    loc,
    type: 'CallExpression',
  }
}

function createMemberCallExpression(objectName: string, methodName: string, args: unknown[]): unknown {
  return {
    arguments: args,
    callee: {
      object: { name: objectName, type: 'Identifier' },
      property: { name: methodName, type: 'Identifier' },
      type: 'MemberExpression',
    },
    loc: {
      end: { column: 60, line: 1 },
      start: { column: 0, line: 1 },
    },
    type: 'CallExpression',
  }
}

function createArrayJoinCall(elements: unknown[], joinArg = ''): unknown {
  return {
    arguments: [{ type: 'Literal', value: joinArg }],
    callee: {
      object: { elements, type: 'ArrayExpression' },
      property: { name: 'join', type: 'Identifier' },
      type: 'MemberExpression',
    },
    loc: {
      end: { column: 60, line: 1 },
      start: { column: 0, line: 1 },
    },
    type: 'CallExpression',
  }
}

type VisitorMethod = (...args: unknown[]) => void

function getCallVisitor(visitor: Record<string, VisitorMethod>): VisitorMethod {
  // eslint-disable-next-line dot-notation
  return visitor['CallExpression'] as VisitorMethod
}

describe('noSqlInjectionRule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noSqlInjectionRule.meta.type).toBe('problem')
    })

    test('should have error severity', () => {
      expect(noSqlInjectionRule.meta.severity).toBe('error')
    })

    test('should be recommended', () => {
      expect(noSqlInjectionRule.meta.docs?.recommended).toBe(true)
    })

    test('should have security category', () => {
      expect(noSqlInjectionRule.meta.docs?.category).toBe('security')
    })

    test('should have schema defined', () => {
      expect(noSqlInjectionRule.meta.schema).toBeDefined()
    })

    test('should have description mentioning SQL injection', () => {
      expect(noSqlInjectionRule.meta.docs?.description.toLowerCase()).toContain('sql injection')
    })

    test('should have correct URL', () => {
      expect(noSqlInjectionRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-sql-injection',
      )
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noSqlInjectionRule.meta.schema)).toBe(true)
    })

    test('should have checkTemplateLiterals in schema', () => {
      const schema = noSqlInjectionRule.meta.schema as Array<Record<string, unknown>>
      const props = (schema[0] as Record<string, unknown>).properties as Record<string, unknown>
      expect(props).toHaveProperty('checkTemplateLiterals')
    })

    test('should have ignoreMethods in schema', () => {
      const schema = noSqlInjectionRule.meta.schema as Array<Record<string, unknown>>
      const props = (schema[0] as Record<string, unknown>).properties as Record<string, unknown>
      expect(props).toHaveProperty('ignoreMethods')
    })

    test('should have fixable as undefined', () => {
      expect(noSqlInjectionRule.meta.fixable).toBeUndefined()
    })

    test('should have checkTemplateLiterals default true in schema', () => {
      const schema = noSqlInjectionRule.meta.schema as Array<Record<string, unknown>>
      const props = (schema[0] as Record<string, unknown>).properties as Record<
        string,
        Record<string, unknown>
      >
      expect(props.checkTemplateLiterals.default).toBe(true)
    })

    test('should have ignoreMethods default empty array in schema', () => {
      const schema = noSqlInjectionRule.meta.schema as Array<Record<string, unknown>>
      const props = (schema[0] as Record<string, unknown>).properties as Record<
        string,
        Record<string, unknown>
      >
      expect(props.ignoreMethods.default).toEqual([])
    })
  })

  describe('create', () => {
    test('should return visitor object with CallExpression method', () => {
      const { context } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      expect(visitor).toHaveProperty('CallExpression')
    })

    test('should return function for CallExpression visitor method', () => {
      const { context } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      expect(typeof visitor.CallExpression).toBe('function')
    })

    test('should return a new visitor each time create is called', () => {
      const { context } = createMockContext()
      const visitor1 = noSqlInjectionRule.create(context)
      const visitor2 = noSqlInjectionRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })
  })

  describe('string concatenation detection', () => {
    test('should report string concat in query() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM users WHERE id = '),
            '+',
            createIdentifier('userId'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('string concatenation')
    })

    const concatMethodCases = [
      { method: 'execute', sql: 'DELETE FROM users WHERE id = ', var: 'id' },
      { method: 'raw', sql: 'UPDATE users SET name = ', var: 'name' },
      { method: 'sql', sql: 'INSERT INTO users VALUES (', var: 'val' },
      { method: 'run', sql: 'DROP TABLE ', var: 'tableName' },
      { method: 'all', sql: 'SELECT * FROM ', var: 'table' },
      { method: 'get', sql: 'SELECT name FROM users WHERE id = ', var: 'id' },
    ]

    test.each(concatMethodCases)('should report string concat in $method() call', ({ method, sql, var: v }) => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression(method, [
          createBinaryExpression(createStringLiteral(sql), '+', createIdentifier(v)),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    const memberConcatCases = [
      { method: 'query', object: 'db', sql: 'SELECT * FROM users WHERE id = ', var: 'userId' },
      { method: 'execute', object: 'connection', sql: 'SELECT * FROM orders WHERE user = ', var: 'user' },
    ]

    test.each(memberConcatCases)('should report string concat in $object.$method() call', ({ method, object, sql, var: v }) => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createMemberCallExpression(object, method, [
          createBinaryExpression(createStringLiteral(sql), '+', createIdentifier(v)),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report multi-part string concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createBinaryExpression(
            createBinaryExpression(
              createStringLiteral('SELECT * FROM '),
              '+',
              createIdentifier('table'),
            ),
            '+',
            createStringLiteral(' WHERE id = 1'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report string concat with identifier on left', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createBinaryExpression(
            createIdentifier('prefix'),
            '+',
            createStringLiteral(' SELECT * FROM users'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report nested binary expression concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      const inner = createBinaryExpression(
        createStringLiteral('SELECT * FROM '),
        '+',
        createIdentifier('tbl'),
      )
      const outer = createBinaryExpression(
        inner,
        '+',
        createStringLiteral(' WHERE 1=1'),
      )
      getCallVisitor(visitor)(createCallExpression('query', [outer]))
      expect(reports.length).toBe(1)
    })

    test('should not report concat without SQL keywords', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createBinaryExpression(
            createStringLiteral('hello '),
            '+',
            createIdentifier('name'),
          ),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report concat with non-SQL method', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('log', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM users WHERE id = '),
            '+',
            createIdentifier('userId'),
          ),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report static string argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createStringLiteral('SELECT * FROM users WHERE id = 1'),
        ]),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('template literal detection', () => {
    test('should report template literal interpolation in query()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createTemplateLiteral(
            ['SELECT * FROM users WHERE id = ', ''],
            [createIdentifier('userId')],
          ),
        ]),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('template literal')
    })

    test('should report template literal interpolation in execute()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('execute', [
          createTemplateLiteral(
            ['DELETE FROM users WHERE id = ', ''],
            [createIdentifier('id')],
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report template literal interpolation in raw()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('raw', [
          createTemplateLiteral(
            ['UPDATE users SET name = ', ' WHERE id = 1'],
            [createIdentifier('name')],
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report template literal with multiple expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createTemplateLiteral(
            ['SELECT * FROM ', ' WHERE id = ', ' AND active = 1'],
            [createIdentifier('table'), createIdentifier('id')],
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report template literal in db.query()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createMemberCallExpression('db', 'query', [
          createTemplateLiteral(
            ['SELECT * FROM users WHERE id = ', ''],
            [createIdentifier('userId')],
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    const templateKeywordCases = [
      { keyword: 'SELECT', parts: ['SELECT ', ' FROM users'] },
      { keyword: 'INSERT', parts: ['INSERT INTO users VALUES (', ')'] },
      { keyword: 'UPDATE', parts: ['UPDATE users SET name = ', ''] },
      { keyword: 'DELETE', parts: ['DELETE FROM users WHERE id = ', ''] },
      { keyword: 'DROP', parts: ['DROP TABLE ', ''] },
    ]

    test.each(templateKeywordCases)('should report template literal with $keyword keyword', ({ parts }) => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createTemplateLiteral(parts, [createIdentifier('x')]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report template literal without SQL keywords', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createTemplateLiteral(
            ['Hello ', '!'],
            [createIdentifier('name')],
          ),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report template literal without expressions', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createTemplateLiteral(
            ['SELECT * FROM users'],
            [],
          ),
        ]),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('parameterized queries (safe)', () => {
    test('should not report parameterized query with ? placeholder', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createStringLiteral('SELECT * FROM users WHERE id = ?'),
          { elements: [createIdentifier('userId')], type: 'ArrayExpression' },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report parameterized query with array params', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('execute', [
          createStringLiteral('INSERT INTO users (name, email) VALUES (?, ?)'),
          {
            elements: [createIdentifier('name'), createIdentifier('email')],
            type: 'ArrayExpression',
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report named parameter query with object params', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createStringLiteral('SELECT * FROM users WHERE id = :id'),
          {
            properties: [
              {
                key: { name: 'id', type: 'Identifier' },
                type: 'Property',
                value: createIdentifier('userId'),
              },
            ],
            type: 'ObjectExpression',
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report static SQL with no interpolation', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createStringLiteral('SELECT * FROM users'),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report parameterized query with multiple ? placeholders', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createStringLiteral('SELECT * FROM users WHERE id = ? AND status = ?'),
          {
            elements: [createIdentifier('id'), createIdentifier('status')],
            type: 'ArrayExpression',
          },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    const staticQueryCases = [
      { label: 'SELECT', sql: 'SELECT id, name FROM products LIMIT 10' },
      { label: 'INSERT', sql: "INSERT INTO logs (msg) VALUES ('ok')" },
      { label: 'UPDATE', sql: "UPDATE config SET value = 'active' WHERE key = 'status'" },
      { label: 'DELETE', sql: 'DELETE FROM sessions WHERE expired = 1' },
    ]

    test.each(staticQueryCases)('should not report static $label query', ({ sql }) => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(createCallExpression('query', [createStringLiteral(sql)]))
      expect(reports.length).toBe(0)
    })

    test('should not report query with only string literal argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createStringLiteral('SELECT 1'),
        ]),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('eval() with SQL', () => {
    test('should report eval() with SQL string literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('eval', [
          createStringLiteral('SELECT * FROM users'),
        ]),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('eval()')
    })

    test('should report eval() with SQL concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('eval', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM '),
            '+',
            createIdentifier('table'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report eval() with SQL template literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('eval', [
          createTemplateLiteral(
            ['DELETE FROM users WHERE id = ', ''],
            [createIdentifier('id')],
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    const evalSqlKeywordCases = [
      { keyword: 'SELECT', sql: 'SELECT * FROM admin_table' },
      { keyword: 'INSERT', sql: 'INSERT INTO users VALUES (1, "admin")' },
      { keyword: 'DELETE', sql: 'DELETE FROM sessions' },
    ]

    test.each(evalSqlKeywordCases)('should report eval() with $keyword keyword', ({ sql }) => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(createCallExpression('eval', [createStringLiteral(sql)]))
      expect(reports.length).toBe(1)
    })

    const evalNoSqlCases = [
      { label: 'console.log', sql: 'console.log("hello")' },
      { label: 'arithmetic', sql: '2 + 2' },
    ]

    test.each(evalNoSqlCases)('should not report eval() with $label', ({ sql }) => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(createCallExpression('eval', [createStringLiteral(sql)]))
      expect(reports.length).toBe(0)
    })
  })

  describe('Array.join() SQL building', () => {
    test('should report Array.join() with SQL elements in query()', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createArrayJoinCall([
            createStringLiteral('SELECT * FROM'),
            createIdentifier('table'),
            createStringLiteral('WHERE id = 1'),
          ]),
        ]),
      )
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('Array.join()')
    })

    test('should report Array.join() with SELECT parts', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createArrayJoinCall([
            createStringLiteral('SELECT'),
            createIdentifier('cols'),
            createStringLiteral('FROM users'),
          ]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report Array.join() with INSERT parts', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createArrayJoinCall([
            createStringLiteral('INSERT INTO'),
            createIdentifier('table'),
            createStringLiteral('VALUES (1, 2)'),
          ]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report Array.join() without SQL keywords', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createArrayJoinCall([
            createStringLiteral('Hello'),
            createIdentifier('name'),
            createStringLiteral('World'),
          ]),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report Array.join() with non-SQL elements', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createArrayJoinCall([
            createIdentifier('a'),
            createIdentifier('b'),
            createIdentifier('c'),
          ]),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report Array.join() in execute() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('execute', [
          createArrayJoinCall([
            createStringLiteral('UPDATE users SET'),
            createIdentifier('clause'),
          ]),
        ]),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('SQL method name detection', () => {
    const sqlMethodCases = [
      { expected: 1, method: 'query' },
      { expected: 1, method: 'execute' },
      { expected: 1, method: 'raw' },
      { expected: 1, method: 'sql' },
      { expected: 1, method: 'run' },
      { expected: 1, method: 'all' },
      { expected: 1, method: 'get' },
    ]

    test.each(sqlMethodCases)('should detect $method method', ({ expected, method }) => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression(method, [
          createBinaryExpression(
            createStringLiteral('SELECT 1 FROM '),
            '+',
            createIdentifier('t'),
          ),
        ]),
      )
      expect(reports.length).toBe(expected)
    })

    test('should not detect non-SQL method', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('fetchData', [
          createBinaryExpression(
            createStringLiteral('SELECT 1 FROM '),
            '+',
            createIdentifier('t'),
          ),
        ]),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('SQL object name detection', () => {
    const sqlObjectCases = [
      { expected: 1, method: 'query', object: 'db' },
      { expected: 1, method: 'execute', object: 'database' },
      { expected: 1, method: 'query', object: 'connection' },
      { expected: 1, method: 'raw', object: 'conn' },
      { expected: 1, method: 'query', object: 'pool' },
      { expected: 1, method: 'query', object: 'knex' },
      { expected: 1, method: 'query', object: 'sequelize' },
    ]

    test.each(sqlObjectCases)('should detect $object.$method', ({ expected, method, object }) => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createMemberCallExpression(object, method, [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM '),
            '+',
            createIdentifier('t'),
          ),
        ]),
      )
      expect(reports.length).toBe(expected)
    })

    test('should detect SQL object with custom method via object check', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createMemberCallExpression('db', 'customQuery', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM '),
            '+',
            createIdentifier('t'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('test file skip', () => {
    const testFileCases = [
      { label: '.test.ts', path: '/src/file.test.ts' },
      { label: '.spec.ts', path: '/src/file.spec.ts' },
      { label: '__tests__', path: '/src/__tests__/file.ts' },
      { label: '.test.js', path: '/src/file.test.js' },
    ]

    test.each(testFileCases)('should not report in $label files', ({ path }) => {
      const { context, reports } = createMockContext({}, path)
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createBinaryExpression(createStringLiteral('SELECT * FROM '), '+', createIdentifier('t')),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report in regular source files', () => {
      const { context, reports } = createMockContext({}, '/src/service.ts')
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM '),
            '+',
            createIdentifier('t'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report in .test.js files', () => {
      const { context, reports } = createMockContext({}, '/src/file.test.js')
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createBinaryExpression(createStringLiteral('SELECT * FROM '), '+', createIdentifier('t')),
        ]),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('options: ignoreMethods', () => {
    test('should not report ignored method', () => {
      const { context, reports } = createMockContext({ ignoreMethods: ['query'] })
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM '),
            '+',
            createIdentifier('t'),
          ),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report non-ignored methods', () => {
      const { context, reports } = createMockContext({ ignoreMethods: ['query'] })
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('execute', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM '),
            '+',
            createIdentifier('t'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle multiple ignored methods', () => {
      const { context, reports } = createMockContext({
        ignoreMethods: ['query', 'execute', 'raw'],
      })
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM '),
            '+',
            createIdentifier('t'),
          ),
        ]),
      )
      getCallVisitor(visitor)(
        createCallExpression('execute', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM '),
            '+',
            createIdentifier('t'),
          ),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should ignore db.query when query is ignored', () => {
      const { context, reports } = createMockContext({ ignoreMethods: ['query'] })
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createMemberCallExpression('db', 'query', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM '),
            '+',
            createIdentifier('t'),
          ),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should still report eval with SQL when methods are ignored', () => {
      const { context, reports } = createMockContext({ ignoreMethods: ['query'] })
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('eval', [
          createStringLiteral('SELECT * FROM users'),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report when method name matches ignoreMethods', () => {
      const { context, reports } = createMockContext({ ignoreMethods: ['raw'] })
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('raw', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM '),
            '+',
            createIdentifier('t'),
          ),
        ]),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('options: checkTemplateLiterals', () => {
    test('should report template literal when checkTemplateLiterals is true (default)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createTemplateLiteral(
            ['SELECT * FROM ', ''],
            [createIdentifier('t')],
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report template literal when checkTemplateLiterals is false', () => {
      const { context, reports } = createMockContext({
        checkTemplateLiterals: false,
      })
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createTemplateLiteral(
            ['SELECT * FROM ', ''],
            [createIdentifier('t')],
          ),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should still report string concat when checkTemplateLiterals is false', () => {
      const { context, reports } = createMockContext({
        checkTemplateLiterals: false,
      })
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM '),
            '+',
            createIdentifier('t'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should default checkTemplateLiterals to true', () => {
      const { context, reports } = createMockContext({})
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createTemplateLiteral(
            ['SELECT * FROM ', ''],
            [createIdentifier('t')],
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should still report eval when checkTemplateLiterals is false', () => {
      const { context, reports } = createMockContext({
        checkTemplateLiterals: false,
      })
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('eval', [
          createStringLiteral('SELECT * FROM users'),
        ]),
      )
      expect(reports.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    test('should handle null node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      expect(() => getCallVisitor(visitor)(null)).not.toThrow()
    })

    test('should handle undefined node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      // eslint-disable-next-line unicorn/no-useless-undefined
      expect(() => getCallVisitor(visitor)(undefined)).not.toThrow()
    })

    test('should handle node without loc', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)({
        arguments: [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM '),
            '+',
            createIdentifier('t'),
          ),
        ],
        callee: { name: 'query', type: 'Identifier' },
        type: 'CallExpression',
      })
      expect(reports.length).toBe(1)
    })

    test('should handle CallExpression without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)({
        arguments: [],
        callee: { name: 'query', type: 'Identifier' },
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      })
      expect(reports.length).toBe(0)
    })

    test('should handle non-string literal value', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          { type: 'Literal', value: 42 },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should handle CallExpression with non-Identifier callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)({
        arguments: [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM '),
            '+',
            createIdentifier('t'),
          ),
        ],
        callee: {
          body: { body: [], type: 'BlockStatement' },
          params: [],
          type: 'FunctionExpression',
        },
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      })
      expect(reports.length).toBe(0)
    })

    test('should handle empty options', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM '),
            '+',
            createIdentifier('t'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle undefined options', () => {
      const contextNoOpts: RuleContext = {
        config: {},
        getAST: () => null,
        getComments: () => [],
        getFilePath: () => '/src/file.ts',
        getSource: () => 'const x = 1;',
        getTokens: () => [],
        logger: {
          debug: vi.fn(),
          error: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
        },
        report() {},
        workspaceRoot: '/src',
      } as unknown as RuleContext

      const reports: ReportDescriptor[] = []
      const ctx: RuleContext = {
        ...contextNoOpts,
        report: (desc: ReportDescriptor) => reports.push(desc),
      }
      const visitor = noSqlInjectionRule.create(ctx)
      expect(() => {
        getCallVisitor(visitor)(
          createCallExpression('query', [
            createBinaryExpression(
              createStringLiteral('SELECT * FROM '),
              '+',
              createIdentifier('t'),
            ),
          ]),
        )
      }).not.toThrow()
      expect(reports.length).toBe(1)
    })

    test('should report correct location information', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      const loc = { end: { column: 55, line: 10 }, start: { column: 5, line: 10 } }
      getCallVisitor(visitor)(
        createCallExpressionWithLoc('query', [
          createBinaryExpressionWithLoc(
            createStringLiteral('SELECT * FROM '),
            '+',
            createIdentifier('t'),
            loc,
          ),
        ], loc),
      )
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('should handle non-object node gracefully', () => {
      const { context } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      expect(() => getCallVisitor(visitor)('string')).not.toThrow()
      expect(() => getCallVisitor(visitor)(123)).not.toThrow()
    })

    test('should handle deeply nested concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      const inner1 = createBinaryExpression(
        createStringLiteral('SELECT * FROM '),
        '+',
        createIdentifier('t'),
      )
      const inner2 = createBinaryExpression(
        inner1,
        '+',
        createStringLiteral(' WHERE '),
      )
      const outer = createBinaryExpression(
        inner2,
        '+',
        createIdentifier('clause'),
      )
      getCallVisitor(visitor)(createCallExpression('query', [outer]))
      expect(reports.length).toBe(1)
    })

    test('should not report on regular function calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('console.log', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM '),
            '+',
            createIdentifier('t'),
          ),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should handle mixed safe and unsafe patterns', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createStringLiteral('SELECT * FROM users'),
        ]),
      )
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM '),
            '+',
            createIdentifier('t'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle eval without arguments', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)({
        arguments: [],
        callee: { name: 'eval', type: 'Identifier' },
        loc: { end: { column: 10, line: 1 }, start: { column: 0, line: 1 } },
        type: 'CallExpression',
      })
      expect(reports.length).toBe(0)
    })

    test('should handle eval with non-SQL variable', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('eval', [createIdentifier('code')]),
      )
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases - additional coverage', () => {
    test('should not report query with numeric argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [{ type: 'Literal', value: 42 }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report query with boolean argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [{ type: 'Literal', value: true }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report query with null argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [{ type: 'Literal', value: null }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report UPDATE with SET in string concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createBinaryExpression(
            createStringLiteral('UPDATE users SET name='),
            '+',
            createIdentifier('userName'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('string concatenation')
    })

    test('should report DELETE with WHERE in string concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createBinaryExpression(
            createStringLiteral('DELETE FROM users WHERE id='),
            '+',
            createIdentifier('userId'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report ALTER TABLE in string concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('execute', [
          createBinaryExpression(
            createStringLiteral('ALTER TABLE users ADD COLUMN '),
            '+',
            createIdentifier('colName'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report DROP TABLE in eval', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('eval', [
          createBinaryExpression(
            createStringLiteral('DROP TABLE '),
            '+',
            createIdentifier('tableName'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('eval()')
    })

    test('should report template literal with UNION SELECT', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createTemplateLiteral(
            ['SELECT * FROM users UNION SELECT * FROM ', ''],
            [createIdentifier('otherTable')],
          ),
        ]),
      )
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('template literal')
    })

    test('should report nested binary expression three levels deep', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      const inner = createBinaryExpression(
        createStringLiteral('WHERE id='),
        '+',
        createIdentifier('id'),
      )
      const mid = createBinaryExpression(
        createStringLiteral('SELECT * FROM users '),
        '+',
        inner,
      )
      const outer = createBinaryExpression(mid, '+', createStringLiteral(';'))
      getCallVisitor(visitor)(createCallExpression('query', [outer]))
      expect(reports.length).toBe(1)
    })

    test('should not report binary expression exceeding depth limit', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      let expr: unknown = createStringLiteral('SELECT * FROM t')
      for (let i = 0; i < 5; i++) {
        expr = createBinaryExpression(expr, '+', createIdentifier(`p${i}`))
      }
      getCallVisitor(visitor)(createCallExpression('query', [expr]))
      expect(reports.length).toBe(0)
    })

    test('should report on knex.raw() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createMemberCallExpression('knex', 'raw', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM '),
            '+',
            createIdentifier('table'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report on sequelize.query() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createMemberCallExpression('sequelize', 'query', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM users WHERE id='),
            '+',
            createIdentifier('id'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report on pool.execute() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createMemberCallExpression('pool', 'execute', [
          createBinaryExpression(
            createStringLiteral('INSERT INTO users VALUES('),
            '+',
            createIdentifier('vals'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report on prisma.$queryRaw() as sql object method', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createMemberCallExpression('prisma', 'queryRaw', [
          createTemplateLiteral(
            ['SELECT * FROM users WHERE id = ', ''],
            [createIdentifier('id')],
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report query() call even on non-SQL object like logger (method name match)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createMemberCallExpression('logger', 'query', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM users'),
            '+',
            createIdentifier('x'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report unknownMethod() on non-SQL object', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createMemberCallExpression('logger', 'log', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM users'),
            '+',
            createIdentifier('x'),
          ),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report on db.all() with SQL concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createMemberCallExpression('db', 'all', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM '),
            '+',
            createIdentifier('table'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report on db.run() with SQL concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createMemberCallExpression('db', 'run', [
          createBinaryExpression(
            createStringLiteral('INSERT INTO users VALUES('),
            '+',
            createIdentifier('vals'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report query with only template literal quasis (no expressions)', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createTemplateLiteral(['SELECT * FROM users'], []),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report query with template literal without SQL keywords', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createTemplateLiteral(
            ['Hello ', ''],
            [createIdentifier('name')],
          ),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should handle chained member expression callee', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)({
        arguments: [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM '),
            '+',
            createIdentifier('t'),
          ),
        ],
        callee: {
          object: {
            object: { name: 'app', type: 'Identifier' },
            property: { name: 'db', type: 'Identifier' },
            type: 'MemberExpression',
          },
          property: { name: 'query', type: 'Identifier' },
          type: 'MemberExpression',
        },
        loc: {
          end: { column: 60, line: 1 },
          start: { column: 0, line: 1 },
        },
        type: 'CallExpression',
      })
      expect(reports.length).toBe(1)
    })

    test('should report VALUES keyword in SQL concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createBinaryExpression(
            createStringLiteral('INSERT INTO t VALUES('),
            '+',
            createIdentifier('v'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report JOIN keyword in SQL concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM a JOIN '),
            '+',
            createIdentifier('b'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle CallExpression with null arguments array', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)({
        arguments: null,
        callee: { name: 'query', type: 'Identifier' },
        type: 'CallExpression',
      })
      expect(reports.length).toBe(0)
    })

    test('should handle node without type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)({ callee: { name: 'query', type: 'Identifier' } })
      expect(reports.length).toBe(0)
    })

    test('should not report query with object argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [{ type: 'ObjectExpression' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report on mysql.query() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createMemberCallExpression('mysql', 'query', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM users WHERE id='),
            '+',
            createIdentifier('id'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report on pg.query() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createMemberCallExpression('pg', 'query', [
          createTemplateLiteral(
            ['SELECT * FROM users WHERE id = ', ''],
            [createIdentifier('id')],
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report on sqlite.all() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createMemberCallExpression('sqlite', 'all', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM '),
            '+',
            createIdentifier('table'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report on connection.execute() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createMemberCallExpression('connection', 'execute', [
          createBinaryExpression(
            createStringLiteral('DELETE FROM users WHERE id='),
            '+',
            createIdentifier('id'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report on database.query() call', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createMemberCallExpression('database', 'query', [
          createBinaryExpression(
            createStringLiteral('UPDATE users SET name='),
            '+',
            createIdentifier('name'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report on config.get() call with SQL-looking string', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createMemberCallExpression('config', 'get', [
          createStringLiteral('SELECT * FROM users'),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report EXEC keyword in string concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createBinaryExpression(
            createStringLiteral('EXEC sp_'),
            '+',
            createIdentifier('procName'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle ignoreMethods with partial match not filtering', () => {
      const { context, reports } = createMockContext({ ignoreMethods: ['executeQuery'] })
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM '),
            '+',
            createIdentifier('t'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should not report in .spec.js files', () => {
      const { context, reports } = createMockContext({}, '/src/file.spec.js')
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM users WHERE id='),
            '+',
            createIdentifier('id'),
          ),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report in __tests__ directory', () => {
      const { context, reports } = createMockContext({}, '/src/__tests__/file.ts')
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createBinaryExpression(
            createStringLiteral('SELECT * FROM users'),
            '+',
            createIdentifier('x'),
          ),
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report Array.join with DELETE parts', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createArrayJoinCall([
            createStringLiteral('DELETE'),
            createStringLiteral('FROM users'),
          ]),
        ]),
      )
      expect(reports.length).toBe(1)
      expect(reports[0]!.message).toContain('Array.join')
    })

    test('should report Array.join with UPDATE parts', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('execute', [
          createArrayJoinCall([
            createStringLiteral('UPDATE'),
            createStringLiteral('users SET name=val'),
          ]),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should handle eval with object argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('eval', [{ type: 'ObjectExpression' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should handle eval with function expression argument', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('eval', [{ type: 'FunctionExpression' }]),
      )
      expect(reports.length).toBe(0)
    })

    test('should not report parameterized query with named params and extra args', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('query', [
          createStringLiteral('SELECT * FROM users WHERE id = $1'),
          { type: 'ObjectExpression' },
        ]),
      )
      expect(reports.length).toBe(0)
    })

    test('should report CREATE TABLE in string concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('execute', [
          createBinaryExpression(
            createStringLiteral('CREATE TABLE '),
            '+',
            createIdentifier('tableName'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })

    test('should report TABLE keyword alone in string concatenation', () => {
      const { context, reports } = createMockContext()
      const visitor = noSqlInjectionRule.create(context)
      getCallVisitor(visitor)(
        createCallExpression('raw', [
          createBinaryExpression(
            createIdentifier('prefix'),
            '+',
            createStringLiteral('TABLE users'),
          ),
        ]),
      )
      expect(reports.length).toBe(1)
    })
  })
})
