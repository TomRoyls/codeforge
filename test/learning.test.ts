import { describe, it, expect } from 'vitest'

import {
  detectLayers,
  computeReadingOrder,
  detectPatterns,
  findEntryPoints,
  buildGlossary,
  buildLearningGuide,
  type ContentMap,
  type LearningGuide,
} from '../src/commands/learning-helpers.js'

import {
  formatLearningTable,
  formatLearningJson,
} from '../src/commands/learning-format-helpers.js'

import Learning from '../src/commands/learning.js'

// ─── detectLayers ────────────────────────────────────────

describe('detectLayers', () => {
  it('should return empty for no files', () => {
    expect(detectLayers([], new Map())).toHaveLength(0)
  })

  it('should detect Commands layer', () => {
    const files = ['src/commands/count.ts']
    const contents: ContentMap = new Map([['src/commands/count.ts', 'export default class Count {}']])
    const layers = detectLayers(files, contents)
    expect(layers.some((l) => l.name === 'Commands')).toBe(true)
  })

  it('should detect Core layer', () => {
    const files = ['src/core/file-discovery.ts']
    const contents: ContentMap = new Map([['src/core/file-discovery.ts', 'export function discoverFiles() {}']])
    const layers = detectLayers(files, contents)
    expect(layers.some((l) => l.name === 'Core')).toBe(true)
  })

  it('should detect Utilities layer', () => {
    const files = ['src/utils/format.ts']
    const contents: ContentMap = new Map([['src/utils/format.ts', 'export function fmt() {}']])
    const layers = detectLayers(files, contents)
    expect(layers.some((l) => l.name === 'Utilities')).toBe(true)
  })

  it('should detect Types layer', () => {
    const files = ['src/types/index.ts']
    const contents: ContentMap = new Map([['src/types/index.ts', 'export interface X {}']])
    const layers = detectLayers(files, contents)
    expect(layers.some((l) => l.name === 'Types')).toBe(true)
  })

  it('should classify unknown dirs as Other', () => {
    const files = ['src/misc/helper.ts']
    const contents: ContentMap = new Map([['src/misc/helper.ts', 'export const x = 1']])
    const layers = detectLayers(files, contents)
    expect(layers.some((l) => l.name === 'Other')).toBe(true)
  })

  it('should count files per layer', () => {
    const files = ['src/commands/a.ts', 'src/commands/b.ts']
    const contents: ContentMap = new Map([
      ['src/commands/a.ts', 'x'],
      ['src/commands/b.ts', 'y'],
    ])
    const layers = detectLayers(files, contents)
    const cmdLayer = layers.find((l) => l.name === 'Commands')
    expect(cmdLayer?.files).toBe(2)
  })

  it('should return key files sorted by size', () => {
    const files = ['src/commands/small.ts', 'src/commands/big.ts']
    const contents: ContentMap = new Map([
      ['src/commands/small.ts', 'line\n'],
      ['src/commands/big.ts', 'line\n'.repeat(100)],
    ])
    const layers = detectLayers(files, contents)
    const cmdLayer = layers.find((l) => l.name === 'Commands')
    expect(cmdLayer?.keyFiles[0]).toBe('src/commands/big.ts')
  })

  it('should detect multiple layers', () => {
    const files = ['src/commands/count.ts', 'src/core/file-discovery.ts']
    const contents: ContentMap = new Map([
      ['src/commands/count.ts', 'x'],
      ['src/core/file-discovery.ts', 'y'],
    ])
    const layers = detectLayers(files, contents)
    expect(layers).toHaveLength(2)
  })
})

// ─── computeReadingOrder ─────────────────────────────────

describe('computeReadingOrder', () => {
  it('should return empty for no files', () => {
    expect(computeReadingOrder([], new Map())).toHaveLength(0)
  })

  it('should categorize command files as entry', () => {
    const files = ['src/commands/count.ts']
    const contents: ContentMap = new Map([
      ['src/commands/count.ts', 'export default class Count extends Command {}'],
    ])
    const order = computeReadingOrder(files, contents)
    expect(order[0].category).toBe('entry')
  })

  it('should categorize test files as test', () => {
    const files = ['test/count.test.ts']
    const contents: ContentMap = new Map([['test/count.test.ts', "import { test } from 'vitest'"]])
    const order = computeReadingOrder(files, contents)
    expect(order[0].category).toBe('test')
  })

  it('should categorize core files as core', () => {
    const files = ['src/core/discover.ts']
    const contents: ContentMap = new Map([['src/core/discover.ts', 'export function discover() {}']])
    const order = computeReadingOrder(files, contents)
    expect(order[0].category).toBe('core')
  })

  it('should categorize type-heavy files as type', () => {
    const files = ['src/types/models.ts']
    const contents: ContentMap = new Map([['src/types/models.ts', 'export interface User {}']])
    const order = computeReadingOrder(files, contents)
    expect(order[0].category).toBe('type')
  })

  it('should compute complexity 1-5', () => {
    const files = ['src/simple.ts']
    const contents: ContentMap = new Map([['src/simple.ts', 'const x = 1']])
    const order = computeReadingOrder(files, contents)
    expect(order[0].complexity).toBeGreaterThanOrEqual(1)
    expect(order[0].complexity).toBeLessThanOrEqual(5)
  })

  it('should count imports', () => {
    const code = "import { a } from 'x'\nimport { b } from 'y'\nconst x = 1\n"
    const files = ['src/app.ts']
    const contents: ContentMap = new Map([['src/app.ts', code]])
    const order = computeReadingOrder(files, contents)
    expect(order[0].dependencies).toBe(2)
  })

  it('should sort by category priority', () => {
    const files = ['test/a.test.ts', 'src/commands/cmd.ts', 'src/core/core.ts']
    const contents: ContentMap = new Map([
      ['test/a.test.ts', "import { test } from 'vitest'"],
      ['src/commands/cmd.ts', 'export default class Cmd extends Command {}'],
      ['src/core/core.ts', 'export function run() {}'],
    ])
    const order = computeReadingOrder(files, contents)
    expect(order[0].category).toBe('entry')
  })

  it('should include reason string', () => {
    const files = ['src/commands/cmd.ts']
    const contents: ContentMap = new Map([
      ['src/commands/cmd.ts', 'export default class Cmd extends Command {}'],
    ])
    const order = computeReadingOrder(files, contents)
    expect(order[0].reason).toContain('cmd.ts')
  })
})

// ─── detectPatterns ──────────────────────────────────────

describe('detectPatterns', () => {
  it('should detect Command Pattern', () => {
    const files = ['src/commands/count.ts']
    const contents: ContentMap = new Map([
      ['src/commands/count.ts', 'export default class Count extends Command {}'],
    ])
    const patterns = detectPatterns(files, contents)
    expect(patterns.some((p) => p.name === 'Command Pattern')).toBe(true)
  })

  it('should detect 3-File Split', () => {
    const files = [
      'src/commands/count.ts',
      'src/commands/count-helpers.ts',
      'src/commands/count-format-helpers.ts',
    ]
    const contents: ContentMap = new Map([
      ['src/commands/count.ts', 'export default class Count extends Command {}'],
      ['src/commands/count-helpers.ts', 'export function helper() {}'],
      ['src/commands/count-format-helpers.ts', 'export function format() {}'],
    ])
    const patterns = detectPatterns(files, contents)
    expect(patterns.some((p) => p.name === '3-File Split')).toBe(true)
  })

  it('should detect Interface Pattern', () => {
    const files = ['src/types.ts']
    const contents: ContentMap = new Map([
      ['src/types.ts', 'export interface Config {}'],
    ])
    const patterns = detectPatterns(files, contents)
    expect(patterns.some((p) => p.name === 'Interface Pattern')).toBe(true)
  })

  it('should detect Named Export pattern', () => {
    const files = ['src/utils.ts']
    const contents: ContentMap = new Map([
      ['src/utils.ts', 'export function hello() {}'],
    ])
    const patterns = detectPatterns(files, contents)
    expect(patterns.some((p) => p.name === 'Named Export')).toBe(true)
  })

  it('should return empty for no patterns', () => {
    const files = ['readme.md']
    const contents: ContentMap = new Map([['readme.md', '# Hello']])
    const patterns = detectPatterns(files, contents)
    expect(patterns).toHaveLength(0)
  })

  it('should count pattern frequency', () => {
    const files = ['src/commands/a.ts', 'src/commands/b.ts']
    const contents: ContentMap = new Map([
      ['src/commands/a.ts', 'export default class A extends Command {}'],
      ['src/commands/b.ts', 'export default class B extends Command {}'],
    ])
    const patterns = detectPatterns(files, contents)
    const cmdPattern = patterns.find((p) => p.name === 'Command Pattern')
    expect(cmdPattern?.frequency).toBe(2)
  })
})

// ─── findEntryPoints ─────────────────────────────────────

describe('findEntryPoints', () => {
  it('should find default export Command classes', () => {
    const files = ['src/commands/count.ts']
    const contents: ContentMap = new Map([
      ['src/commands/count.ts', "export default class Count extends Command {\nstatic override description = 'Count lines'\n}"],
    ])
    const entries = findEntryPoints(files, contents)
    expect(entries).toHaveLength(1)
    expect(entries[0].command).toBe('count')
  })

  it('should extract description', () => {
    const files = ['src/commands/count.ts']
    const contents: ContentMap = new Map([
      ['src/commands/count.ts', "export default class Count extends Command {\nstatic override description = 'Count lines'\n}"],
    ])
    const entries = findEntryPoints(files, contents)
    expect(entries[0].description).toBe('Count lines')
  })

  it('should return empty for no commands', () => {
    const files = ['src/utils.ts']
    const contents: ContentMap = new Map([['src/utils.ts', 'export function x() {}']])
    const entries = findEntryPoints(files, contents)
    expect(entries).toHaveLength(0)
  })

  it('should find multiple entry points', () => {
    const files = ['src/commands/a.ts', 'src/commands/b.ts']
    const contents: ContentMap = new Map([
      ['src/commands/a.ts', "export default class Alpha extends Command {\nstatic override description = 'A'\n}"],
      ['src/commands/b.ts', "export default class Beta extends Command {\nstatic override description = 'B'\n}"],
    ])
    const entries = findEntryPoints(files, contents)
    expect(entries).toHaveLength(2)
  })

  it('should skip non-Command default exports', () => {
    const files = ['src/index.ts']
    const contents: ContentMap = new Map([
      ['src/index.ts', 'export default class NotACommand {}'],
    ])
    const entries = findEntryPoints(files, contents)
    expect(entries).toHaveLength(0)
  })
})

// ─── buildGlossary ───────────────────────────────────────

describe('buildGlossary', () => {
  it('should extract exported interfaces', () => {
    const contents: ContentMap = new Map([
      ['src/types.ts', 'export interface Config { name: string }'],
    ])
    const glossary = buildGlossary(contents)
    expect(glossary.some((g) => g.term === 'Config')).toBe(true)
  })

  it('should extract exported types', () => {
    const contents: ContentMap = new Map([
      ['src/types.ts', 'export type Result = string | number'],
    ])
    const glossary = buildGlossary(contents)
    expect(glossary.some((g) => g.term === 'Result')).toBe(true)
  })

  it('should reference defining file', () => {
    const contents: ContentMap = new Map([
      ['src/models.ts', 'export interface User {}'],
    ])
    const glossary = buildGlossary(contents)
    const userEntry = glossary.find((g) => g.term === 'User')
    expect(userEntry?.file).toBe('src/models.ts')
  })

  it('should return empty for no exports', () => {
    const contents: ContentMap = new Map([
      ['src/index.ts', 'const x = 1'],
    ])
    expect(buildGlossary(contents)).toHaveLength(0)
  })

  it('should sort alphabetically', () => {
    const contents: ContentMap = new Map([
      ['src/types.ts', 'export interface Zebra {}\nexport interface Apple {}'],
    ])
    const glossary = buildGlossary(contents)
    expect(glossary[0].term).toBe('Apple')
    expect(glossary[1].term).toBe('Zebra')
  })
})

// ─── buildLearningGuide ─────────────────────────────────

describe('buildLearningGuide', () => {
  function makeContents(): ContentMap {
    return new Map([
      ['src/commands/count.ts', "import { Command } from '@oclif/core'\nexport default class Count extends Command {\nstatic override description = 'Count lines'\n}"],
      ['src/commands/count-helpers.ts', 'export interface CountResult {}\nexport function countLineTypes() {}'],
      ['src/commands/count-format-helpers.ts', 'export function formatCountTable() {}'],
      ['src/core/file-discovery.ts', 'export function discoverFiles() {}'],
    ])
  }

  it('should produce a complete learning guide', () => {
    const files = ['src/commands/count.ts', 'src/commands/count-helpers.ts', 'src/commands/count-format-helpers.ts', 'src/core/file-discovery.ts']
    const guide = buildLearningGuide('.', files, makeContents(), { role: 'mid', focus: 'all' })
    expect(guide.overview).toBeTruthy()
    expect(guide.architecture).toBeDefined()
    expect(guide.readingOrder.length).toBeGreaterThan(0)
    expect(guide.estimatedReadTime).toBeGreaterThan(0)
  })

  it('should include entry points', () => {
    const files = ['src/commands/count.ts']
    const contents: ContentMap = new Map([
      ['src/commands/count.ts', "export default class Count extends Command {\nstatic override description = 'Count'\n}"],
    ])
    const guide = buildLearningGuide('.', files, contents, { role: 'mid', focus: 'all' })
    expect(guide.entryPoints).toHaveLength(1)
    expect(guide.entryPoints[0].command).toBe('count')
  })

  it('should detect patterns', () => {
    const files = ['src/commands/count.ts', 'src/commands/count-helpers.ts', 'src/commands/count-format-helpers.ts']
    const guide = buildLearningGuide('.', files, makeContents(), { role: 'mid', focus: 'all' })
    expect(guide.keyPatterns.length).toBeGreaterThan(0)
  })

  it('should build glossary', () => {
    const files = ['src/commands/count-helpers.ts']
    const guide = buildLearningGuide('.', files, makeContents(), { role: 'mid', focus: 'all' })
    expect(guide.glossary.some((g) => g.term === 'CountResult')).toBe(true)
  })

  it('should estimate read time based on role', () => {
    const files = ['src/commands/count.ts']
    const contents: ContentMap = new Map([
      ['src/commands/count.ts', 'x\n'.repeat(300)],
    ])
    const junior = buildLearningGuide('.', files, contents, { role: 'junior', focus: 'all' })
    const senior = buildLearningGuide('.', files, contents, { role: 'senior', focus: 'all' })
    expect(junior.estimatedReadTime).toBeGreaterThanOrEqual(senior.estimatedReadTime)
  })

  it('should use role in overview', () => {
    const files = ['src/commands/count.ts']
    const contents: ContentMap = new Map([['src/commands/count.ts', 'x']])
    const guide = buildLearningGuide('.', files, contents, { role: 'junior', focus: 'all' })
    expect(guide.overview).toContain('beginner')
  })
})

// ─── formatLearningTable ─────────────────────────────────

describe('formatLearningTable', () => {
  function makeGuide(): LearningGuide {
    return {
      architecture: {
        dataFlow: 'Commands → Core',
        dependencies: 'Commands depends on Core',
        layers: [
          {
            description: 'CLI commands',
            files: 2,
            imports: ['Core'],
            keyFiles: ['src/commands/count.ts'],
            name: 'Commands',
            path: 'src/commands',
          },
        ],
      },
      entryPoints: [
        { command: 'count', description: 'Count lines', file: 'src/commands/count.ts' },
      ],
      estimatedReadTime: 5,
      glossary: [{ definition: 'Interface: Config', file: 'src/types.ts', term: 'Config' }],
      keyPatterns: [
        { description: 'Extends Command', exampleFile: 'src/commands/count.ts', frequency: 2, name: 'Command Pattern' },
      ],
      overview: 'This codebase has 3 files across 2 layers.',
      readingOrder: [
        {
          category: 'entry',
          complexity: 2,
          dependencies: 3,
          dependents: 0,
          file: 'src/commands/count.ts',
          reason: 'count.ts — CLI command entry point',
        },
      ],
    }
  }

  it('should contain Learning Guide header', () => {
    expect(formatLearningTable(makeGuide(), false)).toContain('Learning Guide')
  })

  it('should contain architecture info', () => {
    expect(formatLearningTable(makeGuide(), false)).toContain('Commands → Core')
  })

  it('should show entry points', () => {
    expect(formatLearningTable(makeGuide(), false)).toContain('count')
  })

  it('should show reading order', () => {
    expect(formatLearningTable(makeGuide(), false)).toContain('count.ts')
  })

  it('should show patterns', () => {
    expect(formatLearningTable(makeGuide(), false)).toContain('Command Pattern')
  })

  it('should show glossary in verbose mode', () => {
    expect(formatLearningTable(makeGuide(), true)).toContain('Config')
  })

  it('should show estimated read time', () => {
    expect(formatLearningTable(makeGuide(), false)).toContain('5 minute')
  })

  it('should show key files in verbose mode', () => {
    expect(formatLearningTable(makeGuide(), true)).toContain('count.ts')
  })

  it('should handle empty guide', () => {
    const emptyGuide: LearningGuide = {
      architecture: { dataFlow: '', dependencies: '', layers: [] },
      entryPoints: [],
      estimatedReadTime: 1,
      glossary: [],
      keyPatterns: [],
      overview: 'Empty codebase.',
      readingOrder: [],
    }
    const output = formatLearningTable(emptyGuide, false)
    expect(output).toContain('No entry points detected')
  })
})

// ─── formatLearningJson ──────────────────────────────────

describe('formatLearningJson', () => {
  it('should produce valid JSON', () => {
    const guide: LearningGuide = {
      architecture: { dataFlow: '', dependencies: '', layers: [] },
      entryPoints: [],
      estimatedReadTime: 0,
      glossary: [],
      keyPatterns: [],
      overview: '',
      readingOrder: [],
    }
    expect(() => JSON.parse(formatLearningJson(guide))).not.toThrow()
  })

  it('should contain overview', () => {
    const guide: LearningGuide = {
      architecture: { dataFlow: '', dependencies: '', layers: [] },
      entryPoints: [],
      estimatedReadTime: 0,
      glossary: [],
      keyPatterns: [],
      overview: 'Test overview',
      readingOrder: [],
    }
    const parsed = JSON.parse(formatLearningJson(guide))
    expect(parsed.overview).toBe('Test overview')
  })

  it('should serialize entry points', () => {
    const guide: LearningGuide = {
      architecture: { dataFlow: '', dependencies: '', layers: [] },
      entryPoints: [{ command: 'count', description: 'Count lines', file: 'src/commands/count.ts' }],
      estimatedReadTime: 5,
      glossary: [],
      keyPatterns: [],
      overview: 'Test',
      readingOrder: [],
    }
    const parsed = JSON.parse(formatLearningJson(guide))
    expect(parsed.entryPoints).toHaveLength(1)
    expect(parsed.entryPoints[0].command).toBe('count')
  })
})

// ─── Command metadata ────────────────────────────────────

describe('Learning command', () => {
  it('should have correct description', () => {
    expect(Learning.description).toContain('learning')
  })

  it('should have path arg', () => {
    expect(Learning.args.path).toBeDefined()
  })

  it('should have format flag', () => {
    expect(Learning.flags.format).toBeDefined()
  })

  it('should have output flag', () => {
    expect(Learning.flags.output).toBeDefined()
  })

  it('should have role flag', () => {
    expect(Learning.flags.role).toBeDefined()
  })

  it('should have focus flag', () => {
    expect(Learning.flags.focus).toBeDefined()
  })

  it('should have verbose flag', () => {
    expect(Learning.flags.verbose).toBeDefined()
  })

  it('should have examples', () => {
    expect(Learning.examples.length).toBeGreaterThan(0)
  })
})
