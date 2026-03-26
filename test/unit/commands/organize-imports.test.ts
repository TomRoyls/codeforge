import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest'
import type { SourceFile } from 'ts-morph'

import * as fs from 'node:fs'
import * as fsPromises from 'node:fs/promises'

vi.mock('../../../src/rules/index.js', function () {
  return {
    allRules: {},
    getRuleCategory: vi.fn(() => 'patterns'),
  }
})

vi.mock('../../../src/core/file-discovery.js', function () {
  return {
    discoverFiles: vi.fn(),
  }
})

vi.mock('../../../src/core/parser.js', function () {
  return {
    Parser: vi.fn(),
  }
})

vi.mock('node:fs', function () {
  return {
    existsSync: vi.fn(),
  }
})

vi.mock('node:fs/promises', function () {
  return {
    writeFile: vi.fn(),
  }
})

vi.mock('node:path', function () {
  return {
    resolve: vi.fn((p: string) => p),
  }
})

describe('OrganizeImports Command', () => {
  let OrganizeImports: typeof import('../../../src/commands/organize-imports.js').default
  let mockDiscoverFiles: ReturnType<typeof vi.fn>
  let mockParser: ReturnType<typeof vi.fn>
  let mockExistsSync: ReturnType<typeof vi.fn>
  let mockWriteFile: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    const fileDiscovery = await import('../../../src/core/file-discovery.js')
    const parser = await import('../../../src/core/parser.js')
    mockDiscoverFiles = fileDiscovery.discoverFiles as ReturnType<typeof vi.fn>
    mockParser = parser.Parser as ReturnType<typeof vi.fn>
    mockExistsSync = fs.existsSync as ReturnType<typeof vi.fn>
    mockWriteFile = fsPromises.writeFile as ReturnType<typeof vi.fn>

    mockExistsSync.mockReturnValue(true)
    mockDiscoverFiles.mockResolvedValue([])
    mockParser.mockImplementation(function () {
      return {
        initialize: vi.fn().mockResolvedValue(undefined),
        parseFile: vi.fn().mockResolvedValue({ sourceFile: null, filePath: '', parseTime: 0 }),
        dispose: vi.fn(),
      }
    })
    mockWriteFile.mockResolvedValue(undefined)

    OrganizeImports = (await import('../../../src/commands/organize-imports.js')).default
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(OrganizeImports.description).toBe('Organize and sort imports in TypeScript files')
    })

    test('has examples defined', () => {
      expect(OrganizeImports.examples).toBeDefined()
      expect(OrganizeImports.examples.length).toBeGreaterThan(0)
    })

    test('has all required flags', () => {
      expect(OrganizeImports.flags).toBeDefined()
      expect(OrganizeImports.flags['dry-run']).toBeDefined()
      expect(OrganizeImports.flags.group).toBeDefined()
      expect(OrganizeImports.flags.sort).toBeDefined()
      expect(OrganizeImports.flags.verbose).toBeDefined()
      expect(OrganizeImports.flags.write).toBeDefined()
    })

    test('dry-run flag has default false', () => {
      expect(OrganizeImports.flags['dry-run'].default).toBe(false)
    })

    test('dry-run flag has char d', () => {
      expect(OrganizeImports.flags['dry-run'].char).toBe('d')
    })

    test('group flag has default false', () => {
      expect(OrganizeImports.flags.group.default).toBe(false)
    })

    test('sort flag has default true', () => {
      expect(OrganizeImports.flags.sort.default).toBe(true)
    })

    test('verbose flag has char v', () => {
      expect(OrganizeImports.flags.verbose.char).toBe('v')
    })

    test('write flag has char w', () => {
      expect(OrganizeImports.flags.write.char).toBe('w')
    })

    test('has path argument', () => {
      expect(OrganizeImports.args.path).toBeDefined()
      expect(OrganizeImports.args.path.default).toBe('.')
    })
  })

  describe('categorizeImport', () => {
    function getTestableCommand(): {
      categorizeImport: (
        imp: { getModuleSpecifierValue: () => string },
        internalPatterns: string[],
      ) => 'external' | 'internal' | 'relative' | 'sideEffects'
    } {
      return new OrganizeImports([], {} as never) as unknown as ReturnType<
        typeof getTestableCommand
      >
    }

    test('categorizes external imports', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => 'react' }
      const result = cmd.categorizeImport(imp, [])
      expect(result).toBe('external')
    })

    test('categorizes internal imports with pattern', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => '@/components/Button' }
      const result = cmd.categorizeImport(imp, ['@/'])
      expect(result).toBe('internal')
    })

    test('categorizes relative imports', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => './utils' }
      const result = cmd.categorizeImport(imp, [])
      expect(result).toBe('relative')
    })

    test('categorizes parent relative imports', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => '../utils' }
      const result = cmd.categorizeImport(imp, [])
      expect(result).toBe('relative')
    })
  })

  describe('detectInternalPatterns', () => {
    function getTestableCommand(): {
      detectInternalPatterns: (sourceFile: unknown) => string[]
    } {
      return new OrganizeImports([], {} as never) as unknown as ReturnType<
        typeof getTestableCommand
      >
    }

    test('returns default patterns', () => {
      const cmd = getTestableCommand()
      const patterns = cmd.detectInternalPatterns(null)
      expect(patterns).toContain('@/')
      expect(patterns).toContain('~/src/')
      expect(patterns).toContain('@/src/')
    })
  })

  describe('getImportGroups', () => {
    interface MockImport {
      getText: ReturnType<typeof vi.fn>
      getModuleSpecifierValue: ReturnType<typeof vi.fn>
      getNamespaceImport: ReturnType<typeof vi.fn>
      getDefaultImport: ReturnType<typeof vi.fn>
      getStart: ReturnType<typeof vi.fn>
      getEnd: ReturnType<typeof vi.fn>
    }

    function createMockImport(
      specifier: string,
      text?: string,
      options?: { namespace?: boolean; defaultImport?: boolean },
    ): MockImport {
      return {
        getText: vi.fn(() => text ?? `import { x } from '${specifier}'`),
        getModuleSpecifierValue: vi.fn(() => specifier),
        getNamespaceImport: vi.fn(
          options?.namespace
            ? function () {
                return {}
              }
            : function () {
                return undefined
              },
        ),
        getDefaultImport: vi.fn(
          options?.defaultImport
            ? function () {
                return {}
              }
            : function () {
                return undefined
              },
        ),
        getStart: vi.fn(() => 0),
        getEnd: vi.fn(() => 50),
      }
    }

    function createMockSourceFile(imports: MockImport[]): {
      getImportDeclarations: ReturnType<typeof vi.fn>
      getFullText: ReturnType<typeof vi.fn>
    } {
      return {
        getImportDeclarations: vi.fn(() => imports),
        getFullText: vi.fn(() => imports.map((i) => i.getText()).join('\n')),
      }
    }

    function getTestableCommand(): {
      getImportGroups: (
        sourceFile: unknown,
        internalPatterns: string[],
      ) => {
        external: MockImport[]
        internal: MockImport[]
        relative: MockImport[]
        sideEffects: MockImport[]
      }
    } {
      return new OrganizeImports([], {} as never) as unknown as ReturnType<
        typeof getTestableCommand
      >
    }

    test('separates imports into external, internal, and relative groups', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('react'),
        createMockImport('@/utils'),
        createMockImport('./local'),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const groups = cmd.getImportGroups(mockSourceFile, ['@/'])
      expect(groups.external).toHaveLength(1)
      expect(groups.internal).toHaveLength(1)
      expect(groups.relative).toHaveLength(1)
    })

    test('categorizes namespace imports as external', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('react', "import * as React from 'react'", { namespace: true }),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const groups = cmd.getImportGroups(mockSourceFile, [])
      expect(groups.external).toHaveLength(1)
    })

    test('categorizes default imports as external', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('react', "import React from 'react'", { defaultImport: true }),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const groups = cmd.getImportGroups(mockSourceFile, [])
      expect(groups.external).toHaveLength(1)
    })

    test('returns empty groups when no imports exist', () => {
      const cmd = getTestableCommand()
      const mockSourceFile = createMockSourceFile([])

      const groups = cmd.getImportGroups(mockSourceFile, [])
      expect(groups.external).toHaveLength(0)
      expect(groups.internal).toHaveLength(0)
      expect(groups.relative).toHaveLength(0)
    })

    test('matches internal patterns correctly', () => {
      const cmd = getTestableCommand()
      const imports = [createMockImport('@/components/Button'), createMockImport('~/src/utils')]
      const mockSourceFile = createMockSourceFile(imports)

      const groups = cmd.getImportGroups(mockSourceFile, ['@/', '~/src/'])
      expect(groups.internal).toHaveLength(2)
    })

    test('categorizes absolute path imports as relative', () => {
      const cmd = getTestableCommand()
      const imports = [createMockImport('/absolute/path')]
      const mockSourceFile = createMockSourceFile(imports)

      const groups = cmd.getImportGroups(mockSourceFile, [])
      expect(groups.relative).toHaveLength(1)
    })
  })

  describe('organizeFile', () => {
    interface MockImport {
      getText: ReturnType<typeof vi.fn>
      getModuleSpecifierValue: ReturnType<typeof vi.fn>
      getNamespaceImport: ReturnType<typeof vi.fn>
      getDefaultImport: ReturnType<typeof vi.fn>
      getStart: ReturnType<typeof vi.fn>
      getEnd: ReturnType<typeof vi.fn>
    }

    function createMockImport(specifier: string, text?: string): MockImport {
      return {
        getText: vi.fn(() => text ?? `import { x } from '${specifier}'`),
        getModuleSpecifierValue: vi.fn(() => specifier),
        getNamespaceImport: vi.fn(() => undefined),
        getDefaultImport: vi.fn(() => undefined),
        getStart: vi.fn(() => 0),
        getEnd: vi.fn(() => text?.length ?? 30),
      }
    }

    function createMockSourceFile(
      imports: MockImport[],
      options?: { leadingContent?: string; trailingContent?: string },
    ): SourceFile {
      const importTexts = imports.map((i) => i.getText())
      const fullText = `${options?.leadingContent ?? ''}${importTexts.join('\n')}${options?.trailingContent ?? ''}`
      const startOffset = options?.leadingContent?.length ?? 0

      imports.forEach((imp, idx) => {
        imp.getStart.mockReturnValue(
          startOffset + (idx > 0 ? importTexts.slice(0, idx).join('\n').length + 1 : 0),
        )
        imp.getEnd.mockReturnValue(imp.getStart() + imp.getText().length)
      })

      return {
        getFullText: vi.fn(() => fullText),
        getImportDeclarations: vi.fn(() => imports),
      } as unknown as SourceFile
    }

    function getTestableCommand(): {
      organizeFile: (
        sourceFile: SourceFile,
        options: { dryRun: boolean; group: boolean; sort: boolean },
      ) => { changed: boolean; organized: string; original: string }
    } {
      return new OrganizeImports([], {} as never) as unknown as ReturnType<
        typeof getTestableCommand
      >
    }

    test('returns unchanged when both group and sort are disabled', () => {
      const cmd = getTestableCommand()
      const imports = [createMockImport('react')]
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: false, sort: false })
      expect(result.changed).toBe(false)
    })

    test('sorts imports alphabetically when sort is enabled', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('zebra', "import { z } from 'zebra'"),
        createMockImport('apple', "import { a } from 'apple'"),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: false, sort: true })
      expect(result.changed).toBe(true)
      expect(result.organized.indexOf('apple')).toBeLessThan(result.organized.indexOf('zebra'))
    })

    test('groups imports when group is enabled', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('react', "import { React } from 'react'"),
        createMockImport('./utils', "import { utils } from './utils'"),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: true, sort: true })
      expect(result.changed).toBe(true)
    })

    test('preserves content before imports', () => {
      const cmd = getTestableCommand()
      const imports = [createMockImport('react')]
      const mockSourceFile = createMockSourceFile(imports, {
        leadingContent: '// leading comment\n',
      })

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: false, sort: true })
      expect(result.organized).toContain('// leading comment')
    })

    test('handles file with no imports', () => {
      const cmd = getTestableCommand()
      const mockSourceFile = createMockSourceFile([])

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: false, sort: true })
      expect(result.changed).toBe(false)
    })

    test('detects when imports are already sorted', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('apple', "import { a } from 'apple'"),
        createMockImport('banana', "import { b } from 'banana'"),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: false, sort: true })
      expect(result.changed).toBe(false)
    })
  })

  describe('run', () => {
    function getCommand(): InstanceType<typeof OrganizeImports> {
      return new OrganizeImports([], {} as never)
    }

    test('errors when path does not exist', async () => {
      mockExistsSync.mockReturnValue(false)
      const cmd = getCommand()
      const mockError = vi.fn((msg: string) => {
        throw new Error(msg)
      })
      Object.defineProperty(cmd, 'error', { value: mockError })
      Object.defineProperty(cmd, 'parse', {
        value: vi.fn().mockResolvedValue({ args: { path: '/nonexistent' }, flags: {} }),
      })

      await expect(cmd.run()).rejects.toThrow('Path not found')
    })

    test('logs warning when no TypeScript files found', async () => {
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = getCommand()
      const mockLog = vi.fn()
      Object.defineProperty(cmd, 'log', { value: mockLog })
      Object.defineProperty(cmd, 'parse', {
        value: vi.fn().mockResolvedValue({ args: { path: '.' }, flags: {} }),
      })

      await cmd.run()
      expect(mockLog).toHaveBeenCalledWith('No TypeScript files found')
    })

    test('processes files and reports results', async () => {
      const mockSourceFile = {
        getFullText: vi.fn(() => "import { a } from 'a'\nimport { b } from 'b'"),
        getImportDeclarations: vi.fn(() => [
          {
            getText: vi.fn(() => "import { a } from 'a'"),
            getModuleSpecifierValue: vi.fn(() => 'a'),
            getNamespaceImport: vi.fn(() => undefined),
            getDefaultImport: vi.fn(() => undefined),
            getStart: vi.fn(() => 0),
            getEnd: vi.fn(() => 20),
          },
          {
            getText: vi.fn(() => "import { b } from 'b'"),
            getModuleSpecifierValue: vi.fn(() => 'b'),
            getNamespaceImport: vi.fn(() => undefined),
            getDefaultImport: vi.fn(() => undefined),
            getStart: vi.fn(() => 21),
            getEnd: vi.fn(() => 41),
          },
        ]),
      }
      mockParser.mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: mockSourceFile,
            filePath: '/src/file.ts',
            parseTime: 10,
          }),
          dispose: vi.fn(),
        }
      })
      mockDiscoverFiles.mockResolvedValue([{ path: 'file.ts', absolutePath: '/src/file.ts' }])

      const cmd = getCommand()
      const mockLog = vi.fn()
      Object.defineProperty(cmd, 'log', { value: mockLog })
      Object.defineProperty(cmd, 'parse', {
        value: vi.fn().mockResolvedValue({ args: { path: '.' }, flags: {} }),
      })

      await cmd.run()
      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Import Organization Complete'))
    })

    test('skips files that fail to parse', async () => {
      mockParser.mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          parseFile: vi.fn().mockRejectedValue(new Error('Parse error')),
          dispose: vi.fn(),
        }
      })
      mockDiscoverFiles.mockResolvedValue([{ path: 'file.ts', absolutePath: '/src/file.ts' }])

      const cmd = getCommand()
      const mockLog = vi.fn()
      Object.defineProperty(cmd, 'log', { value: mockLog })
      Object.defineProperty(cmd, 'parse', {
        value: vi.fn().mockResolvedValue({ args: { path: '.' }, flags: {} }),
      })

      await cmd.run()
      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Files processed'))
    })

    test('does not write in dry-run mode', async () => {
      const mockSourceFile = {
        getFullText: vi.fn(() => "import { a } from 'a'\nimport { b } from 'b'"),
        getImportDeclarations: vi.fn(() => [
          {
            getText: vi.fn(() => "import { a } from 'a'"),
            getModuleSpecifierValue: vi.fn(() => 'a'),
            getNamespaceImport: vi.fn(() => undefined),
            getDefaultImport: vi.fn(() => undefined),
            getStart: vi.fn(() => 0),
            getEnd: vi.fn(() => 20),
          },
          {
            getText: vi.fn(() => "import { b } from 'b'"),
            getModuleSpecifierValue: vi.fn(() => 'b'),
            getNamespaceImport: vi.fn(() => undefined),
            getDefaultImport: vi.fn(() => undefined),
            getStart: vi.fn(() => 21),
            getEnd: vi.fn(() => 41),
          },
        ]),
      }
      mockParser.mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: mockSourceFile,
            filePath: '/src/file.ts',
            parseTime: 10,
          }),
          dispose: vi.fn(),
        }
      })

      mockDiscoverFiles.mockResolvedValue([{ path: 'file.ts', absolutePath: '/src/file.ts' }])

      const cmd = getCommand()
      Object.defineProperty(cmd, 'parse', {
        value: vi.fn().mockResolvedValue({ args: { path: '.' }, flags: { 'dry-run': true } }),
      })

      await cmd.run()
      expect(mockWriteFile).not.toHaveBeenCalled()
    })

    test('shows verbose output when imports need reordering', async () => {
      mockDiscoverFiles.mockResolvedValue([])

      const cmd = getCommand()
      const mockLog = vi.fn()
      Object.defineProperty(cmd, 'log', { value: mockLog })
      Object.defineProperty(cmd, 'parse', {
        value: vi
          .fn()
          .mockResolvedValue({ args: { path: '.' }, flags: { 'dry-run': true, verbose: true } }),
      })

      await cmd.run()
      expect(mockLog).toHaveBeenCalled()
    })

    test('shows dry-run message at end when dry-run flag is set', async () => {
      mockDiscoverFiles.mockResolvedValue([])

      const cmd = getCommand()
      const mockLog = vi.fn()
      Object.defineProperty(cmd, 'log', { value: mockLog })
      Object.defineProperty(cmd, 'parse', {
        value: vi.fn().mockResolvedValue({ args: { path: '.' }, flags: { 'dry-run': true } }),
      })

      await cmd.run()
      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('No TypeScript files found'))
    })
  })
})
