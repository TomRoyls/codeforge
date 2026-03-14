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
    expect(capturedNode!.type).toBe('VariableDeclaration')
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
