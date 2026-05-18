import { ChangeDetector } from '../src/core/change-detector/change-detector.js'
import { HashComputer } from '../src/core/change-detector/hash-computer.js'
import {
  DEFAULT_DETECTOR_CONFIG,
} from '../src/core/change-detector/types.js'
import type {
  FileEntry,
  FileChange,
  ChangeSummary,
  ChangeReport,
  DetectorConfig,
} from '../src/core/change-detector/types.js'

// ─── Helpers ────────────────────────────────────────────────────────────

function makeEntry(path: string, content: string, lastModified = 1000): FileEntry {
  const hasher = new HashComputer('djb2')
  return {
    path,
    hash: hasher.compute(content),
    size: content.length,
    lastModified,
  }
}

function makeBaseline(entries: Array<[string, string]>): Map<string, FileEntry> {
  const map = new Map<string, FileEntry>()
  for (const [path, content] of entries) {
    map.set(path, makeEntry(path, content))
  }
  return map
}

// ─── HashComputer – constructor ─────────────────────────────────────────

describe('HashComputer', () => {
  describe('constructor', () => {
    it('defaults to djb2 algorithm', () => {
      const h = new HashComputer()
      expect(h.getAlgorithm()).toBe('djb2')
    })

    it('accepts simple algorithm', () => {
      const h = new HashComputer('simple')
      expect(h.getAlgorithm()).toBe('simple')
    })

    it('accepts fnv1a algorithm', () => {
      const h = new HashComputer('fnv1a')
      expect(h.getAlgorithm()).toBe('fnv1a')
    })
  })

  // ─── HashComputer – compute ──────────────────────────────────────────

  describe('compute', () => {
    it('returns a string hash for djb2', () => {
      const h = new HashComputer('djb2')
      const result = h.compute('hello')
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('returns a string hash for simple', () => {
      const h = new HashComputer('simple')
      const result = h.compute('hello')
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('returns a string hash for fnv1a', () => {
      const h = new HashComputer('fnv1a')
      const result = h.compute('hello')
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('produces different hashes for different inputs', () => {
      const h = new HashComputer()
      expect(h.compute('foo')).not.toBe(h.compute('bar'))
    })

    it('produces the same hash for identical inputs', () => {
      const h = new HashComputer()
      expect(h.compute('same')).toBe(h.compute('same'))
    })
  })

  // ─── HashComputer – computeSimple ────────────────────────────────────

  describe('computeSimple', () => {
    it('computes sum of char codes in hex', () => {
      const h = new HashComputer('simple')
      expect(h.computeSimple('ab')).toBe((195).toString(16))
    })

    it('returns 0 for empty string', () => {
      const h = new HashComputer('simple')
      expect(h.computeSimple('')).toBe('0')
    })

    it('is deterministic', () => {
      const h = new HashComputer('simple')
      const first = h.computeSimple('test-content')
      const second = h.computeSimple('test-content')
      expect(first).toBe(second)
    })
  })

  // ─── HashComputer – computeDjb2 ──────────────────────────────────────

  describe('computeDjb2', () => {
    it('returns unsigned hex string', () => {
      const h = new HashComputer('djb2')
      const result = h.computeDjb2('test')
      expect(result).toMatch(/^[0-9a-f]+$/)
    })

    it('is deterministic', () => {
      const h = new HashComputer('djb2')
      expect(h.computeDjb2('abc')).toBe(h.computeDjb2('abc'))
    })

    it('produces different results for different inputs', () => {
      const h = new HashComputer('djb2')
      expect(h.computeDjb2('abc')).not.toBe(h.computeDjb2('def'))
    })

    it('returns same value for empty string', () => {
      const h = new HashComputer('djb2')
      const a = h.computeDjb2('')
      const b = h.computeDjb2('')
      expect(a).toBe(b)
    })
  })

  // ─── HashComputer – computeFNV1a ─────────────────────────────────────

  describe('computeFNV1a', () => {
    it('returns unsigned hex string', () => {
      const h = new HashComputer('fnv1a')
      const result = h.computeFNV1a('test')
      expect(result).toMatch(/^[0-9a-f]+$/)
    })

    it('is deterministic', () => {
      const h = new HashComputer('fnv1a')
      expect(h.computeFNV1a('xyz')).toBe(h.computeFNV1a('xyz'))
    })

    it('produces different results for different inputs', () => {
      const h = new HashComputer('fnv1a')
      expect(h.computeFNV1a('cat')).not.toBe(h.computeFNV1a('dog'))
    })

    it('handles long strings', () => {
      const h = new HashComputer('fnv1a')
      const longStr = 'a'.repeat(10000)
      const result = h.computeFNV1a(longStr)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  // ─── HashComputer – setAlgorithm / getAlgorithm ──────────────────────

  describe('setAlgorithm and getAlgorithm', () => {
    it('switches algorithm from djb2 to simple', () => {
      const h = new HashComputer('djb2')
      h.setAlgorithm('simple')
      expect(h.getAlgorithm()).toBe('simple')
    })

    it('switches algorithm to fnv1a', () => {
      const h = new HashComputer()
      h.setAlgorithm('fnv1a')
      expect(h.getAlgorithm()).toBe('fnv1a')
    })

    it('compute uses the new algorithm after setAlgorithm', () => {
      const h = new HashComputer('djb2')
      const djb2Hash = h.compute('test')
      h.setAlgorithm('simple')
      const simpleHash = h.compute('test')
      expect(djb2Hash).not.toBe(simpleHash)
    })

    it('can switch back and forth', () => {
      const h = new HashComputer('simple')
      const first = h.compute('data')
      h.setAlgorithm('djb2')
      h.setAlgorithm('simple')
      expect(h.compute('data')).toBe(first)
    })
  })
})

// ─── ChangeDetector – constructor ───────────────────────────────────────

describe('ChangeDetector', () => {
  describe('constructor', () => {
    it('creates detector with default config', () => {
      const d = new ChangeDetector()
      const config = d.getConfig()
      expect(config.algorithm).toBe('djb2')
      expect(config.includeUnchanged).toBe(false)
    })

    it('accepts custom algorithm', () => {
      const d = new ChangeDetector({ algorithm: 'fnv1a' })
      expect(d.getConfig().algorithm).toBe('fnv1a')
    })

    it('accepts includeUnchanged true', () => {
      const d = new ChangeDetector({ includeUnchanged: true })
      expect(d.getConfig().includeUnchanged).toBe(true)
    })

    it('accepts both config options', () => {
      const d = new ChangeDetector({ algorithm: 'simple', includeUnchanged: true })
      const config = d.getConfig()
      expect(config.algorithm).toBe('simple')
      expect(config.includeUnchanged).toBe(true)
    })

    it('starts with empty baseline', () => {
      const d = new ChangeDetector()
      expect(d.getBaseline().size).toBe(0)
    })
  })

  // ─── setBaseline / getBaseline ───────────────────────────────────────

  describe('setBaseline and getBaseline', () => {
    it('sets and retrieves baseline entries', () => {
      const d = new ChangeDetector()
      const baseline = makeBaseline([['a.ts', 'content']])
      d.setBaseline(baseline)
      const result = d.getBaseline()
      expect(result.size).toBe(1)
      expect(result.has('a.ts')).toBe(true)
    })

    it('returns a copy of the baseline', () => {
      const d = new ChangeDetector()
      const baseline = makeBaseline([['a.ts', 'hello']])
      d.setBaseline(baseline)
      const copy = d.getBaseline()
      copy.delete('a.ts')
      expect(d.getBaseline().has('a.ts')).toBe(true)
    })

    it('replaces existing baseline', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([['a.ts', 'old']]))
      d.setBaseline(makeBaseline([['b.ts', 'new']]))
      const result = d.getBaseline()
      expect(result.has('a.ts')).toBe(false)
      expect(result.has('b.ts')).toBe(true)
    })

    it('makes a defensive copy on set', () => {
      const d = new ChangeDetector()
      const baseline = makeBaseline([['a.ts', 'hello']])
      d.setBaseline(baseline)
      baseline.delete('a.ts')
      expect(d.getBaseline().has('a.ts')).toBe(true)
    })

    it('handles empty baseline', () => {
      const d = new ChangeDetector()
      d.setBaseline(new Map())
      expect(d.getBaseline().size).toBe(0)
    })
  })

  // ─── detectChanges ───────────────────────────────────────────────────

  describe('detectChanges', () => {
    it('detects added files', () => {
      const d = new ChangeDetector()
      const current = new Map<string, string>()
      current.set('new.ts', 'new content')
      const report = d.detectChanges(current)
      expect(report.changes).toHaveLength(1)
      expect(report.changes[0]!.changeType).toBe('added')
      expect(report.changes[0]!.path).toBe('new.ts')
      expect(report.changes[0]!.newHash).toBeDefined()
      expect(report.changes[0]!.newSize).toBe('new content'.length)
    })

    it('detects modified files', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([['a.ts', 'old content']]))
      const current = new Map<string, string>()
      current.set('a.ts', 'new content')
      const report = d.detectChanges(current)
      expect(report.changes).toHaveLength(1)
      expect(report.changes[0]!.changeType).toBe('modified')
      expect(report.changes[0]!.oldHash).toBeDefined()
      expect(report.changes[0]!.newHash).toBeDefined()
      expect(report.changes[0]!.oldSize).toBe('old content'.length)
      expect(report.changes[0]!.newSize).toBe('new content'.length)
    })

    it('detects removed files', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([['gone.ts', 'content']]))
      const report = d.detectChanges(new Map())
      expect(report.changes).toHaveLength(1)
      expect(report.changes[0]!.changeType).toBe('removed')
      expect(report.changes[0]!.path).toBe('gone.ts')
      expect(report.changes[0]!.oldHash).toBeDefined()
      expect(report.changes[0]!.oldSize).toBe('content'.length)
    })

    it('excludes unchanged files by default', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([['a.ts', 'same']]))
      const current = new Map<string, string>()
      current.set('a.ts', 'same')
      const report = d.detectChanges(current)
      expect(report.changes).toHaveLength(0)
    })

    it('includes unchanged files when configured', () => {
      const d = new ChangeDetector({ includeUnchanged: true })
      d.setBaseline(makeBaseline([['a.ts', 'same']]))
      const current = new Map<string, string>()
      current.set('a.ts', 'same')
      const report = d.detectChanges(current)
      expect(report.changes).toHaveLength(1)
      expect(report.changes[0]!.changeType).toBe('unchanged')
    })

    it('handles mixed changes in one report', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([
        ['kept.ts', 'same'],
        ['changed.ts', 'old'],
        ['removed.ts', 'bye'],
      ]))
      const current = new Map<string, string>()
      current.set('kept.ts', 'same')
      current.set('changed.ts', 'new')
      current.set('added.ts', 'fresh')
      const report = d.detectChanges(current)
      const types = report.changes.map((c) => c.changeType).sort()
      expect(types).toEqual(['added', 'modified', 'removed'])
    })

    it('returns correct summary counts', () => {
      const d = new ChangeDetector({ includeUnchanged: true })
      d.setBaseline(makeBaseline([
        ['a.ts', 'same'],
        ['b.ts', 'old'],
        ['c.ts', 'bye'],
      ]))
      const current = new Map<string, string>()
      current.set('a.ts', 'same')
      current.set('b.ts', 'new')
      current.set('d.ts', 'fresh')
      const report = d.detectChanges(current)
      expect(report.summary.added).toBe(1)
      expect(report.summary.modified).toBe(1)
      expect(report.summary.removed).toBe(1)
      expect(report.summary.unchanged).toBe(1)
      expect(report.summary.total).toBe(4)
    })

    it('summary total equals sum of categories', () => {
      const d = new ChangeDetector()
      const report = d.detectChanges(new Map<string, string>())
      const { added, removed, modified, unchanged, total } = report.summary
      expect(total).toBe(added + removed + modified + unchanged)
    })

    it('handles empty current and empty baseline', () => {
      const d = new ChangeDetector()
      const report = d.detectChanges(new Map())
      expect(report.changes).toHaveLength(0)
      expect(report.summary.total).toBe(0)
    })

    it('handles multiple files added at once', () => {
      const d = new ChangeDetector()
      const current = new Map<string, string>()
      current.set('a.ts', 'one')
      current.set('b.ts', 'two')
      current.set('c.ts', 'three')
      const report = d.detectChanges(current)
      expect(report.summary.added).toBe(3)
      expect(report.changes).toHaveLength(3)
    })
  })

  // ─── detectChangesFromEntries ─────────────────────────────────────────

  describe('detectChangesFromEntries', () => {
    it('detects added entries', () => {
      const d = new ChangeDetector()
      const entries: FileEntry[] = [
        makeEntry('new.ts', 'content'),
      ]
      const report = d.detectChangesFromEntries(entries)
      expect(report.changes).toHaveLength(1)
      expect(report.changes[0]!.changeType).toBe('added')
    })

    it('detects modified entries', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([['a.ts', 'old']]))
      const entries: FileEntry[] = [
        makeEntry('a.ts', 'new'),
      ]
      const report = d.detectChangesFromEntries(entries)
      expect(report.changes).toHaveLength(1)
      expect(report.changes[0]!.changeType).toBe('modified')
    })

    it('detects removed entries', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([['gone.ts', 'data']]))
      const report = d.detectChangesFromEntries([])
      expect(report.changes).toHaveLength(1)
      expect(report.changes[0]!.changeType).toBe('removed')
    })

    it('excludes unchanged by default', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([['a.ts', 'same']]))
      const entries: FileEntry[] = [
        makeEntry('a.ts', 'same'),
      ]
      const report = d.detectChangesFromEntries(entries)
      expect(report.changes).toHaveLength(0)
    })

    it('includes unchanged when configured', () => {
      const d = new ChangeDetector({ includeUnchanged: true })
      d.setBaseline(makeBaseline([['a.ts', 'same']]))
      const entries: FileEntry[] = [
        makeEntry('a.ts', 'same'),
      ]
      const report = d.detectChangesFromEntries(entries)
      expect(report.changes).toHaveLength(1)
      expect(report.changes[0]!.changeType).toBe('unchanged')
    })

    it('returns correct summary', () => {
      const d = new ChangeDetector({ includeUnchanged: true })
      d.setBaseline(makeBaseline([
        ['a.ts', 'same'],
        ['b.ts', 'old'],
      ]))
      const entries: FileEntry[] = [
        makeEntry('a.ts', 'same'),
        makeEntry('b.ts', 'new'),
        makeEntry('c.ts', 'fresh'),
      ]
      const report = d.detectChangesFromEntries(entries)
      expect(report.summary.added).toBe(1)
      expect(report.summary.modified).toBe(1)
      expect(report.summary.unchanged).toBe(1)
    })

    it('handles empty entries array', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([['a.ts', 'x']]))
      const report = d.detectChangesFromEntries([])
      expect(report.summary.removed).toBe(1)
    })
  })

  // ─── hasChanged ──────────────────────────────────────────────────────

  describe('hasChanged', () => {
    it('returns true for new file (not in baseline)', () => {
      const d = new ChangeDetector()
      expect(d.hasChanged('new.ts', 'content')).toBe(true)
    })

    it('returns false for unchanged file', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([['a.ts', 'same']]))
      expect(d.hasChanged('a.ts', 'same')).toBe(false)
    })

    it('returns true for modified file', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([['a.ts', 'old']]))
      expect(d.hasChanged('a.ts', 'new')).toBe(true)
    })

    it('returns true for empty string when path not in baseline', () => {
      const d = new ChangeDetector()
      expect(d.hasChanged('missing.ts', '')).toBe(true)
    })
  })

  // ─── getEntry ────────────────────────────────────────────────────────

  describe('getEntry', () => {
    it('returns entry for existing path', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([['a.ts', 'hello']]))
      const entry = d.getEntry('a.ts')
      expect(entry).toBeDefined()
      expect(entry!.path).toBe('a.ts')
      expect(entry!.size).toBe('hello'.length)
    })

    it('returns undefined for missing path', () => {
      const d = new ChangeDetector()
      expect(d.getEntry('missing.ts')).toBeUndefined()
    })

    it('returns entry with hash and lastModified', () => {
      const d = new ChangeDetector()
      const baseline = new Map<string, FileEntry>()
      baseline.set('f.ts', { path: 'f.ts', hash: 'abc', size: 10, lastModified: 42 })
      d.setBaseline(baseline)
      const entry = d.getEntry('f.ts')
      expect(entry!.hash).toBe('abc')
      expect(entry!.lastModified).toBe(42)
    })
  })

  // ─── updateBaseline ──────────────────────────────────────────────────

  describe('updateBaseline', () => {
    it('adds a new entry to the baseline', () => {
      const d = new ChangeDetector()
      d.updateBaseline('new.ts', 'content')
      const entry = d.getEntry('new.ts')
      expect(entry).toBeDefined()
      expect(entry!.path).toBe('new.ts')
      expect(entry!.size).toBe('content'.length)
    })

    it('updates an existing entry in the baseline', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([['a.ts', 'old']]))
      d.updateBaseline('a.ts', 'updated')
      const entry = d.getEntry('a.ts')
      expect(entry!.size).toBe('updated'.length)
    })

    it('sets lastModified to a recent timestamp', () => {
      const d = new ChangeDetector()
      const before = Date.now()
      d.updateBaseline('f.ts', 'data')
      const after = Date.now()
      const entry = d.getEntry('f.ts')
      expect(entry!.lastModified).toBeGreaterThanOrEqual(before)
      expect(entry!.lastModified).toBeLessThanOrEqual(after)
    })

    it('computes hash from content', () => {
      const d = new ChangeDetector()
      d.updateBaseline('f.ts', 'test')
      const entry = d.getEntry('f.ts')
      const hasher = new HashComputer('djb2')
      expect(entry!.hash).toBe(hasher.compute('test'))
    })
  })

  // ─── removeFromBaseline ──────────────────────────────────────────────

  describe('removeFromBaseline', () => {
    it('removes an existing entry and returns true', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([['a.ts', 'content']]))
      expect(d.removeFromBaseline('a.ts')).toBe(true)
      expect(d.getEntry('a.ts')).toBeUndefined()
    })

    it('returns false for non-existent path', () => {
      const d = new ChangeDetector()
      expect(d.removeFromBaseline('nope.ts')).toBe(false)
    })

    it('does not affect other entries', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([['a.ts', 'one'], ['b.ts', 'two']]))
      d.removeFromBaseline('a.ts')
      expect(d.getEntry('b.ts')).toBeDefined()
    })
  })

  // ─── getConfig ───────────────────────────────────────────────────────

  describe('getConfig', () => {
    it('returns a copy of the config', () => {
      const d = new ChangeDetector()
      const config = d.getConfig()
      expect(config).toEqual(DEFAULT_DETECTOR_CONFIG)
    })

    it('returned config is a defensive copy', () => {
      const d = new ChangeDetector()
      const config = d.getConfig()
      config.algorithm = 'fnv1a'
      expect(d.getConfig().algorithm).toBe('djb2')
    })

    it('reflects custom config', () => {
      const d = new ChangeDetector({ algorithm: 'simple', includeUnchanged: true })
      const config = d.getConfig()
      expect(config.algorithm).toBe('simple')
      expect(config.includeUnchanged).toBe(true)
    })
  })

  // ─── DEFAULT_DETECTOR_CONFIG ─────────────────────────────────────────

  describe('DEFAULT_DETECTOR_CONFIG', () => {
    it('has djb2 as default algorithm', () => {
      expect(DEFAULT_DETECTOR_CONFIG.algorithm).toBe('djb2')
    })

    it('has includeUnchanged false by default', () => {
      expect(DEFAULT_DETECTOR_CONFIG.includeUnchanged).toBe(false)
    })
  })

  // ─── Integration / Edge Cases ────────────────────────────────────────

  describe('integration and edge cases', () => {
    it('detectChanges with custom algorithm produces consistent results', () => {
      const d1 = new ChangeDetector({ algorithm: 'simple' })
      const d2 = new ChangeDetector({ algorithm: 'simple' })
      d1.setBaseline(makeBaseline([['a.ts', 'hello']]))
      d2.setBaseline(makeBaseline([['a.ts', 'hello']]))
      const current = new Map<string, string>()
      current.set('a.ts', 'world')
      const r1 = d1.detectChanges(current)
      const r2 = d2.detectChanges(current)
      expect(r1.changes[0]!.oldHash).toBe(r2.changes[0]!.oldHash)
      expect(r1.changes[0]!.newHash).toBe(r2.changes[0]!.newHash)
    })

    it('updateBaseline followed by hasChanged returns false', () => {
      const d = new ChangeDetector()
      d.updateBaseline('a.ts', 'content')
      expect(d.hasChanged('a.ts', 'content')).toBe(false)
    })

    it('updateBaseline followed by detectChanges shows no changes', () => {
      const d = new ChangeDetector()
      d.updateBaseline('a.ts', 'data')
      const current = new Map<string, string>()
      current.set('a.ts', 'data')
      const report = d.detectChanges(current)
      expect(report.changes).toHaveLength(0)
    })

    it('removeFromBaseline then detectChanges shows file as added', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([['a.ts', 'content']]))
      d.removeFromBaseline('a.ts')
      const current = new Map<string, string>()
      current.set('a.ts', 'content')
      const report = d.detectChanges(current)
      expect(report.changes).toHaveLength(1)
      expect(report.changes[0]!.changeType).toBe('added')
    })

    it('detectChanges does not mutate the current map', () => {
      const d = new ChangeDetector()
      const current = new Map<string, string>()
      current.set('a.ts', 'x')
      d.detectChanges(current)
      expect(current.get('a.ts')).toBe('x')
      expect(current.size).toBe(1)
    })

    it('detectChangesFromEntries does not mutate input array', () => {
      const d = new ChangeDetector()
      const entries: FileEntry[] = [makeEntry('a.ts', 'data')]
      d.detectChangesFromEntries(entries)
      expect(entries).toHaveLength(1)
    })

    it('handles files with identical content but different paths', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([['a.ts', 'same'], ['b.ts', 'same']]))
      const current = new Map<string, string>()
      current.set('a.ts', 'same')
      current.set('b.ts', 'changed')
      const report = d.detectChanges(current)
      const modified = report.changes.find((c) => c.changeType === 'modified')
      expect(modified!.path).toBe('b.ts')
    })

    it('handles empty content strings', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([['empty.ts', '']]))
      const current = new Map<string, string>()
      current.set('empty.ts', '')
      const report = d.detectChanges(current)
      expect(report.changes).toHaveLength(0)
    })

    it('handles content change from empty to non-empty', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([['f.ts', '']]))
      const current = new Map<string, string>()
      current.set('f.ts', 'now has content')
      const report = d.detectChanges(current)
      expect(report.changes).toHaveLength(1)
      expect(report.changes[0]!.changeType).toBe('modified')
      expect(report.changes[0]!.oldSize).toBe(0)
      expect(report.changes[0]!.newSize).toBe('now has content'.length)
    })

    it('handles content change from non-empty to empty', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([['f.ts', 'content']]))
      const current = new Map<string, string>()
      current.set('f.ts', '')
      const report = d.detectChanges(current)
      expect(report.changes).toHaveLength(1)
      expect(report.changes[0]!.changeType).toBe('modified')
      expect(report.changes[0]!.oldSize).toBe('content'.length)
      expect(report.changes[0]!.newSize).toBe(0)
    })

    it('handles multiple updates to the same path', () => {
      const d = new ChangeDetector()
      d.updateBaseline('f.ts', 'v1')
      d.updateBaseline('f.ts', 'v2')
      d.updateBaseline('f.ts', 'v3')
      const entry = d.getEntry('f.ts')
      expect(entry!.size).toBe('v3'.length)
    })

    it('summary reports zero for all categories on no-op detection', () => {
      const d = new ChangeDetector({ includeUnchanged: true })
      const current = new Map<string, string>()
      const report = d.detectChanges(current)
      expect(report.summary.added).toBe(0)
      expect(report.summary.removed).toBe(0)
      expect(report.summary.modified).toBe(0)
      expect(report.summary.unchanged).toBe(0)
      expect(report.summary.total).toBe(0)
    })

    it('detectChanges summary counts include unchanged even when filtered out of changes', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([['a.ts', 'same']]))
      const current = new Map<string, string>()
      current.set('a.ts', 'same')
      const report = d.detectChanges(current)
      expect(report.changes).toHaveLength(0)
      expect(report.summary.unchanged).toBe(1)
      expect(report.summary.total).toBe(1)
    })

    it('detectChangesFromEntries with empty baseline and entries', () => {
      const d = new ChangeDetector()
      const report = d.detectChangesFromEntries([])
      expect(report.changes).toHaveLength(0)
      expect(report.summary.total).toBe(0)
    })

    it('large number of files detection', () => {
      const d = new ChangeDetector()
      const baselineEntries: Array<[string, string]> = []
      for (let i = 0; i < 100; i++) {
        baselineEntries.push([`file${i}.ts`, `content${i}`])
      }
      d.setBaseline(makeBaseline(baselineEntries))
      const current = new Map<string, string>()
      for (let i = 0; i < 100; i++) {
        current.set(`file${i}.ts`, `content${i}`)
      }
      for (let i = 100; i < 110; i++) {
        current.set(`file${i}.ts`, `new${i}`)
      }
      for (let i = 0; i < 5; i++) {
        current.delete(`file${i}.ts`)
      }
      for (let i = 5; i < 10; i++) {
        current.set(`file${i}.ts`, `modified${i}`)
      }
      const report = d.detectChanges(current)
      expect(report.summary.added).toBe(10)
      expect(report.summary.removed).toBe(5)
      expect(report.summary.modified).toBe(5)
      expect(report.summary.unchanged).toBe(90)
      expect(report.summary.total).toBe(110)
    })

    it('FileChange type has correct shape for added', () => {
      const d = new ChangeDetector()
      const current = new Map<string, string>()
      current.set('new.ts', 'data')
      const report = d.detectChanges(current)
      const change = report.changes[0]!
      expect(change.path).toBe('new.ts')
      expect(change.changeType).toBe('added')
      expect(change.newHash).toBeDefined()
      expect(change.newSize).toBe(4)
      expect(change.oldHash).toBeUndefined()
      expect(change.oldSize).toBeUndefined()
    })

    it('FileChange type has correct shape for removed', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([['gone.ts', 'data']]))
      const report = d.detectChanges(new Map())
      const change = report.changes[0]!
      expect(change.path).toBe('gone.ts')
      expect(change.changeType).toBe('removed')
      expect(change.oldHash).toBeDefined()
      expect(change.oldSize).toBe(4)
      expect(change.newHash).toBeUndefined()
      expect(change.newSize).toBeUndefined()
    })

    it('path with special characters', () => {
      const d = new ChangeDetector()
      d.setBaseline(makeBaseline([['src/utils/helper [v2].ts', 'code']]))
      const current = new Map<string, string>()
      current.set('src/utils/helper [v2].ts', 'code')
      const report = d.detectChanges(current)
      expect(report.summary.unchanged).toBe(1)
      expect(report.changes).toHaveLength(0)
    })

    it('HashComputer produces different hashes across algorithms', () => {
      const hSimple = new HashComputer('simple')
      const hDjb2 = new HashComputer('djb2')
      const hFnv1a = new HashComputer('fnv1a')
      const content = 'test-content-here'
      const s = hSimple.compute(content)
      const d = hDjb2.compute(content)
      const f = hFnv1a.compute(content)
      const unique = new Set([s, d, f])
      expect(unique.size).toBeGreaterThanOrEqual(2)
    })
  })
})
