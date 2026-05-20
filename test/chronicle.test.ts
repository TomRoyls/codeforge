import { describe, expect, it } from 'vitest'

import {
  assignCharacterRole,
  buildChronicleResult,
  buildEvent,
  classifyEvent,
  computeNarrativeRichness,
  daysBetween,
  divideIntoChapters,
  generateRecommendations,
  getSeason,
  identifyDarkAge,
  identifyGoldenAge,
  parseGitLog,
  type GitCommit,
  type Event,
  type Chapter,
  type Character,
  type ChronicleStats,
} from '../src/commands/chronicle-helpers.js'

import {
  formatChapter,
  formatCharacterRoster,
  formatChronicleJSON,
  formatChronicleRecommendations,
  formatChronicleStats,
  formatChronicleTable,
  formatTimeline,
} from '../src/commands/chronicle-format-helpers.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeCommit(overrides: Partial<GitCommit> & { hash: string }): GitCommit {
  return {
    author: 'Alice',
    date: '2024-01-15 10:00:00 -0500',
    message: 'Add feature',
    insertions: 10,
    deletions: 2,
    filesChanged: [],
    ...overrides,
  }
}

const singleCommit = makeCommit({
  hash: 'aaa111',
  author: 'Alice',
  date: '2024-01-15 10:00:00 -0500',
  message: 'Initial commit',
  insertions: 100,
  deletions: 0,
})

const manyCommits: GitCommit[] = [
  makeCommit({ hash: 'h01', author: 'Alice', date: '2024-01-01 10:00:00 -0500', message: 'Initial commit', insertions: 200, deletions: 0 }),
  makeCommit({ hash: 'h02', author: 'Alice', date: '2024-01-02 10:00:00 -0500', message: 'Add core module', insertions: 80, deletions: 5 }),
  makeCommit({ hash: 'h03', author: 'Bob', date: '2024-01-03 10:00:00 -0500', message: 'Add tests', insertions: 50, deletions: 0 }),
  makeCommit({ hash: 'h04', author: 'Alice', date: '2024-01-04 10:00:00 -0500', message: 'Fix login bug', insertions: 5, deletions: 10 }),
  makeCommit({ hash: 'h05', author: 'Charlie', date: '2024-01-05 10:00:00 -0500', message: 'docs: update readme', insertions: 30, deletions: 5 }),
  makeCommit({ hash: 'h06', author: 'Alice', date: '2024-01-06 10:00:00 -0500', message: 'feat: add dashboard', insertions: 120, deletions: 10 }),
  makeCommit({ hash: 'h07', author: 'Bob', date: '2024-01-07 10:00:00 -0500', message: 'refactor: rewrite parser', insertions: 60, deletions: 80 }),
  makeCommit({ hash: 'h08', author: 'Alice', date: '2024-01-08 10:00:00 -0500', message: 'fix: security patch', insertions: 5, deletions: 3 }),
  makeCommit({ hash: 'h09', author: 'Bob', date: '2024-01-09 10:00:00 -0500', message: 'release v1.0.0', insertions: 2, deletions: 2 }),
  makeCommit({ hash: 'h10', author: 'Alice', date: '2024-01-10 10:00:00 -0500', message: 'move: restructure dirs', insertions: 20, deletions: 20 }),
  makeCommit({ hash: 'h11', author: 'Alice', date: '2024-01-20 10:00:00 -0500', message: 'feat: add settings', insertions: 90, deletions: 5 }),
  makeCommit({ hash: 'h12', author: 'Bob', date: '2024-01-21 10:00:00 -0500', message: 'api: add user types', insertions: 40, deletions: 0 }),
  makeCommit({ hash: 'h13', author: 'Dave', date: '2024-06-01 10:00:00 -0500', message: 'fix typo', insertions: 1, deletions: 1 }),
]

// ─── daysBetween ──────────────────────────────────────────────────────────────

describe('daysBetween', () => {
  it('computes days between dates', () => {
    expect(daysBetween('2024-01-01', '2024-01-10')).toBe(9)
  })

  it('returns 0 for same date', () => {
    expect(daysBetween('2024-01-01', '2024-01-01')).toBe(0)
  })

  it('handles reversed order', () => {
    expect(daysBetween('2024-01-10', '2024-01-01')).toBe(9)
  })
})

// ─── getSeason ─────────────────────────────────────────────────────────────────

describe('getSeason', () => {
  it('returns winter for January', () => {
    expect(getSeason('2024-01-15')).toBe('winter')
  })

  it('returns spring for April', () => {
    expect(getSeason('2024-04-15')).toBe('spring')
  })

  it('returns summer for July', () => {
    expect(getSeason('2024-07-15')).toBe('summer')
  })

  it('returns autumn for October', () => {
    expect(getSeason('2024-10-15')).toBe('autumn')
  })
})

// ─── parseGitLog ──────────────────────────────────────────────────────────────

describe('parseGitLog', () => {
  it('returns empty for empty input', () => {
    expect(parseGitLog('')).toEqual([])
  })

  it('returns empty for whitespace input', () => {
    expect(parseGitLog('   ')).toEqual([])
  })

  it('parses single commit', () => {
    const raw = 'COMMIT_STARTaaa111\x00Alice\x002024-01-15 10:00:00 -0500\x00Initial commit\n\n 2 files changed, 100 insertions(+)\n'
    const commits = parseGitLog(raw)
    expect(commits).toHaveLength(1)
    expect(commits[0]!.hash).toBe('aaa111')
    expect(commits[0]!.author).toBe('Alice')
    expect(commits[0]!.message).toBe('Initial commit')
    expect(commits[0]!.insertions).toBe(100)
  })

  it('parses multiple commits', () => {
    const raw = [
      'COMMIT_STARTaaa\x00Alice\x002024-01-01\x00First',
      'COMMIT_STARTbbb\x00Bob\x002024-01-02\x00Second\n\n 1 file changed, 5 deletions(-)',
    ].join('\n\n')
    const commits = parseGitLog(raw)
    expect(commits).toHaveLength(2)
    expect(commits[0]!.hash).toBe('aaa')
    expect(commits[1]!.hash).toBe('bbb')
    expect(commits[1]!.deletions).toBe(5)
  })

  it('handles commits without shortstat', () => {
    const raw = 'COMMIT_STARTabc\x00Alice\x002024-01-01\x00Simple commit\n'
    const commits = parseGitLog(raw)
    expect(commits).toHaveLength(1)
    expect(commits[0]!.insertions).toBe(0)
    expect(commits[0]!.deletions).toBe(0)
  })
})

// ─── classifyEvent ────────────────────────────────────────────────────────────

describe('classifyEvent', () => {
  it('classifies first commits as founding', () => {
    const c = makeCommit({ hash: 'h1', message: 'Add stuff' })
    expect(classifyEvent(c, 0, 100)).toBe('founding')
    expect(classifyEvent(c, 2, 100)).toBe('founding')
  })

  it('classifies initial commit message as founding', () => {
    const c = makeCommit({ hash: 'h1', message: 'initial commit' })
    expect(classifyEvent(c, 10, 100)).toBe('founding')
  })

  it('classifies release as coronation', () => {
    const c = makeCommit({ hash: 'h1', message: 'release v2.0.0' })
    expect(classifyEvent(c, 10, 100)).toBe('coronation')
  })

  it('classifies version bump as coronation', () => {
    const c = makeCommit({ hash: 'h1', message: 'bump version to 1.5.0' })
    expect(classifyEvent(c, 10, 100)).toBe('coronation')
  })

  it('classifies bug fix as plague', () => {
    const c = makeCommit({ hash: 'h1', message: 'fix: resolve login crash' })
    expect(classifyEvent(c, 10, 100)).toBe('plague')
  })

  it('classifies security patch as plague', () => {
    const c = makeCommit({ hash: 'h1', message: 'security: patch CVE-2024-0001' })
    expect(classifyEvent(c, 10, 100)).toBe('plague')
  })

  it('classifies docs as renaissance', () => {
    const c = makeCommit({ hash: 'h1', message: 'docs: update API documentation' })
    expect(classifyEvent(c, 10, 100)).toBe('renaissance')
  })

  it('classifies move as exodus', () => {
    const c = makeCommit({ hash: 'h1', message: 'move: restructure directories' })
    expect(classifyEvent(c, 10, 100)).toBe('exodus')
  })

  it('classifies api as treaty', () => {
    const c = makeCommit({ hash: 'h1', message: 'api: add user interface types' })
    expect(classifyEvent(c, 10, 100)).toBe('treaty')
  })

  it('classifies refactor as war', () => {
    const c = makeCommit({ hash: 'h1', message: 'refactor: rewrite entire module' })
    expect(classifyEvent(c, 10, 100)).toBe('war')
  })

  it('classifies feat as expansion', () => {
    const c = makeCommit({ hash: 'h1', message: 'feat: add new command' })
    expect(classifyEvent(c, 10, 100)).toBe('expansion')
  })

  it('classifies improve as renaissance', () => {
    const c = makeCommit({ hash: 'h1', message: 'improve error handling' })
    expect(classifyEvent(c, 10, 100)).toBe('renaissance')
  })

  it('classifies high deletion count as war', () => {
    const c = makeCommit({ hash: 'h1', message: 'misc changes', deletions: 150 })
    expect(classifyEvent(c, 10, 100)).toBe('war')
  })

  it('classifies high insertion count as expansion', () => {
    const c = makeCommit({ hash: 'h1', message: 'misc changes', insertions: 80 })
    expect(classifyEvent(c, 10, 100)).toBe('expansion')
  })
})

// ─── buildEvent ───────────────────────────────────────────────────────────────

describe('buildEvent', () => {
  it('builds event from commit', () => {
    const c = makeCommit({ hash: 'abc123', date: '2024-01-15', message: 'feat: add X', insertions: 40, deletions: 10 })
    const e = buildEvent(c, 'expansion')
    expect(e.hash).toBe('abc123')
    expect(e.type).toBe('expansion')
    expect(e.description).toBe('feat: add X')
    expect(e.impact).toBe(50)
    expect(e.filesAffected).toEqual([])
  })

  it('clamps impact to 100', () => {
    const c = makeCommit({ hash: 'abc', insertions: 80, deletions: 40 })
    const e = buildEvent(c, 'expansion')
    expect(e.impact).toBe(100)
  })
})

// ─── assignCharacterRole ──────────────────────────────────────────────────────

describe('assignCharacterRole', () => {
  it('assigns phantom for 1-2 commits', () => {
    const c = [makeCommit({ hash: 'h1' })]
    expect(assignCharacterRole('Dave', c, 20, 100)).toBe('phantom')
  })

  it('assigns phantom for exactly 2 commits', () => {
    const c = [makeCommit({ hash: 'h1' }), makeCommit({ hash: 'h2' })]
    expect(assignCharacterRole('Dave', c, 20, 100)).toBe('phantom')
  })

  it('assigns founder for early committers', () => {
    const c = Array.from({ length: 5 }, (_, i) => makeCommit({ hash: `h${i}` }))
    expect(assignCharacterRole('Alice', c, 5, 100)).toBe('founder')
  })

  it('assigns guardian for > 30% fix commits', () => {
    const c = [
      ...Array.from({ length: 4 }, (_, i) => makeCommit({ hash: `h${i}`, message: 'fix: bug' })),
      makeCommit({ hash: 'h4' }, { message: 'feat: add' }),
      makeCommit({ hash: 'h5' }, { message: 'feat: add' }),
      makeCommit({ hash: 'h6' }, { message: 'fix: bug' }),
      makeCommit({ hash: 'h7' }, { message: 'fix: bug' }),
      makeCommit({ hash: 'h8' }, { message: 'fix: bug' }),
      makeCommit({ hash: 'h9' }, { message: 'fix: bug' }),
      makeCommit({ hash: 'h10' }, { message: 'chore: cleanup' }),
    ]
    expect(assignCharacterRole('Bob', c, 50, 100)).toBe('guardian')
  })

  it('assigns architect for > 20% refactor commits', () => {
    const c = [
      ...Array.from({ length: 3 }, (_, i) => makeCommit({ hash: `h${i}`, message: 'refactor: rewrite' })),
      makeCommit({ hash: 'h3' }, { message: 'feat: add' }),
      makeCommit({ hash: 'h4' }, { message: 'feat: add' }),
      makeCommit({ hash: 'h5' }, { message: 'feat: add' }),
      makeCommit({ hash: 'h6' }, { message: 'feat: add' }),
      makeCommit({ hash: 'h7' }, { message: 'move: dirs' }),
    ]
    expect(assignCharacterRole('Eve', c, 50, 100)).toBe('architect')
  })

  it('assigns builder for > 50% feat commits', () => {
    const c = [
      ...Array.from({ length: 6 }, (_, i) => makeCommit({ hash: `h${i}`, message: 'feat: add feature' })),
      makeCommit({ hash: 'h6' }, { message: 'fix: bug' }),
      makeCommit({ hash: 'h7' }, { message: 'chore: cleanup' }),
    ]
    expect(assignCharacterRole('Dev', c, 50, 100)).toBe('builder')
  })

  it('assigns wanderer for sparse < 5 commits over long period', () => {
    const c = [
      makeCommit({ hash: 'h1', date: '2024-01-01 10:00:00 -0500' }),
      makeCommit({ hash: 'h2', date: '2024-06-01 10:00:00 -0500' }),
      makeCommit({ hash: 'h3', date: '2024-12-01 10:00:00 -0500' }),
      makeCommit({ hash: 'h4', date: '2025-01-01 10:00:00 -0500' }),
    ]
    expect(assignCharacterRole('Zara', c, 50, 100)).toBe('wanderer')
  })

  it('defaults to builder when no strong pattern', () => {
    const c = Array.from({ length: 6 }, (_, i) =>
      makeCommit({ hash: `h${i}`, message: `misc change ${i}` }),
    )
    expect(assignCharacterRole('Dev', c, 50, 100)).toBe('builder')
  })
})

// ─── divideIntoChapters ───────────────────────────────────────────────────────

describe('divideIntoChapters', () => {
  it('returns empty for no events', () => {
    expect(divideIntoChapters([])).toEqual([])
  })

  it('keeps all events in one chapter when no gaps', () => {
    const events: Event[] = manyCommits.slice(0, 5).map((c, i) => ({
      hash: c.hash, date: c.date, type: 'expansion' as const,
      description: c.message, impact: 10, filesAffected: [],
    }))
    const chapters = divideIntoChapters(events)
    expect(chapters).toHaveLength(1)
    expect(chapters[0]!.events).toHaveLength(5)
  })

  it('splits on gap > 3 days', () => {
    const events: Event[] = [
      { hash: 'h1', date: '2024-01-01', type: 'expansion', description: 'a', impact: 10, filesAffected: [] },
      { hash: 'h2', date: '2024-01-02', type: 'expansion', description: 'b', impact: 10, filesAffected: [] },
      { hash: 'h3', date: '2024-01-03', type: 'expansion', description: 'c', impact: 10, filesAffected: [] },
      { hash: 'h4', date: '2024-01-10', type: 'expansion', description: 'd', impact: 10, filesAffected: [] },
      { hash: 'h5', date: '2024-01-11', type: 'expansion', description: 'e', impact: 10, filesAffected: [] },
      { hash: 'h6', date: '2024-01-12', type: 'expansion', description: 'f', impact: 10, filesAffected: [] },
    ]
    const chapters = divideIntoChapters(events)
    expect(chapters).toHaveLength(2)
  })

  it('merges small chapters into previous', () => {
    const events: Event[] = [
      { hash: 'h1', date: '2024-01-01', type: 'expansion', description: 'a', impact: 10, filesAffected: [] },
      { hash: 'h2', date: '2024-01-02', type: 'expansion', description: 'b', impact: 10, filesAffected: [] },
      { hash: 'h3', date: '2024-01-03', type: 'expansion', description: 'c', impact: 10, filesAffected: [] },
      { hash: 'h4', date: '2024-01-15', type: 'expansion', description: 'd', impact: 10, filesAffected: [] },
    ]
    const chapters = divideIntoChapters(events)
    expect(chapters).toHaveLength(1)
    expect(chapters[0]!.events).toHaveLength(4)
  })
})

// ─── identifyGoldenAge ────────────────────────────────────────────────────────

describe('identifyGoldenAge', () => {
  it('returns none for empty chapters', () => {
    expect(identifyGoldenAge([])).toBe('none')
  })

  it('identifies chapter with most renaissance events', () => {
    const chapters: Chapter[] = [
      { title: 'Dark Times', era: 'Winter 2024', startDate: '2024-01-01', endDate: '2024-01-31', narrative: '', keyEvents: [
        { hash: 'h1', date: '2024-01-01', type: 'plague', description: 'fix', impact: 10, filesAffected: [] },
      ], characters: [], significance: 30 },
      { title: 'Golden Age', era: 'Spring 2024', startDate: '2024-03-01', endDate: '2024-03-31', narrative: '', keyEvents: [
        { hash: 'h2', date: '2024-03-01', type: 'renaissance', description: 'docs', impact: 20, filesAffected: [] },
        { hash: 'h3', date: '2024-03-02', type: 'renaissance', description: 'tests', impact: 30, filesAffected: [] },
        { hash: 'h4', date: '2024-03-03', type: 'coronation', description: 'release', impact: 10, filesAffected: [] },
      ], characters: [], significance: 80 },
    ]
    expect(identifyGoldenAge(chapters)).toBe('Golden Age')
  })
})

// ─── identifyDarkAge ──────────────────────────────────────────────────────────

describe('identifyDarkAge', () => {
  it('returns none for empty chapters', () => {
    expect(identifyDarkAge([])).toBe('none')
  })

  it('identifies chapter with most plague events', () => {
    const chapters: Chapter[] = [
      { title: 'Good Times', era: 'Spring 2024', startDate: '2024-03-01', endDate: '2024-03-31', narrative: '', keyEvents: [
        { hash: 'h1', date: '2024-03-01', type: 'expansion', description: 'feat', impact: 20, filesAffected: [] },
      ], characters: [], significance: 70 },
      { title: 'Crisis', era: 'Summer 2024', startDate: '2024-06-01', endDate: '2024-06-30', narrative: '', keyEvents: [
        { hash: 'h2', date: '2024-06-01', type: 'plague', description: 'fix', impact: 10, filesAffected: [] },
        { hash: 'h3', date: '2024-06-02', type: 'plague', description: 'fix', impact: 15, filesAffected: [] },
        { hash: 'h4', date: '2024-06-03', type: 'war', description: 'conflict', impact: 20, filesAffected: [] },
      ], characters: [], significance: 20 },
    ]
    expect(identifyDarkAge(chapters)).toBe('Crisis')
  })
})

// ─── computeNarrativeRichness ─────────────────────────────────────────────────

describe('computeNarrativeRichness', () => {
  it('returns 0 for empty data', () => {
    expect(computeNarrativeRichness([], [], [])).toBe(0)
  })

  it('increases with more chapters', () => {
    const ch1: Chapter = { title: 'A', era: 'E1', startDate: '2024-01-01', endDate: '2024-01-31', narrative: '', keyEvents: [], characters: [], significance: 50 }
    const ch2: Chapter = { title: 'B', era: 'E2', startDate: '2024-02-01', endDate: '2024-02-28', narrative: '', keyEvents: [], characters: [], significance: 50 }
    const ch3: Chapter = { title: 'C', era: 'E3', startDate: '2024-03-01', endDate: '2024-03-31', narrative: '', keyEvents: [], characters: [], significance: 50 }
    const ch4: Chapter = { title: 'D', era: 'E4', startDate: '2024-04-01', endDate: '2024-04-30', narrative: '', keyEvents: [], characters: [], significance: 50 }
    const r1 = computeNarrativeRichness([ch1, ch2], [], [])
    const r2 = computeNarrativeRichness([ch1, ch2, ch3, ch4], [], [])
    expect(r2).toBeGreaterThan(r1)
  })

  it('increases with more event types', () => {
    const ch: Chapter = { title: 'A', era: 'E', startDate: '2024-01-01', endDate: '2024-01-31', narrative: '', keyEvents: [], characters: [], significance: 50 }
    const e1: Event[] = [
      { hash: 'h1', date: '2024-01-01', type: 'expansion', description: 'a', impact: 10, filesAffected: [] },
      { hash: 'h2', date: '2024-01-01', type: 'plague', description: 'b', impact: 10, filesAffected: [] },
    ]
    const e2: Event[] = [
      ...e1,
      { hash: 'h3', date: '2024-01-01', type: 'renaissance', description: 'c', impact: 10, filesAffected: [] },
      { hash: 'h4', date: '2024-01-01', type: 'coronation', description: 'd', impact: 10, filesAffected: [] },
      { hash: 'h5', date: '2024-01-01', type: 'war', description: 'e', impact: 10, filesAffected: [] },
      { hash: 'h6', date: '2024-01-01', type: 'treaty', description: 'f', impact: 10, filesAffected: [] },
    ]
    const r1 = computeNarrativeRichness([ch], e1, [])
    const r2 = computeNarrativeRichness([ch], e2, [])
    expect(r2).toBeGreaterThan(r1)
  })

  it('clamps to 100 max', () => {
    const chapters = Array.from({ length: 10 }, (_, i) => ({
      title: `Ch${i}`, era: 'E', startDate: '2024-01-01', endDate: '2024-01-31', narrative: '', keyEvents: [], characters: [], significance: 50,
    }))
    const events = (['founding', 'expansion', 'war', 'treaty', 'plague', 'renaissance', 'exodus', 'coronation'] as const).map((type, i) => ({
      hash: `h${i}`, date: '2024-01-01', type, description: 'a', impact: 10, filesAffected: [],
    }))
    const chars = Array.from({ length: 10 }, (_, i) => ({
      name: `Dev${i}`, commits: 5, linesAdded: 100, linesRemoved: 20,
      firstAppearance: '2024-01-01', lastAppearance: '2024-06-01', activeDays: 30, role: 'builder' as const,
    }))
    const richness = computeNarrativeRichness(chapters, events, chars)
    expect(richness).toBeLessThanOrEqual(100)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: ChronicleStats = {
    totalChapters: 2, totalEvents: 10, totalCharacters: 3,
    foundingDate: '2024-01-01', currentAge: 100, totalPages: 10,
    goldenAgeChapter: 'Best', darkAgeChapter: 'Worst', narrativeRichness: 50,
  }

  it('recommends knowledge transfer for high phantom count', () => {
    const chars: Character[] = [
      { name: 'A', commits: 10, linesAdded: 100, linesRemoved: 10, firstAppearance: '2024-01-01', lastAppearance: '2024-06-01', activeDays: 30, role: 'builder' },
      { name: 'B', commits: 1, linesAdded: 5, linesRemoved: 1, firstAppearance: '2024-03-01', lastAppearance: '2024-03-01', activeDays: 1, role: 'phantom' },
      { name: 'C', commits: 2, linesAdded: 8, linesRemoved: 2, firstAppearance: '2024-04-01', lastAppearance: '2024-04-02', activeDays: 2, role: 'phantom' },
    ]
    const recs = generateRecommendations([], chars, [], baseStats)
    expect(recs.some((r) => r.includes('phantom'))).toBe(true)
  })

  it('recommends doc sprints when no renaissance', () => {
    const events: Event[] = [
      { hash: 'h1', date: '2024-01-01', type: 'expansion', description: 'a', impact: 10, filesAffected: [] },
    ]
    const recs = generateRecommendations([], [], events, baseStats)
    expect(recs.some((r) => r.includes('renaissance') || r.includes('quality'))).toBe(true)
  })

  it('recommends formalizing interfaces when no treaties', () => {
    const events: Event[] = [
      { hash: 'h1', date: '2024-01-01', type: 'expansion', description: 'a', impact: 10, filesAffected: [] },
    ]
    const recs = generateRecommendations([], [], events, baseStats)
    expect(recs.some((r) => r.includes('treaty') || r.includes('interface'))).toBe(true)
  })

  it('returns positive message for healthy project', () => {
    const chapters: Chapter[] = [
      { title: 'Golden', era: 'E', startDate: '2024-01-01', endDate: '2024-01-10', narrative: '', keyEvents: [
        { hash: 'h1', date: '2024-01-01', type: 'renaissance', description: 'docs', impact: 20, filesAffected: [] },
        { hash: 'h2', date: '2024-01-02', type: 'treaty', description: 'api', impact: 30, filesAffected: [] },
        { hash: 'h3', date: '2024-01-03', type: 'expansion', description: 'feat', impact: 40, filesAffected: [] },
      ], characters: ['Alice'], significance: 80 },
    ]
    const chars: Character[] = [
      { name: 'Alice', commits: 20, linesAdded: 500, linesRemoved: 100, firstAppearance: '2024-01-01', lastAppearance: '2024-01-10', activeDays: 10, role: 'founder' },
      { name: 'Bob', commits: 15, linesAdded: 300, linesRemoved: 80, firstAppearance: '2024-01-01', lastAppearance: '2024-01-10', activeDays: 10, role: 'builder' },
      { name: 'Charlie', commits: 10, linesAdded: 200, linesRemoved: 50, firstAppearance: '2024-01-01', lastAppearance: '2024-01-10', activeDays: 10, role: 'guardian' },
    ]
    const events: Event[] = [
      { hash: 'h1', date: '2024-01-01', type: 'renaissance', description: 'docs', impact: 20, filesAffected: [] },
      { hash: 'h2', date: '2024-01-02', type: 'treaty', description: 'api', impact: 30, filesAffected: [] },
      { hash: 'h3', date: '2024-01-03', type: 'expansion', description: 'feat', impact: 40, filesAffected: [] },
    ]
    const stats: ChronicleStats = {
      totalChapters: 1, totalEvents: 3, totalCharacters: 3,
      foundingDate: '2024-01-01', currentAge: 10, totalPages: 3,
      goldenAgeChapter: 'Golden', darkAgeChapter: 'Golden', narrativeRichness: 70,
    }
    const recs = generateRecommendations(chapters, chars, events, stats)
    expect(recs.some((r) => r.includes('rich') || r.includes('balanced') || r.includes('good'))).toBe(true)
  })

  it('flags founder inactivity', () => {
    const chars: Character[] = [
      { name: 'Founder', commits: 10, linesAdded: 200, linesRemoved: 50, firstAppearance: '2024-01-01', lastAppearance: '2024-02-01', activeDays: 30, role: 'founder' },
    ]
    const events: Event[] = [
      { hash: 'h1', date: '2024-01-01', type: 'expansion', description: 'a', impact: 10, filesAffected: [] },
      { hash: 'h2', date: '2024-01-01', type: 'renaissance', description: 'b', impact: 10, filesAffected: [] },
      { hash: 'h3', date: '2024-12-01', type: 'expansion', description: 'c', impact: 10, filesAffected: [] },
    ]
    const stats: ChronicleStats = { ...baseStats, narrativeRichness: 60 }
    const recs = generateRecommendations([], chars, events, stats)
    expect(recs.some((r) => r.includes('founder') || r.includes('Founder'))).toBe(true)
  })
})

// ─── buildChronicleResult ─────────────────────────────────────────────────────

describe('buildChronicleResult', () => {
  it('returns empty chronicle for no commits', () => {
    const result = buildChronicleResult([], { projectPath: '/project' })
    expect(result.title).toBe('The Empty Chronicle')
    expect(result.stats.totalEvents).toBe(0)
    expect(result.chapters).toHaveLength(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('builds result from single commit', () => {
    const result = buildChronicleResult([singleCommit], { projectPath: '/project' })
    expect(result.stats.totalEvents).toBe(1)
    expect(result.stats.totalCharacters).toBe(1)
    expect(result.characters[0]!.role).toBe('phantom')
  })

  it('builds result from many commits', () => {
    const result = buildChronicleResult(manyCommits, { projectPath: '/myproject' })
    expect(result.stats.totalEvents).toBe(manyCommits.length)
    expect(result.title).toBe('The Chronicle of myproject')
    expect(result.chapters.length).toBeGreaterThanOrEqual(1)
    expect(result.characters.length).toBeGreaterThanOrEqual(3)
  })

  it('computes golden and dark ages', () => {
    const result = buildChronicleResult(manyCommits, { projectPath: '.' })
    expect(result.stats.goldenAgeChapter).toBeDefined()
    expect(result.stats.darkAgeChapter).toBeDefined()
  })

  it('computes narrative richness', () => {
    const result = buildChronicleResult(manyCommits, { projectPath: '.' })
    expect(result.stats.narrativeRichness).toBeGreaterThanOrEqual(0)
    expect(result.stats.narrativeRichness).toBeLessThanOrEqual(100)
  })

  it('computes current age', () => {
    const result = buildChronicleResult(manyCommits, { projectPath: '.' })
    expect(result.stats.currentAge).toBeGreaterThan(0)
  })

  it('generates recommendations', () => {
    const result = buildChronicleResult(manyCommits, { projectPath: '.' })
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('sorts events chronologically', () => {
    const result = buildChronicleResult(manyCommits, { projectPath: '.' })
    for (let i = 1; i < result.events.length; i++) {
      expect(new Date(result.events[i]!.date).getTime()).toBeGreaterThanOrEqual(
        new Date(result.events[i - 1]!.date).getTime(),
      )
    }
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatChapter', () => {
  it('formats a chapter with title and events', () => {
    const ch: Chapter = {
      title: 'The Founding', era: 'Winter 2024', startDate: '2024-01-01', endDate: '2024-01-31',
      narrative: 'In the beginning...', keyEvents: [
        { hash: 'h1', date: '2024-01-01', type: 'founding', description: 'Initial commit', impact: 80, filesAffected: [] },
      ],
      characters: ['Alice'], significance: 75,
    }
    const output = formatChapter(ch, 0)
    expect(output).toContain('Chapter I')
    expect(output).toContain('The Founding')
    expect(output).toContain('In the beginning')
    expect(output).toContain('75%')
  })
})

describe('formatCharacterRoster', () => {
  it('handles empty roster', () => {
    expect(formatCharacterRoster([])).toContain('No characters found')
  })

  it('formats characters with role and stats', () => {
    const chars: Character[] = [
      { name: 'Alice', commits: 50, linesAdded: 1000, linesRemoved: 200, firstAppearance: '2024-01-01', lastAppearance: '2024-06-01', activeDays: 90, role: 'founder' },
    ]
    const output = formatCharacterRoster(chars)
    expect(output).toContain('Alice')
    expect(output).toContain('Founder')
    expect(output).toContain('50 commits')
  })
})

describe('formatTimeline', () => {
  it('handles empty events', () => {
    expect(formatTimeline([])).toContain('No events recorded')
  })

  it('formats events with type and impact', () => {
    const events: Event[] = [
      { hash: 'h1', date: '2024-01-15 10:00:00', type: 'founding', description: 'Initial commit', impact: 85, filesAffected: [] },
    ]
    const output = formatTimeline(events)
    expect(output).toContain('FOUNDING')
    expect(output).toContain('Initial commit')
    expect(output).toContain('85')
  })

  it('truncates to 20 events', () => {
    const events: Event[] = Array.from({ length: 30 }, (_, i) => ({
      hash: `h${i}`, date: `2024-01-${String(i + 1).padStart(2, '0')}`, type: 'expansion' as const,
      description: `Event ${i}`, impact: 10, filesAffected: [],
    }))
    const output = formatTimeline(events)
    expect(output).toContain('10 more events')
  })
})

describe('formatChronicleStats', () => {
  it('formats all stat fields', () => {
    const stats: ChronicleStats = {
      totalChapters: 5, totalEvents: 100, totalCharacters: 8,
      foundingDate: '2024-01-01T00:00:00', currentAge: 365, totalPages: 100,
      goldenAgeChapter: 'Renaissance', darkAgeChapter: 'Bug Crisis', narrativeRichness: 72,
    }
    const output = formatChronicleStats(stats)
    expect(output).toContain('Chapters:        5')
    expect(output).toContain('Events:          100')
    expect(output).toContain('Characters:      8')
    expect(output).toContain('365 days')
    expect(output).toContain('Renaissance')
    expect(output).toContain('Bug Crisis')
  })
})

describe('formatChronicleRecommendations', () => {
  it('handles empty recommendations', () => {
    expect(formatChronicleRecommendations([])).toContain('No recommendations')
  })

  it('numbers recommendations', () => {
    const output = formatChronicleRecommendations(['First rec', 'Second rec'])
    expect(output).toContain('1. First rec')
    expect(output).toContain('2. Second rec')
  })
})

describe('formatChronicleTable', () => {
  it('formats full result', () => {
    const result = buildChronicleResult(manyCommits, { projectPath: '.' })
    const output = formatChronicleTable(result)
    expect(output).toContain('Chronicle Stats')
    expect(output).toContain('Character Roster')
  })
})

describe('formatChronicleJSON', () => {
  it('produces valid JSON', () => {
    const result = buildChronicleResult(manyCommits, { projectPath: '.' })
    const json = formatChronicleJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.chapters).toBeDefined()
    expect(parsed.characters).toBeDefined()
    expect(parsed.events).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})
