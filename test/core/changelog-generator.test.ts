import { describe, it, expect } from 'vitest'
import { ChangelogGenerator } from '../../src/core/changelog-generator/changelog-generator.js'
import { DEFAULT_CHANGELOG_OPTIONS } from '../../src/core/changelog-generator/types.js'
import type { ChangeCategory, ChangeEntry, ChangelogOptions } from '../../src/core/changelog-generator/types.js'

function makeEntry(overrides: Partial<ChangeEntry> & { description: string }): ChangeEntry {
  return {
    category: 'added',
    breaking: false,
    ...overrides,
  }
}

describe('ChangelogGenerator - Construction', () => {
  it('should create with default options', () => {
    const gen = new ChangelogGenerator()
    const opts = gen.getOptions()
    expect(opts.title).toBe('Changelog')
    expect(opts.includeDate).toBe(true)
    expect(opts.groupByCategory).toBe(true)
    expect(opts.categoryOrder).toEqual(['added', 'changed', 'deprecated', 'removed', 'fixed', 'security'])
  })

  it('should create with custom options', () => {
    const gen = new ChangelogGenerator({
      title: 'Release Notes',
      includeDate: false,
      groupByCategory: false,
      categoryOrder: ['fixed', 'added'],
    })
    const opts = gen.getOptions()
    expect(opts.title).toBe('Release Notes')
    expect(opts.includeDate).toBe(false)
    expect(opts.groupByCategory).toBe(false)
    expect(opts.categoryOrder).toEqual(['fixed', 'added'])
  })

  it('should create with partial options merging defaults', () => {
    const gen = new ChangelogGenerator({ title: 'My Changes' })
    const opts = gen.getOptions()
    expect(opts.title).toBe('My Changes')
    expect(opts.includeDate).toBe(true)
    expect(opts.groupByCategory).toBe(true)
  })

  it('should return a copy of options from getOptions', () => {
    const gen = new ChangelogGenerator()
    const opts = gen.getOptions()
    opts.title = 'Modified'
    expect(gen.getOptions().title).toBe('Changelog')
  })
})

describe('ChangelogGenerator - Adding changes', () => {
  it('should add a single change to unreleased', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'New feature' }))
    expect(gen.getUnreleased()).toHaveLength(1)
    expect(gen.getUnreleased()[0]!.description).toBe('New feature')
  })

  it('should add multiple changes at once', () => {
    const gen = new ChangelogGenerator()
    gen.addChanges([
      makeEntry({ description: 'Feature A' }),
      makeEntry({ description: 'Feature B' }),
      makeEntry({ description: 'Feature C' }),
    ])
    expect(gen.getUnreleased()).toHaveLength(3)
  })

  it('should handle addChanges with empty array', () => {
    const gen = new ChangelogGenerator()
    gen.addChanges([])
    expect(gen.getUnreleased()).toHaveLength(0)
  })

  it('should add change with breaking flag', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'Breaking API change', breaking: true }))
    expect(gen.getUnreleased()[0]!.breaking).toBe(true)
  })

  it('should add change with scope', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'Updated parser', scope: 'parser' }))
    expect(gen.getUnreleased()[0]!.scope).toBe('parser')
  })

  it('should add change with issue and commit', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'Bug fix', issue: '123', commit: 'abc456' }))
    const entry = gen.getUnreleased()[0]!
    expect(entry.issue).toBe('123')
    expect(entry.commit).toBe('abc456')
  })

  it('should add changes of all categories', () => {
    const gen = new ChangelogGenerator()
    const categories: ChangeCategory[] = ['added', 'changed', 'deprecated', 'removed', 'fixed', 'security']
    for (const cat of categories) {
      gen.addChange(makeEntry({ category: cat, description: cat + ' change' }))
    }
    const unreleased = gen.getUnreleased()
    expect(unreleased).toHaveLength(6)
    for (const cat of categories) {
      expect(unreleased.some((e) => e.category === cat)).toBe(true)
    }
  })

  it('should store a copy of the change entry', () => {
    const gen = new ChangelogGenerator()
    const entry = makeEntry({ description: 'Test' })
    gen.addChange(entry)
    entry.description = 'Modified'
    expect(gen.getUnreleased()[0]!.description).toBe('Test')
  })
})

describe('ChangelogGenerator - Release', () => {
  it('should move unreleased changes to a version entry', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'Feature A' }))
    gen.addChange(makeEntry({ description: 'Feature B' }))
    const released = gen.release('1.0.0', '2024-01-15')
    expect(released.version).toBe('1.0.0')
    expect(released.changes).toHaveLength(2)
    expect(gen.getUnreleased()).toHaveLength(0)
  })

  it('should use provided date', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'Feature' }))
    const released = gen.release('1.0.0', '2024-03-20')
    expect(released.date).toBe('2024-03-20')
  })

  it('should default to today when no date provided', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'Feature' }))
    const released = gen.release('1.0.0')
    const today = new Date().toISOString().slice(0, 10)
    expect(released.date).toBe(today)
  })

  it('should clear unreleased after release', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'Feature' }))
    gen.release('1.0.0', '2024-01-01')
    expect(gen.hasUnreleased()).toBe(false)
  })

  it('should handle release with empty unreleased', () => {
    const gen = new ChangelogGenerator()
    const released = gen.release('1.0.0', '2024-01-01')
    expect(released.changes).toHaveLength(0)
    expect(released.version).toBe('1.0.0')
  })

  it('should handle multiple releases in order', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'A' }))
    gen.release('1.0.0', '2024-01-01')
    gen.addChange(makeEntry({ description: 'B' }))
    gen.release('1.1.0', '2024-02-01')
    gen.addChange(makeEntry({ description: 'C' }))
    gen.release('2.0.0', '2024-03-01')
    const versions = gen.getVersions()
    expect(versions).toHaveLength(3)
    expect(versions[0]!.version).toBe('1.0.0')
    expect(versions[1]!.version).toBe('1.1.0')
    expect(versions[2]!.version).toBe('2.0.0')
  })

  it('should return a VersionEntry with correct structure', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'X' }))
    const released = gen.release('2.0.0', '2024-06-15')
    expect(released).toEqual({
      version: '2.0.0',
      date: '2024-06-15',
      changes: [{ category: 'added', description: 'X', breaking: false }],
    })
  })
})

describe('ChangelogGenerator - Queries', () => {
  it('should return unreleased changes', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'A' }))
    gen.addChange(makeEntry({ description: 'B' }))
    expect(gen.getUnreleased()).toHaveLength(2)
  })

  it('should return a copy of unreleased changes', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'A' }))
    const unreleased = gen.getUnreleased()
    unreleased.push(makeEntry({ description: 'B' }))
    expect(gen.getUnreleased()).toHaveLength(1)
  })

  it('should return all versions', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'A' }))
    gen.release('1.0.0', '2024-01-01')
    gen.addChange(makeEntry({ description: 'B' }))
    gen.release('1.1.0', '2024-02-01')
    expect(gen.getVersions()).toHaveLength(2)
  })

  it('should return a copy of versions array', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'A' }))
    gen.release('1.0.0', '2024-01-01')
    const versions = gen.getVersions()
    versions.pop()
    expect(gen.getVersions()).toHaveLength(1)
  })

  it('should return specific version by name', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'A' }))
    gen.release('1.0.0', '2024-01-01')
    gen.addChange(makeEntry({ description: 'B' }))
    gen.release('2.0.0', '2024-02-01')
    const v1 = gen.getVersion('1.0.0')
    expect(v1).toBeDefined()
    expect(v1!.version).toBe('1.0.0')
  })

  it('should return undefined for unknown version', () => {
    const gen = new ChangelogGenerator()
    expect(gen.getVersion('99.99.99')).toBeUndefined()
  })

  it('should return latest version', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'A' }))
    gen.release('1.0.0', '2024-01-01')
    gen.addChange(makeEntry({ description: 'B' }))
    gen.release('2.0.0', '2024-02-01')
    const latest = gen.getLatest()
    expect(latest).toBeDefined()
    expect(latest!.version).toBe('2.0.0')
  })

  it('should return undefined for latest when no versions', () => {
    const gen = new ChangelogGenerator()
    expect(gen.getLatest()).toBeUndefined()
  })
})

describe('ChangelogGenerator - Filtering', () => {
  function setupFiltered(): ChangelogGenerator {
    const gen = new ChangelogGenerator()
    gen.addChanges([
      makeEntry({ category: 'added', description: 'New feature', scope: 'api' }),
      makeEntry({ category: 'fixed', description: 'Bug fix', scope: 'parser' }),
      makeEntry({ category: 'added', description: 'Another feature', scope: 'api', breaking: true }),
      makeEntry({ category: 'security', description: 'Security patch', scope: 'auth' }),
      makeEntry({ category: 'fixed', description: 'Another fix', scope: 'api' }),
    ])
    gen.release('1.0.0', '2024-01-01')
    return gen
  }

  it('should filter changes by category', () => {
    const gen = setupFiltered()
    const added = gen.getChangesByCategory('1.0.0', 'added')
    expect(added).toHaveLength(2)
    expect(added.every((c) => c.category === 'added')).toBe(true)
  })

  it('should return empty for non-matching category', () => {
    const gen = setupFiltered()
    const deprecated = gen.getChangesByCategory('1.0.0', 'deprecated')
    expect(deprecated).toHaveLength(0)
  })

  it('should return empty for unknown version when filtering by category', () => {
    const gen = setupFiltered()
    expect(gen.getChangesByCategory('99.0.0', 'added')).toHaveLength(0)
  })

  it('should filter changes by scope', () => {
    const gen = setupFiltered()
    const apiChanges = gen.getChangesByScope('1.0.0', 'api')
    expect(apiChanges).toHaveLength(3)
    expect(apiChanges.every((c) => c.scope === 'api')).toBe(true)
  })

  it('should return empty for non-matching scope', () => {
    const gen = setupFiltered()
    expect(gen.getChangesByScope('1.0.0', 'cli')).toHaveLength(0)
  })

  it('should return empty for unknown version when filtering by scope', () => {
    const gen = setupFiltered()
    expect(gen.getChangesByScope('99.0.0', 'api')).toHaveLength(0)
  })

  it('should return breaking changes', () => {
    const gen = setupFiltered()
    const breaking = gen.getBreakingChanges('1.0.0')
    expect(breaking).toHaveLength(1)
    expect(breaking[0]!.breaking).toBe(true)
    expect(breaking[0]!.description).toBe('Another feature')
  })

  it('should return empty for no breaking changes', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'Normal change' }))
    gen.release('1.0.0', '2024-01-01')
    expect(gen.getBreakingChanges('1.0.0')).toHaveLength(0)
  })

  it('should return empty for unknown version when getting breaking changes', () => {
    const gen = setupFiltered()
    expect(gen.getBreakingChanges('99.0.0')).toHaveLength(0)
  })
})

describe('ChangelogGenerator - Markdown generation', () => {
  it('should generate markdown with title', () => {
    const gen = new ChangelogGenerator({ title: 'My Project' })
    const md = gen.generateMarkdown()
    expect(md).toContain('# My Project')
  })

  it('should include unreleased section', () => {
    const gen = new ChangelogGenerator({ groupByCategory: false })
    gen.addChange(makeEntry({ description: 'Unreleased feature' }))
    const md = gen.generateMarkdown()
    expect(md).toContain('## Unreleased')
    expect(md).toContain('Unreleased feature')
  })

  it('should include version sections', () => {
    const gen = new ChangelogGenerator({ groupByCategory: false })
    gen.addChange(makeEntry({ description: 'Feature' }))
    gen.release('1.0.0', '2024-01-15')
    const md = gen.generateMarkdown()
    expect(md).toContain('## 1.0.0 (2024-01-15)')
  })

  it('should group changes by category', () => {
    const gen = new ChangelogGenerator({ groupByCategory: true })
    gen.addChanges([
      makeEntry({ category: 'added', description: 'New thing' }),
      makeEntry({ category: 'fixed', description: 'Fixed thing' }),
    ])
    gen.release('1.0.0', '2024-01-01')
    const md = gen.generateMarkdown()
    expect(md).toContain('### Added')
    expect(md).toContain('### Fixed')
  })

  it('should not group when groupByCategory is false', () => {
    const gen = new ChangelogGenerator({ groupByCategory: false })
    gen.addChanges([
      makeEntry({ category: 'added', description: 'New thing' }),
      makeEntry({ category: 'fixed', description: 'Fixed thing' }),
    ])
    gen.release('1.0.0', '2024-01-01')
    const md = gen.generateMarkdown()
    expect(md).not.toContain('### Added')
    expect(md).not.toContain('### Fixed')
    expect(md).toContain('New thing')
    expect(md).toContain('Fixed thing')
  })

  it('should include date when includeDate is true', () => {
    const gen = new ChangelogGenerator({ includeDate: true, groupByCategory: false })
    gen.addChange(makeEntry({ description: 'Feature' }))
    gen.release('1.0.0', '2024-01-15')
    const md = gen.generateMarkdown()
    expect(md).toContain('1.0.0 (2024-01-15)')
  })

  it('should not include date when includeDate is false', () => {
    const gen = new ChangelogGenerator({ includeDate: false, groupByCategory: false })
    gen.addChange(makeEntry({ description: 'Feature' }))
    gen.release('1.0.0', '2024-01-15')
    const md = gen.generateMarkdown()
    expect(md).toContain('## 1.0.0')
    expect(md).not.toContain('2024-01-15')
  })

  it('should mark breaking changes in markdown', () => {
    const gen = new ChangelogGenerator({ groupByCategory: false })
    gen.addChange(makeEntry({ description: 'Breaking change', breaking: true }))
    gen.release('1.0.0', '2024-01-01')
    const md = gen.generateMarkdown()
    expect(md).toContain('**BREAKING**')
  })

  it('should generate version markdown for a single version', () => {
    const gen = new ChangelogGenerator({ groupByCategory: false })
    gen.addChanges([
      makeEntry({ description: 'Feature A' }),
      makeEntry({ description: 'Feature B' }),
    ])
    const released = gen.release('1.0.0', '2024-01-01')
    const versionMd = gen.generateVersionMarkdown(released)
    expect(versionMd).toContain('## 1.0.0 (2024-01-01)')
    expect(versionMd).toContain('Feature A')
    expect(versionMd).toContain('Feature B')
  })

  it('should show scope in markdown entries', () => {
    const gen = new ChangelogGenerator({ groupByCategory: false })
    gen.addChange(makeEntry({ description: 'Changed API', scope: 'api' }))
    gen.release('1.0.0', '2024-01-01')
    const md = gen.generateMarkdown()
    expect(md).toContain('**api**')
  })

  it('should respect category order', () => {
    const gen = new ChangelogGenerator({
      groupByCategory: true,
      categoryOrder: ['fixed', 'added'],
    })
    gen.addChanges([
      makeEntry({ category: 'added', description: 'Added' }),
      makeEntry({ category: 'fixed', description: 'Fixed' }),
    ])
    gen.release('1.0.0', '2024-01-01')
    const md = gen.generateMarkdown()
    const fixedPos = md.indexOf('### Fixed')
    const addedPos = md.indexOf('### Added')
    expect(fixedPos).toBeLessThan(addedPos)
  })

  it('should show issue references in markdown', () => {
    const gen = new ChangelogGenerator({ groupByCategory: false })
    gen.addChange(makeEntry({ description: 'Bug fix', issue: '42' }))
    gen.release('1.0.0', '2024-01-01')
    const md = gen.generateMarkdown()
    expect(md).toContain('refs #42')
  })

  it('should show commit references in markdown', () => {
    const gen = new ChangelogGenerator({ groupByCategory: false })
    gen.addChange(makeEntry({ description: 'Change', commit: 'abc123' }))
    gen.release('1.0.0', '2024-01-01')
    const md = gen.generateMarkdown()
    expect(md).toContain('abc123')
  })
})

describe('ChangelogGenerator - JSON generation', () => {
  it('should generate valid JSON', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'Feature' }))
    gen.release('1.0.0', '2024-01-01')
    const json = gen.generateJSON()
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('should include correct structure', () => {
    const gen = new ChangelogGenerator()
    const parsed = JSON.parse(gen.generateJSON())
    expect(parsed).toHaveProperty('title')
    expect(parsed).toHaveProperty('versions')
    expect(parsed).toHaveProperty('unreleased')
  })

  it('should include title in JSON output', () => {
    const gen = new ChangelogGenerator({ title: 'Test Log' })
    const parsed = JSON.parse(gen.generateJSON())
    expect(parsed.title).toBe('Test Log')
  })

  it('should include versions in JSON output', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'Feature' }))
    gen.release('1.0.0', '2024-01-01')
    const parsed = JSON.parse(gen.generateJSON())
    expect(parsed.versions).toHaveLength(1)
    expect(parsed.versions[0].version).toBe('1.0.0')
  })

  it('should include unreleased changes in JSON output', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'Unreleased' }))
    const parsed = JSON.parse(gen.generateJSON())
    expect(parsed.unreleased).toHaveLength(1)
    expect(parsed.unreleased[0].description).toBe('Unreleased')
  })
})

describe('ChangelogGenerator - Text generation', () => {
  it('should generate plain text output', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'Feature' }))
    gen.release('1.0.0', '2024-01-01')
    const text = gen.generateText()
    expect(text).toContain('Changelog')
    expect(text).toContain('1.0.0')
    expect(text).toContain('Feature')
  })

  it('should include version headers in text', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'A' }))
    gen.release('1.0.0', '2024-01-01')
    gen.addChange(makeEntry({ description: 'B' }))
    gen.release('2.0.0', '2024-02-01')
    const text = gen.generateText()
    expect(text).toContain('1.0.0 (2024-01-01)')
    expect(text).toContain('2.0.0 (2024-02-01)')
  })

  it('should mark breaking changes in text format', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'Breaking', breaking: true }))
    gen.release('1.0.0', '2024-01-01')
    const text = gen.generateText()
    expect(text).toContain('[BREAKING]')
  })

  it('should show scope in text format', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'Change', scope: 'core' }))
    gen.release('1.0.0', '2024-01-01')
    const text = gen.generateText()
    expect(text).toContain('(core)')
  })

  it('should not include date in text when includeDate is false', () => {
    const gen = new ChangelogGenerator({ includeDate: false })
    gen.addChange(makeEntry({ description: 'Feature' }))
    gen.release('1.0.0', '2024-01-01')
    const text = gen.generateText()
    expect(text).toContain('1.0.0')
    expect(text).not.toContain('2024-01-01')
  })
})

describe('ChangelogGenerator - Statistics', () => {
  it('should count total versions', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'A' }))
    gen.release('1.0.0', '2024-01-01')
    gen.addChange(makeEntry({ description: 'B' }))
    gen.release('2.0.0', '2024-02-01')
    const stats = gen.getStatistics()
    expect(stats.totalVersions).toBe(2)
  })

  it('should count total changes', () => {
    const gen = new ChangelogGenerator()
    gen.addChanges([
      makeEntry({ description: 'A' }),
      makeEntry({ description: 'B' }),
      makeEntry({ description: 'C' }),
    ])
    gen.release('1.0.0', '2024-01-01')
    const stats = gen.getStatistics()
    expect(stats.totalChanges).toBe(3)
  })

  it('should breakdown by category', () => {
    const gen = new ChangelogGenerator()
    gen.addChanges([
      makeEntry({ category: 'added', description: 'A' }),
      makeEntry({ category: 'added', description: 'B' }),
      makeEntry({ category: 'fixed', description: 'C' }),
    ])
    gen.release('1.0.0', '2024-01-01')
    const stats = gen.getStatistics()
    expect(stats.byCategory.added).toBe(2)
    expect(stats.byCategory.fixed).toBe(1)
    expect(stats.byCategory.changed).toBe(0)
  })

  it('should count breaking changes', () => {
    const gen = new ChangelogGenerator()
    gen.addChanges([
      makeEntry({ description: 'A', breaking: true }),
      makeEntry({ description: 'B', breaking: false }),
      makeEntry({ description: 'C', breaking: true }),
    ])
    gen.release('1.0.0', '2024-01-01')
    const stats = gen.getStatistics()
    expect(stats.breakingChanges).toBe(2)
  })

  it('should return zeros for empty changelog', () => {
    const gen = new ChangelogGenerator()
    const stats = gen.getStatistics()
    expect(stats.totalVersions).toBe(0)
    expect(stats.totalChanges).toBe(0)
    expect(stats.breakingChanges).toBe(0)
    expect(stats.byCategory.added).toBe(0)
  })

  it('should accumulate across multiple releases', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'A' }))
    gen.release('1.0.0', '2024-01-01')
    gen.addChanges([
      makeEntry({ description: 'B' }),
      makeEntry({ description: 'C' }),
    ])
    gen.release('2.0.0', '2024-02-01')
    const stats = gen.getStatistics()
    expect(stats.totalVersions).toBe(2)
    expect(stats.totalChanges).toBe(3)
  })

  it('should not count unreleased changes in statistics', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'A' }))
    gen.release('1.0.0', '2024-01-01')
    gen.addChange(makeEntry({ description: 'Unreleased' }))
    const stats = gen.getStatistics()
    expect(stats.totalChanges).toBe(1)
  })
})

describe('ChangelogGenerator - Merge', () => {
  it('should merge versions from another generator', () => {
    const gen1 = new ChangelogGenerator()
    gen1.addChange(makeEntry({ description: 'A' }))
    gen1.release('1.0.0', '2024-01-01')

    const gen2 = new ChangelogGenerator()
    gen2.addChange(makeEntry({ description: 'B' }))
    gen2.release('2.0.0', '2024-02-01')

    gen1.merge(gen2)
    expect(gen1.getVersions()).toHaveLength(2)
  })

  it('should merge unreleased from another generator', () => {
    const gen1 = new ChangelogGenerator()
    const gen2 = new ChangelogGenerator()
    gen2.addChange(makeEntry({ description: 'Unreleased from gen2' }))

    gen1.merge(gen2)
    expect(gen1.getUnreleased()).toHaveLength(1)
    expect(gen1.getUnreleased()[0]!.description).toBe('Unreleased from gen2')
  })

  it('should combine duplicate version changes', () => {
    const gen1 = new ChangelogGenerator()
    gen1.addChange(makeEntry({ description: 'Change from gen1' }))
    gen1.release('1.0.0', '2024-01-01')

    const gen2 = new ChangelogGenerator()
    gen2.addChange(makeEntry({ description: 'Change from gen2' }))
    gen2.release('1.0.0', '2024-01-01')

    gen1.merge(gen2)
    expect(gen1.getVersions()).toHaveLength(1)
    expect(gen1.getVersion('1.0.0')!.changes).toHaveLength(2)
  })

  it('should merge with empty generator', () => {
    const gen1 = new ChangelogGenerator()
    gen1.addChange(makeEntry({ description: 'A' }))
    gen1.release('1.0.0', '2024-01-01')

    const gen2 = new ChangelogGenerator()
    gen1.merge(gen2)
    expect(gen1.getVersions()).toHaveLength(1)
  })

  it('should preserve existing versions on merge', () => {
    const gen1 = new ChangelogGenerator()
    gen1.addChange(makeEntry({ description: 'Original' }))
    gen1.release('1.0.0', '2024-01-01')

    const gen2 = new ChangelogGenerator()
    gen2.addChange(makeEntry({ description: 'New' }))
    gen2.release('2.0.0', '2024-02-01')

    gen1.merge(gen2)
    const v1 = gen1.getVersion('1.0.0')
    expect(v1!.changes).toHaveLength(1)
    expect(v1!.changes[0]!.description).toBe('Original')
  })
})

describe('ChangelogGenerator - generate format dispatch', () => {
  it('should default to markdown format', () => {
    const gen = new ChangelogGenerator()
    const result = gen.generate()
    expect(result).toContain('# Changelog')
  })

  it('should generate markdown when format is markdown', () => {
    const gen = new ChangelogGenerator()
    const result = gen.generate('markdown')
    expect(result).toContain('# Changelog')
  })

  it('should generate JSON when format is json', () => {
    const gen = new ChangelogGenerator()
    const result = gen.generate('json')
    expect(() => JSON.parse(result)).not.toThrow()
  })

  it('should generate text when format is text', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'Feature' }))
    gen.release('1.0.0', '2024-01-01')
    const result = gen.generate('text')
    expect(result).toContain('Changelog')
    expect(result).not.toContain('#')
  })
})

describe('ChangelogGenerator - Edge cases', () => {
  it('should handle empty changelog markdown', () => {
    const gen = new ChangelogGenerator()
    const md = gen.generateMarkdown()
    expect(md).toBe('# Changelog\n')
  })

  it('should handle empty changelog JSON', () => {
    const gen = new ChangelogGenerator()
    const parsed = JSON.parse(gen.generateJSON())
    expect(parsed.versions).toHaveLength(0)
    expect(parsed.unreleased).toHaveLength(0)
  })

  it('should handle single change', () => {
    const gen = new ChangelogGenerator({ groupByCategory: false })
    gen.addChange(makeEntry({ description: 'Only change' }))
    gen.release('1.0.0', '2024-01-01')
    const md = gen.generateMarkdown()
    expect(md).toContain('Only change')
    expect(gen.getVersions()[0]!.changes).toHaveLength(1)
  })

  it('should handle clear resetting all data', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'A' }))
    gen.release('1.0.0', '2024-01-01')
    gen.addChange(makeEntry({ description: 'B' }))
    gen.clear()
    expect(gen.getVersions()).toHaveLength(0)
    expect(gen.getUnreleased()).toHaveLength(0)
    expect(gen.hasUnreleased()).toBe(false)
  })

  it('should handle hasUnreleased correctly', () => {
    const gen = new ChangelogGenerator()
    expect(gen.hasUnreleased()).toBe(false)
    gen.addChange(makeEntry({ description: 'A' }))
    expect(gen.hasUnreleased()).toBe(true)
  })

  it('should handle hasUnreleased after release', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'A' }))
    gen.release('1.0.0', '2024-01-01')
    expect(gen.hasUnreleased()).toBe(false)
  })

  it('should allow adding changes after clear', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'Old' }))
    gen.release('0.9.0', '2023-01-01')
    gen.clear()
    gen.addChange(makeEntry({ description: 'New' }))
    gen.release('1.0.0', '2024-01-01')
    expect(gen.getVersions()).toHaveLength(1)
    expect(gen.getVersions()[0]!.changes[0]!.description).toBe('New')
  })

  it('should handle many versions', () => {
    const gen = new ChangelogGenerator({ groupByCategory: false })
    for (let i = 0; i < 10; i++) {
      gen.addChange(makeEntry({ description: 'Change ' + i }))
      gen.release('1.' + i + '.0', '2024-01-' + String(i + 1).padStart(2, '0'))
    }
    expect(gen.getVersions()).toHaveLength(10)
    expect(gen.getLatest()!.version).toBe('1.9.0')
  })

  it('should handle clear does not affect options', () => {
    const gen = new ChangelogGenerator({ title: 'Custom' })
    gen.addChange(makeEntry({ description: 'A' }))
    gen.clear()
    expect(gen.getOptions().title).toBe('Custom')
  })
})

describe('ChangelogGenerator - Markdown with both issue and commit', () => {
  it('should show both issue and commit in entry', () => {
    const gen = new ChangelogGenerator({ groupByCategory: false })
    gen.addChange(makeEntry({ description: 'Fix bug', issue: '99', commit: 'deadbeef' }))
    gen.release('1.0.0', '2024-01-01')
    const md = gen.generateMarkdown()
    expect(md).toContain('refs #99')
    expect(md).toContain('deadbeef')
  })
})

describe('ChangelogGenerator - Markdown unreleased only', () => {
  it('should generate unreleased without versions', () => {
    const gen = new ChangelogGenerator({ groupByCategory: false })
    gen.addChange(makeEntry({ description: 'Unreleased feature' }))
    const md = gen.generateMarkdown()
    expect(md).toContain('## Unreleased')
    expect(md).toContain('Unreleased feature')
    expect(md).not.toContain('## 1.')
  })
})

describe('ChangelogGenerator - Category labels in markdown', () => {
  it('should use correct category labels', () => {
    const gen = new ChangelogGenerator({ groupByCategory: true })
    gen.addChanges([
      makeEntry({ category: 'added', description: 'A' }),
      makeEntry({ category: 'changed', description: 'B' }),
      makeEntry({ category: 'deprecated', description: 'C' }),
      makeEntry({ category: 'removed', description: 'D' }),
      makeEntry({ category: 'fixed', description: 'E' }),
      makeEntry({ category: 'security', description: 'F' }),
    ])
    gen.release('1.0.0', '2024-01-01')
    const md = gen.generateMarkdown()
    expect(md).toContain('### Added')
    expect(md).toContain('### Changed')
    expect(md).toContain('### Deprecated')
    expect(md).toContain('### Removed')
    expect(md).toContain('### Fixed')
    expect(md).toContain('### Security')
  })
})

describe('DEFAULT_CHANGELOG_OPTIONS', () => {
  it('should have title default to Changelog', () => {
    expect(DEFAULT_CHANGELOG_OPTIONS.title).toBe('Changelog')
  })

  it('should have includeDate default to true', () => {
    expect(DEFAULT_CHANGELOG_OPTIONS.includeDate).toBe(true)
  })

  it('should have groupByCategory default to true', () => {
    expect(DEFAULT_CHANGELOG_OPTIONS.groupByCategory).toBe(true)
  })

  it('should have all six categories in default order', () => {
    expect(DEFAULT_CHANGELOG_OPTIONS.categoryOrder).toEqual([
      'added',
      'changed',
      'deprecated',
      'removed',
      'fixed',
      'security',
    ])
  })
})

describe('ChangelogGenerator - Text unreleased', () => {
  it('should include unreleased section in text output', () => {
    const gen = new ChangelogGenerator()
    gen.addChange(makeEntry({ description: 'Pending feature' }))
    const text = gen.generateText()
    expect(text).toContain('Unreleased')
    expect(text).toContain('Pending feature')
  })
})
