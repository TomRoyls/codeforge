import { describe, it, expect } from 'vitest'

import {
  parseGitBlame,
  computeFileOwnership,
  computeDirOwnership,
  computeOwnerStats,
  computeBusFactor,
  findKnowledgeMonopolies,
  type FileOwnership,
  type DirOwnership,
  type OwnerInfo,
  type OwnershipResult,
} from '../src/commands/ownership-helpers.js'

import {
  formatOwnershipPercent,
  formatBusFactor,
  formatOwnershipTable,
  formatOwnershipJson,
} from '../src/commands/ownership-format-helpers.js'

import Ownership from '../src/commands/ownership.js'

// ─── Test helpers ─────────────────────────────────────────

function makeBlameData(
  entries: [string, string, number][],
): Map<string, Map<string, number>> {
  const result = new Map<string, Map<string, number>>()
  for (const [file, author, lines] of entries) {
    if (!result.has(file)) result.set(file, new Map())
    result.get(file)!.set(author, lines)
  }
  return result
}

function makeFileOwnership(
  file: string,
  owners: { name: string; percentage: number }[],
  lines: number,
): FileOwnership {
  return {
    file,
    lines,
    owners,
    primaryOwner: owners[0]?.name ?? '',
  }
}

function makeOwnerInfo(
  name: string,
  linesOwned: number,
  filesOwned: number,
  percentage: number,
): OwnerInfo {
  return {
    commits: 0,
    email: '',
    filesOwned,
    linesOwned,
    name,
    percentage,
  }
}

const SAMPLE_BLAME_OUTPUT = [
  'author Alice',
  'author-mail <alice@example.com>',
  'author-time 1000000',
  'filename src/a.ts',
  'author Bob',
  'author-mail <bob@example.com>',
  'author-time 1000001',
  'filename src/a.ts',
  'author Alice',
  'author-mail <alice@example.com>',
  'author-time 1000002',
  'filename src/b.ts',
].join('\n')

// ─── parseGitBlame ────────────────────────────────────────

describe('parseGitBlame', () => {
  it('should parse author and filename pairs', () => {
    const data = parseGitBlame(SAMPLE_BLAME_OUTPUT)
    expect(data.has('src/a.ts')).toBe(true)
    expect(data.has('src/b.ts')).toBe(true)
  })

  it('should count lines per author per file', () => {
    const data = parseGitBlame(SAMPLE_BLAME_OUTPUT)
    expect(data.get('src/a.ts')?.get('Alice')).toBe(1)
    expect(data.get('src/a.ts')?.get('Bob')).toBe(1)
    expect(data.get('src/b.ts')?.get('Alice')).toBe(1)
  })

  it('should return empty map for empty input', () => {
    const data = parseGitBlame('')
    expect(data.size).toBe(0)
  })

  it('should handle "Not Committed Yet" as (uncommitted)', () => {
    const input = [
      'author Not Committed Yet',
      'author-mail <not@committed>',
      'filename new.ts',
    ].join('\n')
    const data = parseGitBlame(input)
    expect(data.get('new.ts')?.get('(uncommitted)')).toBe(1)
  })

  it('should aggregate multiple lines for same author', () => {
    const input = [
      'author Alice',
      'author-mail <a@a.com>',
      'filename f.ts',
      'author Alice',
      'author-mail <a@a.com>',
      'filename f.ts',
    ].join('\n')
    const data = parseGitBlame(input)
    expect(data.get('f.ts')?.get('Alice')).toBe(2)
  })

  it('should ignore lines without filename', () => {
    const input = 'author Alice\nauthor-mail <a@a.com>\nsummary line'
    const data = parseGitBlame(input)
    expect(data.size).toBe(0)
  })
})

// ─── computeFileOwnership ─────────────────────────────────

describe('computeFileOwnership', () => {
  it('should compute ownership percentages', () => {
    const data = makeBlameData([
      ['a.ts', 'Alice', 80],
      ['a.ts', 'Bob', 20],
    ])
    const result = computeFileOwnership(data)
    expect(result).toHaveLength(1)
    expect(result[0].primaryOwner).toBe('Alice')
    expect(result[0].owners[0].percentage).toBe(80)
    expect(result[0].owners[1].percentage).toBe(20)
  })

  it('should set primary owner to highest percentage', () => {
    const data = makeBlameData([
      ['a.ts', 'Zoe', 10],
      ['a.ts', 'Alice', 90],
    ])
    const result = computeFileOwnership(data)
    expect(result[0].primaryOwner).toBe('Alice')
  })

  it('should compute total lines', () => {
    const data = makeBlameData([
      ['a.ts', 'Alice', 60],
      ['a.ts', 'Bob', 40],
    ])
    const result = computeFileOwnership(data)
    expect(result[0].lines).toBe(100)
  })

  it('should handle single-owner files', () => {
    const data = makeBlameData([['a.ts', 'Solo', 50]])
    const result = computeFileOwnership(data)
    expect(result[0].owners).toHaveLength(1)
    expect(result[0].owners[0].percentage).toBe(100)
  })

  it('should handle multiple files', () => {
    const data = makeBlameData([
      ['a.ts', 'Alice', 50],
      ['b.ts', 'Bob', 30],
    ])
    const result = computeFileOwnership(data)
    expect(result).toHaveLength(2)
  })

  it('should skip files with zero lines', () => {
    const data = new Map<string, Map<string, number>>()
    data.set('empty.ts', new Map())
    const result = computeFileOwnership(data)
    expect(result).toHaveLength(0)
  })

  it('should sort files alphabetically', () => {
    const data = makeBlameData([
      ['z.ts', 'A', 10],
      ['a.ts', 'A', 10],
    ])
    const result = computeFileOwnership(data)
    expect(result[0].file).toBe('a.ts')
    expect(result[1].file).toBe('z.ts')
  })
})

// ─── computeDirOwnership ──────────────────────────────────

describe('computeDirOwnership', () => {
  it('should aggregate files into directories', () => {
    const files = [
      makeFileOwnership('src/a.ts', [{ name: 'Alice', percentage: 60 }, { name: 'Bob', percentage: 40 }], 100),
      makeFileOwnership('src/b.ts', [{ name: 'Alice', percentage: 100 }], 50),
    ]
    const result = computeDirOwnership(files)
    expect(result).toHaveLength(1)
    expect(result[0].dir).toBe('src')
    expect(result[0].files).toBe(2)
  })

  it('should place root files in "." directory', () => {
    const files = [
      makeFileOwnership('readme.md', [{ name: 'Alice', percentage: 100 }], 10),
    ]
    const result = computeDirOwnership(files)
    expect(result[0].dir).toBe('.')
  })

  it('should compute directory-level ownership percentages', () => {
    const files = [
      makeFileOwnership('src/a.ts', [{ name: 'Alice', percentage: 100 }], 100),
      makeFileOwnership('src/b.ts', [{ name: 'Bob', percentage: 100 }], 100),
    ]
    const result = computeDirOwnership(files)
    expect(result[0].lines).toBe(200)
  })

  it('should identify primary owner at directory level', () => {
    const files = [
      makeFileOwnership('src/a.ts', [{ name: 'Alice', percentage: 90 }, { name: 'Bob', percentage: 10 }], 100),
      makeFileOwnership('src/b.ts', [{ name: 'Alice', percentage: 80 }, { name: 'Bob', percentage: 20 }], 50),
    ]
    const result = computeDirOwnership(files)
    expect(result[0].primaryOwner).toBe('Alice')
  })

  it('should handle multiple directories', () => {
    const files = [
      makeFileOwnership('src/a.ts', [{ name: 'Alice', percentage: 100 }], 10),
      makeFileOwnership('lib/b.ts', [{ name: 'Bob', percentage: 100 }], 20),
    ]
    const result = computeDirOwnership(files)
    expect(result).toHaveLength(2)
  })

  it('should handle nested directories', () => {
    const files = [
      makeFileOwnership('src/core/a.ts', [{ name: 'Alice', percentage: 100 }], 10),
    ]
    const result = computeDirOwnership(files)
    expect(result[0].dir).toBe('src/core')
  })

  it('should return empty for empty input', () => {
    const result = computeDirOwnership([])
    expect(result).toHaveLength(0)
  })
})

// ─── computeOwnerStats ────────────────────────────────────

describe('computeOwnerStats', () => {
  it('should compute per-owner statistics', () => {
    const files = [
      makeFileOwnership('a.ts', [{ name: 'Alice', percentage: 80 }, { name: 'Bob', percentage: 20 }], 100),
      makeFileOwnership('b.ts', [{ name: 'Alice', percentage: 100 }], 50),
    ]
    const result = computeOwnerStats(files, [])
    expect(result).toHaveLength(2)
  })

  it('should sort owners by percentage descending', () => {
    const files = [
      makeFileOwnership('a.ts', [{ name: 'Zoe', percentage: 10 }, { name: 'Alice', percentage: 90 }], 100),
    ]
    const result = computeOwnerStats(files, [])
    expect(result[0].name).toBe('Alice')
  })

  it('should count files owned per person', () => {
    const files = [
      makeFileOwnership('a.ts', [{ name: 'Alice', percentage: 100 }], 10),
      makeFileOwnership('b.ts', [{ name: 'Alice', percentage: 50 }, { name: 'Bob', percentage: 50 }], 10),
    ]
    const result = computeOwnerStats(files, [])
    const alice = result.find((o) => o.name === 'Alice')
    expect(alice?.filesOwned).toBe(2)
  })

  it('should compute percentage of total lines', () => {
    const files = [
      makeFileOwnership('a.ts', [{ name: 'Alice', percentage: 100 }], 100),
      makeFileOwnership('b.ts', [{ name: 'Bob', percentage: 100 }], 100),
    ]
    const result = computeOwnerStats(files, [])
    expect(result[0].percentage).toBe(50)
  })

  it('should handle empty input', () => {
    const result = computeOwnerStats([], [])
    expect(result).toHaveLength(0)
  })

  it('should compute lines owned', () => {
    const files = [
      makeFileOwnership('a.ts', [{ name: 'Alice', percentage: 50 }], 100),
    ]
    const result = computeOwnerStats(files, [])
    expect(result[0].linesOwned).toBe(50)
  })
})

// ─── computeBusFactor ─────────────────────────────────────

describe('computeBusFactor', () => {
  it('should return 0 for no owners', () => {
    expect(computeBusFactor([])).toBe(0)
  })

  it('should return 1 for single owner', () => {
    const owners = [makeOwnerInfo('Alice', 100, 10, 100)]
    expect(computeBusFactor(owners)).toBe(1)
  })

  it('should return 1 when one owner has >50%', () => {
    const owners = [
      makeOwnerInfo('Alice', 60, 10, 60),
      makeOwnerInfo('Bob', 40, 5, 40),
    ]
    expect(computeBusFactor(owners)).toBe(1)
  })

  it('should return 2 when two owners needed for 50%', () => {
    const owners = [
      makeOwnerInfo('Alice', 35, 8, 35),
      makeOwnerInfo('Bob', 35, 7, 35),
      makeOwnerInfo('Carol', 30, 5, 30),
    ]
    expect(computeBusFactor(owners)).toBe(2)
  })

  it('should return all owners if none reach 50%', () => {
    const owners = [
      makeOwnerInfo('Alice', 20, 5, 20),
      makeOwnerInfo('Bob', 20, 5, 20),
    ]
    expect(computeBusFactor(owners)).toBe(2)
  })

  it('should handle many small contributors', () => {
    const owners = Array.from({ length: 10 }, (_, i) =>
      makeOwnerInfo(`Dev${i}`, 10, 2, 10),
    )
    expect(computeBusFactor(owners)).toBe(5)
  })
})

// ─── findKnowledgeMonopolies ──────────────────────────────

describe('findKnowledgeMonopolies', () => {
  it('should find files with >80% single owner', () => {
    const files = [
      makeFileOwnership('a.ts', [{ name: 'Alice', percentage: 95 }], 100),
    ]
    const result = findKnowledgeMonopolies(files)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('Alice')
    expect(result[0]).toContain('95%')
  })

  it('should not flag files with distributed ownership', () => {
    const files = [
      makeFileOwnership('a.ts', [{ name: 'Alice', percentage: 60 }, { name: 'Bob', percentage: 40 }], 100),
    ]
    const result = findKnowledgeMonopolies(files)
    expect(result).toHaveLength(0)
  })

  it('should include exactly 80%', () => {
    const files = [
      makeFileOwnership('a.ts', [{ name: 'Alice', percentage: 80 }], 100),
    ]
    const result = findKnowledgeMonopolies(files)
    expect(result).toHaveLength(1)
  })

  it('should not include 79%', () => {
    const files = [
      makeFileOwnership('a.ts', [{ name: 'Alice', percentage: 79 }], 100),
    ]
    const result = findKnowledgeMonopolies(files)
    expect(result).toHaveLength(0)
  })

  it('should return empty for empty input', () => {
    const result = findKnowledgeMonopolies([])
    expect(result).toHaveLength(0)
  })

  it('should handle multiple monopoly files', () => {
    const files = [
      makeFileOwnership('a.ts', [{ name: 'Alice', percentage: 90 }], 50),
      makeFileOwnership('b.ts', [{ name: 'Bob', percentage: 85 }], 50),
      makeFileOwnership('c.ts', [{ name: 'Carol', percentage: 50 }, { name: 'Dave', percentage: 50 }], 50),
    ]
    const result = findKnowledgeMonopolies(files)
    expect(result).toHaveLength(2)
  })

  it('should include file path in output', () => {
    const files = [
      makeFileOwnership('src/core/engine.ts', [{ name: 'Alice', percentage: 95 }], 100),
    ]
    const result = findKnowledgeMonopolies(files)
    expect(result[0]).toContain('src/core/engine.ts')
  })
})

// ─── formatOwnershipPercent ───────────────────────────────

describe('formatOwnershipPercent', () => {
  it('should contain the percentage number', () => {
    expect(formatOwnershipPercent(50)).toContain('50')
  })

  it('should contain % sign', () => {
    expect(formatOwnershipPercent(30)).toContain('%')
  })

  it('should handle 0', () => {
    expect(formatOwnershipPercent(0)).toContain('0')
  })

  it('should handle 100', () => {
    expect(formatOwnershipPercent(100)).toContain('100')
  })
})

// ─── formatBusFactor ──────────────────────────────────────

describe('formatBusFactor', () => {
  it('should contain the factor number', () => {
    expect(formatBusFactor(3)).toContain('3')
  })

  it('should show CRITICAL for factor 1', () => {
    expect(formatBusFactor(1)).toContain('CRITICAL')
  })

  it('should show LOW for factor 2', () => {
    expect(formatBusFactor(2)).toContain('LOW')
  })

  it('should not show warning for factor >= 3', () => {
    const result = formatBusFactor(5)
    expect(result).not.toContain('CRITICAL')
    expect(result).not.toContain('LOW')
  })
})

// ─── formatOwnershipTable ─────────────────────────────────

describe('formatOwnershipTable', () => {
  function makeResult(overrides: Partial<OwnershipResult> = {}): OwnershipResult {
    return {
      busFactor: 2,
      dirs: [],
      files: [],
      knowledgeMonopolies: [],
      owners: [],
      ...overrides,
    }
  }

  it('should contain bus factor', () => {
    const result = formatOwnershipTable(makeResult({ busFactor: 3 }), false)
    expect(result).toContain('3')
  })

  it('should show knowledge monopolies', () => {
    const result = formatOwnershipTable(
      makeResult({ knowledgeMonopolies: ['core.ts (Alice: 95%)'] }),
      false,
    )
    expect(result).toContain('core.ts')
    expect(result).toContain('Alice')
  })

  it('should show owner table', () => {
    const owners = [
      makeOwnerInfo('Alice', 500, 10, 60),
      makeOwnerInfo('Bob', 300, 8, 40),
    ]
    const result = formatOwnershipTable(makeResult({ owners }), false)
    expect(result).toContain('Alice')
    expect(result).toContain('Bob')
  })

  it('should show directory ownership', () => {
    const dirs: DirOwnership[] = [
      {
        dir: 'src',
        files: 5,
        lines: 200,
        owners: [{ name: 'Alice', percentage: 70 }],
        primaryOwner: 'Alice',
      },
    ]
    const result = formatOwnershipTable(makeResult({ dirs }), false)
    expect(result).toContain('src')
  })

  it('should show verbose file ownership', () => {
    const files = [
      makeFileOwnership('a.ts', [{ name: 'Alice', percentage: 90 }], 50),
    ]
    const result = formatOwnershipTable(makeResult({ files }), true)
    expect(result).toContain('a.ts')
  })

  it('should not show files in non-verbose mode', () => {
    const files = [
      makeFileOwnership('secret.ts', [{ name: 'Alice', percentage: 90 }], 50),
    ]
    const result = formatOwnershipTable(makeResult({ files }), false)
    expect(result).not.toContain('secret.ts')
  })

  it('should handle empty result', () => {
    const result = formatOwnershipTable(makeResult(), false)
    expect(result).toContain('Ownership')
  })
})

// ─── formatOwnershipJson ──────────────────────────────────

describe('formatOwnershipJson', () => {
  it('should produce valid JSON', () => {
    const result: OwnershipResult = {
      busFactor: 2,
      dirs: [],
      files: [],
      knowledgeMonopolies: [],
      owners: [],
    }
    const json = formatOwnershipJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('should contain bus factor', () => {
    const result: OwnershipResult = {
      busFactor: 5,
      dirs: [],
      files: [],
      knowledgeMonopolies: [],
      owners: [],
    }
    const parsed = JSON.parse(formatOwnershipJson(result))
    expect(parsed.busFactor).toBe(5)
  })

  it('should serialize owners', () => {
    const owners = [makeOwnerInfo('Alice', 500, 10, 60)]
    const result: OwnershipResult = {
      busFactor: 1,
      dirs: [],
      files: [],
      knowledgeMonopolies: [],
      owners,
    }
    const parsed = JSON.parse(formatOwnershipJson(result))
    expect(parsed.owners).toHaveLength(1)
    expect(parsed.owners[0].name).toBe('Alice')
  })

  it('should serialize knowledge monopolies', () => {
    const result: OwnershipResult = {
      busFactor: 2,
      dirs: [],
      files: [],
      knowledgeMonopolies: ['a.ts (Alice: 90%)'],
      owners: [],
    }
    const parsed = JSON.parse(formatOwnershipJson(result))
    expect(parsed.knowledgeMonopolies).toEqual(['a.ts (Alice: 90%)'])
  })

  it('should serialize file ownership', () => {
    const files = [
      makeFileOwnership('a.ts', [{ name: 'Alice', percentage: 80 }], 100),
    ]
    const result: OwnershipResult = {
      busFactor: 1,
      dirs: [],
      files,
      knowledgeMonopolies: [],
      owners: [],
    }
    const parsed = JSON.parse(formatOwnershipJson(result))
    expect(parsed.files).toHaveLength(1)
    expect(parsed.files[0].file).toBe('a.ts')
  })

  it('should serialize directory ownership', () => {
    const dirs: DirOwnership[] = [
      {
        dir: 'src',
        files: 3,
        lines: 100,
        owners: [{ name: 'Alice', percentage: 70 }],
        primaryOwner: 'Alice',
      },
    ]
    const result: OwnershipResult = {
      busFactor: 1,
      dirs,
      files: [],
      knowledgeMonopolies: [],
      owners: [],
    }
    const parsed = JSON.parse(formatOwnershipJson(result))
    expect(parsed.dirs).toHaveLength(1)
    expect(parsed.dirs[0].dir).toBe('src')
  })
})

// ─── Command metadata ─────────────────────────────────────

describe('Ownership command', () => {
  it('should have correct description', () => {
    expect(Ownership.description).toContain('ownership')
  })

  it('should have path arg with default', () => {
    expect(Ownership.args.path).toBeDefined()
  })

  it('should have format flag', () => {
    expect(Ownership.flags.format).toBeDefined()
  })

  it('should have output flag', () => {
    expect(Ownership.flags.output).toBeDefined()
  })

  it('should have ignore flag', () => {
    expect(Ownership.flags.ignore).toBeDefined()
  })

  it('should have ext flag', () => {
    expect(Ownership.flags.ext).toBeDefined()
  })

  it('should have verbose flag', () => {
    expect(Ownership.flags.verbose).toBeDefined()
  })

  it('should have examples', () => {
    expect(Ownership.examples.length).toBeGreaterThan(0)
  })
})
