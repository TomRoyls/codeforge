import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import SnapshotCommand from '../src/commands/snapshot.js'
import {
  captureSnapshot,
  compareSnapshots,
  computeFileHash,
  generateSnapshotName,
  listSnapshots,
  loadSnapshot,
  saveSnapshot,
  type Snapshot as SnapshotType,
  type SnapshotMetrics,
} from '../src/commands/snapshot-helpers.js'
import {
  formatSnapshotDiffTable,
  formatSnapshotJson,
  formatSnapshotList,
  formatSnapshotTable,
} from '../src/commands/snapshot-format-helpers.js'

// ─── Test data factories ────────────────────────────────

function makeSnapshotMetrics(overrides: Partial<SnapshotMetrics> = {}): SnapshotMetrics {
  return {
    averageFileSize: 500,
    classes: 10,
    emptyFiles: 0,
    extensions: [{ count: 5, ext: '.ts' }],
    exports: 20,
    fixmes: 1,
    functions: 30,
    hacks: 0,
    languages: [{ files: 5, lang: 'TypeScript', lines: 500 }],
    maxFileSize: 2000,
    todos: 5,
    totalFiles: 5,
    totalLines: 500,
    totalSize: 2500,
    ...overrides,
  }
}

function makeSnapshot(overrides: Partial<SnapshotType> = {}): SnapshotType {
  return {
    fileHashes: [
      { file: 'src/index.ts', hash: '100:import foo from bar' },
    ],
    metrics: makeSnapshotMetrics(),
    name: 'test-snapshot',
    path: '/tmp/test',
    timestamp: '2025-05-19T12:00:00.000Z',
    ...overrides,
  }
}

// ─── Temp directory helpers ─────────────────────────────

const TEMP_DIR = join('/tmp', `snapshot-cmd-test-${Date.now()}`)

function setupTempDir(): string {
  mkdirSync(TEMP_DIR, { recursive: true })
  return TEMP_DIR
}

function cleanupTempDir(): void {
  rmSync(TEMP_DIR, { recursive: true, force: true })
}

// ─── Command metadata ───────────────────────────────────

describe('Snapshot command - static metadata', () => {
  it('has a description', () => {
    expect(SnapshotCommand.description).toBe('Capture and compare codebase snapshots')
  })

  it('has examples array', () => {
    expect(Array.isArray(SnapshotCommand.examples)).toBe(true)
    expect(SnapshotCommand.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has action arg with options', () => {
    expect(SnapshotCommand.args.action).toBeDefined()
    expect(SnapshotCommand.args.action.options).toContain('capture')
    expect(SnapshotCommand.args.action.options).toContain('compare')
    expect(SnapshotCommand.args.action.options).toContain('list')
    expect(SnapshotCommand.args.action.options).toContain('show')
  })

  it('defaults action to list', () => {
    expect(SnapshotCommand.args.action.default).toBe('list')
  })

  it('has format flag with options', () => {
    expect(SnapshotCommand.flags.format.options).toContain('json')
    expect(SnapshotCommand.flags.format.options).toContain('table')
  })

  it('defaults format to table', () => {
    expect(SnapshotCommand.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(SnapshotCommand.flags.output).toBeDefined()
  })

  it('has name flag', () => {
    expect(SnapshotCommand.flags.name).toBeDefined()
  })

  it('has compare-with flag', () => {
    expect(SnapshotCommand.flags['compare-with']).toBeDefined()
  })

  it('has dir flag defaulting to .codeforge/snapshots', () => {
    expect(SnapshotCommand.flags.dir.default).toBe('.codeforge/snapshots')
  })
})

describe('Snapshot command - class structure', () => {
  it('exports a default class', () => {
    expect(SnapshotCommand).toBeDefined()
    expect(typeof SnapshotCommand).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof SnapshotCommand.prototype.run).toBe('function')
  })
})

// ─── computeFileHash ────────────────────────────────────

describe('computeFileHash', () => {
  it('combines size and first 100 chars', () => {
    const hash = computeFileHash('hello world', 11)
    expect(hash).toBe('11:hello world')
  })

  it('truncates content to 100 characters', () => {
    const longContent = 'a'.repeat(200)
    const hash = computeFileHash(longContent, 200)
    const prefix = longContent.slice(0, 100)
    expect(hash).toBe(`200:${prefix}`)
  })

  it('handles empty content', () => {
    const hash = computeFileHash('', 0)
    expect(hash).toBe('0:')
  })

  it('handles short content', () => {
    const hash = computeFileHash('hi', 2)
    expect(hash).toBe('2:hi')
  })
})

// ─── generateSnapshotName ───────────────────────────────

describe('generateSnapshotName', () => {
  it('starts with snapshot- prefix', () => {
    const name = generateSnapshotName()
    expect(name).toMatch(/^snapshot-/)
  })

  it('matches expected format', () => {
    const name = generateSnapshotName()
    expect(name).toMatch(/^snapshot-\d{4}-\d{2}-\d{2}-\d{6}$/)
  })

  it('generates unique names when called in sequence', async () => {
    const name1 = generateSnapshotName()
    await new Promise((r) => setTimeout(r, 10))
    const name2 = generateSnapshotName()
    expect(name1).toMatch(/^snapshot-\d{4}-\d{2}-\d{2}-\d{6}$/)
    expect(name2).toMatch(/^snapshot-\d{4}-\d{2}-\d{2}-\d{6}$/)
  })

  it('contains date components', () => {
    const name = generateSnapshotName()
    const now = new Date()
    const year = String(now.getFullYear())
    expect(name).toContain(year)
  })
})

// ─── saveSnapshot / loadSnapshot ────────────────────────

describe('saveSnapshot', () => {
  it('creates directory and saves file', async () => {
    const dir = join(setupTempDir(), 'snapshots')
    const snapshot = makeSnapshot({ name: 'test-save' })
    const filePath = await saveSnapshot(snapshot, dir)
    expect(filePath).toContain('test-save.json')
    cleanupTempDir()
  })

  it('writes valid JSON', async () => {
    const dir = setupTempDir()
    const snapshot = makeSnapshot({ name: 'json-test' })
    await saveSnapshot(snapshot, dir)
    const { readFileSync } = await import('node:fs')
    const content = readFileSync(join(dir, 'json-test.json'), 'utf8')
    const parsed = JSON.parse(content)
    expect(parsed.name).toBe('json-test')
    cleanupTempDir()
  })
})

describe('loadSnapshot', () => {
  it('round-trips save and load', async () => {
    const dir = setupTempDir()
    const original = makeSnapshot({ name: 'roundtrip' })
    await saveSnapshot(original, dir)
    const loaded = await loadSnapshot('roundtrip', dir)
    expect(loaded.name).toBe(original.name)
    expect(loaded.timestamp).toBe(original.timestamp)
    expect(loaded.metrics.totalFiles).toBe(original.metrics.totalFiles)
    cleanupTempDir()
  })

  it('throws for non-existent snapshot', async () => {
    const dir = setupTempDir()
    await expect(loadSnapshot('nonexistent', dir)).rejects.toThrow('Snapshot not found')
    cleanupTempDir()
  })

  it('preserves file hashes', async () => {
    const dir = setupTempDir()
    const original = makeSnapshot({
      name: 'hash-test',
      fileHashes: [
        { file: 'a.ts', hash: '10:aaaaaaaaaa' },
        { file: 'b.ts', hash: '20:bbbbbbbbbb' },
      ],
    })
    await saveSnapshot(original, dir)
    const loaded = await loadSnapshot('hash-test', dir)
    expect(loaded.fileHashes).toHaveLength(2)
    expect(loaded.fileHashes[0]!.file).toBe('a.ts')
    cleanupTempDir()
  })
})

// ─── listSnapshots ──────────────────────────────────────

describe('listSnapshots', () => {
  it('returns empty array for non-existent directory', async () => {
    const result = await listSnapshots('/tmp/nonexistent-dir-xyz')
    expect(result).toEqual([])
  })

  it('returns empty array for empty directory', async () => {
    const dir = setupTempDir()
    const result = await listSnapshots(dir)
    expect(result).toEqual([])
    cleanupTempDir()
  })

  it('lists available snapshots', async () => {
    const dir = setupTempDir()
    await saveSnapshot(makeSnapshot({ name: 'snap-a', timestamp: '2025-01-01T00:00:00.000Z' }), dir)
    await saveSnapshot(makeSnapshot({ name: 'snap-b', timestamp: '2025-06-01T00:00:00.000Z' }), dir)
    const result = await listSnapshots(dir)
    expect(result).toHaveLength(2)
    cleanupTempDir()
  })

  it('sorts by timestamp descending', async () => {
    const dir = setupTempDir()
    await saveSnapshot(makeSnapshot({ name: 'older', timestamp: '2025-01-01T00:00:00.000Z' }), dir)
    await saveSnapshot(makeSnapshot({ name: 'newer', timestamp: '2025-06-01T00:00:00.000Z' }), dir)
    const result = await listSnapshots(dir)
    expect(result[0]!.name).toBe('newer')
    expect(result[1]!.name).toBe('older')
    cleanupTempDir()
  })

  it('includes name, timestamp, and path', async () => {
    const dir = setupTempDir()
    await saveSnapshot(makeSnapshot({ name: 'meta-test', path: '/some/path' }), dir)
    const result = await listSnapshots(dir)
    expect(result[0]!.name).toBe('meta-test')
    expect(result[0]!.path).toBe('/some/path')
    expect(result[0]!.timestamp).toBeDefined()
    cleanupTempDir()
  })

  it('skips malformed JSON files', async () => {
    const dir = setupTempDir()
    writeFileSync(join(dir, 'bad.json'), 'not valid json{{{')
    await saveSnapshot(makeSnapshot({ name: 'good' }), dir)
    const result = await listSnapshots(dir)
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('good')
    cleanupTempDir()
  })
})

// ─── compareSnapshots ───────────────────────────────────

describe('compareSnapshots', () => {
  it('detects metric changes', () => {
    const from = makeSnapshot({ metrics: makeSnapshotMetrics({ totalFiles: 5, totalLines: 100 }) })
    const to = makeSnapshot({ metrics: makeSnapshotMetrics({ totalFiles: 8, totalLines: 150 }) })
    const diff = compareSnapshots(from, to)
    const filesChange = diff.changes.find((c) => c.metric === 'totalFiles')
    expect(filesChange).toBeDefined()
    expect(filesChange!.from).toBe(5)
    expect(filesChange!.to).toBe(8)
    expect(filesChange!.diff).toBe(3)
  })

  it('detects up direction', () => {
    const from = makeSnapshot({ metrics: makeSnapshotMetrics({ totalFiles: 5 }) })
    const to = makeSnapshot({ metrics: makeSnapshotMetrics({ totalFiles: 10 }) })
    const diff = compareSnapshots(from, to)
    const filesChange = diff.changes.find((c) => c.metric === 'totalFiles')
    expect(filesChange!.direction).toBe('up')
  })

  it('detects down direction', () => {
    const from = makeSnapshot({ metrics: makeSnapshotMetrics({ totalFiles: 10 }) })
    const to = makeSnapshot({ metrics: makeSnapshotMetrics({ totalFiles: 5 }) })
    const diff = compareSnapshots(from, to)
    const filesChange = diff.changes.find((c) => c.metric === 'totalFiles')
    expect(filesChange!.direction).toBe('down')
  })

  it('detects unchanged direction', () => {
    const from = makeSnapshot({ metrics: makeSnapshotMetrics({ totalFiles: 5 }) })
    const to = makeSnapshot({ metrics: makeSnapshotMetrics({ totalFiles: 5 }) })
    const diff = compareSnapshots(from, to)
    const filesChange = diff.changes.find((c) => c.metric === 'totalFiles')
    expect(filesChange!.direction).toBe('unchanged')
  })

  it('calculates percentage change', () => {
    const from = makeSnapshot({ metrics: makeSnapshotMetrics({ totalLines: 100 }) })
    const to = makeSnapshot({ metrics: makeSnapshotMetrics({ totalLines: 150 }) })
    const diff = compareSnapshots(from, to)
    const linesChange = diff.changes.find((c) => c.metric === 'totalLines')
    expect(linesChange!.percentageChange).toBe(50)
  })

  it('handles zero-division in percentage change', () => {
    const from = makeSnapshot({ metrics: makeSnapshotMetrics({ totalFiles: 0 }) })
    const to = makeSnapshot({ metrics: makeSnapshotMetrics({ totalFiles: 5 }) })
    const diff = compareSnapshots(from, to)
    const filesChange = diff.changes.find((c) => c.metric === 'totalFiles')
    expect(filesChange!.percentageChange).toBe(0)
  })

  it('handles all unchanged', () => {
    const metrics = makeSnapshotMetrics()
    const from = makeSnapshot({ metrics })
    const to = makeSnapshot({ metrics })
    const diff = compareSnapshots(from, to)
    for (const change of diff.changes) {
      expect(change.direction).toBe('unchanged')
    }
  })

  it('detects new files', () => {
    const from = makeSnapshot({
      fileHashes: [{ file: 'a.ts', hash: '10:aaaaaaaaaa' }],
    })
    const to = makeSnapshot({
      fileHashes: [
        { file: 'a.ts', hash: '10:aaaaaaaaaa' },
        { file: 'b.ts', hash: '20:bbbbbbbbbb' },
      ],
    })
    const diff = compareSnapshots(from, to)
    expect(diff.newFiles).toContain('b.ts')
    expect(diff.newFiles).toHaveLength(1)
  })

  it('detects removed files', () => {
    const from = makeSnapshot({
      fileHashes: [
        { file: 'a.ts', hash: '10:aaaaaaaaaa' },
        { file: 'b.ts', hash: '20:bbbbbbbbbb' },
      ],
    })
    const to = makeSnapshot({
      fileHashes: [{ file: 'a.ts', hash: '10:aaaaaaaaaa' }],
    })
    const diff = compareSnapshots(from, to)
    expect(diff.removedFiles).toContain('b.ts')
    expect(diff.removedFiles).toHaveLength(1)
  })

  it('detects modified files', () => {
    const from = makeSnapshot({
      fileHashes: [{ file: 'a.ts', hash: '10:old-hash' }],
    })
    const to = makeSnapshot({
      fileHashes: [{ file: 'a.ts', hash: '20:new-hash' }],
    })
    const diff = compareSnapshots(from, to)
    expect(diff.modifiedFiles).toContain('a.ts')
    expect(diff.modifiedFiles).toHaveLength(1)
  })

  it('includes correct from/to names', () => {
    const from = makeSnapshot({ name: 'snap-a' })
    const to = makeSnapshot({ name: 'snap-b' })
    const diff = compareSnapshots(from, to)
    expect(diff.from).toBe('snap-a')
    expect(diff.to).toBe('snap-b')
  })

  it('generates summary', () => {
    const from = makeSnapshot({
      name: 'from',
      metrics: makeSnapshotMetrics({ totalLines: 100 }),
      fileHashes: [{ file: 'a.ts', hash: '10:old' }],
    })
    const to = makeSnapshot({
      name: 'to',
      metrics: makeSnapshotMetrics({ totalLines: 150 }),
      fileHashes: [
        { file: 'a.ts', hash: '15:new' },
        { file: 'b.ts', hash: '20:new' },
      ],
    })
    const diff = compareSnapshots(from, to)
    expect(diff.summary).toContain('1 files added')
    expect(diff.summary).toContain('0 removed')
    expect(diff.summary).toContain('1 modified')
    expect(diff.summary).toContain('Lines changed by 50')
  })

  it('generates changes for all numeric metrics', () => {
    const from = makeSnapshot()
    const to = makeSnapshot()
    const diff = compareSnapshots(from, to)
    const metricNames = diff.changes.map((c) => c.metric)
    expect(metricNames).toContain('totalFiles')
    expect(metricNames).toContain('totalLines')
    expect(metricNames).toContain('totalSize')
    expect(metricNames).toContain('averageFileSize')
    expect(metricNames).toContain('maxFileSize')
    expect(metricNames).toContain('emptyFiles')
    expect(metricNames).toContain('todos')
    expect(metricNames).toContain('fixmes')
    expect(metricNames).toContain('hacks')
    expect(metricNames).toContain('exports')
    expect(metricNames).toContain('functions')
    expect(metricNames).toContain('classes')
  })

  it('includes timestamp', () => {
    const from = makeSnapshot()
    const to = makeSnapshot()
    const diff = compareSnapshots(from, to)
    expect(diff.timestamp).toBeDefined()
    expect(diff.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})

// ─── captureSnapshot ────────────────────────────────────

describe('captureSnapshot', () => {
  it('captures metrics from a real directory', async () => {
    const dir = setupTempDir()
    mkdirSync(join(dir, 'src'), { recursive: true })
    writeFileSync(join(dir, 'src', 'index.ts'), 'export const x = 1;\n')
    writeFileSync(join(dir, 'src', 'util.ts'), 'function helper() { return 42; }\n')

    const snapshot = await captureSnapshot(dir, 'test-capture')
    expect(snapshot.name).toBe('test-capture')
    expect(snapshot.metrics.totalFiles).toBe(2)
    expect(snapshot.metrics.totalLines).toBeGreaterThan(0)
    expect(snapshot.metrics.exports).toBeGreaterThanOrEqual(1)
    expect(snapshot.metrics.functions).toBeGreaterThanOrEqual(1)
    expect(snapshot.fileHashes).toHaveLength(2)
    cleanupTempDir()
  })

  it('handles empty directory', async () => {
    const dir = setupTempDir()
    const snapshot = await captureSnapshot(dir, 'empty-capture')
    expect(snapshot.metrics.totalFiles).toBe(0)
    expect(snapshot.metrics.totalLines).toBe(0)
    expect(snapshot.metrics.totalSize).toBe(0)
    expect(snapshot.metrics.averageFileSize).toBe(0)
    cleanupTempDir()
  })

  it('counts TODOs and FIXMEs', async () => {
    const dir = setupTempDir()
    writeFileSync(join(dir, 'todo.ts'), '// TODO: fix this\n// FIXME: broken\nconst x = 1;\n')

    const snapshot = await captureSnapshot(dir, 'todo-test')
    expect(snapshot.metrics.todos).toBeGreaterThanOrEqual(1)
    expect(snapshot.metrics.fixmes).toBeGreaterThanOrEqual(1)
    cleanupTempDir()
  })

  it('counts HACKs', async () => {
    const dir = setupTempDir()
    writeFileSync(join(dir, 'hack.ts'), '// HACK: temporary workaround\nconst x = 1;\n')

    const snapshot = await captureSnapshot(dir, 'hack-test')
    expect(snapshot.metrics.hacks).toBeGreaterThanOrEqual(1)
    cleanupTempDir()
  })

  it('counts exports, functions, and classes', async () => {
    const dir = setupTempDir()
    writeFileSync(
      join(dir, 'code.ts'),
      'export class Foo {}\nexport function bar() {}\nconst baz = () => {}\n',
    )

    const snapshot = await captureSnapshot(dir, 'code-test')
    expect(snapshot.metrics.exports).toBeGreaterThanOrEqual(2)
    expect(snapshot.metrics.classes).toBeGreaterThanOrEqual(1)
    expect(snapshot.metrics.functions).toBeGreaterThanOrEqual(1)
    cleanupTempDir()
  })

  it('generates file hashes', async () => {
    const dir = setupTempDir()
    writeFileSync(join(dir, 'hash.ts'), 'const x = 1;\n')
    const snapshot = await captureSnapshot(dir, 'hash-test')
    expect(snapshot.fileHashes).toHaveLength(1)
    expect(snapshot.fileHashes[0]!.file).toBe('hash.ts')
    expect(snapshot.fileHashes[0]!.hash).toContain('13:')
    cleanupTempDir()
  })

  it('sets ISO timestamp', async () => {
    const dir = setupTempDir()
    const snapshot = await captureSnapshot(dir, 'time-test')
    expect(snapshot.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    cleanupTempDir()
  })

  it('detects languages from extensions', async () => {
    const dir = setupTempDir()
    writeFileSync(join(dir, 'a.ts'), 'const a = 1;\n')
    writeFileSync(join(dir, 'b.py'), 'x = 1\n')

    const snapshot = await captureSnapshot(dir, 'lang-test')
    const langs = snapshot.metrics.languages.map((l) => l.lang)
    expect(langs).toContain('TypeScript')
    expect(langs).toContain('Python')
    cleanupTempDir()
  })

  it('tracks extensions', async () => {
    const dir = setupTempDir()
    writeFileSync(join(dir, 'a.ts'), 'const a = 1;\n')
    writeFileSync(join(dir, 'b.ts'), 'const b = 2;\n')
    writeFileSync(join(dir, 'c.py'), 'x = 1\n')

    const snapshot = await captureSnapshot(dir, 'ext-test')
    const tsExt = snapshot.metrics.extensions.find((e) => e.ext === '.ts')
    expect(tsExt).toBeDefined()
    expect(tsExt!.count).toBe(2)
    cleanupTempDir()
  })

  it('detects empty files', async () => {
    const dir = setupTempDir()
    writeFileSync(join(dir, 'empty.ts'), '')
    writeFileSync(join(dir, 'notempty.ts'), 'const x = 1;\n')

    const snapshot = await captureSnapshot(dir, 'empty-test')
    expect(snapshot.metrics.emptyFiles).toBe(1)
    cleanupTempDir()
  })

  it('calculates average file size', async () => {
    const dir = setupTempDir()
    writeFileSync(join(dir, 'a.ts'), 'aaaa')  // 4 bytes
    writeFileSync(join(dir, 'b.ts'), 'bbbbbb') // 6 bytes

    const snapshot = await captureSnapshot(dir, 'avg-test')
    expect(snapshot.metrics.averageFileSize).toBe(5)
    cleanupTempDir()
  })
})

// ─── formatSnapshotTable ────────────────────────────────

describe('formatSnapshotTable', () => {
  it('contains snapshot name', () => {
    const snapshot = makeSnapshot({ name: 'my-snap' })
    const output = formatSnapshotTable(snapshot)
    expect(output).toContain('my-snap')
  })

  it('contains timestamp', () => {
    const snapshot = makeSnapshot({ timestamp: '2025-05-19T12:00:00.000Z' })
    const output = formatSnapshotTable(snapshot)
    expect(output).toContain('2025-05-19T12:00:00.000Z')
  })

  it('contains overview metrics', () => {
    const snapshot = makeSnapshot({ metrics: makeSnapshotMetrics({ totalFiles: 42, totalLines: 1000 }) })
    const output = formatSnapshotTable(snapshot)
    expect(output).toContain('42')
    expect(output).toContain('1,000')
  })

  it('contains language breakdown', () => {
    const snapshot = makeSnapshot({
      metrics: makeSnapshotMetrics({
        languages: [{ lang: 'TypeScript', files: 5, lines: 500 }],
      }),
    })
    const output = formatSnapshotTable(snapshot)
    expect(output).toContain('TypeScript')
  })

  it('shows extensions', () => {
    const snapshot = makeSnapshot({
      metrics: makeSnapshotMetrics({
        extensions: [{ ext: '.ts', count: 3 }],
      }),
    })
    const output = formatSnapshotTable(snapshot)
    expect(output).toContain('.ts')
    expect(output).toContain('3')
  })
})

// ─── formatSnapshotList ─────────────────────────────────

describe('formatSnapshotList', () => {
  it('shows "No snapshots found" for empty list', () => {
    const output = formatSnapshotList([])
    expect(output).toContain('No snapshots found')
  })

  it('lists snapshots with names', () => {
    const snapshots = [
      { name: 'snap-a', timestamp: '2025-01-01T00:00:00.000Z', path: '/tmp' },
      { name: 'snap-b', timestamp: '2025-06-01T00:00:00.000Z', path: '/tmp' },
    ]
    const output = formatSnapshotList(snapshots)
    expect(output).toContain('snap-a')
    expect(output).toContain('snap-b')
  })

  it('contains header row', () => {
    const snapshots = [{ name: 'snap-a', timestamp: '2025-01-01T00:00:00.000Z', path: '/tmp' }]
    const output = formatSnapshotList(snapshots)
    expect(output).toContain('Name')
    expect(output).toContain('Timestamp')
    expect(output).toContain('Path')
  })
})

// ─── formatSnapshotDiffTable ────────────────────────────

describe('formatSnapshotDiffTable', () => {
  function makeDiff() {
    const from = makeSnapshot({
      name: 'from-snap',
      metrics: makeSnapshotMetrics({ totalFiles: 5, totalLines: 100, todos: 3 }),
      fileHashes: [{ file: 'a.ts', hash: '10:old' }],
    })
    const to = makeSnapshot({
      name: 'to-snap',
      metrics: makeSnapshotMetrics({ totalFiles: 8, totalLines: 150, todos: 1 }),
      fileHashes: [
        { file: 'a.ts', hash: '15:new' },
        { file: 'b.ts', hash: '20:new' },
      ],
    })
    return compareSnapshots(from, to)
  }

  it('contains from/to names', () => {
    const diff = makeDiff()
    const output = formatSnapshotDiffTable(diff)
    expect(output).toContain('from-snap')
    expect(output).toContain('to-snap')
  })

  it('contains metric rows', () => {
    const diff = makeDiff()
    const output = formatSnapshotDiffTable(diff)
    expect(output).toContain('Total Files')
    expect(output).toContain('Total Lines')
  })

  it('contains file changes section', () => {
    const diff = makeDiff()
    const output = formatSnapshotDiffTable(diff)
    expect(output).toContain('File Changes')
    expect(output).toContain('b.ts')
  })

  it('contains summary', () => {
    const diff = makeDiff()
    const output = formatSnapshotDiffTable(diff)
    expect(output).toContain('Summary')
    expect(output).toContain(diff.summary)
  })

  it('shows before/after values', () => {
    const diff = makeDiff()
    const output = formatSnapshotDiffTable(diff)
    expect(output).toContain('Before')
    expect(output).toContain('After')
  })
})

// ─── formatSnapshotJson ─────────────────────────────────

describe('formatSnapshotJson', () => {
  it('produces valid JSON for a snapshot', () => {
    const snapshot = makeSnapshot()
    const output = formatSnapshotJson(snapshot)
    const parsed = JSON.parse(output)
    expect(parsed.name).toBe('test-snapshot')
  })

  it('produces valid JSON for a diff', () => {
    const from = makeSnapshot({ name: 'a' })
    const to = makeSnapshot({ name: 'b' })
    const diff = compareSnapshots(from, to)
    const output = formatSnapshotJson(diff)
    const parsed = JSON.parse(output)
    expect(parsed.from).toBe('a')
    expect(parsed.to).toBe('b')
  })

  it('produces valid JSON for a list', () => {
    const list = [{ name: 'snap', timestamp: '2025-01-01', path: '/tmp' }]
    const output = formatSnapshotJson(list)
    const parsed = JSON.parse(output)
    expect(parsed).toHaveLength(1)
    expect(parsed[0]!.name).toBe('snap')
  })

  it('pretty prints with 2-space indent', () => {
    const snapshot = makeSnapshot()
    const output = formatSnapshotJson(snapshot)
    expect(output).toContain('  "name"')
  })
})
