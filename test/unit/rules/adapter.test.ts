import { describe, test, expect, vi, beforeEach } from 'vitest'
import { adaptPluginRule, adaptPluginRules } from '../../../src/rules/adapter.js'
import type {
  RuleDefinition as PluginRuleDefinition,
  RuleContext as PluginRuleContext,
} from '../../../src/plugins/types.js'
import type { Node, SourceFile } from 'ts-morph'
import type { VisitorContext } from '../../../src/ast/visitor.js'

// Helper to create mock ts-morph Node
function createMockNode(
  overrides: {
    kindName?: string
    start?: number
    end?: number
    text?: string
    sourceFile?: SourceFile
  } = {},
): Node {
  const mockSourceFile =
    overrides.sourceFile ??
    ({
      getFilePath: () => '/test/file.ts',
      getFullText: () => 'const x = 1;',
      getLineAndColumnAtPos: (pos: number) => {
        if (pos === 0) return { line: 1, column: 0 }
        if (pos === 11) return { line: 1, column: 11 }
        return { line: 1, column: pos }
      },
    } as SourceFile)

  return {
    getSourceFile: () => mockSourceFile,
    getStart: () => overrides.start ?? 0,
    getEnd: () => overrides.end ?? 11,
    getText: () => overrides.text ?? 'const x = 1;',
    getKindName: () => overrides.kindName ?? 'VariableDeclaration',
    getKind: () => 0,
  } as Node
}

// Helper to create mock SourceFile
function createMockSourceFile(
  overrides: {
    filePath?: string
    fullText?: string
  } = {},
): SourceFile {
  const self = {
    getFilePath: () => overrides.filePath ?? '/test/file.ts',
    getFullText: () => overrides.fullText ?? 'const x = 1;',
    getLineAndColumnAtPos: (pos: number) => {
      if (pos === 0) return { line: 1, column: 0 }
      if (pos === 10) return { line: 1, column: 10 }
      return { line: 1, column: pos }
    },
    getSourceFile: () => self,
    getStart: () => 0,
    getEnd: () => overrides.fullText?.length ?? 11,
    getText: () => overrides.fullText ?? 'const x = 1;',
    getKindName: () => 'SourceFile',
  }
  return self as unknown as SourceFile
}

// Helper to create mock VisitorContext
function createMockVisitorContext(overrides: Partial<VisitorContext> = {}): VisitorContext {
  return {
    sourceFile: createMockSourceFile(),
    depth: 0,
    parent: undefined,
    addViolation: vi.fn(),
    getFilePath: () => '/test/file.ts',
    ...overrides,
  } as VisitorContext
}

// Helper to create a basic plugin rule
function createMockPluginRule(
  overrides: {
    severity?: 'off' | 'warn' | 'error'
    type?: 'problem' | 'suggestion' | 'layout'
    description?: string
    category?: string
    recommended?: boolean
    deprecated?: boolean
    replacedBy?: string[]
    fixable?: 'code' | 'whitespace'
    createVisitor?: (context: PluginRuleContext) => Record<string, (node: unknown) => void>
  } = {},
): PluginRuleDefinition {
  const defaultCreate = (
    _context: PluginRuleContext,
  ): Record<string, (node: unknown) => void> => ({})

  return {
    meta: {
      type: overrides.type ?? 'problem',
      severity: overrides.severity ?? 'error',
      docs: {
        description: overrides.description ?? 'Test rule description',
        category: overrides.category,
        recommended: overrides.recommended ?? false,
      },
      fixable: overrides.fixable,
      deprecated: overrides.deprecated,
      replacedBy: overrides.replacedBy,
    },
    create: overrides.createVisitor ?? defaultCreate,
  }
}

describe('adaptPluginRule', () => {
  describe('meta conversion', () => {
    test('converts basic rule metadata', () => {
      const pluginRule = createMockPluginRule({
        severity: 'error',
        type: 'problem',
        description: 'No console.log',
      })

      const adapted = adaptPluginRule(pluginRule, 'no-console')

      expect(adapted.meta.name).toBe('no-console')
      expect(adapted.meta.description).toBe('No console.log')
      expect(adapted.meta.category).toBe('style')
      expect(adapted.meta.recommended).toBe(false)
    })

    test('uses type as fallback when description is missing', () => {
      const pluginRule: PluginRuleDefinition = {
        meta: {
          type: 'suggestion',
          severity: 'warn',
        },
        create: () => ({}),
      }

      const adapted = adaptPluginRule(pluginRule, 'fallback-rule')

      expect(adapted.meta.description).toBe('suggestion')
    })

    test('maps category correctly - performance', () => {
      const pluginRule = createMockPluginRule({ category: 'Performance' })
      const adapted = adaptPluginRule(pluginRule, 'perf-rule')
      expect(adapted.meta.category).toBe('performance')
    })

    test('maps category correctly - security', () => {
      const pluginRule = createMockPluginRule({ category: 'Security' })
      const adapted = adaptPluginRule(pluginRule, 'security-rule')
      expect(adapted.meta.category).toBe('security')
    })

    test('maps category correctly - style', () => {
      const pluginRule = createMockPluginRule({ category: 'Style' })
      const adapted = adaptPluginRule(pluginRule, 'style-rule')
      expect(adapted.meta.category).toBe('style')
    })

    test('maps category correctly - correctness', () => {
      const pluginRule = createMockPluginRule({ category: 'Correctness' })
      const adapted = adaptPluginRule(pluginRule, 'correctness-rule')
      expect(adapted.meta.category).toBe('correctness')
    })

    test('maps category correctly - complexity', () => {
      const pluginRule = createMockPluginRule({ category: 'Complexity' })
      const adapted = adaptPluginRule(pluginRule, 'complexity-rule')
      expect(adapted.meta.category).toBe('complexity')
    })

    test('defaults to style category for unknown categories', () => {
      const pluginRule = createMockPluginRule({ category: 'UnknownCategory' })
      const adapted = adaptPluginRule(pluginRule, 'unknown-rule')
      expect(adapted.meta.category).toBe('style')
    })

    test('defaults to style category when category is undefined', () => {
      const pluginRule = createMockPluginRule({ category: undefined })
      const adapted = adaptPluginRule(pluginRule, 'no-category-rule')
      expect(adapted.meta.category).toBe('style')
    })

    test('maps deprecated flag correctly', () => {
      const pluginRule = createMockPluginRule({ deprecated: true })
      const adapted = adaptPluginRule(pluginRule, 'deprecated-rule')
      expect(adapted.meta.deprecated).toBe(true)
    })

    test('maps replacedBy correctly - takes first element', () => {
      const pluginRule = createMockPluginRule({
        deprecated: true,
        replacedBy: ['new-rule', 'another-rule'],
      })
      const adapted = adaptPluginRule(pluginRule, 'old-rule')
      expect(adapted.meta.replacedBy).toBe('new-rule')
    })

    test('maps fixable correctly when code', () => {
      const pluginRule = createMockPluginRule({ fixable: 'code' })
      const adapted = adaptPluginRule(pluginRule, 'fixable-rule')
      expect(adapted.meta.fixable).toBe('code')
    })

    test('maps fixable correctly when whitespace', () => {
      const pluginRule = createMockPluginRule({ fixable: 'whitespace' })
      const adapted = adaptPluginRule(pluginRule, 'whitespace-rule')
      expect(adapted.meta.fixable).toBe('whitespace')
    })

    test('maps fixable correctly when undefined', () => {
      const pluginRule = createMockPluginRule({ fixable: undefined })
      const adapted = adaptPluginRule(pluginRule, 'not-fixable-rule')
      expect(adapted.meta.fixable).toBeUndefined()
    })

    test('maps recommended flag correctly', () => {
      const pluginRule = createMockPluginRule({ recommended: true })
      const adapted = adaptPluginRule(pluginRule, 'recommended-rule')
      expect(adapted.meta.recommended).toBe(true)
    })
  })

  describe('create() function', () => {
    test('returns visitor and onComplete', () => {
      const pluginRule = createMockPluginRule()
      const adapted = adaptPluginRule(pluginRule, 'test-rule')

      const result = adapted.create({})

      expect(result.visitor).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })

    test('onComplete returns violations array', () => {
      const pluginRule = createMockPluginRule()
      const adapted = adaptPluginRule(pluginRule, 'test-rule')

      const result = adapted.create({})
      const violations = result.onComplete?.()

      expect(Array.isArray(violations)).toBe(true)
    })

    test('defaultOptions is empty object', () => {
      const pluginRule = createMockPluginRule()
      const adapted = adaptPluginRule(pluginRule, 'test-rule')

      expect(adapted.defaultOptions).toEqual({})
    })
  })

  describe('visitSourceFile', () => {
    test('sets sourceFile and sourceText', () => {
      let capturedContext: PluginRuleContext | undefined

      const pluginRule = createMockPluginRule({
        createVisitor: (context) => {
          capturedContext = context
          return {
            SourceFile: vi.fn(),
          }
        },
      })

      const adapted = adaptPluginRule(pluginRule, 'test-rule')
      const result = adapted.create({})
      const mockSourceFile = createMockSourceFile({
        filePath: '/project/src/index.ts',
        fullText: 'export const x = 42;',
      })

      result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())

      expect(capturedContext!.getFilePath()).toBe('/project/src/index.ts')
      expect(capturedContext!.getSource()).toBe('export const x = 42;')
    })

    test('calls SourceFile handler when available', () => {
      const sourceFileHandler = vi.fn()
      const pluginRule = createMockPluginRule({
        createVisitor: () => ({
          SourceFile: sourceFileHandler,
        }),
      })

      const adapted = adaptPluginRule(pluginRule, 'test-rule')
      const result = adapted.create({})
      const mockSourceFile = createMockSourceFile()

      result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())

      expect(sourceFileHandler).toHaveBeenCalledTimes(1)
      expect(sourceFileHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.any(String),
          range: expect.any(Array),
          loc: expect.any(Object),
        }),
      )
    })

    test('calls Program handler as fallback', () => {
      const programHandler = vi.fn()
      const pluginRule = createMockPluginRule({
        createVisitor: () => ({
          Program: programHandler,
        }),
      })

      const adapted = adaptPluginRule(pluginRule, 'test-rule')
      const result = adapted.create({})
      const mockSourceFile = createMockSourceFile()

      result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())

      expect(programHandler).toHaveBeenCalledTimes(1)
    })

    test('prefers SourceFile handler over Program handler', () => {
      const sourceFileHandler = vi.fn()
      const programHandler = vi.fn()
      const pluginRule = createMockPluginRule({
        createVisitor: () => ({
          SourceFile: sourceFileHandler,
          Program: programHandler,
        }),
      })

      const adapted = adaptPluginRule(pluginRule, 'test-rule')
      const result = adapted.create({})
      const mockSourceFile = createMockSourceFile()

      result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())

      expect(sourceFileHandler).toHaveBeenCalled()
      expect(programHandler).not.toHaveBeenCalled()
    })

    test('resets violations on each source file visit', () => {
      const pluginRule = createMockPluginRule({
        createVisitor: (context) => ({
          SourceFile: () => {
            context.report({
              message: 'Test violation',
              loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 5 } },
            })
          },
        }),
      })

      const adapted = adaptPluginRule(pluginRule, 'test-rule')
      const result = adapted.create({})
      const mockSourceFile = createMockSourceFile()

      // First visit
      result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
      const violations1 = result.onComplete?.()
      expect(violations1).toHaveLength(1)

      // Second visit - should reset
      result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
      const violations2 = result.onComplete?.()
      expect(violations2).toHaveLength(1) // Reset, so still 1
    })
  })

  describe('visitNode', () => {
    test('sets sourceFile from node when not already set', () => {
      let capturedSource: string | null = null

      const pluginRule = createMockPluginRule({
        createVisitor: (context) => {
          capturedSource = context.getSource()
          return {}
        },
      })

      const adapted = adaptPluginRule(pluginRule, 'test-rule')
      const result = adapted.create({})
      const mockSourceFile = createMockSourceFile({ fullText: 'let y = 2;' })
      const mockNode = createMockNode({ sourceFile: mockSourceFile })

      result.visitor.visitNode?.(mockNode, createMockVisitorContext())

      // The context should now have access to the source
      expect(capturedSource).toBeDefined()
    })

    test('calls kind-specific handler when available', () => {
      const identifierHandler = vi.fn()
      const pluginRule = createMockPluginRule({
        createVisitor: () => ({
          Identifier: identifierHandler,
        }),
      })

      const adapted = adaptPluginRule(pluginRule, 'test-rule')
      const result = adapted.create({})
      const mockNode = createMockNode({ kindName: 'Identifier' })

      result.visitor.visitNode?.(mockNode, createMockVisitorContext())

      expect(identifierHandler).toHaveBeenCalledTimes(1)
      expect(identifierHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'Identifier',
        }),
      )
    })

    test('does not call handler when kind-specific handler not available', () => {
      const identifierHandler = vi.fn()
      const pluginRule = createMockPluginRule({
        createVisitor: () => ({
          Identifier: identifierHandler,
        }),
      })

      const adapted = adaptPluginRule(pluginRule, 'test-rule')
      const result = adapted.create({})
      const mockNode = createMockNode({ kindName: 'StringLiteral' })

      result.visitor.visitNode?.(mockNode, createMockVisitorContext())

      expect(identifierHandler).not.toHaveBeenCalled()
    })

    test('calls generic * handler when available', () => {
      const genericHandler = vi.fn()
      const pluginRule = createMockPluginRule({
        createVisitor: () => ({
          '*': genericHandler,
        }),
      })

      const adapted = adaptPluginRule(pluginRule, 'test-rule')
      const result = adapted.create({})
      const mockNode = createMockNode({ kindName: 'SomeNode' })

      result.visitor.visitNode?.(mockNode, createMockVisitorContext())

      expect(genericHandler).toHaveBeenCalledTimes(1)
    })

    test('calls Any handler as generic fallback', () => {
      const anyHandler = vi.fn()
      const pluginRule = createMockPluginRule({
        createVisitor: () => ({
          Any: anyHandler,
        }),
      })

      const adapted = adaptPluginRule(pluginRule, 'test-rule')
      const result = adapted.create({})
      const mockNode = createMockNode({ kindName: 'SomeNode' })

      result.visitor.visitNode?.(mockNode, createMockVisitorContext())

      expect(anyHandler).toHaveBeenCalledTimes(1)
    })

    test('prefers * handler over Any handler', () => {
      const starHandler = vi.fn()
      const anyHandler = vi.fn()
      const pluginRule = createMockPluginRule({
        createVisitor: () => ({
          '*': starHandler,
          Any: anyHandler,
        }),
      })

      const adapted = adaptPluginRule(pluginRule, 'test-rule')
      const result = adapted.create({})
      const mockNode = createMockNode({ kindName: 'SomeNode' })

      result.visitor.visitNode?.(mockNode, createMockVisitorContext())

      expect(starHandler).toHaveBeenCalled()
      expect(anyHandler).not.toHaveBeenCalled()
    })

    test('calls both kind-specific and generic handlers', () => {
      const identifierHandler = vi.fn()
      const genericHandler = vi.fn()
      const pluginRule = createMockPluginRule({
        createVisitor: () => ({
          Identifier: identifierHandler,
          '*': genericHandler,
        }),
      })

      const adapted = adaptPluginRule(pluginRule, 'test-rule')
      const result = adapted.create({})
      const mockNode = createMockNode({ kindName: 'Identifier' })

      result.visitor.visitNode?.(mockNode, createMockVisitorContext())

      expect(identifierHandler).toHaveBeenCalledTimes(1)
      expect(genericHandler).toHaveBeenCalledTimes(1)
    })
  })

  describe('context.report()', () => {
    test('creates violation with provided location', () => {
      const pluginRule = createMockPluginRule({
        createVisitor: (context) => ({
          SourceFile: () => {
            context.report({
              message: 'Custom error message',
              loc: {
                start: { line: 5, column: 10 },
                end: { line: 5, column: 20 },
              },
            })
          },
        }),
      })

      const adapted = adaptPluginRule(pluginRule, 'custom-rule')
      const result = adapted.create({})
      const mockSourceFile = createMockSourceFile({ filePath: '/src/test.ts' })

      result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
      const violations = result.onComplete?.()

      expect(violations).toHaveLength(1)
      expect(violations![0]).toEqual({
        ruleId: 'custom-rule',
        severity: 'error',
        message: 'Custom error message',
        filePath: '/src/test.ts',
        range: {
          start: { line: 5, column: 10 },
          end: { line: 5, column: 20 },
        },
        suggestion: undefined,
      })
    })

    test('uses default location when loc not provided', () => {
      const pluginRule = createMockPluginRule({
        createVisitor: (context) => ({
          SourceFile: () => {
            context.report({
              message: 'Error without location',
            })
          },
        }),
      })

      const adapted = adaptPluginRule(pluginRule, 'no-loc-rule')
      const result = adapted.create({})
      const mockSourceFile = createMockSourceFile()

      result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
      const violations = result.onComplete?.()

      expect(violations).toHaveLength(1)
      expect(violations![0].range).toEqual({
        start: { line: 1, column: 0 },
        end: { line: 1, column: 1 },
      })
    })

    test('maps severity - error stays error', () => {
      const pluginRule = createMockPluginRule({
        severity: 'error',
        createVisitor: (context) => ({
          SourceFile: () => {
            context.report({ message: 'Error' })
          },
        }),
      })

      const adapted = adaptPluginRule(pluginRule, 'error-rule')
      const result = adapted.create({})
      const mockSourceFile = createMockSourceFile()

      result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
      const violations = result.onComplete?.()

      expect(violations![0].severity).toBe('error')
    })

    test('maps severity - warn becomes warning', () => {
      const pluginRule = createMockPluginRule({
        severity: 'warn',
        createVisitor: (context) => ({
          SourceFile: () => {
            context.report({ message: 'Warning' })
          },
        }),
      })

      const adapted = adaptPluginRule(pluginRule, 'warn-rule')
      const result = adapted.create({})
      const mockSourceFile = createMockSourceFile()

      result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
      const violations = result.onComplete?.()

      expect(violations![0].severity).toBe('warning')
    })

    test('maps severity - off becomes info', () => {
      const pluginRule = createMockPluginRule({
        severity: 'off',
        createVisitor: (context) => ({
          SourceFile: () => {
            context.report({ message: 'Info' })
          },
        }),
      })

      const adapted = adaptPluginRule(pluginRule, 'off-rule')
      const result = adapted.create({})
      const mockSourceFile = createMockSourceFile()

      result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
      const violations = result.onComplete?.()

      expect(violations![0].severity).toBe('info')
    })

    test('extracts suggestion from descriptor.suggest array', () => {
      const pluginRule = createMockPluginRule({
        createVisitor: (context) => ({
          SourceFile: () => {
            context.report({
              message: 'Use const',
              suggest: [
                {
                  desc: 'Replace with const',
                  message: 'Replace',
                  fix: { range: [0, 3], text: 'const' },
                },
                {
                  desc: 'Second suggestion',
                  message: 'Second',
                  fix: { range: [0, 3], text: 'let' },
                },
              ],
            })
          },
        }),
      })

      const adapted = adaptPluginRule(pluginRule, 'suggest-rule')
      const result = adapted.create({})
      const mockSourceFile = createMockSourceFile()

      result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
      const violations = result.onComplete?.()

      expect(violations![0].suggestion).toBe('Replace with const')
    })

    test('handles missing suggest array', () => {
      const pluginRule = createMockPluginRule({
        createVisitor: (context) => ({
          SourceFile: () => {
            context.report({
              message: 'No suggestions',
            })
          },
        }),
      })

      const adapted = adaptPluginRule(pluginRule, 'no-suggest-rule')
      const result = adapted.create({})
      const mockSourceFile = createMockSourceFile()

      result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
      const violations = result.onComplete?.()

      expect(violations![0].suggestion).toBeUndefined()
    })

    test('handles empty suggest array', () => {
      const pluginRule = createMockPluginRule({
        createVisitor: (context) => ({
          SourceFile: () => {
            context.report({
              message: 'Empty suggestions',
              suggest: [],
            })
          },
        }),
      })

      const adapted = adaptPluginRule(pluginRule, 'empty-suggest-rule')
      const result = adapted.create({})
      const mockSourceFile = createMockSourceFile()

      result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
      const violations = result.onComplete?.()

      expect(violations![0].suggestion).toBeUndefined()
    })

    test('uses empty string filePath when sourceFile is null', () => {
      const pluginRule = createMockPluginRule({
        createVisitor: (context) => ({
          Identifier: () => {
            context.report({
              message: 'Node violation',
            })
          },
        }),
      })

      const adapted = adaptPluginRule(pluginRule, 'node-rule')
      const result = adapted.create({})

      // Visit a node without first visiting source file
      const mockNode = createMockNode({ kindName: 'Identifier' })
      result.visitor.visitNode?.(mockNode, createMockVisitorContext())

      const violations = result.onComplete?.()

      expect(violations![0].filePath).toBe('/test/file.ts')
    })

    test('handles report called before any node visited', () => {
      const pluginRule = createMockPluginRule({
        createVisitor: (context) => {
          // Report immediately in create(), before any visit
          context.report({ message: 'Early report' })
          return {}
        },
      })

      const adapted = adaptPluginRule(pluginRule, 'early-report-rule')
      const result = adapted.create({})

      const violations = result.onComplete?.()

      expect(violations).toHaveLength(1)
      expect(violations![0].filePath).toBe('')
      expect(violations![0].message).toBe('Early report')
    })

    test('getFilePath returns empty string when sourceFile is null', () => {
      let capturedFilePath: string | undefined

      const pluginRule = createMockPluginRule({
        createVisitor: (context) => {
          capturedFilePath = context.getFilePath()
          return {}
        },
      })

      const adapted = adaptPluginRule(pluginRule, 'null-filepath-rule')
      adapted.create({})

      expect(capturedFilePath).toBe('')
    })

    test('accumulates multiple violations', () => {
      const pluginRule = createMockPluginRule({
        createVisitor: (context) => ({
          SourceFile: () => {
            context.report({ message: 'First violation' })
            context.report({ message: 'Second violation' })
            context.report({ message: 'Third violation' })
          },
        }),
      })

      const adapted = adaptPluginRule(pluginRule, 'multi-rule')
      const result = adapted.create({})
      const mockSourceFile = createMockSourceFile()

      result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
      const violations = result.onComplete?.()

      expect(violations).toHaveLength(3)
      expect(violations!.map((v) => v.message)).toEqual([
        'First violation',
        'Second violation',
        'Third violation',
      ])
    })
  })

  describe('plugin context', () => {
    test('provides silent logger', () => {
      let capturedContext: PluginRuleContext | undefined

      const pluginRule = createMockPluginRule({
        createVisitor: (context) => {
          capturedContext = context
          return {}
        },
      })

      const adapted = adaptPluginRule(pluginRule, 'logger-rule')
      adapted.create({})

      expect(capturedContext!.logger).toBeDefined()
      expect(capturedContext!.logger.debug).toBeDefined()
      expect(capturedContext!.logger.info).toBeDefined()
      expect(capturedContext!.logger.warn).toBeDefined()
      expect(capturedContext!.logger.error).toBeDefined()

      expect(() => {
        capturedContext!.logger.debug('test')
        capturedContext!.logger.info('test')
        capturedContext!.logger.warn('test')
        capturedContext!.logger.error('test')
      }).not.toThrow()
    })

    test('provides default config', () => {
      let capturedContext: PluginRuleContext | undefined

      const pluginRule = createMockPluginRule({
        createVisitor: (context) => {
          capturedContext = context
          return {}
        },
      })

      const adapted = adaptPluginRule(pluginRule, 'config-rule')
      adapted.create({})

      expect(capturedContext!.config).toEqual({
        options: {},
        rules: {},
        transforms: [],
      })
    })

    test('provides workspaceRoot as cwd', () => {
      let capturedContext: PluginRuleContext | undefined

      const pluginRule = createMockPluginRule({
        createVisitor: (context) => {
          capturedContext = context
          return {}
        },
      })

      const adapted = adaptPluginRule(pluginRule, 'workspace-rule')
      adapted.create({})

      expect(capturedContext!.workspaceRoot).toBe(process.cwd())
    })

    test('getAST returns null', () => {
      let capturedContext: PluginRuleContext | undefined

      const pluginRule = createMockPluginRule({
        createVisitor: (context) => {
          capturedContext = context
          return {}
        },
      })

      const adapted = adaptPluginRule(pluginRule, 'ast-rule')
      adapted.create({})

      expect(capturedContext!.getAST()).toBeNull()
    })

    test('getTokens returns empty array', () => {
      let capturedContext: PluginRuleContext | undefined

      const pluginRule = createMockPluginRule({
        createVisitor: (context) => {
          capturedContext = context
          return {}
        },
      })

      const adapted = adaptPluginRule(pluginRule, 'tokens-rule')
      adapted.create({})

      expect(capturedContext!.getTokens()).toEqual([])
    })

    test('getComments returns empty array', () => {
      let capturedContext: PluginRuleContext | undefined

      const pluginRule = createMockPluginRule({
        createVisitor: (context) => {
          capturedContext = context
          return {}
        },
      })

      const adapted = adaptPluginRule(pluginRule, 'comments-rule')
      adapted.create({})

      expect(capturedContext!.getComments()).toEqual([])
    })
  })
})

describe('adaptPluginRules', () => {
  test('adapts multiple rules', () => {
    const rules: Record<string, PluginRuleDefinition> = {
      'rule-one': createMockPluginRule({ description: 'First rule' }),
      'rule-two': createMockPluginRule({ description: 'Second rule' }),
      'rule-three': createMockPluginRule({ description: 'Third rule' }),
    }

    const adapted = adaptPluginRules(rules)

    expect(Object.keys(adapted)).toHaveLength(3)
    expect(adapted['rule-one']).toBeDefined()
    expect(adapted['rule-two']).toBeDefined()
    expect(adapted['rule-three']).toBeDefined()
  })

  test('preserves rule IDs as keys', () => {
    const rules: Record<string, PluginRuleDefinition> = {
      'no-console': createMockPluginRule(),
      'prefer-const': createMockPluginRule(),
    }

    const adapted = adaptPluginRules(rules)

    expect(adapted['no-console'].meta.name).toBe('no-console')
    expect(adapted['prefer-const'].meta.name).toBe('prefer-const')
  })

  test('returns empty object for empty input', () => {
    const adapted = adaptPluginRules({})

    expect(adapted).toEqual({})
  })

  test('each adapted rule is independent', () => {
    const rules: Record<string, PluginRuleDefinition> = {
      'rule-a': createMockPluginRule({
        createVisitor: (context) => ({
          SourceFile: () => context.report({ message: 'A' }),
        }),
      }),
      'rule-b': createMockPluginRule({
        createVisitor: (context) => ({
          SourceFile: () => context.report({ message: 'B' }),
        }),
      }),
    }

    const adapted = adaptPluginRules(rules)

    const resultA = adapted['rule-a'].create({})
    const resultB = adapted['rule-b'].create({})
    const mockSourceFile = createMockSourceFile()

    resultA.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
    resultB.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())

    const violationsA = resultA.onComplete?.()
    const violationsB = resultB.onComplete?.()

    expect(violationsA).toHaveLength(1)
    expect(violationsA![0].message).toBe('A')
    expect(violationsB).toHaveLength(1)
    expect(violationsB![0].message).toBe('B')
  })
})

describe('nodeToGeneric (via visitor calls)', () => {
  test('converts node with correct properties', () => {
    let capturedNode: Record<string, unknown> | undefined

    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        VariableDeclaration: (node) => {
          capturedNode = node as Record<string, unknown>
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'node-test-rule')
    const result = adapted.create({})

    const mockSourceFile = createMockSourceFile()
    const mockNode = createMockNode({
      kindName: 'VariableDeclaration',
      start: 5,
      end: 15,
      text: 'x = 42',
      sourceFile: mockSourceFile,
    })

    result.visitor.visitNode?.(mockNode, createMockVisitorContext())

    expect(capturedNode).toBeDefined()
    expect(capturedNode!.type).toBe('VariableDeclarator')
    expect(capturedNode!.range).toEqual([5, 15])
    expect(capturedNode!.start).toBe(5)
    expect(capturedNode!.end).toBe(15)
    expect(capturedNode!.text).toBe('x = 42')
    expect(capturedNode!.loc).toEqual({
      start: { line: 1, column: 5 },
      end: { line: 1, column: 15 },
    })
  })

  test('converts source file node correctly', () => {
    let capturedNode: Record<string, unknown> | undefined

    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        SourceFile: (node) => {
          capturedNode = node as Record<string, unknown>
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'sourcefile-test-rule')
    const result = adapted.create({})

    const mockSourceFile = createMockSourceFile({
      filePath: '/app/main.ts',
      fullText: 'import { x } from "./lib";',
    })

    result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())

    expect(capturedNode).toBeDefined()
    expect(capturedNode!.type).toBeDefined()
    expect(capturedNode!.range).toBeDefined()
    expect(capturedNode!.loc).toBeDefined()
  })
})

describe('edge cases', () => {
  test('handles rule without docs', () => {
    const pluginRule: PluginRuleDefinition = {
      meta: {
        type: 'problem',
        severity: 'error',
      },
      create: () => ({}),
    }

    const adapted = adaptPluginRule(pluginRule, 'no-docs-rule')

    expect(adapted.meta.description).toBe('problem')
    expect(adapted.meta.recommended).toBe(false)
    expect(adapted.meta.category).toBe('style')
  })

  test('handles rule with partial docs', () => {
    const pluginRule: PluginRuleDefinition = {
      meta: {
        type: 'suggestion',
        severity: 'warn',
        docs: {
          description: 'Partial docs',
        },
      },
      create: () => ({}),
    }

    const adapted = adaptPluginRule(pluginRule, 'partial-docs-rule')

    expect(adapted.meta.description).toBe('Partial docs')
    expect(adapted.meta.recommended).toBe(false)
    expect(adapted.meta.category).toBe('style')
  })

  test('handles deprecated rule without replacedBy', () => {
    const pluginRule = createMockPluginRule({
      deprecated: true,
      replacedBy: undefined,
    })

    const adapted = adaptPluginRule(pluginRule, 'deprecated-no-replace-rule')

    expect(adapted.meta.deprecated).toBe(true)
    expect(adapted.meta.replacedBy).toBeUndefined()
  })

  test('handles empty replacedBy array', () => {
    const pluginRule = createMockPluginRule({
      deprecated: true,
      replacedBy: [],
    })

    const adapted = adaptPluginRule(pluginRule, 'empty-replaced-rule')

    expect(adapted.meta.replacedBy).toBeUndefined()
  })

  test('handles case-insensitive category matching', () => {
    const testCases = [
      { input: 'PERFORMANCE', expected: 'performance' },
      { input: 'Performance', expected: 'performance' },
      { input: 'SECURITY', expected: 'security' },
      { input: 'Security', expected: 'security' },
      { input: 'STYLE', expected: 'style' },
      { input: 'Style', expected: 'style' },
      { input: 'CORRECTNESS', expected: 'correctness' },
      { input: 'Correctness', expected: 'correctness' },
      { input: 'COMPLEXITY', expected: 'complexity' },
      { input: 'Complexity', expected: 'complexity' },
    ]

    testCases.forEach(({ input, expected }) => {
      const pluginRule = createMockPluginRule({ category: input })
      const adapted = adaptPluginRule(pluginRule, `${input}-rule`)
      expect(adapted.meta.category).toBe(expected)
    })
  })
})

describe('comprehensive adapter tests', () => {
  test('handles rule ID with hyphens', () => {
    const pluginRule = createMockPluginRule({})
    const adapted = adaptPluginRule(pluginRule, 'my-rule-name-with-hyphens')
    expect(adapted.meta.name).toBe('my-rule-name-with-hyphens')
  })

  test('handles rule ID with underscores', () => {
    const pluginRule = createMockPluginRule({})
    const adapted = adaptPluginRule(pluginRule, 'my_rule_name_with_underscores')
    expect(adapted.meta.name).toBe('my_rule_name_with_underscores')
  })

  test('handles rule ID with dots', () => {
    const pluginRule = createMockPluginRule({})
    const adapted = adaptPluginRule(pluginRule, 'my.rule.name.with.dots')
    expect(adapted.meta.name).toBe('my.rule.name.with.dots')
  })

  test('handles rule ID starting with digit', () => {
    const pluginRule = createMockPluginRule({})
    const adapted = adaptPluginRule(pluginRule, '1st-rule')
    expect(adapted.meta.name).toBe('1st-rule')
  })

  test('handles rule ID ending with digit', () => {
    const pluginRule = createMockPluginRule({})
    const adapted = adaptPluginRule(pluginRule, 'rule-2')
    expect(adapted.meta.name).toBe('rule-2')
  })

  test('handles rule ID with mixed case', () => {
    const pluginRule = createMockPluginRule({})
    const adapted = adaptPluginRule(pluginRule, 'MyRuleName')
    expect(adapted.meta.name).toBe('MyRuleName')
  })

  test('handles all meta fields together', () => {
    const pluginRule: PluginRuleDefinition = {
      meta: {
        type: 'suggestion',
        severity: 'warn',
        docs: {
          description: 'Full rule',
          url: 'https://example.com/full',
          recommended: true,
        },
        fixable: 'code',
        deprecated: true,
        replacedBy: ['new-full-rule', 'even-newer-rule'],
      },
      create: () => ({}),
    }

    const adapted = adaptPluginRule(pluginRule, 'full-meta-rule')

    expect(adapted.meta.severity).toBe('warning')
    expect(adapted.meta.description).toBe('Full rule')
    expect(adapted.meta.recommended).toBe(true)
    expect(adapted.meta.fixable).toBe('code')
    expect(adapted.meta.deprecated).toBe(true)
    expect(adapted.meta.replacedBy).toBe('new-full-rule')
    expect(adapted.meta.docs).toEqual({
      description: 'Full rule',
      url: 'https://example.com/full',
    })
  })

  test('handles report with minimal data', () => {
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          context.report({ message: 'Minimal report' })
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'minimal-rule')
    const result = adapted.create({})
    const mockSourceFile = createMockSourceFile()

    result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
    const violations = result.onComplete?.()

    expect(violations).toHaveLength(1)
    expect(violations![0].message).toBe('Minimal report')
  })

  test('handles report with custom location', () => {
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          context.report({
            message: 'Custom location',
            loc: {
              start: { line: 42, column: 10 },
              end: { line: 42, column: 25 },
            },
          })
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'custom-loc-rule')
    const result = adapted.create({})
    const mockSourceFile = createMockSourceFile()

    result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
    const violations = result.onComplete?.()

    expect(violations).toHaveLength(1)
    expect(violations![0].range).toEqual({
      start: { line: 42, column: 10 },
      end: { line: 42, column: 25 },
    })
  })

  test('handles suggestion with full data', () => {
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          context.report({
            message: 'Full suggestion',
            suggest: [
              {
                desc: 'Replace with const',
                message: 'Use const',
                fix: { range: [0, 3], text: 'const' },
              },
            ],
          })
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'full-suggest-rule')
    const result = adapted.create({})
    const mockSourceFile = createMockSourceFile()

    result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
    const violations = result.onComplete?.()

    expect(violations![0].suggestion).toBe('Replace with const')
  })

  test('handles empty suggestion', () => {
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          context.report({ message: 'Empty suggestion', suggest: [] })
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'empty-suggest-rule')
    const result = adapted.create({})
    const mockSourceFile = createMockSourceFile()

    result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
    const violations = result.onComplete?.()

    expect(violations![0].suggestion).toBeUndefined()
  })

  test('handles multiple reports from different handlers', () => {
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          context.report({ message: 'From SourceFile' })
        },
        Identifier: () => {
          context.report({ message: 'From Identifier' })
        },
        StringLiteral: () => {
          context.report({ message: 'From StringLiteral' })
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'multi-report-rule')
    const result = adapted.create({})
    const mockSourceFile = createMockSourceFile()

    result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())

    const idNode = createMockNode({ kindName: 'Identifier' })
    const stringNode = createMockNode({ kindName: 'StringLiteral' })
    result.visitor.visitNode?.(idNode, createMockVisitorContext())
    result.visitor.visitNode?.(stringNode, createMockVisitorContext())

    const violations = result.onComplete?.()

    expect(violations).toHaveLength(3)
    expect(violations!.map((v) => v.message)).toEqual([
      'From SourceFile',
      'From Identifier',
      'From StringLiteral',
    ])
  })

  test('handles violation with zero column', () => {
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          context.report({
            message: 'Zero column',
            loc: {
              start: { line: 1, column: 0 },
              end: { line: 1, column: 1 },
            },
          })
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'zero-col-rule')
    const result = adapted.create({})
    const mockSourceFile = createMockSourceFile()

    result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
    const violations = result.onComplete?.()

    expect(violations![0].range.start.column).toBe(0)
    expect(violations![0].range.end.column).toBe(1)
  })

  test('handles very large line number', () => {
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          context.report({
            message: 'Large line',
            loc: {
              start: { line: 99999, column: 5 },
              end: { line: 99999, column: 10 },
            },
          })
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'large-line-rule')
    const result = adapted.create({})
    const mockSourceFile = createMockSourceFile()

    result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
    const violations = result.onComplete?.()

    expect(violations![0].range.start.line).toBe(99999)
  })

  test('handles very large column number', () => {
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          context.report({
            message: 'Large column',
            loc: {
              start: { line: 1, column: 99999 },
              end: { line: 1, column: 100000 },
            },
          })
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'large-col-rule')
    const result = adapted.create({})
    const mockSourceFile = createMockSourceFile()

    result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
    result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
    const violations = result.onComplete?.()

    expect(violations![0].range.start.column).toBe(99999)
    expect(violations![0].range.end.column).toBe(100000)
  })

  test('handles multi-line location', () => {
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          context.report({
            message: 'Multi-line',
            loc: {
              start: { line: 10, column: 0 },
              end: { line: 20, column: 30 },
            },
          })
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'multiline-rule')
    const result = adapted.create({})
    const mockSourceFile = createMockSourceFile()

    result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
    const violations = result.onComplete?.()

    expect(violations![0].range).toEqual({
      start: { line: 10, column: 0 },
      end: { line: 20, column: 30 },
    })
  })

  test('handles suggestion with message field', () => {
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          context.report({
            message: 'Message suggestion',
            suggest: [
              {
                desc: 'Fix it',
                message: 'Replace with better code',
              },
            ],
          })
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'msg-suggest-rule')
    const result = adapted.create({})
    const mockSourceFile = createMockSourceFile()

    result.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
    const violations = result.onComplete?.()

    expect(violations![0].suggestion).toBe('Fix it')
  })

  test('handles rule with whitespace fixable', () => {
    const pluginRule = createMockPluginRule({ fixable: 'whitespace' })
    const adapted = adaptPluginRule(pluginRule, 'whitespace-fixable-rule')
    expect(adapted.meta.fixable).toBe('whitespace')
  })

  test('handles rule without fixable', () => {
    const pluginRule = createMockPluginRule({})
    const adapted = adaptPluginRule(pluginRule, 'no-fixable-rule')
    expect(adapted.meta.fixable).toBeUndefined()
  })

  test('handles deprecated with replacedBy', () => {
    const pluginRule = createMockPluginRule({
      deprecated: true,
      replacedBy: ['replacement-1', 'replacement-2'],
    })

    const adapted = adaptPluginRule(pluginRule, 'deprecated-replaced-rule')

    expect(adapted.meta.deprecated).toBe(true)
    expect(adapted.meta.replacedBy).toBe('replacement-1')
  })

  test('handles recommended true', () => {
    const pluginRule = createMockPluginRule({ recommended: true })
    const adapted = adaptPluginRule(pluginRule, 'recommended-true-rule')
    expect(adapted.meta.recommended).toBe(true)
  })

  test('handles recommended false', () => {
    const pluginRule = createMockPluginRule({ recommended: false })
    const adapted = adaptPluginRule(pluginRule, 'recommended-false-rule')
    expect(adapted.meta.recommended).toBe(false)
  })

  test('handles all severity types', () => {
    const severities: Array<'off' | 'warn' | 'error'> = ['off', 'warn', 'error']

    for (const severity of severities) {
      const pluginRule = createMockPluginRule({ severity })
      const adapted = adaptPluginRule(pluginRule, `severity-${severity}-rule`)

      if (severity === 'error') {
        expect(adapted.meta.severity).toBe('error')
      } else if (severity === 'warn') {
        expect(adapted.meta.severity).toBe('warning')
      } else {
        expect(adapted.meta.severity).toBe('info')
      }
    }
  })

  test('handles all rule types with appropriate severity', () => {
    const types: Array<'problem' | 'suggestion' | 'layout'> = ['problem', 'suggestion', 'layout']

    for (const type of types) {
      const pluginRule = createMockPluginRule({ type })
      const adapted = adaptPluginRule(pluginRule, `type-${type}-rule`)
      expect(adapted.meta.description).toBe('Test rule description')
    }
  })

  test('handles all seven categories', () => {
    const categories = [
      'performance',
      'security',
      'style',
      'correctness',
      'complexity',
      'patterns',
      'dependencies',
    ]

    for (const category of categories) {
      const pluginRule = createMockPluginRule({ category })
      const adapted = adaptPluginRule(pluginRule, `category-${category}-rule`)
      expect(adapted.meta.category).toBe(category)
    }
  })

  test('handles unknown category', () => {
    const pluginRule = createMockPluginRule({ category: 'UnknownCategory' })
    const adapted = adaptPluginRule(pluginRule, 'unknown-category-rule')
    expect(adapted.meta.category).toBe('style')
  })

  test('handles empty category', () => {
    const pluginRule = createMockPluginRule({ category: '' })
    const adapted = adaptPluginRule(pluginRule, 'empty-category-rule')
    expect(adapted.meta.category).toBe('style')
  })

  test('handles docs with URL only', () => {
    const pluginRule: PluginRuleDefinition = {
      meta: {
        type: 'problem',
        severity: 'error',
        docs: {
          url: 'https://example.com/rule',
        },
      },
      create: () => ({}),
    }

    const adapted = adaptPluginRule(pluginRule, 'url-only-rule')

    expect(adapted.meta.docs).toEqual({
      url: 'https://example.com/rule',
    })
  })

  test('handles docs with description only', () => {
    const pluginRule = createMockPluginRule({
      description: 'Rule with description only',
    })

    const adapted = adaptPluginRule(pluginRule, 'desc-only-rule')

    expect(adapted.meta.docs).toBeUndefined()
  })

  test('handles multiple violations across source files', () => {
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          context.report({ message: 'Violation 1' })
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'multi-file-rule')
    const result = adapted.create({})
    const mockSourceFile1 = createMockSourceFile({ filePath: '/path/to/file1.ts' })
    const mockSourceFile2 = createMockSourceFile({ filePath: '/path/to/file2.ts' })

    result.visitor.visitSourceFile?.(mockSourceFile1, createMockVisitorContext())
    const violations1 = result.onComplete?.()

    result.visitor.visitSourceFile?.(mockSourceFile2, createMockVisitorContext())
    const violations2 = result.onComplete?.()

    expect(violations1![0].message).toBe('Violation 1')
    expect(violations2![0].message).toBe('Violation 1')
  })
})

describe('exit handlers', () => {
  test('calls :exit handler for kind name', () => {
    const exitHandler = vi.fn()
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        'Identifier:exit': exitHandler,
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'exit-rule')
    const result = adapted.create({})
    const mockNode = createMockNode({ kindName: 'Identifier' })

    result.visitor.exitNode?.(mockNode, createMockVisitorContext())

    expect(exitHandler).toHaveBeenCalledTimes(1)
  })

  test('calls :exit handler for ESTree type when different from kind name', () => {
    const exitHandler = vi.fn()
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        'VariableDeclarator:exit': exitHandler,
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'estree-exit-rule')
    const result = adapted.create({})
    const mockNode = createMockNode({ kindName: 'VariableDeclaration' })

    result.visitor.exitNode?.(mockNode, createMockVisitorContext())

    expect(exitHandler).toHaveBeenCalledTimes(1)
  })

  test('does not call exit handler for non-matching kind', () => {
    const exitHandler = vi.fn()
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        'Identifier:exit': exitHandler,
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'non-exit-rule')
    const result = adapted.create({})
    const mockNode = createMockNode({ kindName: 'StringLiteral' })

    result.visitor.exitNode?.(mockNode, createMockVisitorContext())

    expect(exitHandler).not.toHaveBeenCalled()
  })

  test('Program:exit is called on SourceFile exit', () => {
    const programExitHandler = vi.fn()
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        'Program:exit': programExitHandler,
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'program-exit-rule')
    const result = adapted.create({})
    const sf = createMockSourceFile()

    result.visitor.visitSourceFile?.(sf, createMockVisitorContext())

    const SourceFileKind = 307
    const sfNode = {
      getSourceFile: () => sf,
      getStart: () => 0,
      getEnd: () => 11,
      getText: () => 'const x = 1;',
      getKindName: () => 'SourceFile',
      getKind: () => SourceFileKind,
    } as Node

    result.visitor.exitNode?.(sfNode, createMockVisitorContext())

    expect(programExitHandler).toHaveBeenCalledTimes(1)
  })
})

describe('ESTree type alias dispatch', () => {
  test('dispatches by ESTree alias for VariableDeclaration -> VariableDeclarator', () => {
    const estreeHandler = vi.fn()
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        VariableDeclarator: estreeHandler,
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'estree-var-rule')
    const result = adapted.create({})
    const mockNode = createMockNode({ kindName: 'VariableDeclaration' })

    result.visitor.visitNode?.(mockNode, createMockVisitorContext())

    expect(estreeHandler).toHaveBeenCalledTimes(1)
  })

  test('dispatches by ESTree alias for StringLiteral -> Literal', () => {
    const literalHandler = vi.fn()
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        Literal: literalHandler,
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'literal-rule')
    const result = adapted.create({})
    const mockNode = createMockNode({ kindName: 'StringLiteral' })

    result.visitor.visitNode?.(mockNode, createMockVisitorContext())

    expect(literalHandler).toHaveBeenCalledTimes(1)
  })

  test('dispatches by ESTree alias for ObjectLiteralExpression -> ObjectExpression', () => {
    const objExprHandler = vi.fn()
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        ObjectExpression: objExprHandler,
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'obj-expr-rule')
    const result = adapted.create({})
    const mockNode = createMockNode({ kindName: 'ObjectLiteralExpression' })

    result.visitor.visitNode?.(mockNode, createMockVisitorContext())

    expect(objExprHandler).toHaveBeenCalledTimes(1)
  })

  test('dispatches by ESTree alias for PropertyAccessExpression -> MemberExpression', () => {
    const memberHandler = vi.fn()
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        MemberExpression: memberHandler,
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'member-expr-rule')
    const result = adapted.create({})
    const mockNode = createMockNode({ kindName: 'PropertyAccessExpression' })

    result.visitor.visitNode?.(mockNode, createMockVisitorContext())

    expect(memberHandler).toHaveBeenCalledTimes(1)
  })

  test('dispatches by ESTree alias for InterfaceDeclaration -> TSInterfaceDeclaration', () => {
    const tsInterfaceHandler = vi.fn()
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        TSInterfaceDeclaration: tsInterfaceHandler,
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'ts-interface-rule')
    const result = adapted.create({})
    const mockNode = createMockNode({ kindName: 'InterfaceDeclaration' })

    result.visitor.visitNode?.(mockNode, createMockVisitorContext())

    expect(tsInterfaceHandler).toHaveBeenCalledTimes(1)
  })

  test('dispatches both ts-morph kind name and ESTree alias', () => {
    const kindHandler = vi.fn()
    const estreeHandler = vi.fn()
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        PropertyAccessExpression: kindHandler,
        MemberExpression: estreeHandler,
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'dual-dispatch-rule')
    const result = adapted.create({})
    const mockNode = createMockNode({ kindName: 'PropertyAccessExpression' })

    result.visitor.visitNode?.(mockNode, createMockVisitorContext())

    expect(kindHandler).toHaveBeenCalledTimes(1)
    expect(estreeHandler).toHaveBeenCalledTimes(1)
  })

  test('does not double-dispatch when kind name equals ESTree type', () => {
    const handler = vi.fn()
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        Identifier: handler,
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'no-double-dispatch-rule')
    const result = adapted.create({})
    const mockNode = createMockNode({ kindName: 'Identifier' })

    result.visitor.visitNode?.(mockNode, createMockVisitorContext())

    // Identifier -> Identifier (no alias), so only called once
    expect(handler).toHaveBeenCalledTimes(1)
  })
})

describe('create() independence', () => {
  test('multiple create() calls produce independent violations', () => {
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          context.report({ message: 'V' })
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'independent-rule')
    const result1 = adapted.create({})
    const result2 = adapted.create({})
    const mockSourceFile = createMockSourceFile()

    result1.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())
    result2.visitor.visitSourceFile?.(mockSourceFile, createMockVisitorContext())

    const violations1 = result1.onComplete?.()
    const violations2 = result2.onComplete?.()

    expect(violations1).toHaveLength(1)
    expect(violations2).toHaveLength(1)
    expect(violations1).not.toBe(violations2)
  })

  test('each create() has its own source file state', () => {
    const adapted = adaptPluginRule(
      createMockPluginRule({
        createVisitor: (context) => ({
          SourceFile: () => {
            context.report({ message: context.getFilePath() })
          },
        }),
      }),
      'state-rule',
    )

    const result1 = adapted.create({})
    const result2 = adapted.create({})

    const sf1 = createMockSourceFile({ filePath: '/a.ts' })
    const sf2 = createMockSourceFile({ filePath: '/b.ts' })

    result1.visitor.visitSourceFile?.(sf1, createMockVisitorContext())
    result2.visitor.visitSourceFile?.(sf2, createMockVisitorContext())

    expect(result1.onComplete?.()![0].filePath).toBe('/a.ts')
    expect(result2.onComplete?.()![0].filePath).toBe('/b.ts')
  })

  test('violations do not leak between create() calls', () => {
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          context.report({ message: 'Leak test' })
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'leak-rule')
    const result1 = adapted.create({})

    result1.visitor.visitSourceFile?.(createMockSourceFile(), createMockVisitorContext())

    const result2 = adapted.create({})
    const violations2 = result2.onComplete?.()

    expect(violations2).toHaveLength(0)
  })
})

describe('generic handler variations', () => {
  test('* handler is called for every node', () => {
    const starHandler = vi.fn()
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({ '*': starHandler }),
    })

    const adapted = adaptPluginRule(pluginRule, 'star-all-rule')
    const result = adapted.create({})

    result.visitor.visitNode?.(
      createMockNode({ kindName: 'IfStatement' }),
      createMockVisitorContext(),
    )
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'ReturnStatement' }),
      createMockVisitorContext(),
    )
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'Identifier' }),
      createMockVisitorContext(),
    )

    expect(starHandler).toHaveBeenCalledTimes(3)
  })

  test('Any handler is called for every node', () => {
    const anyHandler = vi.fn()
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({ Any: anyHandler }),
    })

    const adapted = adaptPluginRule(pluginRule, 'any-all-rule')
    const result = adapted.create({})

    result.visitor.visitNode?.(
      createMockNode({ kindName: 'IfStatement' }),
      createMockVisitorContext(),
    )
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'ReturnStatement' }),
      createMockVisitorContext(),
    )

    expect(anyHandler).toHaveBeenCalledTimes(2)
  })

  test('* handler receives converted node with type', () => {
    let receivedNode: Record<string, unknown> | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        '*': (node) => {
          receivedNode = node as Record<string, unknown>
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'star-type-rule')
    const result = adapted.create({})

    result.visitor.visitNode?.(
      createMockNode({ kindName: 'Identifier' }),
      createMockVisitorContext(),
    )

    expect(receivedNode).toBeDefined()
    expect(receivedNode!.type).toBe('Identifier')
  })
})

describe('context.getSource()', () => {
  test('returns source text after visiting source file', () => {
    let capturedSource: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          capturedSource = context.getSource()
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'source-rule')
    const result = adapted.create({})
    const sf = createMockSourceFile({ fullText: 'const x = 42;' })

    result.visitor.visitSourceFile?.(sf, createMockVisitorContext())

    expect(capturedSource).toBe('const x = 42;')
  })

  test('returns source text after visiting node when source file not yet set', () => {
    let capturedSource: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        Identifier: () => {
          capturedSource = context.getSource()
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'source-node-rule')
    const result = adapted.create({})
    const sf = createMockSourceFile({ fullText: 'let y = 2;' })
    const node = createMockNode({ kindName: 'Identifier', sourceFile: sf })

    result.visitor.visitNode?.(node, createMockVisitorContext())

    expect(capturedSource).toBe('let y = 2;')
  })

  test('returns empty string before any visit', () => {
    let capturedSource: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => {
        capturedSource = context.getSource()
        return {}
      },
    })

    const adapted = adaptPluginRule(pluginRule, 'source-early-rule')
    adapted.create({})

    expect(capturedSource).toBe('')
  })
})

describe('context.getFilePath()', () => {
  test('returns file path after visiting source file', () => {
    let capturedPath: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          capturedPath = context.getFilePath()
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'path-rule')
    const result = adapted.create({})
    const sf = createMockSourceFile({ filePath: '/custom/path.ts' })

    result.visitor.visitSourceFile?.(sf, createMockVisitorContext())

    expect(capturedPath).toBe('/custom/path.ts')
  })

  test('returns node source file path when no source file visited yet', () => {
    let capturedPath: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        Identifier: () => {
          capturedPath = context.getFilePath()
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'path-node-rule')
    const result = adapted.create({})
    const sf = createMockSourceFile({ filePath: '/from/node.ts' })
    const node = createMockNode({ kindName: 'Identifier', sourceFile: sf })

    result.visitor.visitNode?.(node, createMockVisitorContext())

    expect(capturedPath).toBe('/from/node.ts')
  })
})

describe('violation severity mapping', () => {
  test('error severity produces error violations', () => {
    const pluginRule = createMockPluginRule({
      severity: 'error',
      createVisitor: (context) => ({
        SourceFile: () => context.report({ message: 'err' }),
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'sev-err')
    const result = adapted.create({})
    result.visitor.visitSourceFile?.(createMockSourceFile(), createMockVisitorContext())

    expect(result.onComplete?.()![0].severity).toBe('error')
  })

  test('warn severity produces warning violations', () => {
    const pluginRule = createMockPluginRule({
      severity: 'warn',
      createVisitor: (context) => ({
        SourceFile: () => context.report({ message: 'warn' }),
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'sev-warn')
    const result = adapted.create({})
    result.visitor.visitSourceFile?.(createMockSourceFile(), createMockVisitorContext())

    expect(result.onComplete?.()![0].severity).toBe('warning')
  })

  test('off severity produces info violations', () => {
    const pluginRule = createMockPluginRule({
      severity: 'off',
      createVisitor: (context) => ({
        SourceFile: () => context.report({ message: 'info' }),
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'sev-off')
    const result = adapted.create({})
    result.visitor.visitSourceFile?.(createMockSourceFile(), createMockVisitorContext())

    expect(result.onComplete?.()![0].severity).toBe('info')
  })
})

describe('node type conversion', () => {
  test('Block becomes BlockStatement', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        BlockStatement: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'block-rule')
    const result = adapted.create({})
    result.visitor.visitNode?.(createMockNode({ kindName: 'Block' }), createMockVisitorContext())

    expect(capturedType).toBe('BlockStatement')
  })

  test('NumericLiteral becomes Literal', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        Literal: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'num-lit-rule')
    const result = adapted.create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'NumericLiteral' }),
      createMockVisitorContext(),
    )

    expect(capturedType).toBe('Literal')
  })

  test('ArrowFunction becomes ArrowFunctionExpression', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        ArrowFunctionExpression: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'arrow-rule')
    const result = adapted.create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'ArrowFunction' }),
      createMockVisitorContext(),
    )

    expect(capturedType).toBe('ArrowFunctionExpression')
  })

  test('ArrayLiteralExpression becomes ArrayExpression', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        ArrayExpression: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'array-expr-rule')
    const result = adapted.create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'ArrayLiteralExpression' }),
      createMockVisitorContext(),
    )

    expect(capturedType).toBe('ArrayExpression')
  })

  test('IfStatement stays IfStatement', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        IfStatement: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'if-rule')
    const result = adapted.create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'IfStatement' }),
      createMockVisitorContext(),
    )

    expect(capturedType).toBe('IfStatement')
  })

  test('ReturnStatement stays ReturnStatement', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        ReturnStatement: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'return-rule')
    const result = adapted.create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'ReturnStatement' }),
      createMockVisitorContext(),
    )

    expect(capturedType).toBe('ReturnStatement')
  })

  test('EnumDeclaration becomes TSEnumDeclaration', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        TSEnumDeclaration: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'enum-rule')
    const result = adapted.create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'EnumDeclaration' }),
      createMockVisitorContext(),
    )

    expect(capturedType).toBe('TSEnumDeclaration')
  })

  test('ClassExpression stays ClassExpression', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        ClassExpression: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'class-expr-rule')
    const result = adapted.create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'ClassExpression' }),
      createMockVisitorContext(),
    )

    expect(capturedType).toBe('ClassExpression')
  })

  test('BreakStatement stays BreakStatement', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        BreakStatement: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'break-rule')
    const result = adapted.create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'BreakStatement' }),
      createMockVisitorContext(),
    )

    expect(capturedType).toBe('BreakStatement')
  })

  test('ContinueStatement stays ContinueStatement', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        ContinueStatement: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'continue-rule')
    const result = adapted.create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'ContinueStatement' }),
      createMockVisitorContext(),
    )

    expect(capturedType).toBe('ContinueStatement')
  })

  test('ThrowStatement stays ThrowStatement', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        ThrowStatement: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'throw-rule')
    const result = adapted.create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'ThrowStatement' }),
      createMockVisitorContext(),
    )

    expect(capturedType).toBe('ThrowStatement')
  })

  test('AwaitExpression stays AwaitExpression', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        AwaitExpression: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'await-rule')
    const result = adapted.create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'AwaitExpression' }),
      createMockVisitorContext(),
    )

    expect(capturedType).toBe('AwaitExpression')
  })

  test('SpreadElement stays SpreadElement', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        SpreadElement: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'spread-rule')
    const result = adapted.create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'SpreadElement' }),
      createMockVisitorContext(),
    )

    expect(capturedType).toBe('SpreadElement')
  })
})

describe('adaptPluginRules additional coverage', () => {
  test('adapts a single rule correctly', () => {
    const rules: Record<string, PluginRuleDefinition> = {
      'single-rule': createMockPluginRule({ description: 'Single' }),
    }

    const adapted = adaptPluginRules(rules)

    expect(Object.keys(adapted)).toHaveLength(1)
    expect(adapted['single-rule'].meta.name).toBe('single-rule')
    expect(adapted['single-rule'].meta.description).toBe('Single')
  })

  test('handles many rules efficiently', () => {
    const rules: Record<string, PluginRuleDefinition> = {}
    for (let i = 0; i < 50; i++) {
      rules[`rule-${i}`] = createMockPluginRule({ description: `Rule ${i}` })
    }

    const adapted = adaptPluginRules(rules)

    expect(Object.keys(adapted)).toHaveLength(50)
    expect(adapted['rule-0'].meta.description).toBe('Rule 0')
    expect(adapted['rule-49'].meta.description).toBe('Rule 49')
  })

  test('each rule has correct meta', () => {
    const rules: Record<string, PluginRuleDefinition> = {
      'rule-a': createMockPluginRule({ category: 'Security', severity: 'error' }),
      'rule-b': createMockPluginRule({ category: 'Performance', severity: 'warn' }),
    }

    const adapted = adaptPluginRules(rules)

    expect(adapted['rule-a'].meta.category).toBe('security')
    expect(adapted['rule-b'].meta.category).toBe('performance')
    expect(adapted['rule-a'].meta.severity).toBe('error')
    expect(adapted['rule-b'].meta.severity).toBe('warning')
  })
})

describe('node properties', () => {
  test('converted node has range as array', () => {
    let capturedNode: Record<string, unknown> | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        Identifier: (node) => {
          capturedNode = node as Record<string, unknown>
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'range-rule')
    const result = adapted.create({})
    const mockNode = createMockNode({ kindName: 'Identifier', start: 3, end: 8 })

    result.visitor.visitNode?.(mockNode, createMockVisitorContext())

    expect(Array.isArray(capturedNode!.range)).toBe(true)
    expect(capturedNode!.range).toEqual([3, 8])
  })

  test('converted node has loc object', () => {
    let capturedNode: Record<string, unknown> | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        Identifier: (node) => {
          capturedNode = node as Record<string, unknown>
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'loc-rule')
    const result = adapted.create({})
    const mockNode = createMockNode({ kindName: 'Identifier', start: 0, end: 5 })

    result.visitor.visitNode?.(mockNode, createMockVisitorContext())

    expect(capturedNode!.loc).toBeDefined()
    const loc = capturedNode!.loc as {
      start: { line: number; column: number }
      end: { line: number; column: number }
    }
    expect(loc.start.line).toBeDefined()
    expect(loc.start.column).toBeDefined()
    expect(loc.end.line).toBeDefined()
    expect(loc.end.column).toBeDefined()
  })

  test('converted node has start and end numbers', () => {
    let capturedNode: Record<string, unknown> | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        Identifier: (node) => {
          capturedNode = node as Record<string, unknown>
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'start-end-rule')
    const result = adapted.create({})
    const mockNode = createMockNode({ kindName: 'Identifier', start: 10, end: 20 })

    result.visitor.visitNode?.(mockNode, createMockVisitorContext())

    expect(typeof capturedNode!.start).toBe('number')
    expect(typeof capturedNode!.end).toBe('number')
    expect(capturedNode!.start).toBe(10)
    expect(capturedNode!.end).toBe(20)
  })

  test('converted node has text property', () => {
    let capturedNode: Record<string, unknown> | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        Identifier: (node) => {
          capturedNode = node as Record<string, unknown>
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'text-rule')
    const result = adapted.create({})
    const mockNode = createMockNode({ kindName: 'Identifier', text: 'myVar' })

    result.visitor.visitNode?.(mockNode, createMockVisitorContext())

    expect(capturedNode!.text).toBe('myVar')
  })

  test('source file node has body property', () => {
    let capturedNode: Record<string, unknown> | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        SourceFile: (node) => {
          capturedNode = node as Record<string, unknown>
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'sf-body-rule')
    const result = adapted.create({})
    const sf = createMockSourceFile({ fullText: 'const x = 1;' })

    result.visitor.visitSourceFile?.(sf, createMockVisitorContext())

    expect(capturedNode).toBeDefined()
    expect(capturedNode!.type).toBeDefined()
  })
})

describe('report edge cases', () => {
  test('report preserves ruleId from adaptPluginRule', () => {
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => context.report({ message: 'check id' }),
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'my-special-rule-id')
    const result = adapted.create({})
    result.visitor.visitSourceFile?.(createMockSourceFile(), createMockVisitorContext())

    expect(result.onComplete?.()![0].ruleId).toBe('my-special-rule-id')
  })

  test('report preserves filePath from source file', () => {
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => context.report({ message: 'path' }),
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'fp-rule')
    const result = adapted.create({})
    const sf = createMockSourceFile({ filePath: '/deep/nested/module.ts' })

    result.visitor.visitSourceFile?.(sf, createMockVisitorContext())

    expect(result.onComplete?.()![0].filePath).toBe('/deep/nested/module.ts')
  })

  test('report preserves message exactly', () => {
    const longMessage =
      'This is a very long violation message that contains special characters: <>&"\' and unicode: \u00e9\u00e0\u00fc'
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => context.report({ message: longMessage }),
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'msg-rule')
    const result = adapted.create({})
    result.visitor.visitSourceFile?.(createMockSourceFile(), createMockVisitorContext())

    expect(result.onComplete?.()![0].message).toBe(longMessage)
  })

  test('report with single-item suggest array', () => {
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          context.report({
            message: 'fix',
            suggest: [{ desc: 'Fix it', message: 'fix', fix: { range: [0, 1], text: 'x' } }],
          })
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'single-suggest-rule')
    const result = adapted.create({})
    result.visitor.visitSourceFile?.(createMockSourceFile(), createMockVisitorContext())

    expect(result.onComplete?.()![0].suggestion).toBe('Fix it')
  })

  test('report picks first suggestion from multiple', () => {
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          context.report({
            message: 'multi',
            suggest: [
              { desc: 'First', message: 'a', fix: { range: [0, 1], text: 'a' } },
              { desc: 'Second', message: 'b', fix: { range: [0, 1], text: 'b' } },
            ],
          })
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'multi-suggest-rule')
    const result = adapted.create({})
    result.visitor.visitSourceFile?.(createMockSourceFile(), createMockVisitorContext())

    expect(result.onComplete?.()![0].suggestion).toBe('First')
  })

  test('many reports accumulate correctly', () => {
    const count = 50
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          for (let i = 0; i < count; i++) {
            context.report({ message: `violation-${i}` })
          }
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'many-report-rule')
    const result = adapted.create({})
    result.visitor.visitSourceFile?.(createMockSourceFile(), createMockVisitorContext())

    const violations = result.onComplete?.()
    expect(violations).toHaveLength(count)
    expect(violations![0].message).toBe('violation-0')
    expect(violations![49].message).toBe('violation-49')
  })

  test('location with same start and end line', () => {
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          context.report({
            message: 'same line',
            loc: { start: { line: 5, column: 0 }, end: { line: 5, column: 10 } },
          })
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'same-line-rule')
    const result = adapted.create({})
    result.visitor.visitSourceFile?.(createMockSourceFile(), createMockVisitorContext())

    const v = result.onComplete?.()![0]
    expect(v.range.start.line).toBe(v.range.end.line)
  })

  test('location spanning multiple lines', () => {
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          context.report({
            message: 'span',
            loc: { start: { line: 1, column: 0 }, end: { line: 100, column: 50 } },
          })
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'span-rule')
    const result = adapted.create({})
    result.visitor.visitSourceFile?.(createMockSourceFile(), createMockVisitorContext())

    const v = result.onComplete?.()![0]
    expect(v.range.end.line - v.range.start.line).toBe(99)
  })
})

describe('adaptPluginRule with different plugin meta shapes', () => {
  test('handles meta with all optional fields undefined', () => {
    const pluginRule: PluginRuleDefinition = {
      meta: {
        type: 'problem',
        severity: 'error',
      },
      create: () => ({}),
    }

    const adapted = adaptPluginRule(pluginRule, 'minimal-meta')

    expect(adapted.meta.deprecated).toBeUndefined()
    expect(adapted.meta.replacedBy).toBeUndefined()
    expect(adapted.meta.fixable).toBeUndefined()
    expect(adapted.meta.docs).toBeUndefined()
  })

  test('handles layout type rule', () => {
    const adapted = adaptPluginRule(createMockPluginRule({ type: 'layout' }), 'layout-rule')
    expect(adapted.meta.description).toBe('Test rule description')
    expect(adapted.meta.category).toBe('style')
  })

  test('handles suggestion type rule', () => {
    const adapted = adaptPluginRule(createMockPluginRule({ type: 'suggestion' }), 'suggestion-rule')
    expect(adapted.meta.description).toBe('Test rule description')
    expect(adapted.meta.category).toBe('style')
  })

  test('handles category patterns', () => {
    const pluginRule = createMockPluginRule({ category: 'patterns' })
    const adapted = adaptPluginRule(pluginRule, 'patterns-rule')
    expect(adapted.meta.category).toBe('patterns')
  })

  test('handles category dependencies', () => {
    const pluginRule = createMockPluginRule({ category: 'dependencies' })
    const adapted = adaptPluginRule(pluginRule, 'deps-rule')
    expect(adapted.meta.category).toBe('dependencies')
  })

  test('handles docs with both description and url', () => {
    const pluginRule: PluginRuleDefinition = {
      meta: {
        type: 'problem',
        severity: 'error',
        docs: {
          description: 'Rule with docs',
          url: 'https://example.com/rule-docs',
        },
      },
      create: () => ({}),
    }

    const adapted = adaptPluginRule(pluginRule, 'docs-both-rule')

    expect(adapted.meta.docs).toEqual({
      description: 'Rule with docs',
      url: 'https://example.com/rule-docs',
    })
    expect(adapted.meta.description).toBe('Rule with docs')
  })
})

describe('visitor.dispatch order', () => {
  test('kind handler is called before generic handler', () => {
    const callOrder: string[] = []
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        Identifier: () => callOrder.push('kind'),
        '*': () => callOrder.push('generic'),
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'order-rule')
    const result = adapted.create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'Identifier' }),
      createMockVisitorContext(),
    )

    expect(callOrder).toEqual(['kind', 'generic'])
  })

  test('no handlers called when visitor has no matching keys', () => {
    const handlerA = vi.fn()
    const handlerB = vi.fn()
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        Identifier: handlerA,
        StringLiteral: handlerB,
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'no-match-rule')
    const result = adapted.create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'NumericLiteral' }),
      createMockVisitorContext(),
    )

    expect(handlerA).not.toHaveBeenCalled()
    expect(handlerB).not.toHaveBeenCalled()
  })
})

describe('source file handling details', () => {
  test('visiting same source file twice resets violations', () => {
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => context.report({ message: 'dup' }),
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'reset-rule')
    const result = adapted.create({})
    const sf = createMockSourceFile()

    result.visitor.visitSourceFile?.(sf, createMockVisitorContext())
    result.visitor.visitSourceFile?.(sf, createMockVisitorContext())

    expect(result.onComplete?.()).toHaveLength(1)
  })

  test('visiting different source files tracks correct file path', () => {
    let capturedPath: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          capturedPath = context.getFilePath()
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'path-track-rule')
    const result = adapted.create({})
    const sf1 = createMockSourceFile({ filePath: '/first.ts' })
    const sf2 = createMockSourceFile({ filePath: '/second.ts' })

    result.visitor.visitSourceFile?.(sf1, createMockVisitorContext())
    expect(capturedPath).toBe('/first.ts')

    result.visitor.visitSourceFile?.(sf2, createMockVisitorContext())
    expect(capturedPath).toBe('/second.ts')
  })

  test('node visit after source file visit uses source file path', () => {
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        Identifier: () => {
          // After source file visit, getFilePath should return the source file path
          expect(context.getFilePath()).toBe('/src/module.ts')
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'sf-then-node-rule')
    const result = adapted.create({})
    const sf = createMockSourceFile({ filePath: '/src/module.ts' })

    result.visitor.visitSourceFile?.(sf, createMockVisitorContext())
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'Identifier' }),
      createMockVisitorContext(),
    )
  })

  test('empty source text is handled', () => {
    let capturedSource: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          capturedSource = context.getSource()
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'empty-source-rule')
    const result = adapted.create({})
    const sf = createMockSourceFile({ fullText: '' })

    result.visitor.visitSourceFile?.(sf, createMockVisitorContext())

    expect(capturedSource).toBe('')
  })

  test('source text with special characters', () => {
    let capturedSource: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => ({
        SourceFile: () => {
          capturedSource = context.getSource()
        },
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'special-source-rule')
    const result = adapted.create({})
    const special = 'const s = "\u00e9\u00e0\u00fc";\n// comment\n'
    const sf = createMockSourceFile({ fullText: special })

    result.visitor.visitSourceFile?.(sf, createMockVisitorContext())

    expect(capturedSource).toBe(special)
  })
})

describe('additional category mappings', () => {
  test('maps lowercase performance', () => {
    const adapted = adaptPluginRule(createMockPluginRule({ category: 'performance' }), 'lp')
    expect(adapted.meta.category).toBe('performance')
  })

  test('maps lowercase security', () => {
    const adapted = adaptPluginRule(createMockPluginRule({ category: 'security' }), 'ls')
    expect(adapted.meta.category).toBe('security')
  })

  test('maps lowercase correctness', () => {
    const adapted = adaptPluginRule(createMockPluginRule({ category: 'correctness' }), 'lc')
    expect(adapted.meta.category).toBe('correctness')
  })

  test('maps lowercase complexity', () => {
    const adapted = adaptPluginRule(createMockPluginRule({ category: 'complexity' }), 'lx')
    expect(adapted.meta.category).toBe('complexity')
  })

  test('maps mixed case PerForMance', () => {
    const adapted = adaptPluginRule(createMockPluginRule({ category: 'PerForMance' }), 'mc')
    expect(adapted.meta.category).toBe('performance')
  })

  test('maps mixed case SeCurIty', () => {
    const adapted = adaptPluginRule(createMockPluginRule({ category: 'SeCurIty' }), 'ms')
    expect(adapted.meta.category).toBe('security')
  })
})

describe('rule meta field combinations', () => {
  test('deprecated true with no replacedBy', () => {
    const adapted = adaptPluginRule(createMockPluginRule({ deprecated: true }), 'dep-no-rep')
    expect(adapted.meta.deprecated).toBe(true)
    expect(adapted.meta.replacedBy).toBeUndefined()
  })

  test('deprecated false is falsy', () => {
    const adapted = adaptPluginRule(createMockPluginRule({ deprecated: false }), 'dep-false')
    expect(adapted.meta.deprecated).toBeFalsy()
  })

  test('fixable code is preserved', () => {
    const adapted = adaptPluginRule(createMockPluginRule({ fixable: 'code' }), 'fix-code')
    expect(adapted.meta.fixable).toBe('code')
  })

  test('fixable whitespace is preserved', () => {
    const adapted = adaptPluginRule(createMockPluginRule({ fixable: 'whitespace' }), 'fix-ws')
    expect(adapted.meta.fixable).toBe('whitespace')
  })

  test('severity error maps to error', () => {
    const adapted = adaptPluginRule(createMockPluginRule({ severity: 'error' }), 'sev-e')
    expect(adapted.meta.severity).toBe('error')
  })

  test('severity warn maps to warning', () => {
    const adapted = adaptPluginRule(createMockPluginRule({ severity: 'warn' }), 'sev-w')
    expect(adapted.meta.severity).toBe('warning')
  })

  test('severity off maps to info', () => {
    const adapted = adaptPluginRule(createMockPluginRule({ severity: 'off' }), 'sev-o')
    expect(adapted.meta.severity).toBe('info')
  })

  test('type problem produces error severity by default', () => {
    const adapted = adaptPluginRule(createMockPluginRule({ type: 'problem' }), 'tp')
    expect(adapted.meta.severity).toBe('error')
  })

  test('type suggestion with warn severity', () => {
    const adapted = adaptPluginRule(
      createMockPluginRule({ type: 'suggestion', severity: 'warn' }),
      'ts',
    )
    expect(adapted.meta.severity).toBe('warning')
  })

  test('type layout with off severity', () => {
    const adapted = adaptPluginRule(createMockPluginRule({ type: 'layout', severity: 'off' }), 'tl')
    expect(adapted.meta.severity).toBe('info')
  })
})

describe('PluginRuleContext methods', () => {
  test('getAST always returns null', () => {
    let result: unknown
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => {
        result = context.getAST()
        return {}
      },
    })

    adaptPluginRule(pluginRule, 'ast-ctx').create({})
    expect(result).toBeNull()
  })

  test('getTokens always returns empty array', () => {
    let result: unknown
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => {
        result = context.getTokens()
        return {}
      },
    })

    adaptPluginRule(pluginRule, 'tokens-ctx').create({})
    expect(result).toEqual([])
  })

  test('getComments always returns empty array', () => {
    let result: unknown
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => {
        result = context.getComments()
        return {}
      },
    })

    adaptPluginRule(pluginRule, 'comments-ctx').create({})
    expect(result).toEqual([])
  })

  test('config has options, rules, and transforms', () => {
    let config: unknown
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => {
        config = context.config
        return {}
      },
    })

    adaptPluginRule(pluginRule, 'config-ctx').create({})
    expect(config).toEqual({ options: {}, rules: {}, transforms: [] })
  })

  test('workspaceRoot is process.cwd()', () => {
    let root: unknown
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => {
        root = context.workspaceRoot
        return {}
      },
    })

    adaptPluginRule(pluginRule, 'cwd-ctx').create({})
    expect(root).toBe(process.cwd())
  })

  test('logger methods do not throw', () => {
    let logger: unknown
    const pluginRule = createMockPluginRule({
      createVisitor: (context) => {
        logger = context.logger
        return {}
      },
    })

    adaptPluginRule(pluginRule, 'logger-ctx').create({})
    const l = logger as Record<string, () => void>
    expect(() => l.debug('a')).not.toThrow()
    expect(() => l.info('b')).not.toThrow()
    expect(() => l.warn('c')).not.toThrow()
    expect(() => l.error('d')).not.toThrow()
  })
})

describe('more ESTree type conversions', () => {
  test('ElementAccessExpression becomes MemberExpression', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        MemberExpression: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const result = adaptPluginRule(pluginRule, 'elem-access').create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'ElementAccessExpression' }),
      createMockVisitorContext(),
    )
    expect(capturedType).toBe('MemberExpression')
  })

  test('BinaryExpression stays BinaryExpression', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        BinaryExpression: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const result = adaptPluginRule(pluginRule, 'bin-expr').create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'BinaryExpression' }),
      createMockVisitorContext(),
    )
    expect(capturedType).toBe('BinaryExpression')
  })

  test('CallExpression stays CallExpression', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        CallExpression: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const result = adaptPluginRule(pluginRule, 'call-expr').create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'CallExpression' }),
      createMockVisitorContext(),
    )
    expect(capturedType).toBe('CallExpression')
  })

  test('NewExpression stays NewExpression', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        NewExpression: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const result = adaptPluginRule(pluginRule, 'new-expr').create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'NewExpression' }),
      createMockVisitorContext(),
    )
    expect(capturedType).toBe('NewExpression')
  })

  test('SwitchStatement stays SwitchStatement', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        SwitchStatement: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const result = adaptPluginRule(pluginRule, 'switch-rule').create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'SwitchStatement' }),
      createMockVisitorContext(),
    )
    expect(capturedType).toBe('SwitchStatement')
  })

  test('TryStatement stays TryStatement', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        TryStatement: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const result = adaptPluginRule(pluginRule, 'try-rule').create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'TryStatement' }),
      createMockVisitorContext(),
    )
    expect(capturedType).toBe('TryStatement')
  })

  test('ForStatement stays ForStatement', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        ForStatement: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const result = adaptPluginRule(pluginRule, 'for-rule').create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'ForStatement' }),
      createMockVisitorContext(),
    )
    expect(capturedType).toBe('ForStatement')
  })

  test('WhileStatement stays WhileStatement', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        WhileStatement: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const result = adaptPluginRule(pluginRule, 'while-rule').create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'WhileStatement' }),
      createMockVisitorContext(),
    )
    expect(capturedType).toBe('WhileStatement')
  })

  test('FunctionDeclaration stays FunctionDeclaration', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        FunctionDeclaration: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const result = adaptPluginRule(pluginRule, 'func-decl').create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'FunctionDeclaration' }),
      createMockVisitorContext(),
    )
    expect(capturedType).toBe('FunctionDeclaration')
  })

  test('ClassDeclaration stays ClassDeclaration', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        ClassDeclaration: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const result = adaptPluginRule(pluginRule, 'class-decl').create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'ClassDeclaration' }),
      createMockVisitorContext(),
    )
    expect(capturedType).toBe('ClassDeclaration')
  })

  test('ImportDeclaration stays ImportDeclaration', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        ImportDeclaration: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const result = adaptPluginRule(pluginRule, 'import-decl').create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'ImportDeclaration' }),
      createMockVisitorContext(),
    )
    expect(capturedType).toBe('ImportDeclaration')
  })

  test('TemplateExpression becomes TemplateLiteral', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        TemplateLiteral: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const result = adaptPluginRule(pluginRule, 'tpl-lit').create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'TemplateExpression' }),
      createMockVisitorContext(),
    )
    expect(capturedType).toBe('TemplateLiteral')
  })

  test('ExpressionStatement stays ExpressionStatement', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        ExpressionStatement: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const result = adaptPluginRule(pluginRule, 'expr-stmt').create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'ExpressionStatement' }),
      createMockVisitorContext(),
    )
    expect(capturedType).toBe('ExpressionStatement')
  })

  test('CatchClause stays CatchClause', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        CatchClause: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const result = adaptPluginRule(pluginRule, 'catch-rule').create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'CatchClause' }),
      createMockVisitorContext(),
    )
    expect(capturedType).toBe('CatchClause')
  })

  test('PropertyDeclaration becomes PropertyDefinition', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        PropertyDefinition: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const result = adaptPluginRule(pluginRule, 'prop-def').create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'PropertyDeclaration' }),
      createMockVisitorContext(),
    )
    expect(capturedType).toBe('PropertyDefinition')
  })

  test('PrivateIdentifier stays PrivateIdentifier', () => {
    let capturedType: string | undefined
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        PrivateIdentifier: (node) => {
          capturedType = (node as Record<string, unknown>).type as string
        },
      }),
    })

    const result = adaptPluginRule(pluginRule, 'priv-id').create({})
    result.visitor.visitNode?.(
      createMockNode({ kindName: 'PrivateIdentifier' }),
      createMockVisitorContext(),
    )
    expect(capturedType).toBe('PrivateIdentifier')
  })
})

describe('adaptPluginRule returns correct structure', () => {
  test('has meta property', () => {
    const adapted = adaptPluginRule(createMockPluginRule(), 'struct-rule')
    expect(adapted).toHaveProperty('meta')
  })

  test('has create property', () => {
    const adapted = adaptPluginRule(createMockPluginRule(), 'struct-rule')
    expect(adapted).toHaveProperty('create')
  })

  test('has defaultOptions property', () => {
    const adapted = adaptPluginRule(createMockPluginRule(), 'struct-rule')
    expect(adapted).toHaveProperty('defaultOptions')
  })

  test('meta has required fields', () => {
    const adapted = adaptPluginRule(createMockPluginRule(), 'fields-rule')
    expect(adapted.meta).toHaveProperty('name')
    expect(adapted.meta).toHaveProperty('description')
    expect(adapted.meta).toHaveProperty('category')
    expect(adapted.meta).toHaveProperty('recommended')
  })

  test('create returns object with visitor', () => {
    const adapted = adaptPluginRule(createMockPluginRule(), 'visitor-rule')
    const result = adapted.create({})
    expect(result).toHaveProperty('visitor')
  })

  test('create returns object with onComplete', () => {
    const adapted = adaptPluginRule(createMockPluginRule(), 'complete-rule')
    const result = adapted.create({})
    expect(result).toHaveProperty('onComplete')
  })

  test('visitor has visitSourceFile method', () => {
    const adapted = adaptPluginRule(createMockPluginRule(), 'vsf-rule')
    const result = adapted.create({})
    expect(typeof result.visitor.visitSourceFile).toBe('function')
  })

  test('visitor has visitNode method', () => {
    const adapted = adaptPluginRule(createMockPluginRule(), 'vn-rule')
    const result = adapted.create({})
    expect(typeof result.visitor.visitNode).toBe('function')
  })

  test('visitor has exitNode method', () => {
    const adapted = adaptPluginRule(createMockPluginRule(), 'en-rule')
    const result = adapted.create({})
    expect(typeof result.visitor.exitNode).toBe('function')
  })
})

describe('literal type mapping regression tests', () => {
  const literalMappings = [
    { kindName: 'NullKeyword', expectedType: 'Literal', expectedValue: null },
    { kindName: 'NumericLiteral', expectedType: 'Literal' },
    { kindName: 'StringLiteral', expectedType: 'Literal' },
    { kindName: 'BigIntLiteral', expectedType: 'Literal' },
    { kindName: 'TrueKeyword', expectedType: 'BooleanLiteral', expectedValue: true },
    { kindName: 'FalseKeyword', expectedType: 'BooleanLiteral', expectedValue: false },
    { kindName: 'RegularExpressionLiteral', expectedType: 'RegExpLiteral' },
  ]

  for (const { kindName, expectedType } of literalMappings) {
    test(`${kindName} dispatches as ${expectedType}`, () => {
      const handler = vi.fn()
      const pluginRule = createMockPluginRule({
        createVisitor: () => ({
          [expectedType]: handler,
        }),
      })

      const adapted = adaptPluginRule(pluginRule, 'literal-test')
      const result = adapted.create({})
      const mockNode = createMockNode({ kindName })

      result.visitor.visitNode?.(mockNode, createMockVisitorContext())

      expect(handler).toHaveBeenCalledTimes(1)
    })
  }

  test('NullKeyword dispatches as Literal (not NullLiteral)', () => {
    const nullLiteralHandler = vi.fn()
    const literalHandler = vi.fn()
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        NullLiteral: nullLiteralHandler,
        Literal: literalHandler,
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'null-test')
    const result = adapted.create({})
    const mockNode = createMockNode({ kindName: 'NullKeyword' })

    result.visitor.visitNode?.(mockNode, createMockVisitorContext())

    expect(literalHandler).toHaveBeenCalledTimes(1)
    expect(nullLiteralHandler).not.toHaveBeenCalled()
  })

  test('TrueKeyword dispatches as BooleanLiteral (not Literal)', () => {
    const literalHandler = vi.fn()
    const booleanHandler = vi.fn()
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        Literal: literalHandler,
        BooleanLiteral: booleanHandler,
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'bool-test')
    const result = adapted.create({})
    const mockNode = createMockNode({ kindName: 'TrueKeyword' })

    result.visitor.visitNode?.(mockNode, createMockVisitorContext())

    expect(booleanHandler).toHaveBeenCalledTimes(1)
    expect(literalHandler).not.toHaveBeenCalled()
  })

  test('RegularExpressionLiteral dispatches as RegExpLiteral (not Literal)', () => {
    const literalHandler = vi.fn()
    const regexHandler = vi.fn()
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        Literal: literalHandler,
        RegExpLiteral: regexHandler,
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'regex-test')
    const result = adapted.create({})
    const mockNode = createMockNode({ kindName: 'RegularExpressionLiteral', text: '/abc/g' })

    result.visitor.visitNode?.(mockNode, createMockVisitorContext())

    expect(regexHandler).toHaveBeenCalledTimes(1)
    expect(literalHandler).not.toHaveBeenCalled()
  })

  test('RegularExpressionLiteral exit dispatches as RegExpLiteral:exit', () => {
    const regexExitHandler = vi.fn()
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        'RegExpLiteral:exit': regexExitHandler,
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'regex-exit-test')
    const result = adapted.create({})
    const mockNode = createMockNode({ kindName: 'RegularExpressionLiteral', text: '/abc/g' })

    result.visitor.exitNode?.(mockNode, createMockVisitorContext())

    expect(regexExitHandler).toHaveBeenCalledTimes(1)
  })
})

describe('adapter integration tests with real ts-morph', () => {
  let project: import('ts-morph').Project

  beforeEach(() => {
    const { Project } = require('ts-morph')
    project = new Project({ useInMemoryFileSystem: true })
  })

  test('ImportDeclaration handler receives specifiers with local names', () => {
    const importHandler = vi.fn()
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        ImportDeclaration: importHandler,
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'import-test')
    const result = adapted.create({})

    const sf = project.createSourceFile('test.ts', `import { foo, bar } from 'mod';`)
    sf.forEachChild((node) => {
      if (node.getKindName() === 'ImportDeclaration') {
        result.visitor.visitNode?.(node, createMockVisitorContext({ sourceFile: sf }))
      }
    })

    expect(importHandler).toHaveBeenCalledTimes(1)
    const receivedNode = importHandler.mock.calls[0]![0] as Record<string, unknown>
    const specifiers = receivedNode.specifiers as Array<{ local?: { name?: string } }>
    expect(specifiers).toBeDefined()
    expect(specifiers).toHaveLength(2)
    expect(specifiers[0]!.local!.name).toBe('foo')
    expect(specifiers[1]!.local!.name).toBe('bar')
  })

  test('ImportDeclaration handler receives default import specifier', () => {
    const importHandler = vi.fn()
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        ImportDeclaration: importHandler,
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'import-default-test')
    const result = adapted.create({})

    const sf = project.createSourceFile('test.ts', `import React from 'react';`)
    sf.forEachChild((node) => {
      if (node.getKindName() === 'ImportDeclaration') {
        result.visitor.visitNode?.(node, createMockVisitorContext({ sourceFile: sf }))
      }
    })

    expect(importHandler).toHaveBeenCalledTimes(1)
    const receivedNode = importHandler.mock.calls[0]![0] as Record<string, unknown>
    const specifiers = receivedNode.specifiers as Array<{ type: string; local?: { name?: string } }>
    expect(specifiers).toBeDefined()
    expect(specifiers).toHaveLength(1)
    expect(specifiers[0]!.type).toBe('ImportDefaultSpecifier')
    expect(specifiers[0]!.local!.name).toBe('React')
  })

  test('ImportDeclaration handler receives namespace import specifier', () => {
    const importHandler = vi.fn()
    const pluginRule = createMockPluginRule({
      createVisitor: () => ({
        ImportDeclaration: importHandler,
      }),
    })

    const adapted = adaptPluginRule(pluginRule, 'import-namespace-test')
    const result = adapted.create({})

    const sf = project.createSourceFile('test.ts', `import * as utils from 'utils';`)
    sf.forEachChild((node) => {
      if (node.getKindName() === 'ImportDeclaration') {
        result.visitor.visitNode?.(node, createMockVisitorContext({ sourceFile: sf }))
      }
    })

    expect(importHandler).toHaveBeenCalledTimes(1)
    const receivedNode = importHandler.mock.calls[0]![0] as Record<string, unknown>
    const specifiers = receivedNode.specifiers as Array<{ type: string; local?: { name?: string } }>
    expect(specifiers).toBeDefined()
    expect(specifiers).toHaveLength(1)
    expect(specifiers[0]!.type).toBe('ImportNamespaceSpecifier')
    expect(specifiers[0]!.local!.name).toBe('utils')
  })
})
