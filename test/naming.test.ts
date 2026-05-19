import { describe, expect, it } from 'vitest'

import Naming from '../src/commands/naming.js'
import {
  buildNamingResult,
  buildNamingStats,
  checkNamingIssues,
  detectFileNamingConvention,
  detectNamingConvention,
  extractNames,
  type FileNaming,
  type NamedItem,
  type NamingResult,
} from '../src/commands/naming-helpers.js'
import { formatNamingCsv, formatNamingJson, formatNamingTable } from '../src/commands/naming-format-helpers.js'

// ─── Test helpers ────────────────────────────────────────

function makeNamedItem(overrides: Partial<NamedItem> = {}): NamedItem {
  return {
    convention: 'camelCase',
    filePath: 'test.ts',
    issues: [],
    line: 1,
    name: 'myVariable',
    type: 'variable',
    ...overrides,
  }
}

function makeNamingResult(overrides: Partial<NamingResult> = {}): NamingResult {
  const item = makeNamedItem()
  return {
    consistency: 100,
    dominantConvention: 'camelCase',
    fileNaming: [],
    issues: [],
    items: [item],
    stats: [{ byType: [{ count: 1, type: 'variable' }], convention: 'camelCase', count: 1, percentage: 100 }],
    totalItems: 1,
    ...overrides,
  }
}

// ─── Static metadata ────────────────────────────────────

describe('Naming command - static metadata', () => {
  it('has a description', () => {
    expect(Naming.description).toBe('Analyze naming conventions across the codebase')
  })

  it('has examples array', () => {
    expect(Array.isArray(Naming.examples)).toBe(true)
    expect(Naming.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Naming.args.path).toBeDefined()
    expect(Naming.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Naming.args.path.default).toBe('.')
  })
})

// ─── Flags ──────────────────────────────────────────────

describe('Naming command - flags', () => {
  it('has format flag with options', () => {
    expect(Naming.flags.format.options).toContain('json')
    expect(Naming.flags.format.options).toContain('table')
    expect(Naming.flags.format.options).toContain('csv')
  })

  it('defaults format to table', () => {
    expect(Naming.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Naming.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Naming.flags.ignore).toBeDefined()
    expect(Naming.flags.ignore.multiple).toBe(true)
  })

  it('has ext flag', () => {
    expect(Naming.flags.ext).toBeDefined()
    expect(Naming.flags.ext.default).toBe('.ts,.tsx,.js,.jsx')
  })

  it('has check flag defaulting to false', () => {
    expect(Naming.flags.check.default).toBe(false)
  })

  it('has verbose flag defaulting to false', () => {
    expect(Naming.flags.verbose.default).toBe(false)
  })
})

// ─── Class structure ────────────────────────────────────

describe('Naming command - class structure', () => {
  it('exports a default class', () => {
    expect(Naming).toBeDefined()
    expect(typeof Naming).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Naming.prototype.run).toBe('function')
  })
})

// ─── detectNamingConvention ─────────────────────────────

describe('detectNamingConvention', () => {
  // ─── camelCase ──────────────────────────────────────
  it('detects camelCase: myVariable', () => {
    expect(detectNamingConvention('myVariable')).toBe('camelCase')
  })

  it('detects camelCase: getName', () => {
    expect(detectNamingConvention('getName')).toBe('camelCase')
  })

  it('detects camelCase: isLoading', () => {
    expect(detectNamingConvention('isLoading')).toBe('camelCase')
  })

  it('detects camelCase: httpRequest', () => {
    expect(detectNamingConvention('httpRequest')).toBe('camelCase')
  })

  // ─── PascalCase ─────────────────────────────────────
  it('detects PascalCase: MyComponent', () => {
    expect(detectNamingConvention('MyComponent')).toBe('PascalCase')
  })

  it('detects PascalCase: UserService', () => {
    expect(detectNamingConvention('UserService')).toBe('PascalCase')
  })

  it('detects PascalCase: HTMLElement', () => {
    expect(detectNamingConvention('HTMLElement')).toBe('PascalCase')
  })

  // ─── snake_case ─────────────────────────────────────
  it('detects snake_case: my_variable', () => {
    expect(detectNamingConvention('my_variable')).toBe('snake_case')
  })

  it('detects snake_case: get_name', () => {
    expect(detectNamingConvention('get_name')).toBe('snake_case')
  })

  it('detects snake_case: user_count', () => {
    expect(detectNamingConvention('user_count')).toBe('snake_case')
  })

  // ─── SCREAMING_SNAKE ────────────────────────────────
  it('detects SCREAMING_SNAKE: MAX_SIZE', () => {
    expect(detectNamingConvention('MAX_SIZE')).toBe('SCREAMING_SNAKE')
  })

  it('detects SCREAMING_SNAKE: API_URL', () => {
    expect(detectNamingConvention('API_URL')).toBe('SCREAMING_SNAKE')
  })

  it('detects SCREAMING_SNAKE: DEFAULT_TIMEOUT', () => {
    expect(detectNamingConvention('DEFAULT_TIMEOUT')).toBe('SCREAMING_SNAKE')
  })

  // ─── kebab-case ─────────────────────────────────────
  it('detects kebab-case: my-component', () => {
    expect(detectNamingConvention('my-component')).toBe('kebab-case')
  })

  it('detects kebab-case: user-service', () => {
    expect(detectNamingConvention('user-service')).toBe('kebab-case')
  })

  // ─── Unknown / edge cases ───────────────────────────
  it('returns unknown for empty string', () => {
    expect(detectNamingConvention('')).toBe('unknown')
  })

  it('returns camelCase for single lowercase letter', () => {
    expect(detectNamingConvention('x')).toBe('camelCase')
  })

  it('returns PascalCase for single uppercase letter', () => {
    expect(detectNamingConvention('X')).toBe('PascalCase')
  })

  it('returns unknown for names starting with numbers', () => {
    expect(detectNamingConvention('1name')).toBe('unknown')
  })

  it('returns unknown for mixed separators', () => {
    expect(detectNamingConvention('my_variable-name')).toBe('unknown')
  })

  it('returns unknown for mixed case with underscores', () => {
    expect(detectNamingConvention('My_Variable')).toBe('unknown')
  })

  it('handles names with numbers: var1', () => {
    expect(detectNamingConvention('var1')).toBe('camelCase')
  })

  it('handles names with numbers: Var1', () => {
    expect(detectNamingConvention('Var1')).toBe('PascalCase')
  })
})

// ─── extractNames ───────────────────────────────────────

describe('extractNames', () => {
  // ─── Variables ──────────────────────────────────────
  it('extracts const declarations', () => {
    const items = extractNames('const myVar = 1;', 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(1)
    const variable = items.find((i) => i.name === 'myVar' && i.type === 'variable')
    expect(variable).toBeDefined()
    expect(variable!.convention).toBe('camelCase')
    expect(variable!.line).toBe(1)
  })

  it('extracts let declarations', () => {
    const items = extractNames('let counter = 0;', 'test.ts')
    const variable = items.find((i) => i.name === 'counter' && i.type === 'variable')
    expect(variable).toBeDefined()
  })

  it('extracts var declarations', () => {
    const items = extractNames('var legacy = true;', 'test.ts')
    const variable = items.find((i) => i.name === 'legacy' && i.type === 'variable')
    expect(variable).toBeDefined()
  })

  it('classifies SCREAMING_SNAKE consts as constants', () => {
    const items = extractNames('const MAX_SIZE = 100;', 'test.ts')
    const constant = items.find((i) => i.name === 'MAX_SIZE' && i.type === 'constant')
    expect(constant).toBeDefined()
    expect(constant!.convention).toBe('SCREAMING_SNAKE')
  })

  // ─── Functions ──────────────────────────────────────
  it('extracts function declarations', () => {
    const items = extractNames('function myFunc() {}', 'test.ts')
    const fn = items.find((i) => i.name === 'myFunc' && i.type === 'function')
    expect(fn).toBeDefined()
    expect(fn!.convention).toBe('camelCase')
  })

  it('extracts async function declarations', () => {
    const items = extractNames('async function fetchData() {}', 'test.ts')
    const fn = items.find((i) => i.name === 'fetchData' && i.type === 'function')
    expect(fn).toBeDefined()
  })

  it('extracts arrow functions', () => {
    const items = extractNames('const handleClick = () => {}', 'test.ts')
    const fn = items.find((i) => i.name === 'handleClick' && i.type === 'function')
    expect(fn).toBeDefined()
  })

  it('extracts function expressions', () => {
    const items = extractNames('const processData = function() {}', 'test.ts')
    const fn = items.find((i) => i.name === 'processData' && i.type === 'function')
    expect(fn).toBeDefined()
  })

  // ─── Classes ────────────────────────────────────────
  it('extracts class declarations', () => {
    const items = extractNames('class MyComponent {}', 'test.ts')
    const cls = items.find((i) => i.name === 'MyComponent' && i.type === 'class')
    expect(cls).toBeDefined()
    expect(cls!.convention).toBe('PascalCase')
  })

  it('extracts exported class declarations', () => {
    const items = extractNames('export class UserService {}', 'test.ts')
    const cls = items.find((i) => i.name === 'UserService' && i.type === 'class')
    expect(cls).toBeDefined()
  })

  // ─── Interfaces ─────────────────────────────────────
  it('extracts interface declarations', () => {
    const items = extractNames('interface UserProps {}', 'test.ts')
    const iface = items.find((i) => i.name === 'UserProps' && i.type === 'interface')
    expect(iface).toBeDefined()
    expect(iface!.convention).toBe('PascalCase')
  })

  // ─── Type aliases ───────────────────────────────────
  it('extracts type alias declarations', () => {
    const items = extractNames('type UserRecord = { name: string }', 'test.ts')
    const typeAlias = items.find((i) => i.name === 'UserRecord' && i.type === 'type')
    expect(typeAlias).toBeDefined()
    expect(typeAlias!.convention).toBe('PascalCase')
  })

  // ─── Multiple items ─────────────────────────────────
  it('extracts multiple items from multi-line content', () => {
    const content = `const myVar = 1;
function myFunc() {}
class MyClass {}`
    const items = extractNames(content, 'test.ts')
    expect(items.length).toBeGreaterThanOrEqual(3)
  })

  // ─── Empty content ──────────────────────────────────
  it('returns empty array for empty content', () => {
    const items = extractNames('', 'test.ts')
    expect(items).toEqual([])
  })

  it('returns empty array for comment-only content', () => {
    const items = extractNames('// just a comment', 'test.ts')
    expect(items).toEqual([])
  })

  // ─── Line numbers ───────────────────────────────────
  it('tracks correct line numbers', () => {
    const content = `\n\nconst myVar = 1;`
    const items = extractNames(content, 'test.ts')
    const variable = items.find((i) => i.name === 'myVar')
    expect(variable).toBeDefined()
    expect(variable!.line).toBe(3)
  })
})

// ─── checkNamingIssues ──────────────────────────────────

describe('checkNamingIssues', () => {
  it('flags too-short names (length <= 2)', () => {
    const item = makeNamedItem({ name: 'ab' })
    const issues = checkNamingIssues(item)
    const tooShort = issues.find((i) => i.type === 'too-short')
    expect(tooShort).toBeDefined()
    expect(tooShort!.severity).toBe('info')
  })

  it('flags single-letter names that are not allowed', () => {
    const item = makeNamedItem({ name: 'q' })
    const issues = checkNamingIssues(item)
    const singleLetter = issues.find((i) => i.type === 'single-letter')
    expect(singleLetter).toBeDefined()
    expect(singleLetter!.severity).toBe('warn')
  })

  it('allows single-letter loop variables (i, j, k)', () => {
    for (const letter of ['i', 'j', 'k']) {
      const item = makeNamedItem({ name: letter })
      const issues = checkNamingIssues(item)
      expect(issues).toHaveLength(0)
    }
  })

  it('allows single-letter axis variables (x, y, z)', () => {
    for (const letter of ['x', 'y', 'z']) {
      const item = makeNamedItem({ name: letter })
      const issues = checkNamingIssues(item)
      expect(issues).toHaveLength(0)
    }
  })

  it('allows single-letter exception variable (e)', () => {
    const item = makeNamedItem({ name: 'e' })
    const issues = checkNamingIssues(item)
    expect(issues).toHaveLength(0)
  })

  it('allows "id" as a short name', () => {
    const item = makeNamedItem({ name: 'id' })
    const issues = checkNamingIssues(item)
    const tooShort = issues.find((i) => i.type === 'too-short')
    expect(tooShort).toBeUndefined()
  })

  it('allows "fn" as a short name', () => {
    const item = makeNamedItem({ name: 'fn' })
    const issues = checkNamingIssues(item)
    const tooShort = issues.find((i) => i.type === 'too-short')
    expect(tooShort).toBeUndefined()
  })

  it('flags too-long names (> 40 chars)', () => {
    const longName = 'a'.repeat(41)
    const item = makeNamedItem({ name: longName })
    const issues = checkNamingIssues(item)
    const tooLong = issues.find((i) => i.type === 'too-long')
    expect(tooLong).toBeDefined()
    expect(tooLong!.severity).toBe('warn')
  })

  it('flags common abbreviations', () => {
    const abbreviations = ['arr', 'obj', 'str', 'num', 'fn', 'val', 'ref', 'ret', 'tmp', 'buf', 'err']
    for (const abbr of abbreviations) {
      const item = makeNamedItem({ name: abbr })
      const issues = checkNamingIssues(item)
      const abbrIssue = issues.find((i) => i.type === 'abbreviation')
      expect(abbrIssue).toBeDefined()
      expect(abbrIssue!.severity).toBe('info')
    }
  })

  it('flags numeric suffixes', () => {
    const item = makeNamedItem({ name: 'item1' })
    const issues = checkNamingIssues(item)
    const numeric = issues.find((i) => i.type === 'numeric-suffix')
    expect(numeric).toBeDefined()
    expect(numeric!.severity).toBe('warn')
  })

  it('flags numeric suffixes with multiple digits', () => {
    const item = makeNamedItem({ name: 'value123' })
    const issues = checkNamingIssues(item)
    const numeric = issues.find((i) => i.type === 'numeric-suffix')
    expect(numeric).toBeDefined()
  })

  it('returns no issues for clean names', () => {
    const item = makeNamedItem({ name: 'userName' })
    const issues = checkNamingIssues(item)
    expect(issues).toHaveLength(0)
  })

  it('returns no issues for descriptive names', () => {
    const item = makeNamedItem({ name: 'fetchUserData' })
    const issues = checkNamingIssues(item)
    expect(issues).toHaveLength(0)
  })

  it('can return multiple issues for one name', () => {
    const item = makeNamedItem({ name: 'a1' })
    const issues = checkNamingIssues(item)
    expect(issues.length).toBeGreaterThanOrEqual(2)
    const types = issues.map((i) => i.type)
    expect(types).toContain('too-short')
    expect(types).toContain('numeric-suffix')
  })

  it('does not flag names at exactly 40 characters as too long', () => {
    const item = makeNamedItem({ name: 'a'.repeat(40) })
    const issues = checkNamingIssues(item)
    const tooLong = issues.find((i) => i.type === 'too-long')
    expect(tooLong).toBeUndefined()
  })
})

// ─── buildNamingStats ───────────────────────────────────

describe('buildNamingStats', () => {
  it('computes correct counts', () => {
    const items = [
      makeNamedItem({ name: 'a', convention: 'camelCase', type: 'variable' }),
      makeNamedItem({ name: 'b', convention: 'camelCase', type: 'function' }),
      makeNamedItem({ name: 'c', convention: 'snake_case', type: 'variable' }),
    ]
    const stats = buildNamingStats(items)
    expect(stats).toHaveLength(2)
    const camelStat = stats.find((s) => s.convention === 'camelCase')
    expect(camelStat!.count).toBe(2)
  })

  it('computes percentages', () => {
    const items = [
      makeNamedItem({ name: 'a', convention: 'camelCase', type: 'variable' }),
      makeNamedItem({ name: 'b', convention: 'camelCase', type: 'variable' }),
      makeNamedItem({ name: 'c', convention: 'snake_case', type: 'variable' }),
    ]
    const stats = buildNamingStats(items)
    const camelStat = stats.find((s) => s.convention === 'camelCase')
    expect(camelStat!.percentage).toBe(66.7)
  })

  it('breaks down by type', () => {
    const items = [
      makeNamedItem({ name: 'a', convention: 'camelCase', type: 'variable' }),
      makeNamedItem({ name: 'b', convention: 'camelCase', type: 'function' }),
      makeNamedItem({ name: 'c', convention: 'camelCase', type: 'variable' }),
    ]
    const stats = buildNamingStats(items)
    const camelStat = stats.find((s) => s.convention === 'camelCase')
    expect(camelStat!.byType).toHaveLength(2)
    const varType = camelStat!.byType.find((t) => t.type === 'variable')
    expect(varType!.count).toBe(2)
  })

  it('sorts by count descending', () => {
    const items = [
      makeNamedItem({ name: 'a', convention: 'snake_case', type: 'variable' }),
      makeNamedItem({ name: 'b', convention: 'camelCase', type: 'variable' }),
      makeNamedItem({ name: 'c', convention: 'camelCase', type: 'variable' }),
    ]
    const stats = buildNamingStats(items)
    expect(stats[0]!.convention).toBe('camelCase')
    expect(stats[1]!.convention).toBe('snake_case')
  })

  it('handles empty items', () => {
    const stats = buildNamingStats([])
    expect(stats).toEqual([])
  })

  it('handles single item', () => {
    const items = [makeNamedItem({ convention: 'PascalCase', type: 'class' })]
    const stats = buildNamingStats(items)
    expect(stats).toHaveLength(1)
    expect(stats[0]!.percentage).toBe(100)
  })
})

// ─── detectFileNamingConvention ─────────────────────────

describe('detectFileNamingConvention', () => {
  it('detects kebab-case file names', () => {
    const result = detectFileNamingConvention(['my-component.tsx'])
    expect(result[0]!.convention).toBe('kebab-case')
  })

  it('detects camelCase file names', () => {
    const result = detectFileNamingConvention(['myHelper.ts'])
    expect(result[0]!.convention).toBe('camelCase')
  })

  it('detects snake_case file names', () => {
    const result = detectFileNamingConvention(['my_helper.ts'])
    expect(result[0]!.convention).toBe('snake_case')
  })

  it('detects PascalCase file names', () => {
    const result = detectFileNamingConvention(['MyComponent.tsx'])
    expect(result[0]!.convention).toBe('PascalCase')
  })

  it('handles paths with directories', () => {
    const result = detectFileNamingConvention(['src/components/my-panel.tsx'])
    expect(result[0]!.file).toBe('src/components/my-panel.tsx')
    expect(result[0]!.convention).toBe('kebab-case')
  })

  it('handles multiple files', () => {
    const result = detectFileNamingConvention(['my-component.ts', 'MyClass.ts', 'helper_utils.ts'])
    expect(result).toHaveLength(3)
  })
})

// ─── buildNamingResult ──────────────────────────────────

describe('buildNamingResult', () => {
  it('finds dominant convention', () => {
    const items = [
      makeNamedItem({ name: 'a', convention: 'camelCase', type: 'variable' }),
      makeNamedItem({ name: 'b', convention: 'camelCase', type: 'function' }),
      makeNamedItem({ name: 'c', convention: 'snake_case', type: 'variable' }),
    ]
    const result = buildNamingResult(items, [])
    expect(result.dominantConvention).toBe('camelCase')
  })

  it('computes consistency score', () => {
    const items = [
      makeNamedItem({ name: 'a', convention: 'camelCase', type: 'variable' }),
      makeNamedItem({ name: 'b', convention: 'camelCase', type: 'variable' }),
      makeNamedItem({ name: 'c', convention: 'snake_case', type: 'variable' }),
      makeNamedItem({ name: 'd', convention: 'snake_case', type: 'variable' }),
    ]
    const result = buildNamingResult(items, [])
    expect(result.consistency).toBe(50)
  })

  it('filters items with issues', () => {
    const items = [
      makeNamedItem({ name: 'goodName', convention: 'camelCase', type: 'variable' }),
      makeNamedItem({ name: 'a1', convention: 'camelCase', type: 'variable' }),
    ]
    const result = buildNamingResult(items, [])
    expect(result.issues.length).toBeGreaterThanOrEqual(1)
    expect(result.issues.some((i) => i.name === 'a1')).toBe(true)
  })

  it('returns 100% consistency for empty items', () => {
    const result = buildNamingResult([], [])
    expect(result.consistency).toBe(100)
    expect(result.dominantConvention).toBe('unknown')
  })

  it('includes totalItems count', () => {
    const items = [
      makeNamedItem({ name: 'a', convention: 'camelCase', type: 'variable' }),
      makeNamedItem({ name: 'b', convention: 'snake_case', type: 'function' }),
    ]
    const result = buildNamingResult(items, [])
    expect(result.totalItems).toBe(2)
  })

  it('includes file naming data', () => {
    const fileNaming: FileNaming[] = [{ convention: 'kebab-case', file: 'my-component.ts' }]
    const result = buildNamingResult([], fileNaming)
    expect(result.fileNaming).toHaveLength(1)
    expect(result.fileNaming[0]!.convention).toBe('kebab-case')
  })

  it('computes stats', () => {
    const items = [
      makeNamedItem({ name: 'a', convention: 'camelCase', type: 'variable' }),
      makeNamedItem({ name: 'b', convention: 'PascalCase', type: 'class' }),
    ]
    const result = buildNamingResult(items, [])
    expect(result.stats).toHaveLength(2)
  })
})

// ─── formatNamingTable ──────────────────────────────────

describe('formatNamingTable', () => {
  it('contains consistency score', () => {
    const result = makeNamingResult()
    const output = formatNamingTable(result, false)
    expect(output).toContain('Consistency')
    expect(output).toContain('100%')
  })

  it('contains dominant convention', () => {
    const result = makeNamingResult()
    const output = formatNamingTable(result, false)
    expect(output).toContain('camelCase')
  })

  it('contains convention distribution header', () => {
    const result = makeNamingResult()
    const output = formatNamingTable(result, false)
    expect(output).toContain('Convention')
    expect(output).toContain('Count')
    expect(output).toContain('Pct')
  })

  it('shows file naming section', () => {
    const result = makeNamingResult({
      fileNaming: [{ convention: 'kebab-case', file: 'my-component.ts' }],
    })
    const output = formatNamingTable(result, false)
    expect(output).toContain('File Naming')
  })

  it('shows issues in verbose mode', () => {
    const itemWithIssue = makeNamedItem({ name: 'a1', issues: [] })
    const result = makeNamingResult({
      issues: [itemWithIssue],
    })
    const output = formatNamingTable(result, true)
    expect(output).toContain('Issues')
  })

  it('handles empty results', () => {
    const result = makeNamingResult({
      consistency: 100,
      dominantConvention: 'unknown',
      issues: [],
      items: [],
      stats: [],
      totalItems: 0,
    })
    const output = formatNamingTable(result, false)
    expect(output).toContain('Consistency')
    expect(output).toContain('unknown')
  })
})

// ─── formatNamingCsv ────────────────────────────────────

describe('formatNamingCsv', () => {
  it('produces CSV with convention headers', () => {
    const result = makeNamingResult()
    const output = formatNamingCsv(result)
    expect(output).toContain('Convention,Count,Percentage,Top Types')
  })

  it('includes convention data rows', () => {
    const result = makeNamingResult()
    const output = formatNamingCsv(result)
    expect(output).toContain('camelCase')
  })

  it('includes issues section when present', () => {
    const itemWithIssue = makeNamedItem({ name: 'a1', issues: [] })
    const result = makeNamingResult({
      issues: [itemWithIssue],
    })
    const output = formatNamingCsv(result)
    expect(output).toContain('Name,File,Line,Issue Type,Severity,Message')
  })

  it('escapes commas in values', () => {
    const itemWithComma = makeNamedItem({
      name: 'my,name',
      filePath: 'test,dir.ts',
      issues: [{ type: 'too-short', message: 'too short', severity: 'warn' }],
    })
    const result = makeNamingResult({
      issues: [itemWithComma],
    })
    const output = formatNamingCsv(result)
    expect(output).toContain('"my,name"')
  })

  it('handles empty stats', () => {
    const result = makeNamingResult({ stats: [], items: [], totalItems: 0 })
    const output = formatNamingCsv(result)
    expect(output).toContain('Convention,Count,Percentage,Top Types')
  })
})

// ─── formatNamingJson ───────────────────────────────────

describe('formatNamingJson', () => {
  it('produces valid JSON', () => {
    const result = makeNamingResult()
    const output = formatNamingJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains consistency field', () => {
    const result = makeNamingResult()
    const output = formatNamingJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.consistency).toBe(100)
  })

  it('contains dominantConvention field', () => {
    const result = makeNamingResult()
    const output = formatNamingJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.dominantConvention).toBe('camelCase')
  })

  it('contains stats array', () => {
    const result = makeNamingResult()
    const output = formatNamingJson(result)
    const parsed = JSON.parse(output)
    expect(Array.isArray(parsed.stats)).toBe(true)
  })

  it('contains items array', () => {
    const result = makeNamingResult()
    const output = formatNamingJson(result)
    const parsed = JSON.parse(output)
    expect(Array.isArray(parsed.items)).toBe(true)
  })

  it('preserves naming data accurately', () => {
    const result = makeNamingResult({
      consistency: 75,
      dominantConvention: 'snake_case',
      totalItems: 10,
    })
    const output = formatNamingJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.consistency).toBe(75)
    expect(parsed.dominantConvention).toBe('snake_case')
    expect(parsed.totalItems).toBe(10)
  })

  it('handles empty results', () => {
    const result = makeNamingResult({
      consistency: 100,
      dominantConvention: 'unknown',
      items: [],
      stats: [],
      totalItems: 0,
    })
    const output = formatNamingJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.items).toHaveLength(0)
    expect(parsed.stats).toHaveLength(0)
  })
})
