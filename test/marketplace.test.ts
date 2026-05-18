import { RegistryClient, PluginValidator, DEFAULT_MARKETPLACE_CONFIG } from '../src/core/marketplace/index.js'
import type { MarketplacePlugin } from '../src/core/marketplace/index.js'

function makePlugin(overrides: Partial<MarketplacePlugin> = {}): MarketplacePlugin {
  return {
    name: 'test-plugin',
    displayName: 'Test Plugin',
    description: 'A test plugin for unit testing purposes',
    version: '1.0.0',
    author: 'test-author',
    license: 'MIT',
    category: 'utility',
    status: 'active',
    tags: ['test'],
    keywords: ['testing'],
    downloads: 100,
    rating: 4.5,
    ratingCount: 10,
    createdAt: 1000000,
    updatedAt: 2000000,
    ...overrides,
  }
}

// ─── PluginValidator ────────────────────────────────────────────────────

describe('Marketplace', () => {
  describe('PluginValidator', () => {
    it('validates a correct plugin', () => {
      const v = new PluginValidator()
      const result = v.validate(makePlugin())
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('reports missing required fields', () => {
      const v = new PluginValidator()
      const result = v.validate({})
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('validates name format', () => {
      const v = new PluginValidator()
      expect(v.validateName('my-plugin')).toBe(true)
      expect(v.validateName('@scope/my-plugin')).toBe(true)
      expect(v.validateName('A')).toBe(false)
      expect(v.validateName('ab')).toBe(true)
    })

    it('validates version format', () => {
      const v = new PluginValidator()
      expect(v.validateVersion('1.0.0')).toBe(true)
      expect(v.validateVersion('0.1.0-alpha.1')).toBe(true)
      expect(v.validateVersion('not-semver')).toBe(false)
    })

    it('warns about short descriptions', () => {
      const v = new PluginValidator()
      const result = v.validate(makePlugin({ description: 'short' }))
      expect(result.warnings).toContain('Description is too short (less than 20 characters)')
    })

    it('checks compatibility', () => {
      const v = new PluginValidator()
      const plugin = makePlugin({ codeforgeVersion: '0.5.0' })
      expect(v.checkCompatibility(plugin, '1.0.0')).toBe(true)
      expect(v.checkCompatibility(plugin, '0.3.0')).toBe(false)
    })
  })

  // ─── RegistryClient ──────────────────────────────────────────────────────

  describe('RegistryClient', () => {
    it('creates empty registry', () => {
      const client = new RegistryClient()
      expect(client.getCount()).toBe(0)
    })

    it('publishes a plugin', () => {
      const client = new RegistryClient()
      const result = client.publish(makePlugin())
      expect(result.success).toBe(true)
      expect(client.getCount()).toBe(1)
    })

    it('updates existing plugin', () => {
      const client = new RegistryClient()
      client.publish(makePlugin())
      const result = client.publish(makePlugin({ version: '2.0.0' }))
      expect(result.success).toBe(true)
      expect(result.message).toContain('updated')
    })

    it('dry run does not publish', () => {
      const client = new RegistryClient()
      const result = client.publish(makePlugin(), { dryRun: true })
      expect(result.success).toBe(true)
      expect(client.getCount()).toBe(0)
    })

    it('searches plugins by query', () => {
      const client = new RegistryClient()
      client.addPlugin(makePlugin({ name: 'foo', displayName: 'Foo' }))
      client.addPlugin(makePlugin({ name: 'bar', displayName: 'Bar' }))
      const results = client.search({ query: 'foo' })
      expect(results.length).toBe(1)
      expect(results[0]!.plugin.name).toBe('foo')
    })

    it('searches by category', () => {
      const client = new RegistryClient()
      client.addPlugin(makePlugin({ category: 'utility' }))
      client.addPlugin(makePlugin({ name: 'sec-plugin', category: 'security' }))
      const results = client.search({ category: 'security' })
      expect(results.length).toBe(1)
    })

    it('searches by tags', () => {
      const client = new RegistryClient()
      client.addPlugin(makePlugin({ tags: ['testing'] }))
      client.addPlugin(makePlugin({ name: 'other', tags: ['other'] }))
      const results = client.search({ tags: ['testing'] })
      expect(results.length).toBe(1)
    })

    it('getPlugin returns plugin by name', () => {
      const client = new RegistryClient()
      client.addPlugin(makePlugin())
      expect(client.getPlugin('test-plugin')).toBeDefined()
      expect(client.getPlugin('missing')).toBeNull()
    })

    it('deprecates a plugin', () => {
      const client = new RegistryClient()
      client.addPlugin(makePlugin())
      expect(client.deprecate('test-plugin')).toBe(true)
      expect(client.getPlugin('test-plugin')!.status).toBe('deprecated')
      expect(client.deprecate('missing')).toBe(false)
    })

    it('unpublishes a plugin', () => {
      const client = new RegistryClient()
      client.addPlugin(makePlugin())
      expect(client.unpublish('test-plugin')).toBe(true)
      expect(client.getCount()).toBe(0)
    })

    it('getStats returns registry statistics', () => {
      const client = new RegistryClient()
      client.addPlugin(makePlugin({ downloads: 100 }))
      client.addPlugin(makePlugin({ name: 'p2', downloads: 200 }))
      const stats = client.getStats()
      expect(stats.totalPlugins).toBe(2)
      expect(stats.totalDownloads).toBe(300)
    })

    it('getByCategory filters plugins', () => {
      const client = new RegistryClient()
      client.addPlugin(makePlugin({ category: 'utility' }))
      client.addPlugin(makePlugin({ name: 'p2', category: 'security' }))
      expect(client.getByCategory('utility').length).toBe(1)
    })

    it('getByAuthor filters plugins', () => {
      const client = new RegistryClient()
      client.addPlugin(makePlugin({ author: 'alice' }))
      client.addPlugin(makePlugin({ name: 'p2', author: 'bob' }))
      expect(client.getByAuthor('alice').length).toBe(1)
    })

    it('getTrending returns sorted plugins', () => {
      const client = new RegistryClient()
      client.addPlugin(makePlugin({ downloads: 1000, rating: 5, ratingCount: 100 }))
      client.addPlugin(makePlugin({ name: 'p2', downloads: 10, rating: 1, ratingCount: 1 }))
      const trending = client.getTrending(1)
      expect(trending.length).toBe(1)
      expect(trending[0]!.name).toBe('test-plugin')
    })

    it('clear removes all plugins', () => {
      const client = new RegistryClient()
      client.addPlugin(makePlugin())
      client.clear()
      expect(client.getCount()).toBe(0)
    })

    it('getVersions returns version', () => {
      const client = new RegistryClient()
      client.addPlugin(makePlugin({ version: '2.0.0' }))
      expect(client.getVersions('test-plugin')).toEqual(['2.0.0'])
      expect(client.getVersions('missing')).toEqual([])
    })
  })

  // ─── DEFAULT_MARKETPLACE_CONFIG ──────────────────────────────────────────

  describe('DEFAULT_MARKETPLACE_CONFIG', () => {
    it('has sensible defaults', () => {
      expect(DEFAULT_MARKETPLACE_CONFIG.maxResults).toBeGreaterThan(0)
    })
  })
})
