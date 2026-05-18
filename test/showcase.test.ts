import { describe, it, expect } from 'vitest'
import { ShowcaseManager, DEFAULT_SHOWCASE_CONFIG, SHOWCASE_CATEGORIES } from '../src/core/showcase/index.js'
import type { ShowcasePlugin } from '../src/core/showcase/index.js'

const makePlugin = (overrides: Partial<ShowcasePlugin> = {}): ShowcasePlugin => ({
  name: 'test-plugin',
  displayName: 'Test Plugin',
  description: 'A test plugin',
  version: '1.0.0',
  author: 'test',
  license: 'MIT',
  category: 'utility',
  tags: [],
  status: 'active',
  downloads: 100,
  rating: 4.5,
  ratingCount: 10,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  codeforgeVersion: '1.0.0',
  showcaseStatus: ['community'],
  reviewScore: 4.5,
  reviewCount: 10,
  installationCommand: 'npm install test-plugin',
  ...overrides,
})

// ─── Plugin Management ───
describe('ShowcaseManager plugin management', () => {
  it('adds and gets plugin', () => {
    const mgr = new ShowcaseManager()
    mgr.addPlugin(makePlugin({ name: 'p1' }))
    expect(mgr.getPlugin('p1')).not.toBeNull()
    expect(mgr.getPlugin('p1')!.name).toBe('p1')
  })

  it('returns null for missing plugin', () => {
    const mgr = new ShowcaseManager()
    expect(mgr.getPlugin('missing')).toBeNull()
  })

  it('removes plugin', () => {
    const mgr = new ShowcaseManager()
    mgr.addPlugin(makePlugin({ name: 'p1' }))
    expect(mgr.removePlugin('p1')).toBe(true)
    expect(mgr.getPlugin('p1')).toBeNull()
  })

  it('removePlugin returns false for missing', () => {
    const mgr = new ShowcaseManager()
    expect(mgr.removePlugin('missing')).toBe(false)
  })

  it('getCount returns plugin count', () => {
    const mgr = new ShowcaseManager()
    mgr.addPlugin(makePlugin({ name: 'p1' }))
    mgr.addPlugin(makePlugin({ name: 'p2' }))
    expect(mgr.getCount()).toBe(2)
  })
})

// ─── Featured / Staff Picks / Trending ───
describe('ShowcaseManager featured, staff picks, trending', () => {
  it('getFeatured returns featured plugins', () => {
    const mgr = new ShowcaseManager()
    mgr.addPlugin(makePlugin({ name: 'p1', showcaseStatus: ['featured'], reviewScore: 5, downloads: 1000 }))
    mgr.addPlugin(makePlugin({ name: 'p2', showcaseStatus: ['community'] }))
    expect(mgr.getFeatured().length).toBe(1)
    expect(mgr.getFeatured()[0]!.name).toBe('p1')
  })

  it('getStaffPicks returns staff-pick plugins', () => {
    const mgr = new ShowcaseManager()
    mgr.addPlugin(makePlugin({ name: 'p1', showcaseStatus: ['staff-pick'], staffPickReason: 'Great', reviewScore: 5 }))
    expect(mgr.getStaffPicks().length).toBe(1)
  })

  it('getTrending returns trending plugins', () => {
    const mgr = new ShowcaseManager()
    mgr.addPlugin(makePlugin({ name: 'p1', showcaseStatus: ['trending'], downloads: 5000, reviewScore: 4.8 }))
    expect(mgr.getTrending().length).toBe(1)
  })

  it('getVerified returns verified plugins', () => {
    const mgr = new ShowcaseManager()
    mgr.addPlugin(makePlugin({ name: 'p1', showcaseStatus: ['verified'] }))
    mgr.addPlugin(makePlugin({ name: 'p2', showcaseStatus: ['community'] }))
    expect(mgr.getVerified().length).toBe(1)
  })

  it('getByStatus filters by status', () => {
    const mgr = new ShowcaseManager()
    mgr.addPlugin(makePlugin({ name: 'p1', showcaseStatus: ['community'] }))
    mgr.addPlugin(makePlugin({ name: 'p2', showcaseStatus: ['featured'] }))
    expect(mgr.getByStatus('community').length).toBe(1)
  })
})

// ─── Feature / Verify / StaffPick ───
describe('ShowcaseManager feature, verify, staffPick', () => {
  it('featurePlugin adds featured status', () => {
    const mgr = new ShowcaseManager()
    mgr.addPlugin(makePlugin({ name: 'p1' }))
    expect(mgr.featurePlugin('p1', 'great')).toBe(true)
    expect(mgr.getPlugin('p1')!.showcaseStatus).toContain('featured')
  })

  it('featurePlugin returns false for missing', () => {
    const mgr = new ShowcaseManager()
    expect(mgr.featurePlugin('missing')).toBe(false)
  })

  it('unfeaturePlugin removes featured status', () => {
    const mgr = new ShowcaseManager()
    mgr.addPlugin(makePlugin({ name: 'p1', showcaseStatus: ['featured'] }))
    mgr.unfeaturePlugin('p1')
    expect(mgr.getPlugin('p1')!.showcaseStatus).not.toContain('featured')
  })

  it('verifyPlugin adds verified status', () => {
    const mgr = new ShowcaseManager()
    mgr.addPlugin(makePlugin({ name: 'p1' }))
    mgr.verifyPlugin('p1')
    expect(mgr.getPlugin('p1')!.showcaseStatus).toContain('verified')
  })

  it('staffPick adds staff-pick status', () => {
    const mgr = new ShowcaseManager()
    mgr.addPlugin(makePlugin({ name: 'p1' }))
    mgr.staffPick('p1', 'Excellent')
    expect(mgr.getPlugin('p1')!.staffPickReason).toBe('Excellent')
  })
})

// ─── Collections ───
describe('ShowcaseManager collections', () => {
  it('creates and gets collection', () => {
    const mgr = new ShowcaseManager()
    mgr.createCollection({ id: 'c1', name: 'Test', description: 'desc', plugins: [], tags: [], curator: 'admin', createdAt: Date.now(), updatedAt: Date.now(), featured: true })
    expect(mgr.getCollection('c1')).not.toBeNull()
  })

  it('getCollections returns all', () => {
    const mgr = new ShowcaseManager()
    mgr.createCollection({ id: 'c1', name: 'A', description: '', plugins: [], tags: [], curator: 'a', createdAt: 0, updatedAt: 0, featured: false })
    mgr.createCollection({ id: 'c2', name: 'B', description: '', plugins: [], tags: [], curator: 'a', createdAt: 0, updatedAt: 0, featured: true })
    expect(mgr.getCollections().length).toBe(2)
  })

  it('getFeaturedCollections filters', () => {
    const mgr = new ShowcaseManager()
    mgr.createCollection({ id: 'c1', name: 'A', description: '', plugins: [], tags: [], curator: 'a', createdAt: 0, updatedAt: 0, featured: false })
    mgr.createCollection({ id: 'c2', name: 'B', description: '', plugins: [], tags: [], curator: 'a', createdAt: 0, updatedAt: 0, featured: true })
    expect(mgr.getFeaturedCollections().length).toBe(1)
  })

  it('addToCollection adds plugin', () => {
    const mgr = new ShowcaseManager()
    mgr.createCollection({ id: 'c1', name: 'A', description: '', plugins: [], tags: [], curator: 'a', createdAt: 0, updatedAt: 0, featured: false })
    expect(mgr.addToCollection('c1', 'p1')).toBe(true)
    expect(mgr.getCollection('c1')!.plugins).toContain('p1')
  })

  it('removeFromCollection removes plugin', () => {
    const mgr = new ShowcaseManager()
    mgr.createCollection({ id: 'c1', name: 'A', description: '', plugins: ['p1'], tags: [], curator: 'a', createdAt: 0, updatedAt: 0, featured: false })
    expect(mgr.removeFromCollection('c1', 'p1')).toBe(true)
    expect(mgr.getCollection('c1')!.plugins).not.toContain('p1')
  })
})

// ─── Format / Clear ───
describe('ShowcaseManager format and clear', () => {
  it('formatShowcase returns string', () => {
    const mgr = new ShowcaseManager()
    mgr.addPlugin(makePlugin({ name: 'p1', showcaseStatus: ['featured'], reviewScore: 5, downloads: 100 }))
    const out = mgr.formatShowcase()
    expect(out).toContain('Featured')
  })

  it('formatShowcase empty returns message', () => {
    const mgr = new ShowcaseManager()
    expect(mgr.formatShowcase()).toBe('No showcase content available.')
  })

  it('clear resets everything', () => {
    const mgr = new ShowcaseManager()
    mgr.addPlugin(makePlugin({ name: 'p1' }))
    mgr.clear()
    expect(mgr.getCount()).toBe(0)
  })
})

// ─── Constants ───
describe('Showcase constants', () => {
  it('DEFAULT_SHOWCASE_CONFIG has expected defaults', () => {
    expect(DEFAULT_SHOWCASE_CONFIG.maxFeatured).toBe(10)
  })

  it('SHOWCASE_CATEGORIES is populated', () => {
    expect(SHOWCASE_CATEGORIES.length).toBeGreaterThan(0)
  })
})
