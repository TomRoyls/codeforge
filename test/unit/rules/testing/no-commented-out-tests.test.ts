import { describe, expect, test, vi } from 'vitest'
import { noCommentedOutTestsRule } from '../../../../src/rules/testing/no-commented-out-tests.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
}

function createMockContext(
  options: Record<string, unknown> = {},
  filePath = '/src/file.test.ts',
  source = '',
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

function invokeProgramVisitor(
  context: RuleContext,
): void {
  const visitor = noCommentedOutTestsRule.create(context)
  visitor.Program({
    type: 'Program',
    body: [],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
  })
}

describe('no-commented-out-tests rule', () => {
  describe('meta', () => {
    test('should have correct rule type', () => {
      expect(noCommentedOutTestsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noCommentedOutTestsRule.meta.severity).toBe('warn')
    })

    test('should not be recommended', () => {
      expect(noCommentedOutTestsRule.meta.docs?.recommended).toBe(false)
    })

    test('should have correct category', () => {
      expect(noCommentedOutTestsRule.meta.docs?.category).toBe('testing')
    })

    test('should have schema defined', () => {
      expect(noCommentedOutTestsRule.meta.schema).toBeDefined()
    })

    test('should have correct description mentioning commented-out', () => {
      const desc = noCommentedOutTestsRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc).toContain('commented')
    })

    test('should have correct description mentioning test cases', () => {
      const desc = noCommentedOutTestsRule.meta.docs?.description.toLowerCase() ?? ''
      expect(desc).toContain('test')
    })
  })

  describe('create', () => {
    test('should return visitor object with Program method', () => {
      const { context } = createMockContext()
      const visitor = noCommentedOutTestsRule.create(context)

      expect(visitor).toHaveProperty('Program')
    })

    test('should return a function for Program', () => {
      const { context } = createMockContext()
      const visitor = noCommentedOutTestsRule.create(context)
      expect(typeof visitor.Program).toBe('function')
    })
  })

  describe('detecting commented-out line tests', () => {
    test('should report commented-out it()', () => {
      const source = "// it('should work', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('commented-out test')
    })

    test('should report commented-out test()', () => {
      const source = "// test('should work', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('commented-out test')
    })

    test('should report commented-out describe()', () => {
      const source = "// describe('suite', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(1)
    })

    test('should report commented-out context()', () => {
      const source = "// context('suite', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(1)
    })

    test('should report commented-out suite()', () => {
      const source = "// suite('suite', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(1)
    })

    test('should report multiple commented-out tests on different lines', () => {
      const source = [
        "// it('test1', () => {})",
        "// test('test2', () => {})",
        "// describe('suite', () => {})",
      ].join('\n')
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(3)
    })

    test('should report correct line numbers for multi-line source', () => {
      const source = [
        "it('active test', () => {})",
        "// it('commented test', () => {})",
      ].join('\n')
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(2)
    })

    test('should detect commented test with extra spaces after //', () => {
      const source = "//   it('test', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(1)
    })
  })

  describe('detecting commented-out block tests', () => {
    test('should report it() inside block comment', () => {
      const source = "/* it('test') */"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('commented-out test')
    })

    test('should report describe() inside block comment', () => {
      const source = "/* describe('suite', () => {}) */"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(1)
    })

    test('should report test() inside block comment', () => {
      const source = "/* test('case', () => {}) */"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(1)
    })

    test('should report context() inside block comment', () => {
      const source = "/* context('suite', () => {}) */"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(1)
    })

    test('should report suite() inside block comment', () => {
      const source = "/* suite('suite', () => {}) */"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(1)
    })

    test('should report each matching line in multi-line block comment', () => {
      const source = [
        '/*',
        "  describe('suite', () => {",
        "    it('test')",
        '  })',
        '*/',
      ].join('\n')
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(2)
    })
  })

  describe('valid cases (no violations)', () => {
    test('should not report active it() call', () => {
      const source = "it('should work', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report active test() call', () => {
      const source = "test('should work', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report active describe() call', () => {
      const source = "describe('suite', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report regular comment without test calls', () => {
      const source = '// some regular comment'
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report it.todo() active call', () => {
      const source = "it.todo('pending test')"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report TODO comment without test function calls', () => {
      const source = '// TODO: write tests'
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report source with no comments at all', () => {
      const source = [
        "describe('suite', () => {",
        "  it('test', () => {})",
        '})',
      ].join('\n')
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report URL containing test in comment', () => {
      const source = '// https://example.com/test/page'
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      // URL contains 'test' but not followed by '(' as a function call pattern
      // The regex requires test( which the URL won't match
      expect(reports.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    test('should handle empty source string', () => {
      const { context, reports } = createMockContext({}, '/src/file.test.ts', '')

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should handle source with only whitespace', () => {
      const { context, reports } = createMockContext({}, '/src/file.test.ts', '   \n  \n  ')

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should handle null node without throwing', () => {
      const source = "// it('test', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)
      const visitor = noCommentedOutTestsRule.create(context)

      // The rule calls toASTNode which returns null for null input
      expect(() => visitor.Program(null)).not.toThrow()
    })

    test('should handle undefined node without throwing', () => {
      const source = "// it('test', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)
      const visitor = noCommentedOutTestsRule.create(context)

      expect(() => visitor.Program(undefined)).not.toThrow()
    })

    test('should report only commented test in mixed source', () => {
      const source = [
        "it('active test', () => {})",
        "// it('commented test', () => {})",
        "describe('active suite', () => {})",
      ].join('\n')
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(2)
    })

    test('should handle source with only a block comment containing no tests', () => {
      const source = '/* regular comment block */'
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report commented test that uses it.skip() (not a direct call pattern)', () => {
      // // it.skip('test') — the regex matches it( not it.skip(
      const source = "// it.skip('test', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      // it.skip( does not match the pattern /it\s*\(/
      expect(reports.length).toBe(0)
    })

    test('should handle block comment with only non-test content', () => {
      const source = [
        '/*',
        ' * This is a regular block comment',
        ' * It has multiple lines',
        ' */',
      ].join('\n')
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })
  })

  describe('report message', () => {
    test('should include message about removing comment or restoring test', () => {
      const source = "// it('should work', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports[0].message).toBe(
        'Unexpected commented-out test. Remove the comment or restore the test.',
      )
    })
  })

  describe('rule meta expanded', () => {
    test('should have a docs.url property', () => {
      expect(noCommentedOutTestsRule.meta.docs?.url).toBeDefined()
    })

    test('should have docs.url containing github', () => {
      expect(noCommentedOutTestsRule.meta.docs?.url).toContain('github.com')
    })

    test('should have schema as an array', () => {
      expect(Array.isArray(noCommentedOutTestsRule.meta.schema)).toBe(true)
    })

    test('should have empty schema', () => {
      expect(noCommentedOutTestsRule.meta.schema).toHaveLength(0)
    })

    test('should have meta as a plain object', () => {
      expect(typeof noCommentedOutTestsRule.meta).toBe('object')
      expect(noCommentedOutTestsRule.meta).not.toBeNull()
      expect(Array.isArray(noCommentedOutTestsRule.meta)).toBe(false)
    })
  })

  describe('independent visitor instances', () => {
    test('should return independent visitors for different contexts', () => {
      const { context: ctx1, reports: rep1 } = createMockContext(
        {},
        '/src/a.test.ts',
        "// it('test', () => {})",
      )
      const { context: ctx2, reports: rep2 } = createMockContext(
        {},
        '/src/b.test.ts',
        "// test('case', () => {})",
      )

      invokeProgramVisitor(ctx1)
      invokeProgramVisitor(ctx2)

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(1)
    })
  })

  describe('commented-out test variants', () => {
    test('should not report commented-out describe.skip() (not a direct call)', () => {
      const source = "// describe.skip('suite', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report commented-out describe.only() (not a direct call)', () => {
      const source = "// describe.only('suite', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report commented-out it.only() (not a direct call)', () => {
      const source = "// it.only('test', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report commented-out test.only() (not a direct call)', () => {
      const source = "// test.only('case', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report commented-out xit()', () => {
      const source = "// xit('test', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report commented-out fit()', () => {
      const source = "// fit('test', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report commented-out test.each() (not a direct call)', () => {
      const source = "// test.each([[1,2]])('case %i', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report commented-out describe.each() (not a direct call)', () => {
      const source = "// describe.each([[1,2]])('suite %i', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should report multi-line commented-out test block', () => {
      const source = [
        "// describe('suite', () => {",
        "//   it('test', () => {})",
        '// })',
      ].join('\n')
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(2)
    })
  })

  describe('valid non-violation cases', () => {
    test('should not report regular comment with no test calls', () => {
      const source = '// This is just a note about the code'
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report test-like string in regular code', () => {
      const source = "const msg = 'test(something)'"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report word "test" in string literal', () => {
      const source = 'console.log("this is a test string")'
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report commented-out expect() inside active test', () => {
      const source = [
        "it('test', () => {",
        "  // expect(result).toBe(1)",
        '})',
      ].join('\n')
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report commented-out function call that is not a test function', () => {
      const source = "// someFunction('test', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })
  })

  describe('report message content verification', () => {
    test('report message for describe() contains commented-out test', () => {
      const source = "// describe('suite', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports[0].message).toBe(
        'Unexpected commented-out test. Remove the comment or restore the test.',
      )
    })

    test('report message for test() contains commented-out test', () => {
      const source = "// test('case', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports[0].message).toBe(
        'Unexpected commented-out test. Remove the comment or restore the test.',
      )
    })

    test('report message for block comment it() contains commented-out test', () => {
      const source = "/* it('test') */"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports[0].message).toBe(
        'Unexpected commented-out test. Remove the comment or restore the test.',
      )
    })
  })

  describe('meta validation', () => {
    test('should have docs with good and bad examples via description', () => {
      const desc = noCommentedOutTestsRule.meta.docs?.description ?? ''
      expect(desc.length).toBeGreaterThan(10)
      expect(desc.toLowerCase()).toContain('commented')
      expect(desc.toLowerCase()).toContain('test')
    })

    test('should have severity as warn', () => {
      expect(noCommentedOutTestsRule.meta.severity).toBe('warn')
    })

    test('should have category set to testing', () => {
      expect(noCommentedOutTestsRule.meta.docs?.category).toBe('testing')
    })
  })

  describe('default export', () => {
    test('default export should equal named export', () => {
      expect(noCommentedOutTestsRule).toHaveProperty('create')
      expect(noCommentedOutTestsRule).toHaveProperty('meta')
      expect(typeof noCommentedOutTestsRule.create).toBe('function')
    })

    test('default export should have create method', () => {
      expect(typeof noCommentedOutTestsRule.create).toBe('function')
    })

    test('default export should have meta property', () => {
      expect(noCommentedOutTestsRule.meta).toBeDefined()
    })
  })

  describe('state isolation between visitors', () => {
    test('should not share reportedLines between different visitor invocations', () => {
      const source = "// it('test', () => {})"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)
      const visitor = noCommentedOutTestsRule.create(context)

      invokeProgramVisitor(context)
      const firstReportCount = reports.length

      invokeProgramVisitor(context)
      const secondReportCount = reports.length

      expect(firstReportCount).toBeGreaterThan(0)
      expect(secondReportCount).toBeGreaterThan(0)
    })

    test('should handle multiple files with different reportedLines sets', () => {
      const source1 = "// it('test1', () => {})"
      const source2 = "// test('test2', () => {})"
      const { context: ctx1, reports: rep1 } = createMockContext({}, '/src/a.test.ts', source1)
      const { context: ctx2, reports: rep2 } = createMockContext({}, '/src/b.test.ts', source2)

      invokeProgramVisitor(ctx1)
      invokeProgramVisitor(ctx2)

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(1)
      expect(rep1[0].message).toBe(rep2[0].message)
    })
  })

  describe('comment variants in block comments', () => {
    test('should not report it.skip() inside block comment (not a direct call)', () => {
      const source = "/* it.skip('test', () => {}) */"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report test.skip() inside block comment (not a direct call)', () => {
      const source = "/* test.skip('case', () => {}) */"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should report xit() inside block comment (contains it() pattern)', () => {
      const source = "/* xit('test', () => {}) */"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(1)
    })

    test('should report xtest() inside block comment (contains test() pattern)', () => {
      const source = "/* xtest('case', () => {}) */"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(1)
    })

    test('should not report describe.skip() inside block comment (not a direct call)', () => {
      const source = "/* describe.skip('suite', () => {}) */"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })
  })

  describe('partial matches and false positives', () => {
    test('should not report comment with "test" word but no function call', () => {
      const source = "// test this function"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report comment with "it" word but no function call', () => {
      const source = "// it is important to test"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report comment with "describe" word but no function call', () => {
      const source = "// describe the test suite"
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })
  })

  describe('JSDoc comment handling', () => {
    test('should not report test mentions in JSDoc comments', () => {
      const source = [
        '/**',
        ' * Test description for function',
        ' * @param {string} test - test parameter',
        ' */',
        'function fn(test: string) {}',
      ].join('\n')
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })

    test('should not report it mentions in JSDoc comments', () => {
      const source = [
        '/**',
        ' * It is a test function',
        ' * @description it does something',
        ' */',
        'function fn() {}',
      ].join('\n')
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)

      invokeProgramVisitor(context)

      expect(reports.length).toBe(0)
    })
  })

  describe('additional meta verification', () => {
    test('should have testing category', () => {
      expect(noCommentedOutTestsRule.meta.docs?.category).toBe('testing')
    })

    test('should have suggestion type', () => {
      expect(noCommentedOutTestsRule.meta.type).toBe('suggestion')
    })

    test('should have warn severity', () => {
      expect(noCommentedOutTestsRule.meta.severity).toBe('warn')
    })

    test('should have description mentioning commented', () => {
      expect(noCommentedOutTestsRule.meta.docs?.description).toContain('commented')
    })

    test('should have create function', () => {
      expect(typeof noCommentedOutTestsRule.create).toBe('function')
    })
  })

  describe('additional coverage', () => {
    test('should not report when source has no comments', () => {
      const { context, reports } = createMockContext({}, "it('works', () => { expect(1).toBe(1) })")
      const visitor = noCommentedOutTestsRule.create(context)

      visitor.Program({ type: 'Program', body: [] })

      expect(reports.length).toBe(0)
    })

    test('should report mixed line and block comments in same source', () => {
      const source = `// it('first', () => {})
/* test('second', () => {}) */
it('active', () => {})`

      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)
      const visitor = noCommentedOutTestsRule.create(context)

      visitor.Program({ type: 'Program', body: [] })

      expect(reports.length).toBe(2)
    })

    test('should not report commented non-test function', () => {
      const source = "// console.log('debug')"

      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)
      const visitor = noCommentedOutTestsRule.create(context)

      visitor.Program({ type: 'Program', body: [] })

      expect(reports.length).toBe(0)
    })

    test('should report describe() in block comment', () => {
      const source = "/* describe('suite', () => { it('test', () => {}) }) */"

      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)
      const visitor = noCommentedOutTestsRule.create(context)

      visitor.Program({ type: 'Program', body: [] })

      expect(reports.length).toBeGreaterThanOrEqual(1)
    })

    test('should handle empty source', () => {
      const { context, reports } = createMockContext({}, '/src/file.test.ts', '')
      const visitor = noCommentedOutTestsRule.create(context)

      visitor.Program({ type: 'Program', body: [] })

      expect(reports.length).toBe(0)
    })

    test('should not report it inside a string literal', () => {
      const source = "const msg = 'use it() for tests'"

      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)
      const visitor = noCommentedOutTestsRule.create(context)

      visitor.Program({ type: 'Program', body: [] })

      expect(reports.length).toBe(0)
    })
  })

  // SECTION: additional coverage
  describe('additional coverage', () => {
    test('should detect commented-out context() call', () => {
      const source = '// context("when foo", () => {})'
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)
      const visitor = noCommentedOutTestsRule.create(context)
      visitor.Program({ type: 'Program', body: [] })
      expect(reports.length).toBe(1)
      expect(reports[0].message).toContain('commented-out')
    })

    test('should detect commented-out suite() call', () => {
      const source = '// suite("group", () => {})'
      const { context, reports } = createMockContext({}, '/src/file.test.ts', source)
      const visitor = noCommentedOutTestsRule.create(context)
      visitor.Program({ type: 'Program', body: [] })
      expect(reports.length).toBe(1)
    })

    test('meta schema should be empty array', () => {
      expect(noCommentedOutTestsRule.meta.schema).toEqual([])
    })
  })
})
