import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import OrganizeImports from '../../src/commands/organize-imports.js'

// ─── Top-level mocks ───

vi.mock('node:fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('node:fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
}))

vi.mock('node:path', () => ({
  resolve: vi.fn((...args: string[]) => args.join('/')),
}))

vi.mock('chalk', () => ({
  default: {
    bold: (s: string) => s,
    gray: (s: string) => s,
    green: (s: string) => s,
    yellow: (s: string) => s,
  },
}))

vi.mock('../../src/core/parser.js', () => {
  const parseFileMock = vi.fn().mockResolvedValue({ sourceFile: null })
  return {
    __parseFileMock: parseFileMock,
    Parser: class {
      initialize = vi.fn().mockResolvedValue(undefined)
      dispose = vi.fn()
      parseFile = parseFileMock
    },
  }
})

vi.mock('../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn().mockResolvedValue([]),
}))

vi.mock('../../src/utils/constants.js', () => ({
  MAX_ORGANIZE_IMPORTS_FILES: 200,
}))

vi.mock('../../src/commands/organize-imports-helpers.js', () => ({
  GROUP_ORDER: ['external', 'internal', 'relative', 'sideEffects'],
  categorizeImport: vi.fn((_imp: unknown, _patterns: string[]) => 'external'),
  detectInternalPatterns: vi.fn(() => ['@/', '~/src/', '@/src/']),
  displayOrganizeResult: vi.fn(),
  shouldWriteChanges: vi.fn(() => false),
}))

// ─── Helpers ───

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

interface OrganizePrivate {
  categorizeImport: (imp: unknown, patterns: string[]) => string
  detectInternalPatterns: (_sourceFile: unknown) => string[]
  getImportGroups: (
    sourceFile: {
      getImportDeclarations: () => unknown[]
    },
    internalPatterns: string[],
  ) => Record<string, unknown[]>
  log: (...args: unknown[]) => void
  organizeFile: (
    sourceFile: unknown,
    options: { dryRun: boolean; group: boolean; sort: boolean },
  ) => { changed: boolean; organized: string; original: string }
  run: () => Promise<void>
  warn: (...args: unknown[]) => void
}

function createInstance(): { command: OrganizeImports; p: OrganizePrivate; logs: string[] } {
  const logs: string[] = []
  const command = new OrganizeImports([], {} as never)
  const p = command as unknown as OrganizePrivate

  p.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(' '))
  }
  p.warn = (...args: unknown[]) => {
    logs.push('[warn] ' + args.map(String).join(' '))
  }

  return { command, p, logs }
}

function mockImportDecl(specifier: string, text?: string) {
  return {
    getDefaultImport: vi.fn().mockReturnValue(undefined),
    getEnd: vi.fn().mockReturnValue(0),
    getModuleSpecifierValue: vi.fn().mockReturnValue(specifier),
    getNamespaceImport: vi.fn().mockReturnValue(undefined),
    getStart: vi.fn().mockReturnValue(0),
    getText: vi.fn().mockReturnValue(text ?? `import { x } from '${specifier}'`),
  }
}

function makeSourceFile(imports: unknown[], fullText: string) {
  return {
    getFullText: vi.fn().mockReturnValue(fullText),
    getImportDeclarations: vi.fn().mockReturnValue(imports),
  }
}

function stubParse(instance: ReturnType<typeof createInstance>, flags: Record<string, unknown> = {}) {
  instance.command.parse = vi.fn().mockResolvedValue({
    args: { path: '.' },
    flags: {
      'dry-run': false,
      group: false,
      sort: true,
      verbose: false,
      write: false,
      ...flags,
    },
  })
}

// ─── Static properties ───

describe('OrganizeImports command static properties', () => {
  it('has correct description', () => {
    expect(OrganizeImports.description).toBe('Organize and sort imports in TypeScript files')
  })

  it('has examples defined', () => {
    expect(OrganizeImports.examples).toBeDefined()
    expect(OrganizeImports.examples!.length).toBeGreaterThan(0)
  })

  it('defines path arg as optional string with default "."', () => {
    const pathArg = OrganizeImports.args!.path as Record<string, unknown>
    expect(pathArg).toBeDefined()
    expect(pathArg.default).toBe('.')
    expect(pathArg.required).toBe(false)
  })

  it('has dry-run flag with char d defaulting to false', () => {
    const flag = OrganizeImports.flags!['dry-run'] as Record<string, unknown>
    expect(flag).toBeDefined()
    expect(flag.char).toBe('d')
    expect(flag.default).toBe(false)
  })

  it('has group flag defaulting to false', () => {
    const flag = OrganizeImports.flags!.group as Record<string, unknown>
    expect(flag).toBeDefined()
    expect(flag.default).toBe(false)
  })

  it('has sort flag defaulting to true', () => {
    const flag = OrganizeImports.flags!.sort as Record<string, unknown>
    expect(flag).toBeDefined()
    expect(flag.default).toBe(true)
  })

  it('has verbose flag with char v defaulting to false', () => {
    const flag = OrganizeImports.flags!.verbose as Record<string, unknown>
    expect(flag).toBeDefined()
    expect(flag.char).toBe('v')
    expect(flag.default).toBe(false)
  })

  it('has write flag with char w defaulting to false', () => {
    const flag = OrganizeImports.flags!.write as Record<string, unknown>
    expect(flag).toBeDefined()
    expect(flag.char).toBe('w')
    expect(flag.default).toBe(false)
  })

  it('defines at least 3 examples', () => {
    expect(OrganizeImports.examples!.length).toBeGreaterThanOrEqual(3)
  })

  it('each example has command and description', () => {
    for (const example of OrganizeImports.examples!) {
      expect(example).toHaveProperty('command')
      expect(example).toHaveProperty('description')
      expect(typeof example.command).toBe('string')
      expect(typeof example.description).toBe('string')
      expect(example.command.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
    }
  })
})

// ─── categorizeImport ───

describe('categorizeImport (delegates to helper)', () => {
  let instance: ReturnType<typeof createInstance>

  beforeEach(() => {
    instance = createInstance()
  })

  it('delegates to helperCategorizeImport', async () => {
    const { categorizeImport } = await import('../../src/commands/organize-imports-helpers.js')
    vi.mocked(categorizeImport).mockReturnValue('external')

    const imp = mockImportDecl('react')
    const result = instance.p.categorizeImport(imp, ['@/'])

    expect(categorizeImport).toHaveBeenCalledWith(imp, ['@/'])
    expect(result).toBe('external')
  })

  it('passes internal patterns through', async () => {
    const { categorizeImport } = await import('../../src/commands/organize-imports-helpers.js')
    vi.mocked(categorizeImport).mockReturnValue('internal')

    const imp = mockImportDecl('@/components')
    const patterns = ['@/', '~/', '#/']
    const result = instance.p.categorizeImport(imp, patterns)

    expect(categorizeImport).toHaveBeenCalledWith(imp, patterns)
    expect(result).toBe('internal')
  })
})

// ─── detectInternalPatterns ───

describe('detectInternalPatterns (delegates to helper)', () => {
  let instance: ReturnType<typeof createInstance>

  beforeEach(() => {
    instance = createInstance()
  })

  it('delegates to helperDetectInternalPatterns', async () => {
    const { detectInternalPatterns: helperFn } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )
    vi.mocked(helperFn).mockReturnValue(['@/', '~/'])

    const result = instance.p.detectInternalPatterns({} as never)

    expect(helperFn).toHaveBeenCalled()
    expect(result).toEqual(['@/', '~/'])
  })
})

// ─── getImportGroups ───

describe('getImportGroups', () => {
  let instance: ReturnType<typeof createInstance>

  beforeEach(() => {
    instance = createInstance()
  })

  it('returns empty groups when no imports', () => {
    const sf = makeSourceFile([], '')
    const result = instance.p.getImportGroups(sf, [])

    expect(result.external).toEqual([])
    expect(result.internal).toEqual([])
    expect(result.relative).toEqual([])
    expect(result.sideEffects).toEqual([])
  })

  it('categorizes each import', async () => {
    const { categorizeImport } = await import('../../src/commands/organize-imports-helpers.js')
    vi.mocked(categorizeImport)
      .mockReturnValueOnce('external')
      .mockReturnValueOnce('relative')

    const imp1 = mockImportDecl('react')
    const imp2 = mockImportDecl('./utils')
    const sf = makeSourceFile([imp1, imp2], '')

    const result = instance.p.getImportGroups(sf, ['@/'])

    expect(result.external).toHaveLength(1)
    expect(result.relative).toHaveLength(1)
  })

  it('puts namespace imports into external', () => {
    const imp = mockImportDecl('lodash')
    imp.getNamespaceImport.mockReturnValue({})

    const sf = makeSourceFile([imp], '')
    const result = instance.p.getImportGroups(sf, [])

    expect(result.external).toHaveLength(1)
  })

  it('puts default imports into external', () => {
    const imp = mockImportDecl('react')
    imp.getDefaultImport.mockReturnValue({})

    const sf = makeSourceFile([imp], '')
    const result = instance.p.getImportGroups(sf, [])

    expect(result.external).toHaveLength(1)
  })

  it('handles mixed namespace/default and named imports', async () => {
    const { categorizeImport } = await import('../../src/commands/organize-imports-helpers.js')
    vi.mocked(categorizeImport).mockReturnValue('internal')

    const namespaceImp = mockImportDecl('* as lodash')
    namespaceImp.getNamespaceImport.mockReturnValue({})

    const namedImp = mockImportDecl('@/utils')

    const sf = makeSourceFile([namespaceImp, namedImp], '')
    const result = instance.p.getImportGroups(sf, ['@/'])

    expect(result.external).toHaveLength(1)
    expect(result.internal).toHaveLength(1)
  })
})

// ─── organizeFile ───

describe('organizeFile', () => {
  let instance: ReturnType<typeof createInstance>

  beforeEach(() => {
    instance = createInstance()
  })

  it('returns unchanged when no group and no sort', () => {
    const sf = makeSourceFile([], 'import { x } from "a"')
    const result = instance.p.organizeFile(sf, {
      dryRun: false,
      group: false,
      sort: false,
    })

    expect(result.changed).toBe(false)
    expect(result.organized).toBe('import { x } from "a"')
  })

  it('returns unchanged when no imports exist', () => {
    const sf = makeSourceFile([], 'const x = 1')
    const result = instance.p.organizeFile(sf, {
      dryRun: false,
      group: true,
      sort: true,
    })

    expect(result.changed).toBe(false)
  })

  it('sorts imports alphabetically with sort=true and group=false', async () => {
    const { detectInternalPatterns: helperDetect } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )
    const { categorizeImport: helperCategorize } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )
    vi.mocked(helperDetect).mockReturnValue(['@/'])
    vi.mocked(helperCategorize).mockReturnValue('external')

    const imp1 = mockImportDecl('zebra', "import { z } from 'zebra'")
    imp1.getStart.mockReturnValue(0)
    imp1.getEnd.mockReturnValue(26)

    const imp2 = mockImportDecl('alpha', "import { a } from 'alpha'")
    imp2.getStart.mockReturnValue(0)
    imp2.getEnd.mockReturnValue(26)

    const fullText = "import { z } from 'zebra'\nimport { a } from 'alpha'\nconst x = 1"
    const sf = makeSourceFile([imp1, imp2], fullText)
    sf.getImportDeclarations.mockReturnValue([imp1, imp2])

    const result = instance.p.organizeFile(sf, {
      dryRun: false,
      group: false,
      sort: true,
    })

    expect(result.changed).toBe(true)
    expect(result.organized).toContain("import { a } from 'alpha'")
    expect(result.organized).toContain("import { z } from 'zebra'")
    const alphaIdx = result.organized.indexOf("'alpha'")
    const zebraIdx = result.organized.indexOf("'zebra'")
    expect(alphaIdx).toBeLessThan(zebraIdx)
  })

  it('groups imports when group=true', async () => {
    const { detectInternalPatterns: helperDetect } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )
    const { categorizeImport: helperCategorize } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )
    vi.mocked(helperDetect).mockReturnValue(['@/'])
    vi.mocked(helperCategorize)
      .mockReturnValueOnce('relative')
      .mockReturnValueOnce('external')

    const imp1 = mockImportDecl('./utils', "import { u } from './utils'")
    imp1.getStart.mockReturnValue(0)
    imp1.getEnd.mockReturnValue(28)

    const imp2 = mockImportDecl('react', "import { r } from 'react'")
    imp2.getStart.mockReturnValue(0)
    imp2.getEnd.mockReturnValue(27)

    const fullText = "import { u } from './utils'\nimport { r } from 'react'\nconst x = 1"
    const sf = makeSourceFile([imp1, imp2], fullText)
    sf.getImportDeclarations.mockReturnValue([imp1, imp2])

    const result = instance.p.organizeFile(sf, {
      dryRun: false,
      group: true,
      sort: false,
    })

    expect(result.changed).toBe(true)
    expect(result.organized).toContain("import { r } from 'react'")
    expect(result.organized).toContain("import { u } from './utils'")
    const reactIdx = result.organized.indexOf("'react'")
    const utilsIdx = result.organized.indexOf("'./utils'")
    expect(reactIdx).toBeLessThan(utilsIdx)
  })

  it('preserves code before and after imports', async () => {
    const { detectInternalPatterns: helperDetect } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )
    const { categorizeImport: helperCategorize } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )
    vi.mocked(helperDetect).mockReturnValue([])
    vi.mocked(helperCategorize).mockReturnValue('external')

    const imp = mockImportDecl('react', "import { x } from 'react'")
    imp.getStart.mockReturnValue(16)
    imp.getEnd.mockReturnValue(40)

    const fullText = "// header comment\nimport { x } from 'react'\nconst x = 1"
    const sf = makeSourceFile([imp], fullText)
    sf.getImportDeclarations.mockReturnValue([imp])

    const result = instance.p.organizeFile(sf, {
      dryRun: false,
      group: false,
      sort: true,
    })

    expect(result.organized).toContain('const x = 1')
  })

  it('detects no change when already organized (single import, sort only)', async () => {
    const { detectInternalPatterns: helperDetect } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )
    const { categorizeImport: helperCategorize } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )
    vi.mocked(helperDetect).mockReturnValue([])
    vi.mocked(helperCategorize).mockReturnValue('external')

    const imp = mockImportDecl('react', "import { x } from 'react'")
    const importText = "import { x } from 'react'"
    imp.getStart.mockReturnValue(0)
    imp.getEnd.mockReturnValue(importText.length)

    const fullText = importText + '\nconst x = 1'
    const sf = makeSourceFile([imp], fullText)
    sf.getImportDeclarations.mockReturnValue([imp])

    const result = instance.p.organizeFile(sf, {
      dryRun: false,
      group: false,
      sort: true,
    })

    expect(result.changed).toBe(false)
    expect(result.organized).toBe(fullText)
  })

  it('sorts within groups when both group and sort are true', async () => {
    const { detectInternalPatterns: helperDetect } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )
    const { categorizeImport: helperCategorize } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )
    vi.mocked(helperDetect).mockReturnValue([])
    vi.mocked(helperCategorize)
      .mockReturnValueOnce('external')
      .mockReturnValueOnce('external')
      .mockReturnValueOnce('relative')

    const imp1 = mockImportDecl('zebra', "import { z } from 'zebra'")
    const imp2 = mockImportDecl('alpha', "import { a } from 'alpha'")
    const imp3 = mockImportDecl('./local', "import { l } from './local'")

    const allImports = [imp1, imp2, imp3]
    allImports.forEach((imp) => {
      imp.getStart.mockReturnValue(0)
      imp.getEnd.mockReturnValue(26)
    })

    const fullText = "import { z } from 'zebra'\nimport { a } from 'alpha'\nimport { l } from './local'"
    const sf = makeSourceFile(allImports, fullText)
    sf.getImportDeclarations.mockReturnValue(allImports)

    const result = instance.p.organizeFile(sf, {
      dryRun: false,
      group: true,
      sort: true,
    })

    expect(result.changed).toBe(true)
    const organized = result.organized
    const alphaIdx = organized.indexOf("'alpha'")
    const zebraIdx = organized.indexOf("'zebra'")
    expect(alphaIdx).toBeLessThan(zebraIdx)
  })

  it('joins groups with double newline when grouping', async () => {
    const { detectInternalPatterns: helperDetect } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )
    const { categorizeImport: helperCategorize } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )
    vi.mocked(helperDetect).mockReturnValue([])
    vi.mocked(helperCategorize)
      .mockReturnValueOnce('external')
      .mockReturnValueOnce('relative')

    const imp1 = mockImportDecl('react', "import { r } from 'react'")
    imp1.getStart.mockReturnValue(0)
    imp1.getEnd.mockReturnValue(27)

    const imp2 = mockImportDecl('./local', "import { l } from './local'")
    imp2.getStart.mockReturnValue(0)
    imp2.getEnd.mockReturnValue(29)

    const fullText = "import { r } from 'react'\nimport { l } from './local'"
    const sf = makeSourceFile([imp1, imp2], fullText)
    sf.getImportDeclarations.mockReturnValue([imp1, imp2])

    const result = instance.p.organizeFile(sf, {
      dryRun: false,
      group: true,
      sort: false,
    })

    expect(result.changed).toBe(true)
    const organized = result.organized
    const reactBlockEnd = organized.indexOf("'react'") + "'react'".length
    const localStart = organized.indexOf("'./local'")
    const gap = organized.slice(reactBlockEnd, localStart)
    expect(gap).toContain('\n\n')
  })

  it('skips empty groups when grouping', async () => {
    const { detectInternalPatterns: helperDetect } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )
    const { categorizeImport: helperCategorize } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )
    vi.mocked(helperDetect).mockReturnValue([])
    vi.mocked(helperCategorize).mockReturnValue('external')

    const imp = mockImportDecl('react', "import { r } from 'react'")
    imp.getStart.mockReturnValue(0)
    imp.getEnd.mockReturnValue(27)

    const fullText = "import { r } from 'react'\nconst x = 1"
    const sf = makeSourceFile([imp], fullText)
    sf.getImportDeclarations.mockReturnValue([imp])

    const result = instance.p.organizeFile(sf, {
      dryRun: false,
      group: true,
      sort: false,
    })

    expect(result.organized).not.toContain('\n\n')
  })
})

// ─── run() integration ───

describe('run()', () => {
  let instance: ReturnType<typeof createInstance>

  beforeEach(async () => {
    instance = createInstance()
    stubParse(instance)
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(true)
    const { shouldWriteChanges } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )
    vi.mocked(shouldWriteChanges).mockReturnValue(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('errors when path does not exist', async () => {
    const { existsSync } = await import('node:fs')
    vi.mocked(existsSync).mockReturnValue(false)

    stubParse(instance)
    const errorSpy = vi.fn((_msg: string, opts: Record<string, unknown>) => {
      throw new Error(`Exit ${opts.exit}`)
    })
    instance.command.error = errorSpy

    await expect(instance.p.run()).rejects.toThrow('Exit 1')
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Path not found'),
      { exit: 1 },
    )
  })

  it('logs yellow message when no TypeScript files found', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    vi.mocked(discoverFiles).mockResolvedValue([])

    await instance.p.run()

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('No TypeScript files found')
  })

  it('calls parseFile for each discovered file', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const parserMod = await import('../../src/core/parser.js')

    const sf = makeSourceFile([], 'const x = 1')
    vi.mocked(parserMod.__parseFileMock).mockResolvedValue({ sourceFile: sf })

    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/abs/a.ts', path: 'a.ts' },
      { absolutePath: '/abs/b.ts', path: 'b.ts' },
    ])

    await instance.p.run()

    expect(parserMod.__parseFileMock).toHaveBeenCalledTimes(2)
  })

  it('processes files and calls displayOrganizeResult', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const parserMod = await import('../../src/core/parser.js')
    const { displayOrganizeResult } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )

    const sf = makeSourceFile([], 'const x = 1')
    vi.mocked(parserMod.__parseFileMock).mockResolvedValue({ sourceFile: sf })

    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/abs/a.ts', path: 'a.ts' },
    ])

    await instance.p.run()

    expect(displayOrganizeResult).toHaveBeenCalledWith(
      expect.objectContaining({
        importsOrganized: expect.any(Number),
        skipped: expect.any(Number),
      }),
      1,
      false,
      expect.any(Function),
    )
  })

  it('skips files that fail to parse', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const parserMod = await import('../../src/core/parser.js')
    const { displayOrganizeResult } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )

    vi.mocked(parserMod.__parseFileMock).mockRejectedValue(new Error('Parse failed'))

    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/abs/bad.ts', path: 'bad.ts' },
    ])

    await instance.p.run()

    expect(displayOrganizeResult).toHaveBeenCalledWith(
      expect.objectContaining({ skipped: 1 }),
      1,
      false,
      expect.any(Function),
    )
  })

  it('writes file when shouldWriteChanges is true and imports changed', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const parserMod = await import('../../src/core/parser.js')
    const { writeFile } = await import('node:fs/promises')
    const { shouldWriteChanges } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )
    const { detectInternalPatterns: helperDetect } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )
    const { categorizeImport: helperCategorize } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )

    vi.mocked(helperDetect).mockReturnValue([])
    vi.mocked(helperCategorize).mockReturnValue('external')
    vi.mocked(shouldWriteChanges).mockReturnValue(true)

    const imp1 = mockImportDecl('zebra', "import { z } from 'zebra'")
    const imp2 = mockImportDecl('alpha', "import { a } from 'alpha'")
    const allImports = [imp1, imp2]
    allImports.forEach((imp) => {
      imp.getStart.mockReturnValue(0)
      imp.getEnd.mockReturnValue(26)
    })

    const fullText = "import { z } from 'zebra'\nimport { a } from 'alpha'\n"
    const sf = makeSourceFile(allImports, fullText)
    sf.getImportDeclarations.mockReturnValue(allImports)

    vi.mocked(parserMod.__parseFileMock).mockResolvedValue({ sourceFile: sf })

    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/abs/a.ts', path: 'a.ts' },
    ])

    await instance.p.run()

    expect(writeFile).toHaveBeenCalledWith(
      '/abs/a.ts',
      expect.any(String),
      'utf8',
    )
  })

  it('does not write file when shouldWriteChanges returns false', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const parserMod = await import('../../src/core/parser.js')
    const { writeFile } = await import('node:fs/promises')
    const { shouldWriteChanges } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )

    vi.mocked(shouldWriteChanges).mockReturnValue(false)
    vi.mocked(writeFile).mockClear()

    const imp1 = mockImportDecl('zebra', "import { z } from 'zebra'")
    const imp2 = mockImportDecl('alpha', "import { a } from 'alpha'")
    const allImports = [imp1, imp2]
    allImports.forEach((imp) => {
      imp.getStart.mockReturnValue(0)
      imp.getEnd.mockReturnValue(26)
    })

    const fullText = "import { z } from 'zebra'\nimport { a } from 'alpha'\n"
    const sf = makeSourceFile(allImports, fullText)
    sf.getImportDeclarations.mockReturnValue(allImports)

    vi.mocked(parserMod.__parseFileMock).mockResolvedValue({ sourceFile: sf })

    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/abs/a.ts', path: 'a.ts' },
    ])

    await instance.p.run()

    expect(writeFile).not.toHaveBeenCalled()
  })

  it('warns on write failure', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const parserMod = await import('../../src/core/parser.js')
    const { writeFile } = await import('node:fs/promises')
    const { shouldWriteChanges } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )
    const { detectInternalPatterns: helperDetect } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )
    const { categorizeImport: helperCategorize } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )

    vi.mocked(helperDetect).mockReturnValue([])
    vi.mocked(helperCategorize).mockReturnValue('external')
    vi.mocked(shouldWriteChanges).mockReturnValue(true)
    vi.mocked(writeFile).mockRejectedValue(new Error('Disk full'))

    const imp1 = mockImportDecl('zebra', "import { z } from 'zebra'")
    const imp2 = mockImportDecl('alpha', "import { a } from 'alpha'")
    const allImports = [imp1, imp2]
    allImports.forEach((imp) => {
      imp.getStart.mockReturnValue(0)
      imp.getEnd.mockReturnValue(26)
    })

    const fullText = "import { z } from 'zebra'\nimport { a } from 'alpha'\n"
    const sf = makeSourceFile(allImports, fullText)
    sf.getImportDeclarations.mockReturnValue(allImports)

    vi.mocked(parserMod.__parseFileMock).mockResolvedValue({ sourceFile: sf })

    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/abs/a.ts', path: 'a.ts' },
    ])

    await instance.p.run()

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('Disk full')
  })

  it('handles parse error gracefully', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const parserMod = await import('../../src/core/parser.js')
    const { displayOrganizeResult } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )

    vi.mocked(parserMod.__parseFileMock).mockRejectedValue(new Error('Parse failed'))

    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/abs/a.ts', path: 'a.ts' },
    ])

    await instance.p.run()

    expect(displayOrganizeResult).toHaveBeenCalledWith(
      expect.objectContaining({ skipped: 1 }),
      1,
      false,
      expect.any(Function),
    )
  })
})

// ─── file limit ───

describe('file processing limits', () => {
  it('respects MAX_ORGANIZE_IMPORTS_FILES limit', async () => {
    const { MAX_ORGANIZE_IMPORTS_FILES } = await import('../../src/utils/constants.js')
    expect(MAX_ORGANIZE_IMPORTS_FILES).toBe(200)
  })

  it('slices files to MAX_ORGANIZE_IMPORTS_FILES', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const parserMod = await import('../../src/core/parser.js')

    vi.mocked(parserMod.__parseFileMock).mockClear()

    const manyFiles = Array.from({ length: 250 }, (_, i) => ({
      absolutePath: `/abs/file${i}.ts`,
      path: `file${i}.ts`,
    }))
    vi.mocked(discoverFiles).mockResolvedValue(manyFiles)

    vi.mocked(parserMod.__parseFileMock).mockResolvedValue({
      sourceFile: makeSourceFile([], 'const x = 1'),
    })

    const instance = createInstance()
    stubParse(instance)
    await instance.p.run()

    expect(parserMod.__parseFileMock).toHaveBeenCalledTimes(200)
  })
})

// ─── verbose output ───

describe('verbose output', () => {
  it('shows "Would organize" in verbose mode for changed files without write', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const parserMod = await import('../../src/core/parser.js')
    const { shouldWriteChanges } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )
    const { detectInternalPatterns: helperDetect } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )
    const { categorizeImport: helperCategorize } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )

    vi.mocked(helperDetect).mockReturnValue([])
    vi.mocked(helperCategorize).mockReturnValue('external')
    vi.mocked(shouldWriteChanges).mockReturnValue(false)

    const imp1 = mockImportDecl('zebra', "import { z } from 'zebra'")
    const imp2 = mockImportDecl('alpha', "import { a } from 'alpha'")
    const allImports = [imp1, imp2]
    allImports.forEach((imp) => {
      imp.getStart.mockReturnValue(0)
      imp.getEnd.mockReturnValue(26)
    })

    const fullText = "import { z } from 'zebra'\nimport { a } from 'alpha'\n"
    const sf = makeSourceFile(allImports, fullText)
    sf.getImportDeclarations.mockReturnValue(allImports)

    vi.mocked(parserMod.__parseFileMock).mockResolvedValue({ sourceFile: sf })

    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/abs/a.ts', path: 'a.ts' },
    ])

    const instance = createInstance()
    stubParse(instance, { verbose: true })
    await instance.p.run()

    const output = stripAnsi(instance.logs.join('\n'))
    expect(output).toContain('Would organize')
  })
})

// ─── Example structures ───

describe('OrganizeImports examples structure', () => {
  it('includes dry-run example', () => {
    const hasDryRun = OrganizeImports.examples!.some(
      (ex) => ex.command.includes('--dry-run') || ex.command.includes('-d'),
    )
    expect(hasDryRun).toBe(true)
  })

  it('includes group example', () => {
    const hasGroup = OrganizeImports.examples!.some(
      (ex) => ex.command.includes('--group'),
    )
    expect(hasGroup).toBe(true)
  })

  it('includes directory path example', () => {
    const hasDir = OrganizeImports.examples!.some(
      (ex) => ex.command.includes('src/') || ex.description.includes('src'),
    )
    expect(hasDir).toBe(true)
  })
})

// ─── displayOrganizeResult integration ───

describe('displayOrganizeResult usage', () => {
  it('passes dry-run flag to displayOrganizeResult', async () => {
    const { discoverFiles } = await import('../../src/core/file-discovery.js')
    const parserMod = await import('../../src/core/parser.js')
    const { displayOrganizeResult } = await import(
      '../../src/commands/organize-imports-helpers.js'
    )

    const sf = makeSourceFile([], 'const x = 1')
    vi.mocked(parserMod.__parseFileMock).mockResolvedValue({ sourceFile: sf })

    vi.mocked(discoverFiles).mockResolvedValue([
      { absolutePath: '/abs/a.ts', path: 'a.ts' },
    ])

    const instance = createInstance()
    stubParse(instance, { 'dry-run': true })
    await instance.p.run()

    expect(displayOrganizeResult).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Number),
      true,
      expect.any(Function),
    )
  })
})
