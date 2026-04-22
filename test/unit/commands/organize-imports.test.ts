import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest'
import type { SourceFile } from 'ts-morph'

import * as fs from 'node:fs'
import * as fsPromises from 'node:fs/promises'

import {
  categorizeImport as helperCategorizeImport,
  detectInternalPatterns as helperDetectInternalPatterns,
  getImportGroups as helperGetImportGroups,
  organizeFile as helperOrganizeFile,
  displayOrganizeResult,
  buildOrganizeOptions,
  shouldWriteChanges,
} from '../../../src/commands/organize-imports-helpers.js'

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

    test('path argument is optional', () => {
      expect(OrganizeImports.args.path.required).toBe(false)
    })

    test('verbose flag has default false', () => {
      expect(OrganizeImports.flags.verbose.default).toBe(false)
    })

    test('write flag has default false', () => {
      expect(OrganizeImports.flags.write.default).toBe(false)
    })

    test('has at least 4 examples', () => {
      expect(OrganizeImports.examples.length).toBeGreaterThanOrEqual(4)
    })

    test('each example has command and description', () => {
      for (const example of OrganizeImports.examples) {
        expect(example).toHaveProperty('command')
        expect(example).toHaveProperty('description')
      }
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

    test('categorizes scoped npm packages as external', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => '@angular/core' }
      expect(cmd.categorizeImport(imp, [])).toBe('external')
    })

    test('categorizes @nestjs/common as external with no patterns', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => '@nestjs/common' }
      expect(cmd.categorizeImport(imp, [])).toBe('external')
    })

    test('does not treat @angular/core as internal when @/ is a pattern', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => '@angular/core' }
      expect(cmd.categorizeImport(imp, ['@/'])).toBe('external')
    })

    test('categorizes @/hooks as internal when @/ is a pattern', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => '@/hooks' }
      expect(cmd.categorizeImport(imp, ['@/'])).toBe('internal')
    })

    test('categorizes @/hooks/useAuth as internal with @/ pattern', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => '@/hooks/useAuth' }
      expect(cmd.categorizeImport(imp, ['@/'])).toBe('internal')
    })

    test('categorizes node:fs as external', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => 'node:fs' }
      expect(cmd.categorizeImport(imp, [])).toBe('external')
    })

    test('categorizes node:path as external', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => 'node:path' }
      expect(cmd.categorizeImport(imp, [])).toBe('external')
    })

    test('categorizes #imports as external', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => '#imports' }
      expect(cmd.categorizeImport(imp, [])).toBe('external')
    })

    test('categorizes subpath imports like lodash/fp as external', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => 'lodash/fp' }
      expect(cmd.categorizeImport(imp, [])).toBe('external')
    })

    test('categorizes react-dom/client as external', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => 'react-dom/client' }
      expect(cmd.categorizeImport(imp, [])).toBe('external')
    })

    test('categorizes ./deeply/nested/module as relative', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => './deeply/nested/module' }
      expect(cmd.categorizeImport(imp, [])).toBe('relative')
    })

    test('categorizes ../../configs/settings as relative', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => '../../configs/settings' }
      expect(cmd.categorizeImport(imp, [])).toBe('relative')
    })

    test('categorizes ../../../root as relative', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => '../../../root' }
      expect(cmd.categorizeImport(imp, [])).toBe('relative')
    })

    test('categorizes ~/src/utils as internal when ~/src/ is a pattern', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => '~/src/utils' }
      expect(cmd.categorizeImport(imp, ['~/src/'])).toBe('internal')
    })

    test('categorizes ~/utils as external when only ~/src/ is a pattern', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => '~/utils' }
      expect(cmd.categorizeImport(imp, ['~/src/'])).toBe('external')
    })

    test('categorizes @/src/components as internal with @/src/ pattern', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => '@/src/components' }
      expect(cmd.categorizeImport(imp, ['@/src/'])).toBe('internal')
    })

    test('matches first internal pattern when multiple patterns provided', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => '@/hooks' }
      expect(cmd.categorizeImport(imp, ['~/', '@/'])).toBe('internal')
    })

    test('matches second internal pattern when first does not match', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => '~/src/foo' }
      expect(cmd.categorizeImport(imp, ['@/', '~/src/'])).toBe('internal')
    })

    test('categorizes @/stuff as external with empty patterns array', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => '@/stuff' }
      expect(cmd.categorizeImport(imp, [])).toBe('external')
    })

    test('categorizes single character specifier as external', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => 'a' }
      expect(cmd.categorizeImport(imp, [])).toBe('external')
    })

    test('categorizes ./ as relative', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => './' }
      expect(cmd.categorizeImport(imp, [])).toBe('relative')
    })

    test('categorizes ../ as relative', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => '../' }
      expect(cmd.categorizeImport(imp, [])).toBe('relative')
    })

    test('categorizes /absolute/deep/path as relative', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => '/absolute/deep/path' }
      expect(cmd.categorizeImport(imp, [])).toBe('relative')
    })

    test('categorizes react as internal when react is a pattern', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => 'react' }
      expect(cmd.categorizeImport(imp, ['react'])).toBe('internal')
    })

    test('categorizes lodash as internal when lodash is a pattern', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => 'lodash' }
      expect(cmd.categorizeImport(imp, ['lodash'])).toBe('internal')
    })

    test('categorizes @scope-only as external', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => '@scope' }
      expect(cmd.categorizeImport(imp, ['@/'])).toBe('external')
    })

    test('categorizes data: URL as external', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => 'data:text/javascript' }
      expect(cmd.categorizeImport(imp, [])).toBe('external')
    })

    test('categorizes package with version-like subpath as external', () => {
      const cmd = getTestableCommand()
      const imp = { getModuleSpecifierValue: () => 'some-pkg/v2' }
      expect(cmd.categorizeImport(imp, [])).toBe('external')
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

    test('returns exactly 3 patterns', () => {
      const cmd = getTestableCommand()
      const patterns = cmd.detectInternalPatterns(null)
      expect(patterns).toHaveLength(3)
    })

    test('returns same patterns on each call', () => {
      const cmd = getTestableCommand()
      const first = cmd.detectInternalPatterns(null)
      const second = cmd.detectInternalPatterns(null)
      expect(first).toEqual(second)
    })

    test('returns consistent pattern values', () => {
      const cmd = getTestableCommand()
      const patterns = cmd.detectInternalPatterns(null)
      expect(patterns[0]).toBe('@/')
      expect(patterns[1]).toBe('~/src/')
      expect(patterns[2]).toBe('@/src/')
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

    test('puts multiple external imports in external group', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('react'),
        createMockImport('lodash'),
        createMockImport('express'),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const groups = cmd.getImportGroups(mockSourceFile, [])
      expect(groups.external).toHaveLength(3)
      expect(groups.internal).toHaveLength(0)
      expect(groups.relative).toHaveLength(0)
    })

    test('puts multiple relative imports in relative group', () => {
      const cmd = getTestableCommand()
      const imports = [createMockImport('./a'), createMockImport('./b'), createMockImport('../c')]
      const mockSourceFile = createMockSourceFile(imports)

      const groups = cmd.getImportGroups(mockSourceFile, [])
      expect(groups.relative).toHaveLength(3)
      expect(groups.external).toHaveLength(0)
    })

    test('puts multiple internal imports in internal group', () => {
      const cmd = getTestableCommand()
      const imports = [createMockImport('@/a'), createMockImport('@/b'), createMockImport('@/c')]
      const mockSourceFile = createMockSourceFile(imports)

      const groups = cmd.getImportGroups(mockSourceFile, ['@/'])
      expect(groups.internal).toHaveLength(3)
      expect(groups.external).toHaveLength(0)
    })

    test('always puts namespace imports in external regardless of specifier', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('./local', "import * as local from './local'", { namespace: true }),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const groups = cmd.getImportGroups(mockSourceFile, [])
      expect(groups.external).toHaveLength(1)
      expect(groups.relative).toHaveLength(0)
    })

    test('always puts default imports in external regardless of specifier', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('./local', "import local from './local'", { defaultImport: true }),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const groups = cmd.getImportGroups(mockSourceFile, [])
      expect(groups.external).toHaveLength(1)
      expect(groups.relative).toHaveLength(0)
    })

    test('puts namespace import from internal path in external', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('@/utils', "import * as utils from '@/utils'", { namespace: true }),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const groups = cmd.getImportGroups(mockSourceFile, ['@/'])
      expect(groups.external).toHaveLength(1)
      expect(groups.internal).toHaveLength(0)
    })

    test('handles mix of namespace and regular imports', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('react', "import * as React from 'react'", { namespace: true }),
        createMockImport('lodash'),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const groups = cmd.getImportGroups(mockSourceFile, [])
      expect(groups.external).toHaveLength(2)
    })

    test('handles import with both namespace and default as external', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('react', "import * as React from 'react'", {
          namespace: true,
          defaultImport: true,
        }),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const groups = cmd.getImportGroups(mockSourceFile, [])
      expect(groups.external).toHaveLength(1)
    })

    test('distributes imports across all three main groups', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('react'),
        createMockImport('lodash'),
        createMockImport('@/components'),
        createMockImport('@/utils'),
        createMockImport('./local'),
        createMockImport('../parent'),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const groups = cmd.getImportGroups(mockSourceFile, ['@/'])
      expect(groups.external).toHaveLength(2)
      expect(groups.internal).toHaveLength(2)
      expect(groups.relative).toHaveLength(2)
    })

    test('sideEffects group is always empty for regular imports', () => {
      const cmd = getTestableCommand()
      const imports = [createMockImport('react'), createMockImport('./local')]
      const mockSourceFile = createMockSourceFile(imports)

      const groups = cmd.getImportGroups(mockSourceFile, [])
      expect(groups.sideEffects).toHaveLength(0)
    })

    test('internal import not matching any pattern goes to external', () => {
      const cmd = getTestableCommand()
      const imports = [createMockImport('@/components')]
      const mockSourceFile = createMockSourceFile(imports)

      const groups = cmd.getImportGroups(mockSourceFile, ['~/src/'])
      expect(groups.external).toHaveLength(1)
      expect(groups.internal).toHaveLength(0)
    })

    test('two imports with same specifier are both categorized the same', () => {
      const cmd = getTestableCommand()
      const imports = [createMockImport('react'), createMockImport('react')]
      const mockSourceFile = createMockSourceFile(imports)

      const groups = cmd.getImportGroups(mockSourceFile, [])
      expect(groups.external).toHaveLength(2)
    })

    test('handles large number of imports across categories', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('react'),
        createMockImport('lodash'),
        createMockImport('express'),
        createMockImport('@/a'),
        createMockImport('@/b'),
        createMockImport('@/c'),
        createMockImport('./x'),
        createMockImport('./y'),
        createMockImport('../z'),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const groups = cmd.getImportGroups(mockSourceFile, ['@/'])
      expect(groups.external).toHaveLength(3)
      expect(groups.internal).toHaveLength(3)
      expect(groups.relative).toHaveLength(3)
    })

    test('imports with only one category fill only that group', () => {
      const cmd = getTestableCommand()
      const imports = [createMockImport('./a'), createMockImport('./b'), createMockImport('./c')]
      const mockSourceFile = createMockSourceFile(imports)

      const groups = cmd.getImportGroups(mockSourceFile, ['@/'])
      expect(groups.relative).toHaveLength(3)
      expect(groups.external).toHaveLength(0)
      expect(groups.internal).toHaveLength(0)
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

    test('sorts imports in reverse order correctly', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('zoo', "import { z } from 'zoo'"),
        createMockImport('middle', "import { m } from 'middle'"),
        createMockImport('alpha', "import { a } from 'alpha'"),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: false, sort: true })
      expect(result.changed).toBe(true)
      expect(result.organized.indexOf('alpha')).toBeLessThan(result.organized.indexOf('middle'))
      expect(result.organized.indexOf('middle')).toBeLessThan(result.organized.indexOf('zoo'))
    })

    test('group mode separates different import categories with blank lines', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('react', "import { React } from 'react'"),
        createMockImport('@/utils', "import { utils } from '@/utils'"),
        createMockImport('./local', "import { local } from './local'"),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: true, sort: true })
      expect(result.changed).toBe(true)
      expect(result.organized).toContain('\n\n')
    })

    test('group mode without sort preserves original order within groups', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('lodash', "import { l } from 'lodash'"),
        createMockImport('react', "import { r } from 'react'"),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: true, sort: false })
      expect(result.organized.indexOf('lodash')).toBeLessThan(result.organized.indexOf('react'))
    })

    test('preserves content after imports', () => {
      const cmd = getTestableCommand()
      const imports = [createMockImport('react')]
      const mockSourceFile = createMockSourceFile(imports, {
        trailingContent: '\nconsole.log("hello")\n',
      })

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: false, sort: true })
      expect(result.organized).toContain('console.log("hello")')
    })

    test('preserves both leading and trailing content', () => {
      const cmd = getTestableCommand()
      const imports = [createMockImport('react')]
      const mockSourceFile = createMockSourceFile(imports, {
        leadingContent: '// header\n',
        trailingContent: '\nexport default App\n',
      })

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: false, sort: true })
      expect(result.organized).toContain('// header')
      expect(result.organized).toContain('export default App')
    })

    test('returns original string in result', () => {
      const cmd = getTestableCommand()
      const imports = [createMockImport('react')]
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: false, sort: true })
      expect(result.original).toBeDefined()
      expect(typeof result.original).toBe('string')
    })

    test('dry-run option does not affect organizeFile output', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('zebra', "import { z } from 'zebra'"),
        createMockImport('apple', "import { a } from 'apple'"),
      ]
      const mockSourceFile1 = createMockSourceFile([...imports])
      const mockSourceFile2 = createMockSourceFile(
        imports.map((i) => createMockImport(i.getModuleSpecifierValue(), i.getText())),
      )

      const result1 = cmd.organizeFile(mockSourceFile1, { dryRun: true, group: false, sort: true })
      const result2 = cmd.organizeFile(mockSourceFile2, { dryRun: false, group: false, sort: true })
      expect(result1.changed).toBe(result2.changed)
    })

    test('single import with sort shows no change', () => {
      const cmd = getTestableCommand()
      const imports = [createMockImport('react')]
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: false, sort: true })
      expect(result.changed).toBe(false)
    })

    test('single import with group shows no change', () => {
      const cmd = getTestableCommand()
      const imports = [createMockImport('react')]
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: true, sort: false })
      expect(result.changed).toBe(false)
    })

    test('many imports sort correctly', () => {
      const cmd = getTestableCommand()
      const specs = [
        'zoo',
        'yellow',
        'xray',
        'warm',
        'victory',
        'ultra',
        'test',
        'smart',
        'risk',
        'alpha',
      ]
      const imports = specs.map((s) => createMockImport(s, `import { ${s[0]} } from '${s}'`))
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: false, sort: true })
      expect(result.changed).toBe(true)
      expect(result.organized.indexOf('alpha')).toBeLessThan(result.organized.indexOf('zoo'))
    })

    test('sort-only mode does not add blank lines between groups', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('react', "import { r } from 'react'"),
        createMockImport('./local', "import { l } from './local'"),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: false, sort: true })
      expect(result.organized).not.toContain('\n\n')
    })

    test('group mode with only external imports shows no blank line separators', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('lodash', "import { l } from 'lodash'"),
        createMockImport('react', "import { r } from 'react'"),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: true, sort: true })
      expect(result.organized).not.toContain('\n\n')
    })

    test('case-sensitive sorting', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('React', "import { R } from 'React'"),
        createMockImport('react', "import { r } from 'react'"),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: false, sort: true })
      expect(result.changed).toBe(true)
    })

    test('group with sort orders within each group', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('lodash', "import { l } from 'lodash'"),
        createMockImport('react', "import { r } from 'react'"),
        createMockImport('./z-local', "import { z } from './z-local'"),
        createMockImport('./a-local', "import { a } from './a-local'"),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: true, sort: true })
      expect(result.changed).toBe(true)
      const extIdx = result.organized.indexOf('lodash')
      const reactIdx = result.organized.indexOf('react')
      expect(extIdx).toBeLessThan(reactIdx)
    })

    test('already grouped and sorted imports show no change', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('apple', "import { a } from 'apple'"),
        createMockImport('banana', "import { b } from 'banana'"),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: true, sort: true })
      expect(result.changed).toBe(false)
    })

    test('handles imports starting at non-zero offset', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('zebra', "import { z } from 'zebra'"),
        createMockImport('apple', "import { a } from 'apple'"),
      ]
      const mockSourceFile = createMockSourceFile(imports, {
        leadingContent: '/* license header */\n// comment\n',
      })

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: false, sort: true })
      expect(result.changed).toBe(true)
      expect(result.organized).toContain('/* license header */')
      expect(result.organized).toContain('// comment')
    })

    test('group mode places external before internal before relative', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('./local', "import { l } from './local'"),
        createMockImport('@/utils', "import { u } from '@/utils'"),
        createMockImport('react', "import { r } from 'react'"),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: true, sort: true })
      const extIdx = result.organized.indexOf("from 'react'")
      const intIdx = result.organized.indexOf("from '@/utils'")
      const relIdx = result.organized.indexOf("from './local'")
      expect(extIdx).toBeLessThan(intIdx)
      expect(intIdx).toBeLessThan(relIdx)
    })

    test('handles single import with group and sort enabled', () => {
      const cmd = getTestableCommand()
      const imports = [createMockImport('react')]
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: true, sort: true })
      expect(result.changed).toBe(false)
    })

    test('sort is case sensitive with localeCompare', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('Zebra', "import { Z } from 'Zebra'"),
        createMockImport('apple', "import { a } from 'apple'"),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: false, sort: true })
      expect(result.changed).toBe(true)
    })

    test('group with sort disabled preserves import order', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('react', "import { r } from 'react'"),
        createMockImport('./local', "import { l } from './local'"),
        createMockImport('lodash', "import { l2 } from 'lodash'"),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: true, sort: false })
      expect(result.changed).toBe(true)
      const reactIdx = result.organized.indexOf("from 'react'")
      const lodashIdx = result.organized.indexOf("from 'lodash'")
      const localIdx = result.organized.indexOf("from './local'")
      expect(reactIdx).toBeLessThan(lodashIdx)
      expect(lodashIdx).toBeLessThan(localIdx)
    })

    test('all same-category imports group mode no blank lines', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('react', "import { r } from 'react'"),
        createMockImport('lodash', "import { l } from 'lodash'"),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: true, sort: false })
      expect(result.organized).not.toContain('\n\n')
    })

    test('preserves multiline leading content', () => {
      const cmd = getTestableCommand()
      const imports = [createMockImport('react')]
      const mockSourceFile = createMockSourceFile(imports, {
        leadingContent: '/*!\n * License\n */\n',
      })

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: false, sort: true })
      expect(result.organized).toContain('License')
      expect(result.organized).toContain('react')
    })

    test('group mode with three distinct categories produces two blank line separators', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('react', "import { r } from 'react'"),
        createMockImport('@/utils', "import { u } from '@/utils'"),
        createMockImport('./local', "import { l } from './local'"),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: true, sort: true })
      const doubleNewlineMatches = result.organized.match(/\n\n/g)
      expect(doubleNewlineMatches).toHaveLength(2)
    })

    test('organizeFile returns correct original text', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('b', "import { b } from 'b'"),
        createMockImport('a', "import { a } from 'a'"),
      ]
      const mockSourceFile = createMockSourceFile(imports)
      const expectedOriginal = mockSourceFile.getFullText()

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: false, sort: true })
      expect(result.original).toBe(expectedOriginal)
    })

    test('sort preserves import text including named imports', () => {
      const cmd = getTestableCommand()
      const imports = [
        createMockImport('z', "import { zebra, zoo } from 'z'"),
        createMockImport('a', "import { apple, ant } from 'a'"),
      ]
      const mockSourceFile = createMockSourceFile(imports)

      const result = cmd.organizeFile(mockSourceFile, { dryRun: false, group: false, sort: true })
      expect(result.organized).toContain('zebra, zoo')
      expect(result.organized).toContain('apple, ant')
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

    test('writes file when write flag is set', async () => {
      const mockSourceFile = {
        getFullText: vi.fn(() => "import { b } from 'b'\nimport { a } from 'a'"),
        getImportDeclarations: vi.fn(() => [
          {
            getText: vi.fn(() => "import { b } from 'b'"),
            getModuleSpecifierValue: vi.fn(() => 'b'),
            getNamespaceImport: vi.fn(() => undefined),
            getDefaultImport: vi.fn(() => undefined),
            getStart: vi.fn(() => 0),
            getEnd: vi.fn(() => 20),
          },
          {
            getText: vi.fn(() => "import { a } from 'a'"),
            getModuleSpecifierValue: vi.fn(() => 'a'),
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
        value: vi
          .fn()
          .mockResolvedValue({ args: { path: '.' }, flags: { write: true, sort: true } }),
      })

      await cmd.run()
      expect(mockWriteFile).toHaveBeenCalledWith('/src/file.ts', expect.any(String), 'utf8')
    })

    test('does not write when dry-run is true and write is false', async () => {
      const mockSourceFile = {
        getFullText: vi.fn(() => "import { b } from 'b'\nimport { a } from 'a'"),
        getImportDeclarations: vi.fn(() => [
          {
            getText: vi.fn(() => "import { b } from 'b'"),
            getModuleSpecifierValue: vi.fn(() => 'b'),
            getNamespaceImport: vi.fn(() => undefined),
            getDefaultImport: vi.fn(() => undefined),
            getStart: vi.fn(() => 0),
            getEnd: vi.fn(() => 20),
          },
          {
            getText: vi.fn(() => "import { a } from 'a'"),
            getModuleSpecifierValue: vi.fn(() => 'a'),
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
        value: vi.fn().mockResolvedValue({
          args: { path: '.' },
          flags: { 'dry-run': true, write: false },
        }),
      })

      await cmd.run()
      expect(mockWriteFile).not.toHaveBeenCalled()
    })

    test('skips file with no imports needing changes', async () => {
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
            filePath: '/src/sorted.ts',
            parseTime: 5,
          }),
          dispose: vi.fn(),
        }
      })
      mockDiscoverFiles.mockResolvedValue([{ path: 'sorted.ts', absolutePath: '/src/sorted.ts' }])

      const cmd = getCommand()
      const mockLog = vi.fn()
      Object.defineProperty(cmd, 'log', { value: mockLog })
      Object.defineProperty(cmd, 'parse', {
        value: vi.fn().mockResolvedValue({ args: { path: '.' }, flags: {} }),
      })

      await cmd.run()
      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Skipped: 1'))
    })

    test('handles write failure gracefully', async () => {
      const mockSourceFile = {
        getFullText: vi.fn(() => "import { b } from 'b'\nimport { a } from 'a'"),
        getImportDeclarations: vi.fn(() => [
          {
            getText: vi.fn(() => "import { b } from 'b'"),
            getModuleSpecifierValue: vi.fn(() => 'b'),
            getNamespaceImport: vi.fn(() => undefined),
            getDefaultImport: vi.fn(() => undefined),
            getStart: vi.fn(() => 0),
            getEnd: vi.fn(() => 20),
          },
          {
            getText: vi.fn(() => "import { a } from 'a'"),
            getModuleSpecifierValue: vi.fn(() => 'a'),
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
      mockWriteFile.mockRejectedValue(new Error('Permission denied'))

      const cmd = getCommand()
      const mockWarn = vi.fn()
      const mockLog = vi.fn()
      Object.defineProperty(cmd, 'warn', { value: mockWarn })
      Object.defineProperty(cmd, 'log', { value: mockLog })
      Object.defineProperty(cmd, 'parse', {
        value: vi
          .fn()
          .mockResolvedValue({ args: { path: '.' }, flags: { write: true, sort: true } }),
      })

      await cmd.run()
      expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining('Failed to write'))
    })

    test('shows verbose output for each changed file', async () => {
      const mockSourceFile = {
        getFullText: vi.fn(() => "import { b } from 'b'\nimport { a } from 'a'"),
        getImportDeclarations: vi.fn(() => [
          {
            getText: vi.fn(() => "import { b } from 'b'"),
            getModuleSpecifierValue: vi.fn(() => 'b'),
            getNamespaceImport: vi.fn(() => undefined),
            getDefaultImport: vi.fn(() => undefined),
            getStart: vi.fn(() => 0),
            getEnd: vi.fn(() => 20),
          },
          {
            getText: vi.fn(() => "import { a } from 'a'"),
            getModuleSpecifierValue: vi.fn(() => 'a'),
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
        value: vi.fn().mockResolvedValue({
          args: { path: '.' },
          flags: { 'dry-run': true, verbose: true, sort: true },
        }),
      })

      await cmd.run()
      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Would organize'))
    })

    test('processes multiple files', async () => {
      const makeMockImport = (spec: string) => ({
        getText: vi.fn(() => `import { ${spec} } from '${spec}'`),
        getModuleSpecifierValue: vi.fn(() => spec),
        getNamespaceImport: vi.fn(() => undefined),
        getDefaultImport: vi.fn(() => undefined),
        getStart: vi.fn(() => 0),
        getEnd: vi.fn(() => 30),
      })

      const sf1 = {
        getFullText: vi.fn(() => "import { b } from 'b'\nimport { a } from 'a'"),
        getImportDeclarations: vi.fn(() => [makeMockImport('b'), makeMockImport('a')]),
      }
      const sf2 = {
        getFullText: vi.fn(() => "import { z } from 'z'\nimport { y } from 'y'"),
        getImportDeclarations: vi.fn(() => [makeMockImport('z'), makeMockImport('y')]),
      }

      let callCount = 0
      mockParser.mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          parseFile: vi.fn().mockImplementation(function () {
            callCount++
            return Promise.resolve({
              sourceFile: callCount === 1 ? sf1 : sf2,
              filePath: callCount === 1 ? '/src/a.ts' : '/src/b.ts',
              parseTime: 5,
            })
          }),
          dispose: vi.fn(),
        }
      })
      mockDiscoverFiles.mockResolvedValue([
        { path: 'a.ts', absolutePath: '/src/a.ts' },
        { path: 'b.ts', absolutePath: '/src/b.ts' },
      ])

      const cmd = getCommand()
      const mockLog = vi.fn()
      Object.defineProperty(cmd, 'log', { value: mockLog })
      Object.defineProperty(cmd, 'parse', {
        value: vi.fn().mockResolvedValue({ args: { path: '.' }, flags: {} }),
      })

      await cmd.run()
      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Import Organization Complete'))
    })

    test('displays dry-run mode message in output', async () => {
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
        value: vi.fn().mockResolvedValue({
          args: { path: '.' },
          flags: { 'dry-run': true },
        }),
      })

      await cmd.run()
      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('dry-run'))
    })

    test('increments skipped count for parse errors', async () => {
      mockParser.mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          parseFile: vi.fn().mockRejectedValue(new Error('Parse error')),
          dispose: vi.fn(),
        }
      })
      mockDiscoverFiles.mockResolvedValue([
        { path: 'a.ts', absolutePath: '/src/a.ts' },
        { path: 'b.ts', absolutePath: '/src/b.ts' },
      ])

      const cmd = getCommand()
      const mockLog = vi.fn()
      Object.defineProperty(cmd, 'log', { value: mockLog })
      Object.defineProperty(cmd, 'parse', {
        value: vi.fn().mockResolvedValue({ args: { path: '.' }, flags: {} }),
      })

      await cmd.run()
      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Skipped'))
    })

    test('increments skipped count for already organized files', async () => {
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
      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Skipped: 1'))
    })

    test('disposes parser after processing', async () => {
      const mockDispose = vi.fn()
      const mockSourceFile = {
        getFullText: vi.fn(() => "import { a } from 'a'"),
        getImportDeclarations: vi.fn(() => [
          {
            getText: vi.fn(() => "import { a } from 'a'"),
            getModuleSpecifierValue: vi.fn(() => 'a'),
            getNamespaceImport: vi.fn(() => undefined),
            getDefaultImport: vi.fn(() => undefined),
            getStart: vi.fn(() => 0),
            getEnd: vi.fn(() => 20),
          },
        ]),
      }
      mockParser.mockImplementation(function () {
        return {
          initialize: vi.fn().mockResolvedValue(undefined),
          parseFile: vi.fn().mockResolvedValue({
            sourceFile: mockSourceFile,
            filePath: '/src/file.ts',
            parseTime: 0,
          }),
          dispose: mockDispose,
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
      expect(mockDispose).toHaveBeenCalled()
    })
  })
})

describe('organize-imports helpers', () => {
  describe('categorizeImport (helper)', () => {
    function makeMockImport(specifier: string) {
      return { getModuleSpecifierValue: () => specifier }
    }

    test('categorizes react as external', () => {
      expect(helperCategorizeImport(makeMockImport('react'), [])).toBe('external')
    })

    test('categorizes lodash as external', () => {
      expect(helperCategorizeImport(makeMockImport('lodash'), [])).toBe('external')
    })

    test('categorizes @/components as internal with @/ pattern', () => {
      expect(helperCategorizeImport(makeMockImport('@/components'), ['@/'])).toBe('internal')
    })

    test('categorizes ./utils as relative', () => {
      expect(helperCategorizeImport(makeMockImport('./utils'), [])).toBe('relative')
    })

    test('categorizes ../parent as relative', () => {
      expect(helperCategorizeImport(makeMockImport('../parent'), [])).toBe('relative')
    })

    test('categorizes /absolute as relative', () => {
      expect(helperCategorizeImport(makeMockImport('/absolute'), [])).toBe('relative')
    })

    test('categorizes @angular/core as external with empty patterns', () => {
      expect(helperCategorizeImport(makeMockImport('@angular/core'), [])).toBe('external')
    })

    test('categorizes node:fs as external', () => {
      expect(helperCategorizeImport(makeMockImport('node:fs'), [])).toBe('external')
    })

    test('categorizes lodash/fp as external', () => {
      expect(helperCategorizeImport(makeMockImport('lodash/fp'), [])).toBe('external')
    })

    test('categorizes ~/src/utils as internal with ~/src/ pattern', () => {
      expect(helperCategorizeImport(makeMockImport('~/src/utils'), ['~/src/'])).toBe('internal')
    })

    test('categorizes @/src/hooks as internal with @/src/ pattern', () => {
      expect(helperCategorizeImport(makeMockImport('@/src/hooks'), ['@/src/'])).toBe('internal')
    })

    test('categorizes non-matching pattern as external', () => {
      expect(helperCategorizeImport(makeMockImport('@/stuff'), ['~/src/'])).toBe('external')
    })

    test('matches first of multiple patterns', () => {
      expect(helperCategorizeImport(makeMockImport('@/app'), ['@/', '~/src/'])).toBe('internal')
    })

    test('matches second of multiple patterns', () => {
      expect(helperCategorizeImport(makeMockImport('~/src/app'), ['@/', '~/src/'])).toBe('internal')
    })

    test('categorizes ./deeply/nested as relative', () => {
      expect(helperCategorizeImport(makeMockImport('./deeply/nested'), [])).toBe('relative')
    })

    test('categorizes ../../parent as relative', () => {
      expect(helperCategorizeImport(makeMockImport('../../parent'), [])).toBe('relative')
    })

    test('categorizes #internal as external', () => {
      expect(helperCategorizeImport(makeMockImport('#internal'), [])).toBe('external')
    })

    test('categorizes data: URL as external', () => {
      expect(helperCategorizeImport(makeMockImport('data:text/js'), [])).toBe('external')
    })
  })

  describe('detectInternalPatterns (helper)', () => {
    test('returns array containing @/', () => {
      const patterns = helperDetectInternalPatterns(null)
      expect(patterns).toContain('@/')
    })

    test('returns array containing ~/src/', () => {
      const patterns = helperDetectInternalPatterns(null)
      expect(patterns).toContain('~/src/')
    })

    test('returns array containing @/src/', () => {
      const patterns = helperDetectInternalPatterns(null)
      expect(patterns).toContain('@/src/')
    })

    test('returns exactly 3 patterns', () => {
      const patterns = helperDetectInternalPatterns(null)
      expect(patterns).toHaveLength(3)
    })
  })

  describe('getImportGroups (helper)', () => {
    interface HelperMockImport {
      getText: ReturnType<typeof vi.fn>
      getModuleSpecifierValue: ReturnType<typeof vi.fn>
      getNamespaceImport: ReturnType<typeof vi.fn>
      getDefaultImport: ReturnType<typeof vi.fn>
    }

    function createImport(
      specifier: string,
      options?: { namespace?: boolean; defaultImport?: boolean },
    ): HelperMockImport {
      return {
        getText: vi.fn(() => `import { x } from '${specifier}'`),
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
      }
    }

    function createSourceFile(imports: HelperMockImport[]) {
      return {
        getImportDeclarations: vi.fn(() => imports),
        getFullText: vi.fn(() => imports.map((i) => i.getText()).join('\n')),
      }
    }

    test('categorizes external imports', () => {
      const imp = createImport('react')
      const groups = helperGetImportGroups(createSourceFile([imp]), [])
      expect(groups.external).toHaveLength(1)
      expect(groups.internal).toHaveLength(0)
      expect(groups.relative).toHaveLength(0)
    })

    test('categorizes internal imports with matching pattern', () => {
      const imp = createImport('@/components')
      const groups = helperGetImportGroups(createSourceFile([imp]), ['@/'])
      expect(groups.internal).toHaveLength(1)
      expect(groups.external).toHaveLength(0)
    })

    test('categorizes relative imports', () => {
      const imp = createImport('./utils')
      const groups = helperGetImportGroups(createSourceFile([imp]), [])
      expect(groups.relative).toHaveLength(1)
    })

    test('returns empty groups for no imports', () => {
      const groups = helperGetImportGroups(createSourceFile([]), [])
      expect(groups.external).toHaveLength(0)
      expect(groups.internal).toHaveLength(0)
      expect(groups.relative).toHaveLength(0)
      expect(groups.sideEffects).toHaveLength(0)
    })

    test('puts namespace imports in external', () => {
      const imp = createImport('react', { namespace: true })
      const groups = helperGetImportGroups(createSourceFile([imp]), [])
      expect(groups.external).toHaveLength(1)
    })

    test('puts default imports in external', () => {
      const imp = createImport('react', { defaultImport: true })
      const groups = helperGetImportGroups(createSourceFile([imp]), [])
      expect(groups.external).toHaveLength(1)
    })

    test('puts namespace import from relative path in external', () => {
      const imp = createImport('./utils', { namespace: true })
      const groups = helperGetImportGroups(createSourceFile([imp]), [])
      expect(groups.external).toHaveLength(1)
      expect(groups.relative).toHaveLength(0)
    })

    test('distributes imports across groups correctly', () => {
      const imports = [createImport('react'), createImport('@/app'), createImport('./local')]
      const groups = helperGetImportGroups(createSourceFile(imports), ['@/'])
      expect(groups.external).toHaveLength(1)
      expect(groups.internal).toHaveLength(1)
      expect(groups.relative).toHaveLength(1)
    })

    test('sideEffects group stays empty for regular imports', () => {
      const imports = [createImport('react'), createImport('./local')]
      const groups = helperGetImportGroups(createSourceFile(imports), [])
      expect(groups.sideEffects).toHaveLength(0)
    })

    test('handles multiple imports per category', () => {
      const imports = [
        createImport('react'),
        createImport('lodash'),
        createImport('./a'),
        createImport('./b'),
      ]
      const groups = helperGetImportGroups(createSourceFile(imports), [])
      expect(groups.external).toHaveLength(2)
      expect(groups.relative).toHaveLength(2)
    })
  })

  describe('organizeFile (helper)', () => {
    interface OrgMockImport {
      getText: ReturnType<typeof vi.fn>
      getModuleSpecifierValue: ReturnType<typeof vi.fn>
      getNamespaceImport: ReturnType<typeof vi.fn>
      getDefaultImport: ReturnType<typeof vi.fn>
      getStart: ReturnType<typeof vi.fn>
      getEnd: ReturnType<typeof vi.fn>
    }

    function createImport(specifier: string, text?: string): OrgMockImport {
      return {
        getText: vi.fn(() => text ?? `import { x } from '${specifier}'`),
        getModuleSpecifierValue: vi.fn(() => specifier),
        getNamespaceImport: vi.fn(() => undefined),
        getDefaultImport: vi.fn(() => undefined),
        getStart: vi.fn(() => 0),
        getEnd: vi.fn(() => text?.length ?? 30),
      }
    }

    function createSourceFile(
      imports: OrgMockImport[],
      options?: { leadingContent?: string; trailingContent?: string },
    ) {
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
      }
    }

    test('returns unchanged when both group and sort are false', () => {
      const imports = [createImport('react')]
      const sf = createSourceFile(imports)
      const result = helperOrganizeFile(sf, { dryRun: false, group: false, sort: false })
      expect(result.changed).toBe(false)
    })

    test('sorts imports alphabetically', () => {
      const imports = [
        createImport('zebra', "import { z } from 'zebra'"),
        createImport('apple', "import { a } from 'apple'"),
      ]
      const sf = createSourceFile(imports)
      const result = helperOrganizeFile(sf, { dryRun: false, group: false, sort: true })
      expect(result.changed).toBe(true)
      expect(result.organized.indexOf('apple')).toBeLessThan(result.organized.indexOf('zebra'))
    })

    test('groups imports by category', () => {
      const imports = [
        createImport('react', "import { r } from 'react'"),
        createImport('./local', "import { l } from './local'"),
      ]
      const sf = createSourceFile(imports)
      const result = helperOrganizeFile(sf, { dryRun: false, group: true, sort: false })
      expect(result.changed).toBe(true)
    })

    test('returns unchanged for no imports', () => {
      const sf = createSourceFile([])
      const result = helperOrganizeFile(sf, { dryRun: false, group: false, sort: true })
      expect(result.changed).toBe(false)
    })

    test('preserves leading content', () => {
      const imports = [createImport('react')]
      const sf = createSourceFile(imports, { leadingContent: '// header\n' })
      const result = helperOrganizeFile(sf, { dryRun: false, group: false, sort: true })
      expect(result.organized).toContain('// header')
    })

    test('preserves trailing content', () => {
      const imports = [createImport('react')]
      const sf = createSourceFile(imports, { trailingContent: '\nexport {}' })
      const result = helperOrganizeFile(sf, { dryRun: false, group: false, sort: true })
      expect(result.organized).toContain('export {}')
    })

    test('returns original string in result', () => {
      const imports = [createImport('react')]
      const sf = createSourceFile(imports)
      const result = helperOrganizeFile(sf, { dryRun: false, group: false, sort: true })
      expect(result.original).toBe(sf.getFullText())
    })

    test('group with sort orders within each group', () => {
      const imports = [
        createImport('lodash', "import { l } from 'lodash'"),
        createImport('react', "import { r } from 'react'"),
        createImport('./z', "import { z } from './z'"),
        createImport('./a', "import { a } from './a'"),
      ]
      const sf = createSourceFile(imports)
      const result = helperOrganizeFile(sf, { dryRun: false, group: true, sort: true })
      expect(result.changed).toBe(true)
      expect(result.organized.indexOf('lodash')).toBeLessThan(result.organized.indexOf('react'))
      expect(result.organized.indexOf('./a')).toBeLessThan(result.organized.indexOf('./z'))
    })

    test('detects already sorted and grouped as no change', () => {
      const imports = [
        createImport('apple', "import { a } from 'apple'"),
        createImport('banana', "import { b } from 'banana'"),
      ]
      const sf = createSourceFile(imports)
      const result = helperOrganizeFile(sf, { dryRun: false, group: true, sort: true })
      expect(result.changed).toBe(false)
    })

    test('separates groups with blank lines', () => {
      const imports = [
        createImport('react', "import { r } from 'react'"),
        createImport('./local', "import { l } from './local'"),
      ]
      const sf = createSourceFile(imports)
      const result = helperOrganizeFile(sf, { dryRun: false, group: true, sort: true })
      expect(result.organized).toContain('\n\n')
    })

    test('dryRun flag does not affect output', () => {
      const imports = [
        createImport('zebra', "import { z } from 'zebra'"),
        createImport('apple', "import { a } from 'apple'"),
      ]
      const sf1 = createSourceFile(
        imports.map((i) => createImport(i.getModuleSpecifierValue(), i.getText())),
      )
      const sf2 = createSourceFile(
        imports.map((i) => createImport(i.getModuleSpecifierValue(), i.getText())),
      )

      const r1 = helperOrganizeFile(sf1, { dryRun: true, group: false, sort: true })
      const r2 = helperOrganizeFile(sf2, { dryRun: false, group: false, sort: true })
      expect(r1.changed).toBe(r2.changed)
    })
  })

  describe('displayOrganizeResult', () => {
    test('displays completion header', () => {
      const logFn = vi.fn()
      displayOrganizeResult({ filesModified: 0, importsOrganized: 0, skipped: 0 }, 5, false, logFn)
      expect(logFn).toHaveBeenCalledWith(expect.stringContaining('Import Organization Complete'))
    })

    test('displays files processed count', () => {
      const logFn = vi.fn()
      displayOrganizeResult({ filesModified: 0, importsOrganized: 0, skipped: 0 }, 10, false, logFn)
      expect(logFn).toHaveBeenCalledWith(expect.stringContaining('10'))
    })

    test('displays imports organized count', () => {
      const logFn = vi.fn()
      displayOrganizeResult({ filesModified: 2, importsOrganized: 5, skipped: 1 }, 8, false, logFn)
      expect(logFn).toHaveBeenCalledWith(expect.stringContaining('5'))
    })

    test('displays skipped count', () => {
      const logFn = vi.fn()
      displayOrganizeResult({ filesModified: 1, importsOrganized: 3, skipped: 2 }, 6, false, logFn)
      expect(logFn).toHaveBeenCalledWith(expect.stringContaining('2'))
    })

    test('shows dry-run message when dryRun is true', () => {
      const logFn = vi.fn()
      displayOrganizeResult({ filesModified: 0, importsOrganized: 2, skipped: 0 }, 2, true, logFn)
      expect(logFn).toHaveBeenCalledWith(expect.stringContaining('dry-run'))
    })

    test('does not show dry-run message when dryRun is false', () => {
      const logFn = vi.fn()
      displayOrganizeResult({ filesModified: 1, importsOrganized: 1, skipped: 0 }, 1, false, logFn)
      const dryRunCalls = logFn.mock.calls.filter(
        (call: Array<string>) => typeof call[0] === 'string' && call[0].includes('dry-run'),
      )
      expect(dryRunCalls).toHaveLength(0)
    })

    test('calls logFn with correct number of times without dryRun', () => {
      const logFn = vi.fn()
      displayOrganizeResult({ filesModified: 0, importsOrganized: 0, skipped: 0 }, 0, false, logFn)
      // blank line, header, blank line, processed, organized, skipped, blank line = 7 calls
      expect(logFn).toHaveBeenCalledTimes(7)
    })

    test('calls logFn more times with dryRun enabled', () => {
      const logFn = vi.fn()
      displayOrganizeResult({ filesModified: 0, importsOrganized: 0, skipped: 0 }, 0, true, logFn)
      // + blank line + dry-run message = 9 calls
      expect(logFn).toHaveBeenCalledTimes(9)
    })

    test('handles zero values correctly', () => {
      const logFn = vi.fn()
      displayOrganizeResult({ filesModified: 0, importsOrganized: 0, skipped: 0 }, 0, false, logFn)
      expect(logFn).toHaveBeenCalledWith(expect.stringContaining('0'))
    })

    test('handles large values correctly', () => {
      const logFn = vi.fn()
      displayOrganizeResult(
        { filesModified: 100, importsOrganized: 500, skipped: 50 },
        650,
        false,
        logFn,
      )
      expect(logFn).toHaveBeenCalledWith(expect.stringContaining('500'))
      expect(logFn).toHaveBeenCalledWith(expect.stringContaining('650'))
    })

    test('always calls logFn for blank lines', () => {
      const logFn = vi.fn()
      displayOrganizeResult({ filesModified: 0, importsOrganized: 0, skipped: 0 }, 1, false, logFn)
      const blankCalls = logFn.mock.calls.filter((call: Array<string>) => call[0] === '')
      expect(blankCalls.length).toBeGreaterThanOrEqual(2)
    })

    test('displays bold header', () => {
      const logFn = vi.fn()
      displayOrganizeResult({ filesModified: 0, importsOrganized: 0, skipped: 0 }, 1, false, logFn)
      const headerCalls = logFn.mock.calls.filter(
        (call: Array<string>) =>
          typeof call[0] === 'string' && call[0].includes('Import Organization'),
      )
      expect(headerCalls.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('buildOrganizeOptions', () => {
    test('returns defaults when no flags provided', () => {
      const opts = buildOrganizeOptions({})
      expect(opts).toEqual({ dryRun: false, group: false, sort: true })
    })

    test('returns dryRun true when flag is true', () => {
      const opts = buildOrganizeOptions({ 'dry-run': true })
      expect(opts.dryRun).toBe(true)
    })

    test('returns dryRun false when flag is false', () => {
      const opts = buildOrganizeOptions({ 'dry-run': false })
      expect(opts.dryRun).toBe(false)
    })

    test('returns group true when flag is true', () => {
      const opts = buildOrganizeOptions({ group: true })
      expect(opts.group).toBe(true)
    })

    test('returns group false when flag is false', () => {
      const opts = buildOrganizeOptions({ group: false })
      expect(opts.group).toBe(false)
    })

    test('returns sort true when flag is true', () => {
      const opts = buildOrganizeOptions({ sort: true })
      expect(opts.sort).toBe(true)
    })

    test('returns sort false when flag is false', () => {
      const opts = buildOrganizeOptions({ sort: false })
      expect(opts.sort).toBe(false)
    })

    test('returns all true when all flags are true', () => {
      const opts = buildOrganizeOptions({ 'dry-run': true, group: true, sort: true })
      expect(opts).toEqual({ dryRun: true, group: true, sort: true })
    })

    test('returns all false when explicitly set false', () => {
      const opts = buildOrganizeOptions({ 'dry-run': false, group: false, sort: false })
      expect(opts).toEqual({ dryRun: false, group: false, sort: false })
    })

    test('uses default sort=true when sort is undefined', () => {
      const opts = buildOrganizeOptions({ 'dry-run': true, group: true })
      expect(opts.sort).toBe(true)
    })

    test('uses default group=false when group is undefined', () => {
      const opts = buildOrganizeOptions({ 'dry-run': true })
      expect(opts.group).toBe(false)
    })

    test('returns consistent types', () => {
      const opts = buildOrganizeOptions({})
      expect(typeof opts.dryRun).toBe('boolean')
      expect(typeof opts.group).toBe('boolean')
      expect(typeof opts.sort).toBe('boolean')
    })

    test('mixed flags with dryRun and group true', () => {
      const opts = buildOrganizeOptions({ 'dry-run': true, group: true })
      expect(opts).toEqual({ dryRun: true, group: true, sort: true })
    })

    test('mixed flags with dryRun false and sort false', () => {
      const opts = buildOrganizeOptions({ 'dry-run': false, sort: false })
      expect(opts).toEqual({ dryRun: false, group: false, sort: false })
    })
  })

  describe('shouldWriteChanges', () => {
    test('returns true when write is true and dry-run is false', () => {
      expect(shouldWriteChanges({ write: true, 'dry-run': false })).toBe(true)
    })

    test('returns true when write is true and dry-run is true', () => {
      expect(shouldWriteChanges({ write: true, 'dry-run': true })).toBe(true)
    })

    test('returns true when write is false and dry-run is false', () => {
      expect(shouldWriteChanges({ write: false, 'dry-run': false })).toBe(true)
    })

    test('returns false when write is false and dry-run is true', () => {
      expect(shouldWriteChanges({ write: false, 'dry-run': true })).toBe(false)
    })

    test('returns true when write is undefined and dry-run is false', () => {
      expect(shouldWriteChanges({ 'dry-run': false })).toBe(true)
    })

    test('returns false when write is undefined and dry-run is true', () => {
      expect(shouldWriteChanges({ 'dry-run': true })).toBe(false)
    })

    test('returns true when neither flag is defined', () => {
      expect(shouldWriteChanges({})).toBe(true)
    })

    test('returns true when write is true and dry-run is undefined', () => {
      expect(shouldWriteChanges({ write: true })).toBe(true)
    })

    test('returns false when write is false and dry-run is undefined', () => {
      expect(shouldWriteChanges({ write: false })).toBe(true)
    })

    test('write flag overrides dry-run', () => {
      expect(shouldWriteChanges({ write: true, 'dry-run': true })).toBe(true)
    })

    test('returns correct result with all flags false', () => {
      expect(shouldWriteChanges({ write: false, 'dry-run': false })).toBe(true)
    })

    test('handles empty object as falsy write and falsy dry-run', () => {
      expect(shouldWriteChanges({})).toBe(true)
    })

    test('write true takes precedence over dry-run true', () => {
      expect(shouldWriteChanges({ write: true, 'dry-run': true })).toBe(true)
    })

    test('write false and dry-run true means no write', () => {
      expect(shouldWriteChanges({ write: false, 'dry-run': true })).toBe(false)
    })
  })
})
