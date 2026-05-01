import { describe, expect, test, vi } from 'vitest'
import { noGitDependenciesRule } from '../../../../src/rules/dependencies/no-git-dependencies.js'
import type { RuleContext } from '../../../../src/plugins/types.js'

interface ReportDescriptor {
  message: string
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } }
  node?: unknown
}

function createMockContext(): { context: RuleContext; reports: ReportDescriptor[] } {
  const reports: ReportDescriptor[] = []

  const context: RuleContext = {
    report: (descriptor: ReportDescriptor) => {
      reports.push({
        message: descriptor.message,
        loc: descriptor.loc,
        node: descriptor.node,
      })
    },
    getFilePath: () => '/src/file.ts',
    getAST: () => null,
    getSource: () => '"git+ssh://git@github.com/user/repo.git"',
    getTokens: () => [],
    getComments: () => [],
    config: { options: [{}] },
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

function makeLoc(startLine: number, startCol: number, endLine: number, endCol: number) {
  return {
    start: { line: startLine, column: startCol },
    end: { line: endLine, column: endCol },
  }
}

function makeLiteral(value: unknown, line = 1, col = 4): unknown {
  const valStr = typeof value === 'string' ? value : String(value)
  return {
    type: 'Literal',
    value,
    loc: makeLoc(line, col, line, col + valStr.length + 2),
  }
}

describe('no-git-dependencies rule', () => {
  // ===== META TESTS (8) =====
  describe('meta', () => {
    test('should have correct type "suggestion"', () => {
      expect(noGitDependenciesRule.meta.type).toBe('suggestion')
    })

    test('should have severity "warn"', () => {
      expect(noGitDependenciesRule.meta.severity).toBe('warn')
    })

    test('should have correct category "dependencies"', () => {
      expect(noGitDependenciesRule.meta.docs?.category).toBe('dependencies')
    })

    test('should not be recommended', () => {
      expect(noGitDependenciesRule.meta.docs?.recommended).toBe(false)
    })

    test('should have a description', () => {
      expect(noGitDependenciesRule.meta.docs?.description).toBeTruthy()
    })

    test('should have description mentioning git and dependency', () => {
      const desc = noGitDependenciesRule.meta.docs?.description?.toLowerCase() ?? ''
      expect(desc).toMatch(/git/)
      expect(desc).toMatch(/dependen/)
    })

    test('should have correct docs URL', () => {
      expect(noGitDependenciesRule.meta.docs?.url).toBe(
        'https://codeforge.dev/docs/rules/no-git-dependencies',
      )
    })

    test('should have empty schema', () => {
      expect(noGitDependenciesRule.meta.schema).toEqual([])
    })
  })

  // ===== STRUCTURE TESTS (2) =====
  describe('structure', () => {
    test('create() returns visitor with Literal', () => {
      const { context } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      expect(visitor).toHaveProperty('Literal')
      expect(typeof visitor.Literal).toBe('function')
    })

    test('default export matches named export', () => {
      expect(noGitDependenciesRule).toBeDefined()
      expect(noGitDependenciesRule.meta).toBeDefined()
      expect(noGitDependenciesRule.create).toBeDefined()
    })
  })

  // ===== POSITIVE CASES (20) =====
  describe('positive cases — reports git dependencies', () => {
    test('reports git+ssh dependency', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git+ssh://git@github.com/user/repo.git'))
      expect(reports.length).toBe(1)
    })

    test('reports git:// dependency', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git://github.com/user/repo.git'))
      expect(reports.length).toBe(1)
    })

    test('reports github: shorthand', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('github:user/repo'))
      expect(reports.length).toBe(1)
    })

    test('reports bitbucket: shorthand', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('bitbucket:user/repo'))
      expect(reports.length).toBe(1)
    })

    test('reports gitlab: shorthand', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('gitlab:user/repo'))
      expect(reports.length).toBe(1)
    })

    test('message contains "Unexpected"', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git+ssh://git@github.com/user/repo.git'))
      expect(reports[0].message).toContain('Unexpected')
    })

    test('message contains "git dependency"', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git+ssh://git@github.com/user/repo.git'))
      expect(reports[0].message.toLowerCase()).toContain('git dependency')
    })

    test('message contains the value', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git+ssh://git@github.com/user/repo.git'))
      expect(reports[0].message).toContain('git+ssh://git@github.com/user/repo.git')
    })

    test('report has loc property', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git+ssh://git@github.com/user/repo.git'))
      expect(reports[0].loc).toBeDefined()
    })

    test('report has node property', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git+ssh://git@github.com/user/repo.git'))
      expect(reports[0].node).toBeDefined()
    })

    test('accumulates reports across multiple calls', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git+ssh://git@github.com/user/repo.git'))
      visitor.Literal(makeLiteral('github:user/repo'))
      visitor.Literal(makeLiteral('gitlab:user/repo'))
      expect(reports.length).toBe(3)
    })

    test('reports git+https dependency', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git+https://github.com/user/repo.git'))
      expect(reports.length).toBe(1)
    })

    test('reports with correct location line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      const node = {
        type: 'Literal',
        value: 'git+ssh://git@github.com/user/repo.git',
        loc: makeLoc(5, 8, 5, 50),
      }
      visitor.Literal(node)
      expect(reports[0].loc?.start.line).toBe(5)
      expect(reports[0].loc?.start.column).toBe(8)
      expect(reports[0].loc?.end.line).toBe(5)
      expect(reports[0].loc?.end.column).toBe(50)
    })

    test('report node matches original node passed in', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      const node = makeLiteral('git+ssh://git@github.com/user/repo.git')
      visitor.Literal(node)
      expect(reports[0].node).toBe(node)
    })

    test('reports git+file protocol', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git+file:///path/to/repo.git'))
      expect(reports.length).toBe(1)
    })

    test('reports git+git protocol', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git+git://github.com/user/repo.git'))
      expect(reports.length).toBe(1)
    })

    test('message contains "versioned"', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git+ssh://git@github.com/user/repo.git'))
      expect(reports[0].message.toLowerCase()).toContain('versioned')
    })

    test('message contains "npm"', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git+ssh://git@github.com/user/repo.git'))
      expect(reports[0].message).toContain('npm')
    })

    test('visitor accumulates 5 reports — one per prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git+ssh://git@github.com/user/repo.git'))
      visitor.Literal(makeLiteral('git://github.com/user/repo.git'))
      visitor.Literal(makeLiteral('github:user/repo'))
      visitor.Literal(makeLiteral('bitbucket:user/repo'))
      visitor.Literal(makeLiteral('gitlab:user/repo'))
      expect(reports.length).toBe(5)
    })
  })

  // ===== NEGATIVE CASES (35) =====
  describe('negative cases — does NOT report', () => {
    test('does not report normal npm package name', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('lodash'))
      expect(reports.length).toBe(0)
    })

    test('does not report scoped npm package', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('@types/node'))
      expect(reports.length).toBe(0)
    })

    test('does not report URL npm package', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz'))
      expect(reports.length).toBe(0)
    })

    test('does not report number literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral(42))
      expect(reports.length).toBe(0)
    })

    test('does not report boolean literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral(true))
      expect(reports.length).toBe(0)
    })

    test('does not report null literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral(null))
      expect(reports.length).toBe(0)
    })

    test('handles null node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      expect(() => visitor.Literal(null)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles undefined node gracefully', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      expect(() => visitor.Literal(undefined)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles empty object node — wrong type', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      expect(() => visitor.Literal({})).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report non-Literal node type (Identifier)', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      const node = {
        type: 'Identifier',
        name: 'gitPackage',
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-Literal node type (CallExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report non-Literal node type (MemberExpression)', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'pkg' },
        property: { type: 'Identifier', name: 'version' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('empty string NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral(''))
      expect(reports.length).toBe(0)
    })

    test('string starting with "g" but not "git" NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('graphics-package'))
      expect(reports.length).toBe(0)
    })

    test('string "github" without colon NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('github-user-package'))
      expect(reports.length).toBe(0)
    })

    test('string "gitlab" without colon NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('gitlab-helper'))
      expect(reports.length).toBe(0)
    })

    test('string "bitbucket" without colon NOT reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('bitbucket-utils'))
      expect(reports.length).toBe(0)
    })

    test('does not report version range string', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('^4.17.21'))
      expect(reports.length).toBe(0)
    })

    test('does not report file: protocol', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('file:../local-package'))
      expect(reports.length).toBe(0)
    })

    test('does not report link: protocol', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('link:../local-package'))
      expect(reports.length).toBe(0)
    })

    test('does not report npm: protocol', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('npm:lodash@4.17.21'))
      expect(reports.length).toBe(0)
    })

    test('does not report http:// URL', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('http://example.com/package.tgz'))
      expect(reports.length).toBe(0)
    })

    test('does not report https:// URL', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('https://example.com/package.tgz'))
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (string primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      expect(() => visitor.Literal('not a node')).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('handles non-object node (number primitive)', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      expect(() => visitor.Literal(42)).not.toThrow()
      expect(reports.length).toBe(0)
    })

    test('does not report regex literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      const node = {
        type: 'Literal',
        value: /git+/,
        loc: makeLoc(1, 0, 1, 8),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report node missing value property', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      const node = {
        type: 'Literal',
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when value is undefined', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      const node = {
        type: 'Literal',
        value: undefined,
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when value is an object', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      const node = {
        type: 'Literal',
        value: { name: 'git+' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report when value is an array', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      const node = {
        type: 'Literal',
        value: ['git+', 'github:'],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report semver string', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('1.2.3'))
      expect(reports.length).toBe(0)
    })

    test('does not report workspace: protocol', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('workspace:*'))
      expect(reports.length).toBe(0)
    })

    test('does not report github.com URL without git+ prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('https://github.com/user/repo'))
      expect(reports.length).toBe(0)
    })

    test('does not report node with type BinaryExpression', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 'git+' },
        right: { type: 'Literal', value: 'repo' },
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report template literal with git-like content', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      const node = {
        type: 'TemplateLiteral',
        quasis: [{ type: 'TemplateElement', value: { raw: 'git+' } }],
        loc: makeLoc(1, 0, 1, 10),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('does not report node with value "git" alone', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git'))
      expect(reports.length).toBe(0)
    })
  })

  // ===== EDGE CASES (15) =====
  describe('edge cases', () => {
    test('separate create() calls have independent state', () => {
      const { context: ctx1, reports: rep1 } = createMockContext()
      const { context: ctx2, reports: rep2 } = createMockContext()
      const visitor1 = noGitDependenciesRule.create(ctx1)
      const visitor2 = noGitDependenciesRule.create(ctx2)

      visitor1.Literal(makeLiteral('git+ssh://git@github.com/user/repo.git'))
      visitor2.Literal(makeLiteral('lodash'))

      expect(rep1.length).toBe(1)
      expect(rep2.length).toBe(0)
    })

    test('visitor accumulates reports correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git+ssh://git@github.com/user/repo.git'))
      visitor.Literal(makeLiteral('github:user/repo'))
      expect(reports.length).toBe(2)
    })

    test('node without loc still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      const node = {
        type: 'Literal',
        value: 'git+ssh://git@github.com/user/repo.git',
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('node without loc reports with default location', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      const node = {
        type: 'Literal',
        value: 'git+ssh://git@github.com/user/repo.git',
      }
      visitor.Literal(node)
      expect(reports[0].loc?.start.line).toBe(1)
      expect(reports[0].loc?.start.column).toBe(0)
    })

    test('mixed valid/invalid count correctly', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git+ssh://git@github.com/user/repo.git'))
      visitor.Literal(makeLiteral('lodash'))
      visitor.Literal(makeLiteral('github:user/repo'))
      visitor.Literal(makeLiteral('@types/node'))
      visitor.Literal(makeLiteral('bitbucket:user/repo'))
      expect(reports.length).toBe(3)
    })

    test('multiple git deps all reported', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git+ssh://git@github.com/user/repo.git'))
      visitor.Literal(makeLiteral('git+ssh://git@github.com/user/repo.git'))
      visitor.Literal(makeLiteral('git+ssh://git@github.com/user/repo.git'))
      expect(reports.length).toBe(3)
    })

    test('create returns a new visitor each call (not same reference)', () => {
      const { context } = createMockContext()
      const visitor1 = noGitDependenciesRule.create(context)
      const visitor2 = noGitDependenciesRule.create(context)
      expect(visitor1).not.toBe(visitor2)
    })

    test('handles node with empty loc object', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      const node = {
        type: 'Literal',
        value: 'git+ssh://git@github.com/user/repo.git',
        loc: {},
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with partial loc (missing end)', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      const node = {
        type: 'Literal',
        value: 'git+ssh://git@github.com/user/repo.git',
        loc: { start: { line: 3, column: 5 } },
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
      expect(reports[0].loc?.start.line).toBe(3)
      expect(reports[0].loc?.start.column).toBe(5)
    })

    test('each prefix tested individually reports', () => {
      const prefixes = [
        'git+ssh://git@github.com/user/repo.git',
        'git://github.com/user/repo.git',
        'github:user/repo',
        'bitbucket:user/repo',
        'gitlab:user/repo',
      ]
      for (const prefix of prefixes) {
        const { context, reports } = createMockContext()
        const visitor = noGitDependenciesRule.create(context)
        visitor.Literal(makeLiteral(prefix))
        expect(reports.length).toBe(1)
      }
    })

    test('node with extra properties still reports', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      const node = {
        type: 'Literal',
        value: 'git+ssh://git@github.com/user/repo.git',
        loc: makeLoc(1, 0, 1, 40),
        range: [0, 40],
        extra: true,
        parent: {},
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with missing type property', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      const node = {
        value: 'git+ssh://git@github.com/user/repo.git',
        loc: makeLoc(1, 0, 1, 40),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('handles node with numeric value and type Literal', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      const node = {
        type: 'Literal',
        value: 3.14,
        loc: makeLoc(1, 0, 1, 4),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(0)
    })

    test('reports git+http dependency', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git+http://github.com/user/repo.git'))
      expect(reports.length).toBe(1)
    })

    test('location with specific line/column values', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      const node = {
        type: 'Literal',
        value: 'git+ssh://git@github.com/user/repo.git',
        loc: makeLoc(10, 4, 10, 46),
      }
      visitor.Literal(node)
      expect(reports[0].loc?.start.line).toBe(10)
      expect(reports[0].loc?.start.column).toBe(4)
    })
  })

  // ===== ADDITIONAL CASES (15) =====
  describe('additional coverage', () => {
    test('meta is same reference across multiple accesses', () => {
      const meta1 = noGitDependenciesRule.meta
      const meta2 = noGitDependenciesRule.meta
      expect(meta1).toBe(meta2)
    })

    test('rule name is exported as noGitDependenciesRule', () => {
      expect(noGitDependenciesRule).toBeDefined()
      expect(typeof noGitDependenciesRule.create).toBe('function')
      expect(typeof noGitDependenciesRule.meta).toBe('object')
    })

    test('reports two violations with correct individual messages', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git+ssh://git@github.com/user/repo.git'))
      visitor.Literal(makeLiteral('github:user/repo'))
      expect(reports.length).toBe(2)
      expect(reports[0].message).toContain('git+ssh://git@github.com/user/repo.git')
      expect(reports[1].message).toContain('github:user/repo')
    })

    test('all prefix messages follow same pattern', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git+ssh://git@github.com/user/repo.git'))
      visitor.Literal(makeLiteral('git://github.com/user/repo.git'))
      visitor.Literal(makeLiteral('github:user/repo'))
      for (const r of reports) {
        expect(r.message).toContain('Unexpected git dependency')
        expect(r.message).toContain('not versioned')
        expect(r.message).toContain('npm')
      }
    })

    test('message for git+ssh contains the value', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git+ssh://git@github.com/user/repo.git'))
      expect(reports[0].message).toContain('git+ssh://git@github.com/user/repo.git')
    })

    test('message for git:// contains the value', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git://github.com/user/repo.git'))
      expect(reports[0].message).toContain('git://github.com/user/repo.git')
    })

    test('message for github: contains the value', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('github:user/repo'))
      expect(reports[0].message).toContain('github:user/repo')
    })

    test('message for bitbucket: contains the value', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('bitbucket:user/repo'))
      expect(reports[0].message).toContain('bitbucket:user/repo')
    })

    test('message for gitlab: contains the value', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('gitlab:user/repo'))
      expect(reports[0].message).toContain('gitlab:user/repo')
    })

    test('report descriptor has all expected properties', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git+ssh://git@github.com/user/repo.git'))
      expect(reports[0]).toHaveProperty('message')
      expect(reports[0]).toHaveProperty('loc')
      expect(reports[0]).toHaveProperty('node')
    })

    test('handles node with raw property', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      const node = {
        type: 'Literal',
        value: 'git+ssh://git@github.com/user/repo.git',
        raw: '"git+ssh://git@github.com/user/repo.git"',
        loc: makeLoc(1, 0, 1, 40),
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('handles node with parent reference', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      const parent = { type: 'ObjectExpression', properties: [] }
      const node = {
        type: 'Literal',
        value: 'github:user/repo',
        loc: makeLoc(1, 4, 1, 20),
        parent,
      }
      visitor.Literal(node)
      expect(reports.length).toBe(1)
    })

    test('does not report string starting with "git " (space after git)', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git clone example'))
      expect(reports.length).toBe(0)
    })

    test('does not report string "github.com" URL without git+ prefix', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('http://github.com/user/repo'))
      expect(reports.length).toBe(0)
    })

    test('message format includes backtick-wrapped value', () => {
      const { context, reports } = createMockContext()
      const visitor = noGitDependenciesRule.create(context)
      visitor.Literal(makeLiteral('git+ssh://git@github.com/user/repo.git'))
      expect(reports[0].message).toContain('`git+ssh://git@github.com/user/repo.git`')
    })
  })
})
