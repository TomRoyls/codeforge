import { describe, it, expect, beforeEach } from 'vitest'
import { ShowcaseManager } from '../../src/core/showcase/showcase-manager.js'
import type { ShowcasePlugin, ShowcaseCollection, ShowcaseConfig } from '../../src/core/showcase/types.js'
import { DEFAULT_SHOWCASE_CONFIG, SHOWCASE_CATEGORIES } from '../../src/core/showcase/types.js'

function makeShowcasePlugin(overrides: Partial<ShowcasePlugin> = {}): ShowcasePlugin {
  return {
    name: 'test-plugin',
    displayName: 'Test Plugin',
    description: 'A test plugin for the showcase system',
    version: '1.0.0',
    author: 'testauthor',
    license: 'MIT',
    repository: 'https://github.com/test/test-plugin',
    category: 'utility',
    tags: ['test'],
    status: 'active',
    downloads: 1000,
    rating: 4.5,
    ratingCount: 20,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
    codeforgeVersion: '1.0.0',
    dependencies: {},
    keywords: ['test'],
    size: 2048,
    showcaseStatus: ['community'],
    reviewScore: 4.5,
    reviewCount: 20,
    installationCommand: 'codeforge install test-plugin',
    ...overrides,
  }
}

function makeCollection(overrides: Partial<ShowcaseCollection> = {}): ShowcaseCollection {
  return {
    id: 'col-1',
    name: 'Test Collection',
    description: 'A test collection',
    plugins: [],
    tags: ['test'],
    curator: 'admin',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
    featured: false,
    ...overrides,
  }
}

describe('ShowcaseManager', () => {
  let manager: ShowcaseManager

  beforeEach(() => {
    manager = new ShowcaseManager()
  })

  describe('addPlugin / removePlugin / getPlugin', () => {
    it('adds and retrieves a plugin', () => {
      const plugin = makeShowcasePlugin({ name: 'plugin-a' })
      manager.addPlugin(plugin)
      expect(manager.getPlugin('plugin-a')).toEqual(plugin)
    })

    it('returns null for unknown plugin', () => {
      expect(manager.getPlugin('unknown')).toBeNull()
    })

    it('removes a plugin and returns true', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'plugin-a' }))
      expect(manager.removePlugin('plugin-a')).toBe(true)
      expect(manager.getPlugin('plugin-a')).toBeNull()
    })

    it('returns false when removing unknown plugin', () => {
      expect(manager.removePlugin('unknown')).toBe(false)
    })

    it('stores a copy of the plugin', () => {
      const plugin = makeShowcasePlugin({ name: 'plugin-a' })
      manager.addPlugin(plugin)
      plugin.showcaseStatus.push('featured')
      const stored = manager.getPlugin('plugin-a')!
      expect(stored.showcaseStatus).not.toContain('featured')
    })
  })

  describe('getFeatured', () => {
    it('returns featured plugins sorted by reviewScore then downloads', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'a', showcaseStatus: ['featured'], reviewScore: 4.0, downloads: 500 }))
      manager.addPlugin(makeShowcasePlugin({ name: 'b', showcaseStatus: ['featured'], reviewScore: 4.5, downloads: 200 }))
      manager.addPlugin(makeShowcasePlugin({ name: 'c', showcaseStatus: ['featured'], reviewScore: 4.5, downloads: 800 }))

      const featured = manager.getFeatured()
      expect(featured.map((p) => p.name)).toEqual(['c', 'b', 'a'])
    })

    it('respects maxFeatured limit', () => {
      for (let i = 0; i < 15; i++) {
        manager.addPlugin(makeShowcasePlugin({ name: `p-${i}`, showcaseStatus: ['featured'], reviewScore: 4.0 + i * 0.01 }))
      }
      expect(manager.getFeatured()).toHaveLength(DEFAULT_SHOWCASE_CONFIG.maxFeatured)
    })

    it('returns empty array when no featured plugins', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'a', showcaseStatus: ['community'] }))
      expect(manager.getFeatured()).toEqual([])
    })

    it('only includes plugins with featured status', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'a', showcaseStatus: ['featured'] }))
      manager.addPlugin(makeShowcasePlugin({ name: 'b', showcaseStatus: ['community'] }))
      manager.addPlugin(makeShowcasePlugin({ name: 'c', showcaseStatus: ['verified'] }))

      const featured = manager.getFeatured()
      expect(featured).toHaveLength(1)
      expect(featured[0]!.name).toBe('a')
    })
  })

  describe('getStaffPicks', () => {
    it('returns staff-pick plugins', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'a', showcaseStatus: ['staff-pick'], staffPickReason: 'Great plugin', reviewScore: 4.8 }))
      manager.addPlugin(makeShowcasePlugin({ name: 'b', showcaseStatus: ['staff-pick'], staffPickReason: undefined, reviewScore: 4.5 }))

      const picks = manager.getStaffPicks()
      expect(picks).toHaveLength(2)
      expect(picks[0]!.name).toBe('a')
    })

    it('sorts by reason presence then reviewScore', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'a', showcaseStatus: ['staff-pick'], staffPickReason: undefined, reviewScore: 4.9 }))
      manager.addPlugin(makeShowcasePlugin({ name: 'b', showcaseStatus: ['staff-pick'], staffPickReason: 'Excellent', reviewScore: 4.5 }))

      const picks = manager.getStaffPicks()
      expect(picks[0]!.name).toBe('b')
      expect(picks[1]!.name).toBe('a')
    })

    it('respects maxStaffPicks limit', () => {
      for (let i = 0; i < 10; i++) {
        manager.addPlugin(makeShowcasePlugin({ name: `p-${i}`, showcaseStatus: ['staff-pick'], staffPickReason: `Reason ${i}` }))
      }
      expect(manager.getStaffPicks()).toHaveLength(DEFAULT_SHOWCASE_CONFIG.maxStaffPicks)
    })
  })

  describe('getTrending', () => {
    it('returns trending plugins', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'a', showcaseStatus: ['trending'], downloads: 1000, reviewScore: 4.0 }))
      manager.addPlugin(makeShowcasePlugin({ name: 'b', showcaseStatus: ['trending'], downloads: 500, reviewScore: 5.0 }))

      const trending = manager.getTrending()
      expect(trending).toHaveLength(2)
    })

    it('sorts by downloads*0.3 + reviewScore*0.7', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'a', showcaseStatus: ['trending'], downloads: 1000, reviewScore: 1.0 }))
      manager.addPlugin(makeShowcasePlugin({ name: 'b', showcaseStatus: ['trending'], downloads: 100, reviewScore: 5.0 }))

      const scoreA = 1000 * 0.3 + 1.0 * 0.7
      const scoreB = 100 * 0.3 + 5.0 * 0.7
      const trending = manager.getTrending()

      if (scoreB > scoreA) {
        expect(trending[0]!.name).toBe('b')
      } else {
        expect(trending[0]!.name).toBe('a')
      }
    })

    it('respects maxTrending limit', () => {
      for (let i = 0; i < 20; i++) {
        manager.addPlugin(makeShowcasePlugin({ name: `p-${i}`, showcaseStatus: ['trending'], downloads: 100 + i, reviewScore: 4.0 }))
      }
      expect(manager.getTrending()).toHaveLength(DEFAULT_SHOWCASE_CONFIG.maxTrending)
    })
  })

  describe('getVerified', () => {
    it('returns verified plugins', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'a', showcaseStatus: ['verified'] }))
      manager.addPlugin(makeShowcasePlugin({ name: 'b', showcaseStatus: ['community'] }))
      manager.addPlugin(makeShowcasePlugin({ name: 'c', showcaseStatus: ['verified'] }))

      const verified = manager.getVerified()
      expect(verified).toHaveLength(2)
      expect(verified.map((p) => p.name)).toContain('a')
      expect(verified.map((p) => p.name)).toContain('c')
    })

    it('returns empty array when no verified plugins', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'a', showcaseStatus: ['community'] }))
      expect(manager.getVerified()).toEqual([])
    })
  })

  describe('getByStatus', () => {
    it('filters by specific status', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'a', showcaseStatus: ['community', 'verified'] }))
      manager.addPlugin(makeShowcasePlugin({ name: 'b', showcaseStatus: ['trending'] }))
      manager.addPlugin(makeShowcasePlugin({ name: 'c', showcaseStatus: ['verified'] }))

      const verified = manager.getByStatus('verified')
      expect(verified).toHaveLength(2)
    })

    it('returns empty for status with no plugins', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'a', showcaseStatus: ['community'] }))
      expect(manager.getByStatus('staff-pick')).toEqual([])
    })
  })

  describe('featurePlugin', () => {
    it('adds featured status to existing plugin', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'a', showcaseStatus: ['community'] }))
      expect(manager.featurePlugin('a')).toBe(true)

      const plugin = manager.getPlugin('a')!
      expect(plugin.showcaseStatus).toContain('featured')
      expect(plugin.featuredAt).toBeDefined()
    })

    it('returns false for unknown plugin', () => {
      expect(manager.featurePlugin('unknown')).toBe(false)
    })

    it('does not duplicate featured status', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'a', showcaseStatus: ['featured'] }))
      manager.featurePlugin('a')

      const plugin = manager.getPlugin('a')!
      const featuredCount = plugin.showcaseStatus.filter((s) => s === 'featured').length
      expect(featuredCount).toBe(1)
    })
  })

  describe('unfeaturePlugin', () => {
    it('removes featured status', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'a', showcaseStatus: ['featured', 'community'], featuredAt: Date.now() }))
      expect(manager.unfeaturePlugin('a')).toBe(true)

      const plugin = manager.getPlugin('a')!
      expect(plugin.showcaseStatus).not.toContain('featured')
      expect(plugin.featuredAt).toBeUndefined()
    })

    it('returns false for unknown plugin', () => {
      expect(manager.unfeaturePlugin('unknown')).toBe(false)
    })
  })

  describe('verifyPlugin', () => {
    it('adds verified status', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'a', showcaseStatus: ['community'] }))
      expect(manager.verifyPlugin('a')).toBe(true)

      const plugin = manager.getPlugin('a')!
      expect(plugin.showcaseStatus).toContain('verified')
      expect(plugin.verifiedAt).toBeDefined()
    })

    it('returns false for unknown plugin', () => {
      expect(manager.verifyPlugin('unknown')).toBe(false)
    })

    it('does not duplicate verified status', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'a', showcaseStatus: ['verified'] }))
      manager.verifyPlugin('a')

      const plugin = manager.getPlugin('a')!
      const count = plugin.showcaseStatus.filter((s) => s === 'verified').length
      expect(count).toBe(1)
    })
  })

  describe('staffPick', () => {
    it('adds staff-pick status with reason', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'a', showcaseStatus: ['community'] }))
      expect(manager.staffPick('a', 'Essential tool')).toBe(true)

      const plugin = manager.getPlugin('a')!
      expect(plugin.showcaseStatus).toContain('staff-pick')
      expect(plugin.staffPickReason).toBe('Essential tool')
    })

    it('returns false for unknown plugin', () => {
      expect(manager.staffPick('unknown', 'reason')).toBe(false)
    })
  })

  describe('collections', () => {
    it('creates and retrieves a collection', () => {
      const col = makeCollection({ id: 'col-1', name: 'Best Plugins' })
      manager.createCollection(col)
      expect(manager.getCollection('col-1')).toEqual(col)
    })

    it('returns null for unknown collection', () => {
      expect(manager.getCollection('unknown')).toBeNull()
    })

    it('getCollections returns all collections', () => {
      manager.createCollection(makeCollection({ id: 'c1', name: 'First' }))
      manager.createCollection(makeCollection({ id: 'c2', name: 'Second' }))

      const collections = manager.getCollections()
      expect(collections).toHaveLength(2)
    })

    it('getFeaturedCollections returns only featured ones', () => {
      manager.createCollection(makeCollection({ id: 'c1', featured: true }))
      manager.createCollection(makeCollection({ id: 'c2', featured: false }))
      manager.createCollection(makeCollection({ id: 'c3', featured: true }))

      const featured = manager.getFeaturedCollections()
      expect(featured).toHaveLength(2)
      expect(featured.every((c) => c.featured)).toBe(true)
    })

    it('addToCollection adds a plugin name', () => {
      manager.createCollection(makeCollection({ id: 'c1' }))
      expect(manager.addToCollection('c1', 'plugin-a')).toBe(true)

      const col = manager.getCollection('c1')!
      expect(col.plugins).toContain('plugin-a')
    })

    it('addToCollection returns false for unknown collection', () => {
      expect(manager.addToCollection('unknown', 'plugin-a')).toBe(false)
    })

    it('addToCollection does not duplicate plugin names', () => {
      manager.createCollection(makeCollection({ id: 'c1', plugins: ['plugin-a'] }))
      manager.addToCollection('c1', 'plugin-a')

      const col = manager.getCollection('c1')!
      expect(col.plugins.filter((p) => p === 'plugin-a')).toHaveLength(1)
    })

    it('removeFromCollection removes a plugin name', () => {
      manager.createCollection(makeCollection({ id: 'c1', plugins: ['a', 'b', 'c'] }))
      expect(manager.removeFromCollection('c1', 'b')).toBe(true)

      const col = manager.getCollection('c1')!
      expect(col.plugins).toEqual(['a', 'c'])
    })

    it('removeFromCollection returns false for unknown collection', () => {
      expect(manager.removeFromCollection('unknown', 'a')).toBe(false)
    })

    it('removeFromCollection returns false when plugin not in collection', () => {
      manager.createCollection(makeCollection({ id: 'c1', plugins: ['a'] }))
      expect(manager.removeFromCollection('c1', 'z')).toBe(false)
    })
  })

  describe('formatShowcase', () => {
    it('produces readable output with all sections', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'feat-1', description: 'A featured plugin', showcaseStatus: ['featured'], reviewScore: 4.8, downloads: 5000 }))
      manager.addPlugin(makeShowcasePlugin({ name: 'pick-1', description: 'A staff pick', showcaseStatus: ['staff-pick'], staffPickReason: 'Must have', reviewScore: 4.7, downloads: 3000 }))
      manager.addPlugin(makeShowcasePlugin({ name: 'trend-1', description: 'A trending plugin', showcaseStatus: ['trending'], reviewScore: 4.5, downloads: 10000 }))
      manager.createCollection(makeCollection({ id: 'c1', name: 'Essentials', description: 'Essential plugins', plugins: ['feat-1'], featured: true }))

      const output = manager.formatShowcase()
      expect(output).toContain('Featured Plugins')
      expect(output).toContain('feat-1')
      expect(output).toContain('Staff Picks')
      expect(output).toContain('pick-1')
      expect(output).toContain('Trending')
      expect(output).toContain('trend-1')
      expect(output).toContain('Collections')
      expect(output).toContain('Essentials')
    })

    it('shows rating and downloads for each plugin', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'p1', showcaseStatus: ['featured'], reviewScore: 4.2, downloads: 1234 }))

      const output = manager.formatShowcase()
      expect(output).toContain('4.2')
      expect(output).toContain('1234')
    })

    it('shows staff pick reason when present', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'p1', showcaseStatus: ['staff-pick'], staffPickReason: 'Top quality' }))

      const output = manager.formatShowcase()
      expect(output).toContain('Reason: Top quality')
    })

    it('returns message when showcase is empty', () => {
      expect(manager.formatShowcase()).toBe('No showcase content available.')
    })

    it('omits sections with no content', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'a', showcaseStatus: ['featured'] }))
      const output = manager.formatShowcase()
      expect(output).toContain('Featured Plugins')
      expect(output).not.toContain('Staff Picks')
      expect(output).not.toContain('Trending')
    })
  })

  describe('getCount', () => {
    it('returns correct count', () => {
      expect(manager.getCount()).toBe(0)
      manager.addPlugin(makeShowcasePlugin({ name: 'a' }))
      expect(manager.getCount()).toBe(1)
      manager.addPlugin(makeShowcasePlugin({ name: 'b' }))
      expect(manager.getCount()).toBe(2)
    })

    it('decreases after removal', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'a' }))
      manager.addPlugin(makeShowcasePlugin({ name: 'b' }))
      manager.removePlugin('a')
      expect(manager.getCount()).toBe(1)
    })
  })

  describe('clear', () => {
    it('empties plugins and collections', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'a' }))
      manager.createCollection(makeCollection({ id: 'c1' }))
      manager.clear()
      expect(manager.getCount()).toBe(0)
      expect(manager.getCollections()).toHaveLength(0)
    })
  })

  describe('custom config', () => {
    it('respects custom maxFeatured', () => {
      const customManager = new ShowcaseManager({ maxFeatured: 2 })
      for (let i = 0; i < 5; i++) {
        customManager.addPlugin(makeShowcasePlugin({ name: `p-${i}`, showcaseStatus: ['featured'], reviewScore: 4.0 + i * 0.1 }))
      }
      expect(customManager.getFeatured()).toHaveLength(2)
    })

    it('respects custom maxStaffPicks', () => {
      const customManager = new ShowcaseManager({ maxStaffPicks: 1 })
      for (let i = 0; i < 3; i++) {
        customManager.addPlugin(makeShowcasePlugin({ name: `p-${i}`, showcaseStatus: ['staff-pick'], staffPickReason: `Reason ${i}` }))
      }
      expect(customManager.getStaffPicks()).toHaveLength(1)
    })

    it('respects custom maxTrending', () => {
      const customManager = new ShowcaseManager({ maxTrending: 3 })
      for (let i = 0; i < 10; i++) {
        customManager.addPlugin(makeShowcasePlugin({ name: `p-${i}`, showcaseStatus: ['trending'] }))
      }
      expect(customManager.getTrending()).toHaveLength(3)
    })
  })

  describe('DEFAULT_SHOWCASE_CONFIG', () => {
    it('has expected default values', () => {
      expect(DEFAULT_SHOWCASE_CONFIG.maxFeatured).toBe(10)
      expect(DEFAULT_SHOWCASE_CONFIG.maxStaffPicks).toBe(5)
      expect(DEFAULT_SHOWCASE_CONFIG.maxTrending).toBe(10)
      expect(DEFAULT_SHOWCASE_CONFIG.minReviewScore).toBe(4.0)
      expect(DEFAULT_SHOWCASE_CONFIG.minReviews).toBe(5)
    })
  })

  describe('SHOWCASE_CATEGORIES', () => {
    it('contains expected category ids', () => {
      const ids = SHOWCASE_CATEGORIES.map((c) => c.id)
      expect(ids).toContain('framework')
      expect(ids).toContain('language')
      expect(ids).toContain('security')
      expect(ids).toContain('performance')
      expect(ids).toContain('reporting')
      expect(ids).toContain('testing')
      expect(ids).toContain('integration')
      expect(ids).toContain('utility')
    })

    it('each category has name and description', () => {
      for (const cat of SHOWCASE_CATEGORIES) {
        expect(cat.name.length).toBeGreaterThan(0)
        expect(cat.description.length).toBeGreaterThan(0)
      }
    })
  })

  describe('edge cases', () => {
    it('handles empty showcase gracefully', () => {
      expect(manager.getFeatured()).toEqual([])
      expect(manager.getStaffPicks()).toEqual([])
      expect(manager.getTrending()).toEqual([])
      expect(manager.getVerified()).toEqual([])
      expect(manager.getByStatus('featured')).toEqual([])
      expect(manager.getCount()).toBe(0)
      expect(manager.getCollections()).toEqual([])
      expect(manager.getFeaturedCollections()).toEqual([])
    })

    it('handles plugin with multiple statuses', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'a', showcaseStatus: ['featured', 'verified', 'trending'] }))
      expect(manager.getFeatured()).toHaveLength(1)
      expect(manager.getVerified()).toHaveLength(1)
      expect(manager.getTrending()).toHaveLength(1)
      expect(manager.getByStatus('featured')).toHaveLength(1)
      expect(manager.getByStatus('verified')).toHaveLength(1)
    })

    it('overwrites plugin with same name on addPlugin', () => {
      manager.addPlugin(makeShowcasePlugin({ name: 'a', reviewScore: 3.0 }))
      manager.addPlugin(makeShowcasePlugin({ name: 'a', reviewScore: 5.0 }))
      expect(manager.getCount()).toBe(1)
      expect(manager.getPlugin('a')!.reviewScore).toBe(5.0)
    })

    it('overwrites collection with same id on createCollection', () => {
      manager.createCollection(makeCollection({ id: 'c1', name: 'First' }))
      manager.createCollection(makeCollection({ id: 'c1', name: 'Second' }))
      expect(manager.getCollections()).toHaveLength(1)
      expect(manager.getCollection('c1')!.name).toBe('Second')
    })
  })
})
