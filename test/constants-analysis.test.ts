import { describe, it, expect } from 'vitest'

import {
  buildConstantsResult,
  computeConstantsStats,
  countOccurrences,
  findExistingConstants,
  findHardcodedStrings,
  findMagicNumbers,
  suggestConstantName,
  type ExistingConstant,
  type HardcodedString,
  type MagicNumber,
} from '../src/commands/constants-helpers.js'

import {
  formatConstantsJson,
  formatConstantsStats,
  formatConstantsTable,
  formatExistingConstants,
  formatHardcodedStrings,
  formatMagicNumbers,
} from '../src/commands/constants-format-helpers.js'

import Constants from '../src/commands/constants.js'

// ─── findMagicNumbers ───────────────────────────────────

describe('findMagicNumbers', () => {
  it('should find magic number 86400', () => {
    const nums = findMagicNumbers('const timeout = 86400', 'app.ts')
    expect(nums.length).toBeGreaterThan(0)
    expect(nums.some((n) => n.value === 86400)).toBe(true)
  })

  it('should skip 0, 1, -1, 2', () => {
    const nums = findMagicNumbers('const x = 0\nconst y = 1\nconst z = -1\nconst w = 2', 'app.ts')
    expect(nums).toHaveLength(0)
  })

  it('should skip numbers in comments', () => {
    const nums = findMagicNumbers('// timeout is 86400', 'app.ts')
    expect(nums).toHaveLength(0)
  })

  it('should skip numbers in strings', () => {
    const nums = findMagicNumbers("const s = 'value is 42'", 'app.ts')
    expect(nums).toHaveLength(0)
  })

  it('should skip import paths', () => {
    const nums = findMagicNumbers("import { x } from './utils'", 'app.ts')
    expect(nums).toHaveLength(0)
  })

  it('should report correct line numbers', () => {
    const nums = findMagicNumbers('line1\nconst x = 42\nline3', 'app.ts')
    expect(nums[0].line).toBe(2)
  })

  it('should include file path', () => {
    const nums = findMagicNumbers('const x = 42', 'src/app.ts')
    expect(nums[0].file).toBe('src/app.ts')
  })

  it('should suggest constant name', () => {
    const nums = findMagicNumbers('const timeout = 86400', 'app.ts')
    const found = nums.find((n) => n.value === 86400)
    expect(found!.suggestedName).toBe('SECONDS_PER_DAY')
  })

  it('should include context', () => {
    const nums = findMagicNumbers('const x = 42', 'app.ts')
    expect(nums[0].context).toContain('42')
  })

  it('should find multiple numbers', () => {
    const nums = findMagicNumbers('const x = 42\nconst y = 100', 'app.ts')
    expect(nums.length).toBeGreaterThanOrEqual(2)
  })

  it('should skip already-defined constants', () => {
    const nums = findMagicNumbers('const MAX_SIZE = 42', 'app.ts')
    expect(nums).toHaveLength(0)
  })

  it('should flag shouldExtract', () => {
    const nums = findMagicNumbers('const x = 42', 'app.ts')
    expect(nums[0].shouldExtract).toBe(true)
  })
})

// ─── findHardcodedStrings ───────────────────────────────

describe('findHardcodedStrings', () => {
  it('should find URL strings', () => {
    const strs = findHardcodedStrings("const url = 'https://api.example.com/v1'", 'app.ts')
    expect(strs.length).toBeGreaterThan(0)
  })

  it('should skip short strings', () => {
    const strs = findHardcodedStrings("const s = 'ab'", 'app.ts')
    expect(strs).toHaveLength(0)
  })

  it('should skip import paths', () => {
    const strs = findHardcodedStrings("import { x } from 'my-package'", 'app.ts')
    expect(strs).toHaveLength(0)
  })

  it('should skip require paths', () => {
    const strs = findHardcodedStrings("const x = require('fs')", 'app.ts')
    expect(strs).toHaveLength(0)
  })

  it('should find long strings', () => {
    const strs = findHardcodedStrings("'this is a pretty long string value'", 'app.ts')
    expect(strs.length).toBeGreaterThan(0)
  })

  it('should report correct line number', () => {
    const strs = findHardcodedStrings("line1\nconst x = 'https://example.com/api'\nline3", 'app.ts')
    expect(strs[0].line).toBe(2)
  })

  it('should compute string length', () => {
    const strs = findHardcodedStrings("'https://api.example.com/v1'", 'app.ts')
    expect(strs[0].length).toBeGreaterThan(0)
  })

  it('should suggest constant name for URLs', () => {
    const strs = findHardcodedStrings("'https://api.example.com/v1'", 'app.ts')
    expect(strs[0].suggestedName).toBe('BASE_URL')
  })

  it('should skip strings in comments', () => {
    const strs = findHardcodedStrings("// 'https://api.example.com/v1'", 'app.ts')
    expect(strs).toHaveLength(0)
  })

  it('should mark shouldExtract for long strings', () => {
    const strs = findHardcodedStrings("'this is a pretty long string that should be extracted'", 'app.ts')
    expect(strs[0].shouldExtract).toBe(true)
  })

  it('should skip relative import paths', () => {
    const strs = findHardcodedStrings("'./utils'", 'app.ts')
    expect(strs).toHaveLength(0)
  })
})

// ─── findExistingConstants ──────────────────────────────

describe('findExistingConstants', () => {
  it('should find UPPER_CASE constants', () => {
    const consts = findExistingConstants('const MAX_RETRIES = 3', 'app.ts')
    expect(consts).toHaveLength(1)
    expect(consts[0].name).toBe('MAX_RETRIES')
  })

  it('should find exported constants', () => {
    const consts = findExistingConstants('export const API_VERSION = "v1"', 'app.ts')
    expect(consts).toHaveLength(1)
    expect(consts[0].name).toBe('API_VERSION')
  })

  it('should detect number type', () => {
    const consts = findExistingConstants('const LIMIT = 100', 'app.ts')
    expect(consts[0].type).toBe('number')
  })

  it('should detect string type', () => {
    const consts = findExistingConstants("const NAME = 'test'", 'app.ts')
    expect(consts[0].type).toBe('string')
  })

  it('should detect boolean type', () => {
    const consts = findExistingConstants('const ENABLED = true', 'app.ts')
    expect(consts[0].type).toBe('boolean')
  })

  it('should skip camelCase constants', () => {
    const consts = findExistingConstants('const myValue = 42', 'app.ts')
    expect(consts).toHaveLength(0)
  })

  it('should count usages', () => {
    const code = 'const MAX = 100\nconst x = MAX\nconst y = MAX + MAX'
    const consts = findExistingConstants(code, 'app.ts')
    expect(consts[0].usageCount).toBe(3)
  })

  it('should report line number', () => {
    const consts = findExistingConstants('line1\nconst MAX = 100', 'app.ts')
    expect(consts[0].line).toBe(2)
  })

  it('should handle typed constants', () => {
    const consts = findExistingConstants('const TIMEOUT: number = 3000', 'app.ts')
    expect(consts).toHaveLength(1)
    expect(consts[0].name).toBe('TIMEOUT')
  })
})

// ─── countOccurrences ───────────────────────────────────

describe('countOccurrences', () => {
  it('should count number occurrences', () => {
    const count = countOccurrences(86400, ['a.ts'], { 'a.ts': '86400 + 86400' })
    expect(count).toBe(2)
  })

  it('should count string occurrences', () => {
    const count = countOccurrences('hello', ['a.ts'], { 'a.ts': 'hello world hello' })
    expect(count).toBe(2)
  })

  it('should return 0 for no matches', () => {
    const count = countOccurrences(42, ['a.ts'], { 'a.ts': 'no match' })
    expect(count).toBe(0)
  })

  it('should search across multiple files', () => {
    const count = countOccurrences('x', ['a.ts', 'b.ts'], { 'a.ts': 'x', 'b.ts': 'x x' })
    expect(count).toBe(3)
  })
})

// ─── suggestConstantName ────────────────────────────────

describe('suggestConstantName', () => {
  it('should suggest SECONDS_PER_DAY for 86400', () => {
    expect(suggestConstantName(86400, '')).toBe('SECONDS_PER_DAY')
  })

  it('should suggest SECONDS_PER_HOUR for 3600', () => {
    expect(suggestConstantName(3600, '')).toBe('SECONDS_PER_HOUR')
  })

  it('should suggest MILLIS_PER_SECOND for 1000', () => {
    expect(suggestConstantName(1000, '')).toBe('MILLIS_PER_SECOND')
  })

  it('should suggest SECONDS_PER_MINUTE for 60', () => {
    expect(suggestConstantName(60, '')).toBe('SECONDS_PER_MINUTE')
  })

  it('should suggest HTTP_OK for 200', () => {
    expect(suggestConstantName(200, '')).toBe('HTTP_OK')
  })

  it('should suggest HTTP_NOT_FOUND for 404', () => {
    expect(suggestConstantName(404, '')).toBe('HTTP_NOT_FOUND')
  })

  it('should suggest BASE_URL for https URLs', () => {
    expect(suggestConstantName('https://api.example.com', '')).toBe('BASE_URL')
  })

  it('should suggest VERSION for version strings', () => {
    expect(suggestConstantName('1.2.3', '')).toBe('VERSION')
  })

  it('should suggest GENERIC for unknown numbers', () => {
    const name = suggestConstantName(777, '')
    expect(name).toContain('777')
  })

  it('should handle long strings', () => {
    expect(suggestConstantName('a'.repeat(50), '')).toBe('LONG_STRING_CONSTANT')
  })
})

// ─── computeConstantsStats ──────────────────────────────

describe('computeConstantsStats', () => {
  it('should count totals', () => {
    const stats = computeConstantsStats(
      [{ value: 42, file: 'a.ts', line: 1, context: '', occurrences: 1, shouldExtract: true, suggestedName: 'X' }] as MagicNumber[],
      [{ value: 'hello', file: 'a.ts', line: 2, context: '', occurrences: 1, length: 5, shouldExtract: true, suggestedName: 'Y' }] as HardcodedString[],
      [{ name: 'MAX', value: '100', file: 'a.ts', line: 3, type: 'number', usageCount: 0 }] as ExistingConstant[],
    )
    expect(stats.totalMagicNumbers).toBe(1)
    expect(stats.totalHardcodedStrings).toBe(1)
    expect(stats.totalExistingConstants).toBe(1)
  })

  it('should count extraction candidates', () => {
    const stats = computeConstantsStats(
      [{ value: 42, file: 'a.ts', line: 1, context: '', occurrences: 1, shouldExtract: true, suggestedName: 'X' }] as MagicNumber[],
      [{ value: 'hi', file: 'a.ts', line: 2, context: '', occurrences: 1, length: 2, shouldExtract: false, suggestedName: 'Y' }] as HardcodedString[],
      [],
    )
    expect(stats.extractionCandidates).toBe(1)
  })

  it('should count by file', () => {
    const stats = computeConstantsStats(
      [
        { value: 42, file: 'a.ts', line: 1, context: '', occurrences: 1, shouldExtract: true, suggestedName: 'X' },
        { value: 99, file: 'b.ts', line: 2, context: '', occurrences: 1, shouldExtract: true, suggestedName: 'Y' },
      ] as MagicNumber[],
      [],
      [],
    )
    expect(stats.byFile['a.ts']).toBe(1)
    expect(stats.byFile['b.ts']).toBe(1)
  })

  it('should handle empty data', () => {
    const stats = computeConstantsStats([], [], [])
    expect(stats.totalMagicNumbers).toBe(0)
    expect(stats.extractionCandidates).toBe(0)
  })
})

// ─── buildConstantsResult ───────────────────────────────

describe('buildConstantsResult', () => {
  const reader = async (f: string) => {
    if (f === 'a.ts') return 'const x = 42\nconst y = 86400\n'
    if (f === 'b.ts') return "const url = 'https://api.example.com'\nconst MAX = 100\n"
    return ''
  }

  it('should return full result', async () => {
    const result = await buildConstantsResult(['a.ts', 'b.ts'], reader)
    expect(result.magicNumbers.length).toBeGreaterThan(0)
    expect(result.stats).toBeDefined()
  })

  it('should find existing constants', async () => {
    const result = await buildConstantsResult(['b.ts'], reader)
    expect(result.existingConstants.some((c) => c.name === 'MAX')).toBe(true)
  })

  it('should skip non-scannable extensions', async () => {
    const result = await buildConstantsResult(['readme.md'], reader)
    expect(result.stats.totalMagicNumbers).toBe(0)
  })

  it('should handle file read errors', async () => {
    const failReader = async () => { throw new Error('ENOENT') }
    const result = await buildConstantsResult(['missing.ts'], failReader)
    expect(result.stats.totalMagicNumbers).toBe(0)
  })

  it('should count occurrences across files', async () => {
    const multiReader = async (f: string) => {
      if (f === 'a.ts') return '42 + 42'
      if (f === 'b.ts') return '42'
      return ''
    }
    const result = await buildConstantsResult(['a.ts', 'b.ts'], multiReader)
    const fortyTwo = result.magicNumbers.find((n) => n.value === 42)
    if (fortyTwo) {
      expect(fortyTwo.occurrences).toBeGreaterThanOrEqual(2)
    }
  })

  it('should apply verbose mode', async () => {
    const result = await buildConstantsResult(['a.ts'], reader, { verbose: true })
    expect(result.magicNumbers.length).toBeGreaterThan(0)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('formatMagicNumbers', () => {
  it('should handle empty array', () => {
    expect(formatMagicNumbers([])).toContain('No magic numbers')
  })

  it('should format magic numbers', () => {
    const nums: MagicNumber[] = [
      { value: 86400, file: 'a.ts', line: 1, context: 'const x = 86400', occurrences: 1, shouldExtract: true, suggestedName: 'SECONDS_PER_DAY' },
    ]
    expect(formatMagicNumbers(nums)).toContain('86400')
  })
})

describe('formatHardcodedStrings', () => {
  it('should handle empty array', () => {
    expect(formatHardcodedStrings([])).toContain('No hardcoded strings')
  })

  it('should format strings', () => {
    const strs: HardcodedString[] = [
      { value: 'https://api.example.com', file: 'a.ts', line: 1, context: '', length: 23, occurrences: 1, shouldExtract: true, suggestedName: 'BASE_URL' },
    ]
    expect(formatHardcodedStrings(strs)).toContain('api.example.com')
  })
})

describe('formatExistingConstants', () => {
  it('should handle empty array', () => {
    expect(formatExistingConstants([])).toContain('No existing constants')
  })

  it('should format constants', () => {
    const consts: ExistingConstant[] = [
      { name: 'MAX', value: '100', file: 'a.ts', line: 1, type: 'number', usageCount: 2 },
    ]
    expect(formatExistingConstants(consts)).toContain('MAX')
  })
})

describe('formatConstantsTable', () => {
  it('should include header', () => {
    const result = { magicNumbers: [], hardcodedStrings: [], existingConstants: [], stats: { totalMagicNumbers: 0, totalHardcodedStrings: 0, totalExistingConstants: 0, extractionCandidates: 0, byFile: {} } }
    expect(formatConstantsTable(result)).toContain('Constants')
  })
})

describe('formatConstantsJson', () => {
  it('should produce valid JSON', () => {
    const result = { magicNumbers: [], hardcodedStrings: [], existingConstants: [], stats: { totalMagicNumbers: 0, totalHardcodedStrings: 0, totalExistingConstants: 0, extractionCandidates: 0, byFile: {} } }
    const json = formatConstantsJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalMagicNumbers).toBe(0)
  })
})

// ─── Command metadata ───────────────────────────────────

describe('Constants command', () => {
  it('should have correct description', () => {
    expect(Constants.description).toContain('agic')
  })

  it('should have path arg', () => {
    expect(Constants.args.path).toBeDefined()
  })

  it('should have format flag', () => {
    expect(Constants.flags.format).toBeDefined()
  })

  it('should have output flag', () => {
    expect(Constants.flags.output).toBeDefined()
  })

  it('should have ignore flag', () => {
    expect(Constants.flags.ignore).toBeDefined()
  })

  it('should have ext flag', () => {
    expect(Constants.flags.ext).toBeDefined()
  })

  it('should have threshold flag', () => {
    expect(Constants.flags.threshold).toBeDefined()
  })

  it('should have verbose flag', () => {
    expect(Constants.flags.verbose).toBeDefined()
  })

  it('should have examples', () => {
    expect(Constants.examples.length).toBeGreaterThan(0)
  })
})
