import { ChangelogGenerator } from '../src/core/changelog-generator/changelog-generator.js'
import { DEFAULT_CHANGELOG_OPTIONS } from '../src/core/changelog-generator/types.js'
import type { ChangeEntry } from '../src/core/changelog-generator/types.js'

// ─── Helpers ───────────────────────────────────────────────────────────

function makeChange(overrides?: Partial<ChangeEntry>): ChangeEntry {
  return {
    category: 'added',
    description: 'New feature',
    breaking: false,
    ...overrides,
  }
}

// ─── Constructor ────────────────────────────────────────────────────────

describe('ChangelogGenerator', () => {
  describe('constructor', () => {
    it('creates with default options', () => {
      const gen = new ChangelogGenerator()
      expect(gen.getOptions().title).toBe('Changelog')
      expect(gen.getOptions().includeDate).toBe(true)
      expect(gen.getOptions().groupByCategory).toBe(true)
    })

    it('overrides options', () => {
      const gen = new ChangelogGenerator({ title: 'My Changes', includeDate: false })
      expect(gen.getOptions().title).toBe('My Changes')
      expect(gen.getOptions().includeDate).toBe(false)
    })

    it('returns copy of options', () => {
      const gen = new ChangelogGenerator()
      const opts = gen.getOptions()
      opts.title = 'hacked'
      expect(gen.getOptions().title).toBe('Changelog')
    })
  })

  // ─── addChange / addChanges ───────────────────────────────────────────

  describe('addChange', () => {
    it('adds a change to unreleased', () => {
      const gen = new ChangelogGenerator()
      gen.addChange(makeChange())
      expect(gen.getUnreleased()).toHaveLength(1)
      expect(gen.hasUnreleased()).toBe(true)
    })

    it('copies change entry', () => {
      const gen = new ChangelogGenerator()
      const change = makeChange()
      gen.addChange(change)
      change.description = 'changed'
      expect(gen.getUnreleased()[0]?.description).toBe('New feature')
    })
  })

  describe('addChanges', () => {
    it('adds multiple changes', () => {
      const gen = new ChangelogGenerator()
      gen.addChanges([makeChange(), makeChange({ description: 'Other' })])
      expect(gen.getUnreleased()).toHaveLength(2)
    })
  })

  // ─── release ──────────────────────────────────────────────────────────

  describe('release', () => {
    it('creates version from unreleased', () => {
      const gen = new ChangelogGenerator()
      gen.addChange(makeChange())
      const version = gen.release('1.0.0')
      expect(version.version).toBe('1.0.0')
      expect(version.changes).toHaveLength(1)
      expect(gen.getUnreleased()).toHaveLength(0)
      expect(gen.hasUnreleased()).toBe(false)
    })

    it('uses provided date', () => {
      const gen = new ChangelogGenerator()
      gen.addChange(makeChange())
      const version = gen.release('1.0.0', '2024-01-15')
      expect(version.date).toBe('2024-01-15')
    })

    it('generates date when not provided', () => {
      const gen = new ChangelogGenerator()
      gen.addChange(makeChange())
      const version = gen.release('1.0.0')
      expect(version.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('clears unreleased after release', () => {
      const gen = new ChangelogGenerator()
      gen.addChange(makeChange())
      gen.release('1.0.0')
      gen.addChange(makeChange({ description: 'post-release' }))
      expect(gen.getUnreleased()).toHaveLength(1)
      expect(gen.getVersions()).toHaveLength(1)
    })

    it('accumulates multiple versions', () => {
      const gen = new ChangelogGenerator()
      gen.addChange(makeChange())
      gen.release('1.0.0')
      gen.addChange(makeChange({ description: 'fix' }))
      gen.release('1.1.0')
      expect(gen.getVersions()).toHaveLength(2)
      expect(gen.getLatest()?.version).toBe('1.1.0')
    })
  })

  // ─── getVersions / getVersion / getLatest ─────────────────────────────

  describe('getVersions', () => {
    it('returns empty before any release', () => {
      const gen = new ChangelogGenerator()
      expect(gen.getVersions()).toEqual([])
    })

    it('returns copy', () => {
      const gen = new ChangelogGenerator()
      gen.addChange(makeChange())
      gen.release('1.0.0')
      const versions = gen.getVersions()
      versions.pop()
      expect(gen.getVersions()).toHaveLength(1)
    })
  })

  describe('getVersion', () => {
    it('returns specific version', () => {
      const gen = new ChangelogGenerator()
      gen.addChange(makeChange())
      gen.release('1.0.0')
      gen.addChange(makeChange({ description: 'fix' }))
      gen.release('1.1.0')
      expect(gen.getVersion('1.0.0')).toBeDefined()
      expect(gen.getVersion('1.0.0')?.changes).toHaveLength(1)
    })

    it('returns undefined for unknown version', () => {
      const gen = new ChangelogGenerator()
      expect(gen.getVersion('0.0.0')).toBeUndefined()
    })
  })

  describe('getLatest', () => {
    it('returns undefined with no releases', () => {
      const gen = new ChangelogGenerator()
      expect(gen.getLatest()).toBeUndefined()
    })

    it('returns most recent version', () => {
      const gen = new ChangelogGenerator()
      gen.addChange(makeChange())
      gen.release('1.0.0')
      gen.addChange(makeChange({ description: 'new' }))
      gen.release('2.0.0')
      expect(gen.getLatest()?.version).toBe('2.0.0')
    })
  })

  // ─── getChangesByCategory / Scope / Breaking ──────────────────────────

  describe('getChangesByCategory', () => {
    it('filters by category', () => {
      const gen = new ChangelogGenerator()
      gen.addChanges([
        makeChange({ category: 'added' }),
        makeChange({ category: 'fixed' }),
        makeChange({ category: 'added', description: 'Another' }),
      ])
      gen.release('1.0.0')
      expect(gen.getChangesByCategory('1.0.0', 'added')).toHaveLength(2)
      expect(gen.getChangesByCategory('1.0.0', 'fixed')).toHaveLength(1)
    })

    it('returns empty for unknown version', () => {
      const gen = new ChangelogGenerator()
      expect(gen.getChangesByCategory('0.0.0', 'added')).toEqual([])
    })
  })

  describe('getChangesByScope', () => {
    it('filters by scope', () => {
      const gen = new ChangelogGenerator()
      gen.addChanges([
        makeChange({ scope: 'api' }),
        makeChange({ scope: 'ui' }),
        makeChange({ scope: 'api', description: 'Other' }),
      ])
      gen.release('1.0.0')
      expect(gen.getChangesByScope('1.0.0', 'api')).toHaveLength(2)
    })
  })

  describe('getBreakingChanges', () => {
    it('returns only breaking changes', () => {
      const gen = new ChangelogGenerator()
      gen.addChanges([
        makeChange({ breaking: true, description: 'Removed old API' }),
        makeChange({ breaking: false }),
        makeChange({ breaking: true, description: 'Changed signature' }),
      ])
      gen.release('2.0.0')
      expect(gen.getBreakingChanges('2.0.0')).toHaveLength(2)
    })
  })

  // ─── generate (markdown) ──────────────────────────────────────────────

  describe('generate markdown', () => {
    it('generates markdown with title', () => {
      const gen = new ChangelogGenerator()
      const md = gen.generate('markdown')
      expect(md).toContain('# Changelog')
    })

    it('includes unreleased section', () => {
      const gen = new ChangelogGenerator()
      gen.addChange(makeChange())
      const md = gen.generate('markdown')
      expect(md).toContain('## Unreleased')
      expect(md).toContain('New feature')
    })

    it('includes version section with date', () => {
      const gen = new ChangelogGenerator()
      gen.addChange(makeChange())
      gen.release('1.0.0', '2024-01-01')
      const md = gen.generate('markdown')
      expect(md).toContain('## 1.0.0 (2024-01-01)')
    })

    it('omits date when includeDate is false', () => {
      const gen = new ChangelogGenerator({ includeDate: false })
      gen.addChange(makeChange())
      gen.release('1.0.0', '2024-01-01')
      const md = gen.generate('markdown')
      expect(md).toContain('## 1.0.0')
      expect(md).not.toContain('(2024-01-01)')
    })

    it('groups by category when enabled', () => {
      const gen = new ChangelogGenerator({ groupByCategory: true })
      gen.addChange(makeChange({ category: 'added' }))
      gen.addChange(makeChange({ category: 'fixed' }))
      gen.release('1.0.0')
      const md = gen.generate('markdown')
      expect(md).toContain('### Added')
      expect(md).toContain('### Fixed')
    })

    it('does not group when disabled', () => {
      const gen = new ChangelogGenerator({ groupByCategory: false })
      gen.addChange(makeChange({ category: 'added' }))
      gen.addChange(makeChange({ category: 'fixed' }))
      gen.release('1.0.0')
      const md = gen.generate('markdown')
      expect(md).not.toContain('### Added')
    })

    it('marks breaking changes', () => {
      const gen = new ChangelogGenerator({ groupByCategory: false })
      gen.addChange(makeChange({ breaking: true }))
      gen.release('1.0.0')
      const md = gen.generate('markdown')
      expect(md).toContain('**BREAKING**')
    })

    it('includes scope', () => {
      const gen = new ChangelogGenerator({ groupByCategory: false })
      gen.addChange(makeChange({ scope: 'core' }))
      gen.release('1.0.0')
      const md = gen.generate('markdown')
      expect(md).toContain('**core**:')
    })

    it('includes issue reference', () => {
      const gen = new ChangelogGenerator({ groupByCategory: false })
      gen.addChange(makeChange({ issue: '42' }))
      gen.release('1.0.0')
      const md = gen.generate('markdown')
      expect(md).toContain('refs #42')
    })

    it('includes commit hash', () => {
      const gen = new ChangelogGenerator({ groupByCategory: false })
      gen.addChange(makeChange({ commit: 'abc123' }))
      gen.release('1.0.0')
      const md = gen.generate('markdown')
      expect(md).toContain('abc123')
    })
  })

  // ─── generate JSON ────────────────────────────────────────────────────

  describe('generate JSON', () => {
    it('generates valid JSON', () => {
      const gen = new ChangelogGenerator()
      gen.addChange(makeChange())
      gen.release('1.0.0')
      const json = gen.generate('json')
      const parsed = JSON.parse(json)
      expect(parsed.title).toBe('Changelog')
      expect(parsed.versions).toHaveLength(1)
    })

    it('includes unreleased in JSON', () => {
      const gen = new ChangelogGenerator()
      gen.addChange(makeChange())
      const json = gen.generate('json')
      const parsed = JSON.parse(json)
      expect(parsed.unreleased).toHaveLength(1)
    })
  })

  // ─── generate text ────────────────────────────────────────────────────

  describe('generate text', () => {
    it('generates plain text output', () => {
      const gen = new ChangelogGenerator()
      gen.addChange(makeChange())
      gen.release('1.0.0', '2024-01-01')
      const text = gen.generate('text')
      expect(text).toContain('Changelog')
      expect(text).toContain('1.0.0 (2024-01-01)')
      expect(text).toContain('- New feature')
    })

    it('marks breaking in text', () => {
      const gen = new ChangelogGenerator()
      gen.addChange(makeChange({ breaking: true }))
      gen.release('1.0.0')
      const text = gen.generate('text')
      expect(text).toContain('[BREAKING]')
    })

    it('includes scope in text', () => {
      const gen = new ChangelogGenerator()
      gen.addChange(makeChange({ scope: 'api' }))
      gen.release('1.0.0')
      const text = gen.generate('text')
      expect(text).toContain('(api)')
    })
  })

  // ─── getStatistics ────────────────────────────────────────────────────

  describe('getStatistics', () => {
    it('returns zeros with no releases', () => {
      const gen = new ChangelogGenerator()
      const stats = gen.getStatistics()
      expect(stats.totalVersions).toBe(0)
      expect(stats.totalChanges).toBe(0)
      expect(stats.breakingChanges).toBe(0)
    })

    it('counts versions and changes', () => {
      const gen = new ChangelogGenerator()
      gen.addChanges([makeChange(), makeChange()])
      gen.release('1.0.0')
      gen.addChange(makeChange({ category: 'fixed' }))
      gen.release('1.1.0')
      const stats = gen.getStatistics()
      expect(stats.totalVersions).toBe(2)
      expect(stats.totalChanges).toBe(3)
    })

    it('counts by category', () => {
      const gen = new ChangelogGenerator()
      gen.addChanges([
        makeChange({ category: 'added' }),
        makeChange({ category: 'added' }),
        makeChange({ category: 'fixed' }),
      ])
      gen.release('1.0.0')
      const stats = gen.getStatistics()
      expect(stats.byCategory.added).toBe(2)
      expect(stats.byCategory.fixed).toBe(1)
    })

    it('counts breaking changes', () => {
      const gen = new ChangelogGenerator()
      gen.addChanges([
        makeChange({ breaking: true }),
        makeChange({ breaking: false }),
        makeChange({ breaking: true }),
      ])
      gen.release('1.0.0')
      expect(gen.getStatistics().breakingChanges).toBe(2)
    })

    it('includes all category keys', () => {
      const gen = new ChangelogGenerator()
      gen.addChange(makeChange())
      gen.release('1.0.0')
      const stats = gen.getStatistics()
      expect(Object.keys(stats.byCategory)).toHaveLength(6)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('clears everything', () => {
      const gen = new ChangelogGenerator()
      gen.addChange(makeChange())
      gen.release('1.0.0')
      gen.addChange(makeChange())
      gen.clear()
      expect(gen.getVersions()).toEqual([])
      expect(gen.getUnreleased()).toEqual([])
      expect(gen.hasUnreleased()).toBe(false)
    })
  })

  // ─── merge ────────────────────────────────────────────────────────────

  describe('merge', () => {
    it('merges versions from another generator', () => {
      const gen1 = new ChangelogGenerator()
      gen1.addChange(makeChange())
      gen1.release('1.0.0')

      const gen2 = new ChangelogGenerator()
      gen2.addChange(makeChange({ description: 'from gen2' }))
      gen2.release('1.1.0')

      gen1.merge(gen2)
      expect(gen1.getVersions()).toHaveLength(2)
      expect(gen1.getVersion('1.1.0')).toBeDefined()
    })

    it('merges unreleased from another generator', () => {
      const gen1 = new ChangelogGenerator()
      const gen2 = new ChangelogGenerator()
      gen2.addChange(makeChange({ description: 'unreleased' }))
      gen1.merge(gen2)
      expect(gen1.getUnreleased()).toHaveLength(1)
    })

    it('combines changes for existing version', () => {
      const gen1 = new ChangelogGenerator()
      gen1.addChange(makeChange({ description: 'original' }))
      gen1.release('1.0.0')

      const gen2 = new ChangelogGenerator()
      gen2.addChange(makeChange({ description: 'additional' }))
      gen2.release('1.0.0')

      gen1.merge(gen2)
      expect(gen1.getVersion('1.0.0')?.changes).toHaveLength(2)
    })
  })

  // ─── DEFAULT_CHANGELOG_OPTIONS ────────────────────────────────────────

  describe('DEFAULT_CHANGELOG_OPTIONS', () => {
    it('has expected defaults', () => {
      expect(DEFAULT_CHANGELOG_OPTIONS.title).toBe('Changelog')
      expect(DEFAULT_CHANGELOG_OPTIONS.includeDate).toBe(true)
      expect(DEFAULT_CHANGELOG_OPTIONS.groupByCategory).toBe(true)
      expect(DEFAULT_CHANGELOG_OPTIONS.categoryOrder).toHaveLength(6)
    })
  })

  // ─── edge cases ───────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles empty release', () => {
      const gen = new ChangelogGenerator()
      const v = gen.release('0.1.0')
      expect(v.changes).toEqual([])
    })

    it('generates empty changelog', () => {
      const gen = new ChangelogGenerator()
      const md = gen.generate('markdown')
      expect(md).toBe('# Changelog\n')
    })

    it('handles changes with all optional fields', () => {
      const gen = new ChangelogGenerator({ groupByCategory: false })
      gen.addChange({
        category: 'removed',
        description: 'Removed X',
        scope: 'core',
        breaking: true,
        issue: '100',
        commit: 'deadbeef',
      })
      gen.release('2.0.0')
      const md = gen.generate('markdown')
      expect(md).toContain('**BREAKING**')
      expect(md).toContain('**core**:')
      expect(md).toContain('refs #100')
      expect(md).toContain('deadbeef')
    })

    it('handles multiple versions with unreleased', () => {
      const gen = new ChangelogGenerator()
      gen.addChange(makeChange())
      gen.release('1.0.0')
      gen.addChange(makeChange({ description: 'Unreleased fix' }))
      const md = gen.generate('markdown')
      expect(md).toContain('## Unreleased')
      expect(md).toContain('## 1.0.0')
    })

    it('generate defaults to markdown', () => {
      const gen = new ChangelogGenerator()
      gen.addChange(makeChange())
      gen.release('1.0.0')
      const result = gen.generate()
      expect(result).toContain('# Changelog')
    })
  })
})
