import { describe, expect, it } from 'vitest'

import {
  buildTaxonomistResult,
  buildTaxonomyTree,
  classifyClass,
  classifyFamily,
  classifyFile,
  classifyGenus,
  classifyKingdom,
  classifyOrder,
  classifyPhylum,
  classifyFile as classifyFileFull,
  collectLeafGroups,
  classifyFile as fullClassify,
  computeClassificationConfidence,
  computeSimilarity,
  computeTaxonomyStats,
  computeTreeDepth,
  countTaxa,
  detectTraits,
  extractGroupTraits,
  findClosestRelative,
  generateTaxonomyRecommendations,
  groupBy,
  type Classification,
  type Taxon,
} from '../src/commands/taxonomist-helpers.js'

import {
  formatClassificationTable,
  formatCoverageScore,
  formatRecommendations,
  formatSimilarityPairs,
  formatTaxonomistJSON,
  formatTaxonomistTable,
  formatTaxonomyStats,
  formatTaxonomyTree,
  getRankColor,
} from '../src/commands/taxonomist-format-helpers.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SOURCE_COMMAND = `import { Args, Command, Flags } from '@oclif/core'
import ora from 'ora'

export default class Count extends Command {
  static override description = 'Count lines'

  static override flags = {
    verbose: Flags.boolean({ char: 'v' }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Count)
    this.log('done')
  }
}
`

const SOURCE_UTILITY = `import chalk from 'chalk'

export function helperOne(): string {
  return chalk.rgb(255, 0, 0)('red')
}

export function helperTwo(): number {
  return 42
}

export interface HelperOpts {
  name: string
  value: number
}
`

const SOURCE_CORE = `import * as fs from 'node:fs/promises'

export class FileDiscovery {
  private cache = new Map<string, string>()

  async discover(pattern: string): Promise<string[]> {
    const files = await fs.readdir('.')
    return files.filter(f => f.endsWith('.ts'))
  }
}
`

const TEST_FILE = `import { describe, expect, it } from 'vitest'
import { helperOne } from '../src/helpers.js'

describe('helperOne', () => {
  it('returns red string', () => {
    expect(helperOne()).toBe('red')
  })
})
`

const CONFIG_FILE = `{
  "name": "codeforge",
  "version": "0.1.0",
  "type": "module"
}
`

const MARKDOWN_FILE = `# Title

Some documentation content here.

## Section

More text.
`

const EMPTY_FILE = ''

const SMALL_FILE = 'const x = 1\n'

const LARGE_FILE = Array.from({ length: 250 }, (_, i) => `const line${i} = ${i}`).join('\n')

function makeClassification(
  file: string,
  kingdom: string,
  phylum: string,
  cls: string,
  order: string,
  family: string,
  genus: string,
  traits: string[] = [],
  confidence = 50,
): Classification {
  return {
    file,
    taxonomy: { kingdom, phylum, class: cls, order, family, genus, species: file },
    traits,
    confidence,
    closestRelative: '',
    similarity: 0,
  }
}

// ─── classifyKingdom ──────────────────────────────────────────────────────────

describe('classifyKingdom', () => {
  it('classifies test files as Test', () => {
    expect(classifyKingdom('src/count.test.ts')).toBe('Test')
    expect(classifyKingdom('test/count.spec.ts')).toBe('Test')
    expect(classifyKingdom('src/__test__/foo.ts')).toBe('Test')
  })

  it('classifies documentation files as Documentation', () => {
    expect(classifyKingdom('README.md')).toBe('Documentation')
    expect(classifyKingdom('docs/guide.txt')).toBe('Documentation')
  })

  it('classifies config files as Config', () => {
    expect(classifyKingdom('package.json')).toBe('Config')
    expect(classifyKingdom('tsconfig.yaml')).toBe('Config')
    expect(classifyKingdom('tsconfig.yml')).toBe('Config')
    expect(classifyKingdom('.eslintrc.json')).toBe('Config')
    expect(classifyKingdom('config/settings.json')).toBe('Config')
  })

  it('classifies source files as Source', () => {
    expect(classifyKingdom('src/commands/count.ts')).toBe('Source')
    expect(classifyKingdom('src/core/discovery.ts')).toBe('Source')
  })

  it('classifies unknown source as Source', () => {
    expect(classifyKingdom('src/utils/helpers.ts')).toBe('Source')
  })
})

// ─── classifyPhylum ───────────────────────────────────────────────────────────

describe('classifyPhylum', () => {
  it('classifies test kingdom phyla', () => {
    expect(classifyPhylum('test/fixture/data.ts', '', 'Test')).toBe('Fixture')
    expect(classifyPhylum('test/mock/thing.ts', '', 'Test')).toBe('Mock')
    expect(classifyPhylum('test/stub/thing.ts', '', 'Test')).toBe('Mock')
    expect(classifyPhylum('test/integration/app.ts', '', 'Test')).toBe('Integration')
    expect(classifyPhylum('test/e2e/flow.ts', '', 'Test')).toBe('Integration')
    expect(classifyPhylum('test/unit/math.ts', '', 'Test')).toBe('Unit')
  })

  it('classifies documentation as Markdown', () => {
    expect(classifyPhylum('README.md', '', 'Documentation')).toBe('Markdown')
  })

  it('classifies config as Settings', () => {
    expect(classifyPhylum('package.json', '', 'Config')).toBe('Settings')
  })

  it('classifies command files as Command', () => {
    expect(classifyPhylum('src/commands/count.ts', SOURCE_COMMAND, 'Source')).toBe('Command')
  })

  it('classifies core files as Core', () => {
    expect(classifyPhylum('src/core/discovery.ts', SOURCE_CORE, 'Source')).toBe('Core')
  })

  it('classifies utility files as Utility', () => {
    expect(classifyPhylum('src/utils/helpers.ts', SOURCE_UTILITY, 'Source')).toBe('Utility')
  })

  it('classifies files with flags and exports as Command', () => {
    const content = `import { Flags } from '@oclif/core'
export async function run() {
  const { flags } = Flags.string({ char: 'f' })
}
`
    expect(classifyPhylum('src/something.ts', content, 'Source')).toBe('Command')
  })

  it('classifies files with just exports as Utility', () => {
    const content = 'export function foo() {}\n'
    expect(classifyPhylum('src/something.ts', content, 'Source')).toBe('Utility')
  })

  it('defaults to Utility for source files', () => {
    expect(classifyPhylum('src/random.ts', '', 'Source')).toBe('Utility')
  })
})

// ─── classifyClass ────────────────────────────────────────────────────────────

describe('classifyClass', () => {
  it('classifies Command phylum', () => {
    expect(classifyClass('src/commands/report.ts', '', 'Command')).toBe('Reporting')
    expect(classifyClass('src/commands/format.ts', '', 'Command')).toBe('Reporting')
    expect(classifyClass('src/commands/config.ts', '', 'Command')).toBe('Config')
    expect(classifyClass('src/commands/init.ts', '', 'Command')).toBe('Config')
    expect(classifyClass('src/commands/discover.ts', '', 'Command')).toBe('Discovery')
    expect(classifyClass('src/commands/find.ts', '', 'Command')).toBe('Discovery')
    expect(classifyClass('src/commands/count.ts', '', 'Command')).toBe('Analysis')
  })

  it('classifies Core phylum', () => {
    expect(classifyClass('src/core/engine.ts', 'export class Engine {}', 'Core')).toBe('Engine')
    expect(classifyClass('src/core/base.ts', 'export function setup() {}', 'Core')).toBe('Foundation')
  })

  it('classifies Unit phylum as Assertion', () => {
    expect(classifyClass('test/unit.ts', '', 'Unit')).toBe('Assertion')
  })

  it('classifies Integration phylum as Workflow', () => {
    expect(classifyClass('test/integration.ts', '', 'Integration')).toBe('Workflow')
  })

  it('defaults to General', () => {
    expect(classifyClass('src/thing.ts', '', 'Utility')).toBe('General')
  })
})

// ─── classifyOrder ────────────────────────────────────────────────────────────

describe('classifyOrder', () => {
  it('classifies Analysis class orders', () => {
    expect(classifyOrder('a.ts', 'const regex = /foo/', 'Analysis')).toBe('Pattern')
    expect(classifyOrder('a.ts', 'const x = item.match(/bar/)', 'Analysis')).toBe('Pattern')
    expect(classifyOrder('a.ts', 'const score = 5; const metric = 3', 'Analysis')).toBe('Metric')
    expect(classifyOrder('a.ts', 'const count = items.length', 'Analysis')).toBe('Metric')
    expect(classifyOrder('a.ts', 'function parse(s) {} function transform() {}', 'Analysis')).toBe('Dynamic')
    expect(classifyOrder('a.ts', 'function basic() {}', 'Analysis')).toBe('Static')
  })

  it('classifies Reporting as Output', () => {
    expect(classifyOrder('a.ts', '', 'Reporting')).toBe('Output')
  })

  it('classifies Discovery as Scan', () => {
    expect(classifyOrder('a.ts', '', 'Discovery')).toBe('Scan')
  })

  it('defaults to Standard', () => {
    expect(classifyOrder('a.ts', '', 'General')).toBe('Standard')
  })
})

// ─── classifyFamily ───────────────────────────────────────────────────────────

describe('classifyFamily', () => {
  it('classifies by line count', () => {
    expect(classifyFamily(EMPTY_FILE)).toBe('Compact')
    expect(classifyFamily(SMALL_FILE)).toBe('Compact')
    expect(classifyFamily(SOURCE_COMMAND)).toBe('Compact')
    expect(classifyFamily(LARGE_FILE)).toBe('Large')
  })

  it('classifies Medium at 51-150 lines', () => {
    const medium = Array.from({ length: 80 }, (_, i) => `// line ${i}`).join('\n')
    expect(classifyFamily(medium)).toBe('Medium')
  })

  it('classifies Large at 151-400 lines', () => {
    const large = Array.from({ length: 250 }, (_, i) => `// line ${i}`).join('\n')
    expect(classifyFamily(large)).toBe('Large')
  })

  it('boundary: exactly 50 lines is Compact', () => {
    const content = Array.from({ length: 50 }, (_, i) => `line ${i}`).join('\n')
    expect(classifyFamily(content)).toBe('Compact')
  })

  it('boundary: exactly 150 lines is Medium', () => {
    const content = Array.from({ length: 150 }, (_, i) => `line ${i}`).join('\n')
    expect(classifyFamily(content)).toBe('Medium')
  })

  it('boundary: exactly 400 lines is Large', () => {
    const content = Array.from({ length: 400 }, (_, i) => `line ${i}`).join('\n')
    expect(classifyFamily(content)).toBe('Large')
  })
})

// ─── classifyGenus ────────────────────────────────────────────────────────────

describe('classifyGenus', () => {
  it('classifies Standalone (no exports, no imports)', () => {
    expect(classifyGenus('const x = 1')).toBe('Standalone')
  })

  it('classifies MultiExport (5+ exports)', () => {
    const content = Array.from({ length: 6 }, (_, i) => `export const item${i} = ${i}`).join('\n')
    expect(classifyGenus(content)).toBe('MultiExport')
  })

  it('classifies Aggregator (1 export, 4+ imports)', () => {
    const content = [
      'import a from "a"',
      'import b from "b"',
      'import c from "c"',
      'import d from "d"',
      'export const result = 1',
    ].join('\n')
    expect(classifyGenus(content)).toBe('Aggregator')
  })

  it('classifies SelfContained (exports but no imports)', () => {
    const content = 'export function foo() { return 1 }\n'
    expect(classifyGenus(content)).toBe('SelfContained')
  })

  it('classifies Connected (6+ imports)', () => {
    const content = Array.from({ length: 7 }, (_, i) => `import mod${i} from "mod${i}"`).join('\n')
    expect(classifyGenus(content)).toBe('Connected')
  })

  it('classifies Simple (default)', () => {
    const content = 'import foo from "bar"\nexport const x = 1\nexport const y = 2\n'
    expect(classifyGenus(content)).toBe('Simple')
  })
})

// ─── detectTraits ─────────────────────────────────────────────────────────────

describe('detectTraits', () => {
  it('detects has-default-export', () => {
    const traits = detectTraits('a.ts', 'export default function main() {}')
    expect(traits).toContain('has-default-export')
  })

  it('detects exports-functions', () => {
    const traits = detectTraits('a.ts', 'export function foo() {}')
    expect(traits).toContain('exports-functions')
  })

  it('detects exports-functions with async', () => {
    const traits = detectTraits('a.ts', 'export async function foo() {}')
    expect(traits).toContain('exports-functions')
  })

  it('detects exports-interfaces', () => {
    const traits = detectTraits('a.ts', 'export interface Opts { name: string }')
    expect(traits).toContain('exports-interfaces')
  })

  it('detects exports-types', () => {
    const traits = detectTraits('a.ts', 'export type ID = string')
    expect(traits).toContain('exports-types')
  })

  it('detects exports-constants', () => {
    const traits = detectTraits('a.ts', 'export const MAX = 100')
    expect(traits).toContain('exports-constants')
  })

  it('detects exports-classes', () => {
    const traits = detectTraits('a.ts', 'export class Engine {}')
    expect(traits).toContain('exports-classes')
  })

  it('detects has-imports', () => {
    const traits = detectTraits('a.ts', 'import chalk from "chalk"')
    expect(traits).toContain('has-imports')
  })

  it('detects uses-async', () => {
    const traits = detectTraits('a.ts', 'async function run() {}')
    expect(traits).toContain('uses-async')
  })

  it('detects uses-classes', () => {
    const traits = detectTraits('a.ts', 'class MyClass {}')
    expect(traits).toContain('uses-classes')
  })

  it('detects uses-interfaces', () => {
    const traits = detectTraits('a.ts', 'interface Config {}')
    expect(traits).toContain('uses-interfaces')
  })

  it('detects error-handling', () => {
    const traits = detectTraits('a.ts', 'try { foo() } catch (e) {}')
    expect(traits).toContain('error-handling')
  })

  it('detects has-jsdoc', () => {
    const traits = detectTraits('a.ts', '/** docs */\nfunction foo() {}')
    expect(traits).toContain('has-jsdoc')
  })

  it('detects terminal-output (chalk)', () => {
    const traits = detectTraits('a.ts', 'import chalk from "chalk"\nchalk.red("x")')
    expect(traits).toContain('terminal-output')
  })

  it('detects progress-indicator (ora)', () => {
    const traits = detectTraits('a.ts', 'import ora from "ora"\nora("x")')
    expect(traits).toContain('progress-indicator')
  })

  it('detects test-suite', () => {
    const traits = detectTraits('a.ts', "import { describe } from 'vitest'\ndescribe('x', () => {})")
    expect(traits).toContain('test-suite')
  })

  it('detects large-file (>200 lines)', () => {
    const content = Array.from({ length: 250 }, (_, i) => `line ${i}`).join('\n')
    const traits = detectTraits('a.ts', content)
    expect(traits).toContain('large-file')
    expect(traits).not.toContain('small-file')
  })

  it('detects small-file (<30 lines)', () => {
    const traits = detectTraits('a.ts', 'const x = 1')
    expect(traits).toContain('small-file')
    expect(traits).not.toContain('large-file')
  })

  it('returns small-file for minimal file', () => {
    const traits = detectTraits('a.ts', '')
    expect(traits).toEqual(['small-file'])
  })
})

// ─── classifyFile ─────────────────────────────────────────────────────────────

describe('classifyFile', () => {
  it('classifies a source command file', () => {
    const cls = classifyFile('src/commands/count.ts', SOURCE_COMMAND)
    expect(cls.taxonomy.kingdom).toBe('Source')
    expect(cls.taxonomy.phylum).toBe('Command')
    expect(cls.taxonomy.class).toBe('Analysis')
    expect(cls.taxonomy.species).toBe('src/commands/count.ts')
    expect(cls.traits.length).toBeGreaterThan(0)
    expect(cls.confidence).toBeGreaterThan(0)
  })

  it('classifies a test file', () => {
    const cls = classifyFile('test/count.test.ts', TEST_FILE)
    expect(cls.taxonomy.kingdom).toBe('Test')
    expect(cls.taxonomy.phylum).toBe('Unit')
  })

  it('classifies a config file', () => {
    const cls = classifyFile('package.json', CONFIG_FILE)
    expect(cls.taxonomy.kingdom).toBe('Config')
  })

  it('classifies documentation', () => {
    const cls = classifyFile('README.md', MARKDOWN_FILE)
    expect(cls.taxonomy.kingdom).toBe('Documentation')
  })

  it('sets initial closestRelative to empty', () => {
    const cls = classifyFile('src/a.ts', 'export const x = 1')
    expect(cls.closestRelative).toBe('')
    expect(cls.similarity).toBe(0)
  })
})

// ─── computeClassificationConfidence ──────────────────────────────────────────

describe('computeClassificationConfidence', () => {
  it('starts at 50 base', () => {
    const taxonomy = { kingdom: 'Source', phylum: 'Utility', class: 'General', order: 'Standard', family: 'Compact', genus: 'Simple', species: '' }
    const conf = computeClassificationConfidence(taxonomy, [])
    // Simple (-5) + Standard (-5) = 40
    expect(conf).toBe(40)
  })

  it('adds 3 per trait (max +20)', () => {
    const taxonomy = { kingdom: 'Source', phylum: 'Utility', class: 'General', order: 'Standard', family: 'Compact', genus: 'Simple', species: '' }
    const traits = ['a', 'b', 'c', 'd']
    const conf = computeClassificationConfidence(taxonomy, traits)
    // 50 + 12 - 5 - 5 = 52
    expect(conf).toBe(52)
  })

  it('caps at 20 bonus for traits', () => {
    const taxonomy = { kingdom: 'Source', phylum: 'Utility', class: 'General', order: 'Standard', family: 'Compact', genus: 'Simple', species: '' }
    const traits = Array.from({ length: 20 }, (_, i) => `trait-${i}`)
    const conf = computeClassificationConfidence(taxonomy, traits)
    // 50 + 20 - 5 - 5 = 60
    expect(conf).toBe(60)
  })

  it('adds 10 for specific phylum', () => {
    const taxonomy = { kingdom: 'Source', phylum: 'Command', class: 'Analysis', order: 'Static', family: 'Compact', genus: 'SelfContained', species: '' }
    const conf = computeClassificationConfidence(taxonomy, [])
    // 50 + 10 = 60
    expect(conf).toBe(60)
  })

  it('clamps at 100', () => {
    const taxonomy = { kingdom: 'Source', phylum: 'Command', class: 'Analysis', order: 'Pattern', family: 'Compact', genus: 'SelfContained', species: '' }
    const traits = Array.from({ length: 15 }, (_, i) => `t-${i}`)
    const conf = computeClassificationConfidence(taxonomy, traits)
    expect(conf).toBeLessThanOrEqual(100)
  })

  it('clamps at 0', () => {
    const taxonomy = { kingdom: 'Source', phylum: 'Utility', class: 'General', order: 'Standard', family: 'Compact', genus: 'Simple', species: '' }
    const conf = computeClassificationConfidence(taxonomy, [])
    expect(conf).toBeGreaterThanOrEqual(0)
  })
})

// ─── computeSimilarity ────────────────────────────────────────────────────────

describe('computeSimilarity', () => {
  it('returns 0 for completely different files', () => {
    const a = makeClassification('a.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained')
    const b = makeClassification('b.ts', 'Test', 'Unit', 'Assertion', 'Standard', 'Medium', 'Simple')
    expect(computeSimilarity(a, b)).toBe(0)
  })

  it('returns high similarity for same taxonomy', () => {
    const a = makeClassification('a.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained', ['exports-functions', 'has-imports'])
    const b = makeClassification('b.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained', ['exports-functions', 'has-imports'])
    expect(computeSimilarity(a, b)).toBe(100)
  })

  it('computes partial taxonomy match', () => {
    const a = makeClassification('a.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained')
    const b = makeClassification('b.ts', 'Source', 'Command', 'Reporting', 'Output', 'Medium', 'Simple')
    // kingdom + phylum match = 2/6 * 70 = ~23
    const sim = computeSimilarity(a, b)
    expect(sim).toBeGreaterThanOrEqual(20)
    expect(sim).toBeLessThan(30)
  })

  it('factors in trait overlap', () => {
    const a = makeClassification('a.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained', ['x', 'y', 'z'])
    const b = makeClassification('b.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained', ['x', 'y', 'w'])
    // taxonomy = 100% (70), traits = 2/4 * 30 = 15
    const sim = computeSimilarity(a, b)
    expect(sim).toBe(85)
  })
})

// ─── findClosestRelative ──────────────────────────────────────────────────────

describe('findClosestRelative', () => {
  it('finds the closest file', () => {
    const a = makeClassification('a.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained')
    const b = makeClassification('b.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained')
    const c = makeClassification('c.ts', 'Test', 'Unit', 'Assertion', 'Standard', 'Medium', 'Simple')

    const result = findClosestRelative(a, [a, b, c])
    expect(result.file).toBe('b.ts')
    expect(result.similarity).toBe(70)
  })

  it('skips self', () => {
    const a = makeClassification('a.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained')
    const result = findClosestRelative(a, [a])
    expect(result.file).toBe('')
    expect(result.similarity).toBe(0)
  })

  it('returns empty for single item', () => {
    const a = makeClassification('a.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained')
    const result = findClosestRelative(a, [a])
    expect(result.file).toBe('')
  })
})

// ─── groupBy ──────────────────────────────────────────────────────────────────

describe('groupBy', () => {
  it('groups by key', () => {
    const items = [
      makeClassification('a.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained'),
      makeClassification('b.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained'),
      makeClassification('c.ts', 'Test', 'Unit', 'Assertion', 'Standard', 'Medium', 'Simple'),
    ]
    const groups = groupBy(items, (c) => c.taxonomy.kingdom)
    expect(groups.get('Source')?.length).toBe(2)
    expect(groups.get('Test')?.length).toBe(1)
  })

  it('returns empty map for empty array', () => {
    const groups = groupBy([], () => 'x')
    expect(groups.size).toBe(0)
  })
})

// ─── extractGroupTraits ───────────────────────────────────────────────────────

describe('extractGroupTraits', () => {
  it('extracts traits present in majority', () => {
    const items = [
      makeClassification('a.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained', ['x', 'y']),
      makeClassification('b.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained', ['x', 'z']),
    ]
    const traits = extractGroupTraits(items)
    expect(traits).toContain('x')
  })

  it('returns empty for empty array', () => {
    expect(extractGroupTraits([])).toEqual([])
  })
})

// ─── buildTaxonomyTree ────────────────────────────────────────────────────────

describe('buildTaxonomyTree', () => {
  it('builds a tree from classifications', () => {
    const classifications = [
      makeClassification('a.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained'),
      makeClassification('b.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained'),
      makeClassification('c.ts', 'Test', 'Unit', 'Assertion', 'Standard', 'Medium', 'Simple'),
    ]
    const tree = buildTaxonomyTree(classifications)
    expect(tree.name).toBe('Codebase')
    expect(tree.fileCount).toBe(3)
    expect(tree.children.length).toBe(2) // Source + Test
  })

  it('builds a tree with single file', () => {
    const classifications = [
      makeClassification('a.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained'),
    ]
    const tree = buildTaxonomyTree(classifications)
    expect(tree.name).toBe('Codebase')
    expect(tree.fileCount).toBe(1)
    expect(tree.children.length).toBe(1)
  })

  it('builds nested hierarchy', () => {
    const classifications = [
      makeClassification('a.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained'),
    ]
    const tree = buildTaxonomyTree(classifications)
    // Root -> Source -> Command -> Analysis -> Static -> Compact -> SelfContained
    let node = tree.children[0]! // Source
    expect(node.name).toBe('Source')
    node = node.children[0]! // Command
    expect(node.name).toBe('Command')
    node = node.children[0]! // Analysis
    expect(node.name).toBe('Analysis')
  })

  it('handles empty classifications', () => {
    const tree = buildTaxonomyTree([])
    expect(tree.name).toBe('Codebase')
    expect(tree.fileCount).toBe(0)
    expect(tree.children.length).toBe(0)
  })
})

// ─── countTaxa ────────────────────────────────────────────────────────────────

describe('countTaxa', () => {
  it('counts root only', () => {
    const taxon: Taxon = {
      rank: 'kingdom',
      name: 'Root',
      description: '',
      children: [],
      files: [],
      fileCount: 0,
      traits: [],
    }
    expect(countTaxa(taxon)).toBe(1)
  })

  it('counts recursively', () => {
    const taxon: Taxon = {
      rank: 'kingdom',
      name: 'Root',
      description: '',
      children: [
        { rank: 'phylum', name: 'A', description: '', children: [], files: [], fileCount: 0, traits: [] },
        { rank: 'phylum', name: 'B', description: '', children: [], files: [], fileCount: 0, traits: [] },
      ],
      files: [],
      fileCount: 0,
      traits: [],
    }
    expect(countTaxa(taxon)).toBe(3)
  })
})

// ─── computeTreeDepth ─────────────────────────────────────────────────────────

describe('computeTreeDepth', () => {
  it('returns 1 for leaf', () => {
    const taxon: Taxon = {
      rank: 'kingdom', name: 'Root', description: '', children: [], files: [], fileCount: 0, traits: [],
    }
    expect(computeTreeDepth(taxon)).toBe(1)
  })

  it('computes depth recursively', () => {
    const taxon: Taxon = {
      rank: 'kingdom', name: 'Root', description: '', files: [], fileCount: 0, traits: [],
      children: [{
        rank: 'phylum', name: 'A', description: '', files: [], fileCount: 0, traits: [],
        children: [{
          rank: 'class', name: 'B', description: '', files: [], fileCount: 0, traits: [],
          children: [],
        }],
      }],
    }
    expect(computeTreeDepth(taxon)).toBe(3)
  })
})

// ─── collectLeafGroups ────────────────────────────────────────────────────────

describe('collectLeafGroups', () => {
  it('returns single leaf', () => {
    const taxon: Taxon = {
      rank: 'genus', name: 'SelfContained', description: '', files: ['a.ts'], fileCount: 1, traits: [],
      children: [],
    }
    const leaves = collectLeafGroups(taxon)
    expect(leaves.length).toBe(1)
    expect(leaves[0]!.name).toBe('SelfContained')
  })

  it('collects all leaves', () => {
    const taxon: Taxon = {
      rank: 'kingdom', name: 'Root', description: '', files: [], fileCount: 0, traits: [],
      children: [
        { rank: 'genus', name: 'A', description: '', files: ['a.ts'], fileCount: 1, traits: [], children: [] },
        { rank: 'genus', name: 'B', description: '', files: ['b.ts'], fileCount: 1, traits: [], children: [] },
      ],
    }
    const leaves = collectLeafGroups(taxon)
    expect(leaves.length).toBe(2)
  })
})

// ─── computeTaxonomyStats ─────────────────────────────────────────────────────

describe('computeTaxonomyStats', () => {
  it('computes stats for empty tree', () => {
    const root: Taxon = {
      rank: 'kingdom', name: 'Codebase', description: '', files: [], fileCount: 0, traits: [],
      children: [],
    }
    const stats = computeTaxonomyStats(root, [])
    expect(stats.totalFiles).toBe(0)
    expect(stats.totalTaxa).toBe(1)
    expect(stats.coverageScore).toBe(100)
    expect(stats.largestGroup).toBe('Codebase (0)')
    expect(stats.smallestGroup).toBe('Codebase (0)')
  })

  it('computes stats for populated tree', () => {
    const classifications = [
      makeClassification('a.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained', [], 80),
      makeClassification('b.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained', [], 60),
      makeClassification('c.ts', 'Test', 'Unit', 'Assertion', 'Standard', 'Medium', 'Simple', [], 30),
    ]
    const tree = buildTaxonomyTree(classifications)
    const stats = computeTaxonomyStats(tree, classifications)
    expect(stats.totalFiles).toBe(3)
    expect(stats.totalTaxa).toBeGreaterThan(1)
    expect(stats.orphanCount).toBe(1) // only c.ts with conf 30 < 50
    expect(stats.coverageScore).toBe(67) // 2/3 * 100 = 66.67 -> 67
  })
})

// ─── generateTaxonomyRecommendations ──────────────────────────────────────────

describe('generateTaxonomyRecommendations', () => {
  it('warns about orphans', () => {
    const root: Taxon = {
      rank: 'kingdom', name: 'Codebase', description: '', files: [], fileCount: 0, traits: [],
      children: [],
    }
    const classifications = [
      makeClassification('a.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained', [], 20),
    ]
    const stats = { totalFiles: 1, totalTaxa: 1, depth: 1, largestGroup: 'N/A', smallestGroup: 'N/A', avgGroupSize: 0, orphanCount: 1, coverageScore: 0 }
    const recs = generateTaxonomyRecommendations(root, classifications, stats)
    expect(recs.some((r) => r.includes('low classification confidence'))).toBe(true)
  })

  it('warns about large groups', () => {
    const classifications = Array.from({ length: 15 }, (_, i) =>
      makeClassification(`f${i}.ts`, 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained', [], 80),
    )
    const tree = buildTaxonomyTree(classifications)
    const stats = computeTaxonomyStats(tree, classifications)
    const recs = generateTaxonomyRecommendations(tree, classifications, stats)
    expect(recs.some((r) => r.includes('10+ files'))).toBe(true)
  })

  it('warns about misplaced files', () => {
    const classifications = [
      makeClassification('src/helper.ts', 'Test', 'Unit', 'Assertion', 'Standard', 'Compact', 'Simple', [], 80),
    ]
    const root: Taxon = {
      rank: 'kingdom', name: 'Codebase', description: '', files: [], fileCount: 0, traits: [],
      children: [],
    }
    const stats = { totalFiles: 1, totalTaxa: 1, depth: 1, largestGroup: 'N/A', smallestGroup: 'N/A', avgGroupSize: 0, orphanCount: 0, coverageScore: 100 }
    const recs = generateTaxonomyRecommendations(root, classifications, stats)
    expect(recs.some((r) => r.includes('misclassified'))).toBe(true)
  })

  it('warns about low coverage', () => {
    const root: Taxon = {
      rank: 'kingdom', name: 'Codebase', description: '', files: [], fileCount: 0, traits: [],
      children: [],
    }
    const classifications = [
      makeClassification('a.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'Simple', [], 20),
    ]
    const stats = { totalFiles: 1, totalTaxa: 1, depth: 5, largestGroup: 'N/A', smallestGroup: 'N/A', avgGroupSize: 0, orphanCount: 1, coverageScore: 0 }
    const recs = generateTaxonomyRecommendations(root, classifications, stats)
    expect(recs.some((r) => r.includes('Low classification coverage'))).toBe(true)
  })

  it('warns about shallow taxonomy', () => {
    const root: Taxon = {
      rank: 'kingdom', name: 'Codebase', description: '', files: [], fileCount: 0, traits: [],
      children: [],
    }
    const classifications = [
      makeClassification('a.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained', [], 80),
    ]
    const stats = { totalFiles: 1, totalTaxa: 1, depth: 1, largestGroup: 'N/A', smallestGroup: 'N/A', avgGroupSize: 0, orphanCount: 0, coverageScore: 100 }
    const recs = generateTaxonomyRecommendations(root, classifications, stats)
    expect(recs.some((r) => r.includes('Shallow taxonomy'))).toBe(true)
  })

  it('praises well-structured taxonomy', () => {
    const classifications = [
      makeClassification('a.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained', [], 80),
      makeClassification('b.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained', [], 80),
    ]
    const tree = buildTaxonomyTree(classifications)
    const stats = computeTaxonomyStats(tree, classifications)
    // Only generate recs without orphans/low-coverage/shallow issues
    const recs = generateTaxonomyRecommendations(tree, classifications, stats)
    // Should have a positive recommendation or be about structure
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── buildTaxonomistResult ────────────────────────────────────────────────────

describe('buildTaxonomistResult', () => {
  it('builds result from files and contents', () => {
    const files = ['src/commands/count.ts', 'test/count.test.ts']
    const contents = [SOURCE_COMMAND, TEST_FILE]
    const result = buildTaxonomistResult(files, contents)

    expect(result.classifications.length).toBe(2)
    expect(result.taxonomy.name).toBe('Codebase')
    expect(result.taxonomy.fileCount).toBe(2)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('fills in closest relatives', () => {
    const files = ['a.ts', 'b.ts']
    const contents = [SOURCE_COMMAND, SOURCE_COMMAND]
    const result = buildTaxonomistResult(files, contents)

    for (const cls of result.classifications) {
      // With 2 similar files, each should find the other
      if (result.classifications.length > 1) {
        expect(cls.closestRelative).not.toBe('')
      }
    }
  })

  it('handles single file', () => {
    const result = buildTaxonomistResult(['a.ts'], ['const x = 1'])
    expect(result.classifications.length).toBe(1)
    expect(result.classifications[0]!.closestRelative).toBe('')
    expect(result.classifications[0]!.similarity).toBe(0)
  })

  it('handles empty input', () => {
    const result = buildTaxonomistResult([], [])
    expect(result.classifications.length).toBe(0)
    expect(result.taxonomy.fileCount).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('handles mismatched arrays', () => {
    const result = buildTaxonomistResult(['a.ts', 'b.ts'], ['const x = 1'])
    expect(result.classifications.length).toBe(2)
    // b.ts should use empty content
    expect(result.classifications[1]!.file).toBe('b.ts')
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('getRankColor', () => {
  it('returns a function for known ranks', () => {
    expect(typeof getRankColor('kingdom')).toBe('function')
    expect(typeof getRankColor('phylum')).toBe('function')
    expect(typeof getRankColor('class')).toBe('function')
    expect(typeof getRankColor('order')).toBe('function')
    expect(typeof getRankColor('family')).toBe('function')
    expect(typeof getRankColor('genus')).toBe('function')
    expect(typeof getRankColor('species')).toBe('function')
  })

  it('returns chalk.white for unknown rank', () => {
    expect(typeof getRankColor('unknown')).toBe('function')
  })
})

describe('formatTaxonomyTree', () => {
  it('formats a simple tree', () => {
    const taxon: Taxon = {
      rank: 'kingdom', name: 'Source', description: '', files: ['a.ts'], fileCount: 1, traits: [],
      children: [],
    }
    const output = formatTaxonomyTree(taxon)
    expect(output).toContain('Taxonomy Tree')
    expect(output).toContain('Source')
    expect(output).toContain('[Kingdom]')
    expect(output).toContain('1 files')
  })

  it('formats nested tree', () => {
    const taxon: Taxon = {
      rank: 'kingdom', name: 'Codebase', description: '', files: [], fileCount: 2, traits: [],
      children: [
        { rank: 'phylum', name: 'Command', description: '', files: ['a.ts'], fileCount: 1, traits: [], children: [] },
        { rank: 'phylum', name: 'Core', description: '', files: ['b.ts'], fileCount: 1, traits: [], children: [] },
      ],
    }
    const output = formatTaxonomyTree(taxon)
    expect(output).toContain('Command')
    expect(output).toContain('Core')
  })
})

describe('formatClassificationTable', () => {
  it('formats classification table', () => {
    const classifications = [
      makeClassification('src/count.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained', [], 80),
    ]
    const output = formatClassificationTable(classifications)
    expect(output).toContain('Classifications')
    expect(output).toContain('src/count.ts')
    expect(output).toContain('Source')
    expect(output).toContain('80%')
  })

  it('handles empty classifications', () => {
    const output = formatClassificationTable([])
    expect(output).toContain('No classifications')
  })

  it('truncates long file names', () => {
    const longName = 'src/very/deeply/nested/path/to/a/file/that/is/very/long.ts'
    const classifications = [makeClassification(longName, 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained', [], 80)]
    const output = formatClassificationTable(classifications)
    expect(output).toContain('...')
  })
})

describe('formatSimilarityPairs', () => {
  it('formats similarity pairs', () => {
    const classifications = [
      makeClassification('a.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained', [], 80),
      makeClassification('b.ts', 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained', [], 80),
    ]
    classifications[0]!.closestRelative = 'b.ts'
    classifications[0]!.similarity = 95
    classifications[1]!.closestRelative = 'a.ts'
    classifications[1]!.similarity = 95

    const output = formatSimilarityPairs(classifications)
    expect(output).toContain('Closest Relatives')
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
    expect(output).toContain('95%')
  })

  it('handles empty', () => {
    const output = formatSimilarityPairs([])
    expect(output).toContain('No similarity')
  })

  it('shows truncation message for 15+ pairs', () => {
    const classifications = Array.from({ length: 16 }, (_, i) => {
      const cls = makeClassification(`f${i}.ts`, 'Source', 'Command', 'Analysis', 'Static', 'Compact', 'SelfContained', [], 80)
      cls.closestRelative = `f${(i + 1) % 16}.ts`
      cls.similarity = 50
      return cls
    })
    const output = formatSimilarityPairs(classifications)
    expect(output).toContain('... and')
  })
})

describe('formatCoverageScore', () => {
  it('formats high score in green', () => {
    const output = formatCoverageScore(90)
    expect(output).toContain('90%')
    expect(output).toContain('█')
  })

  it('formats medium score', () => {
    const output = formatCoverageScore(60)
    expect(output).toContain('60%')
  })

  it('formats low score', () => {
    const output = formatCoverageScore(20)
    expect(output).toContain('20%')
  })

  it('formats 0 score', () => {
    const output = formatCoverageScore(0)
    expect(output).toContain('0%')
  })
})

describe('formatTaxonomyStats', () => {
  it('formats stats', () => {
    const stats = {
      totalFiles: 10,
      totalTaxa: 25,
      depth: 5,
      largestGroup: 'Command (5)',
      smallestGroup: 'Core (1)',
      avgGroupSize: 2.5,
      orphanCount: 2,
      coverageScore: 80,
    }
    const output = formatTaxonomyStats(stats)
    expect(output).toContain('Taxonomy Stats')
    expect(output).toContain('10')
    expect(output).toContain('25')
    expect(output).toContain('Command (5)')
    expect(output).toContain('80%')
  })
})

describe('formatRecommendations', () => {
  it('formats recommendations', () => {
    const recs = ['Review file X', 'Split group Y']
    const output = formatRecommendations(recs)
    expect(output).toContain('Recommendations')
    expect(output).toContain('1.')
    expect(output).toContain('2.')
    expect(output).toContain('Review file X')
  })

  it('handles empty', () => {
    const output = formatRecommendations([])
    expect(output).toContain('No recommendations')
  })
})

describe('formatTaxonomistTable', () => {
  it('formats full table output', () => {
    const result = buildTaxonomistResult(
      ['src/count.ts', 'test/count.test.ts'],
      [SOURCE_COMMAND, TEST_FILE],
    )
    const output = formatTaxonomistTable(result)
    expect(output).toContain('Code Taxonomist')
    expect(output).toContain('Taxonomy Tree')
    expect(output).toContain('Classifications')
    expect(output).toContain('Taxonomy Stats')
  })
})

describe('formatTaxonomistJSON', () => {
  it('formats as valid JSON', () => {
    const result = buildTaxonomistResult(['a.ts'], ['const x = 1'])
    const json = formatTaxonomistJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.classifications.length).toBe(1)
    expect(parsed.taxonomy.name).toBe('Codebase')
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── Integration ──────────────────────────────────────────────────────────────

describe('integration: full pipeline', () => {
  it('classifies a realistic codebase', () => {
    const files = [
      'src/commands/count.ts',
      'src/commands/count-helpers.ts',
      'src/commands/count-format-helpers.ts',
      'src/core/file-discovery.ts',
      'test/count.test.ts',
      'package.json',
      'README.md',
    ]
    const contents = [
      SOURCE_COMMAND,
      SOURCE_UTILITY,
      SOURCE_UTILITY,
      SOURCE_CORE,
      TEST_FILE,
      CONFIG_FILE,
      MARKDOWN_FILE,
    ]
    const result = buildTaxonomistResult(files, contents)

    expect(result.classifications.length).toBe(7)

    const kingdoms = new Set(result.classifications.map((c) => c.taxonomy.kingdom))
    expect(kingdoms.has('Source')).toBe(true)
    expect(kingdoms.has('Test')).toBe(true)
    expect(kingdoms.has('Config')).toBe(true)
    expect(kingdoms.has('Documentation')).toBe(true)

    expect(result.taxonomy.fileCount).toBe(7)
    expect(result.stats.totalFiles).toBe(7)
    expect(result.stats.totalTaxa).toBeGreaterThan(1)
  })

  it('classifies command vs helper vs core correctly', () => {
    const cmd = classifyFile('src/commands/count.ts', SOURCE_COMMAND)
    expect(cmd.taxonomy.phylum).toBe('Command')

    const util = classifyFile('src/utils/helpers.ts', SOURCE_UTILITY)
    expect(util.taxonomy.phylum).toBe('Utility')

    const core = classifyFile('src/core/discovery.ts', SOURCE_CORE)
    expect(core.taxonomy.phylum).toBe('Core')
  })

  it('computes similarity between related files', () => {
    const a = classifyFile('src/commands/count.ts', SOURCE_COMMAND)
    const b = classifyFile('src/commands/count-helpers.ts', SOURCE_UTILITY)
    const sim = computeSimilarity(a, b)
    // Both are Source kingdom, should have some similarity
    expect(sim).toBeGreaterThan(0)
  })
})
