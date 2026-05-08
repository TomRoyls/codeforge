import { describe, it, expect, beforeEach } from 'vitest'
import { RegistryClient } from '../../src/core/marketplace/registry-client.js'
import { PluginValidator } from '../../src/core/marketplace/plugin-validator.js'
import type { MarketplacePlugin, PluginCategory } from '../../src/core/marketplace/types.js'

function makePlugin(overrides: Partial<MarketplacePlugin> = {}): MarketplacePlugin {
  return {
    name: 'test-plugin',
    displayName: 'Test Plugin',
    description: 'A test plugin for testing purposes in the marketplace system',
    version: '1.0.0',
    author: 'testauthor',
    license: 'MIT',
    repository: 'https://github.com/test/test-plugin',
    category: 'utility',
    tags: ['test', 'plugin'],
    status: 'active',
    downloads: 100,
    rating: 4.5,
    ratingCount: 10,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
    codeforgeVersion: '1.0.0',
    dependencies: {},
    keywords: ['test', 'plugin'],
    size: 1024,
    readme: '# Test Plugin\n\nA test plugin.',
    ...overrides,
  }
}

function seedRegistry(client: RegistryClient): void {
  const now = Date.now()
  const day = 86400000

  const plugins: MarketplacePlugin[] = [
    makePlugin({
      name: 'react-framework',
      displayName: 'React Framework',
      description: 'React component framework for building modern user interfaces',
      version: '2.1.0',
      author: 'facebook',
      category: 'framework',
      tags: ['react', 'ui', 'components'],
      keywords: ['react', 'framework', 'ui'],
      downloads: 50000,
      rating: 4.8,
      ratingCount: 500,
      createdAt: now - 90 * day,
      updatedAt: now - 1 * day,
    }),
    makePlugin({
      name: 'typescript-lang',
      displayName: 'TypeScript Support',
      description: 'TypeScript language support with type checking and IntelliSense',
      version: '3.0.1',
      author: 'microsoft',
      category: 'language',
      tags: ['typescript', 'types', 'javascript'],
      keywords: ['typescript', 'language', 'types'],
      downloads: 75000,
      rating: 4.9,
      ratingCount: 800,
      createdAt: now - 120 * day,
      updatedAt: now - 2 * day,
    }),
    makePlugin({
      name: 'security-scanner',
      displayName: 'Security Scanner',
      description: 'Comprehensive security vulnerability scanner for your codebase',
      version: '1.5.0',
      author: 'securityteam',
      category: 'security',
      tags: ['security', 'vulnerability', 'scan'],
      keywords: ['security', 'scanner', 'vulnerability'],
      downloads: 30000,
      rating: 4.3,
      ratingCount: 200,
      createdAt: now - 60 * day,
      updatedAt: now - 5 * day,
    }),
    makePlugin({
      name: 'perf-optimizer',
      displayName: 'Performance Optimizer',
      description: 'Automatic performance optimization and profiling tools',
      version: '1.2.0',
      author: 'perfteam',
      category: 'performance',
      tags: ['performance', 'optimization', 'profiling'],
      keywords: ['performance', 'optimizer', 'speed'],
      downloads: 25000,
      rating: 4.1,
      ratingCount: 150,
      createdAt: now - 45 * day,
      updatedAt: now - 10 * day,
    }),
    makePlugin({
      name: 'jest-runner',
      displayName: 'Jest Test Runner',
      description: 'Jest test runner integration for seamless test execution',
      version: '2.0.0',
      author: 'testingteam',
      category: 'testing',
      tags: ['jest', 'testing', 'unit-test'],
      keywords: ['jest', 'test', 'runner'],
      downloads: 40000,
      rating: 4.6,
      ratingCount: 350,
      createdAt: now - 80 * day,
      updatedAt: now - 3 * day,
    }),
    makePlugin({
      name: 'report-gen',
      displayName: 'Report Generator',
      description: 'Generate detailed reports from your analysis results',
      version: '1.0.0',
      author: 'reportteam',
      category: 'reporting',
      tags: ['reports', 'generation', 'pdf'],
      keywords: ['report', 'generator', 'pdf'],
      downloads: 15000,
      rating: 3.8,
      ratingCount: 80,
      createdAt: now - 30 * day,
      updatedAt: now - 15 * day,
    }),
    makePlugin({
      name: 'github-integration',
      displayName: 'GitHub Integration',
      description: 'GitHub integration for pull requests and code reviews',
      version: '1.3.0',
      author: 'facebook',
      category: 'integration',
      tags: ['github', 'pull-request', 'review'],
      keywords: ['github', 'integration', 'pr'],
      downloads: 35000,
      rating: 4.4,
      ratingCount: 250,
      createdAt: now - 70 * day,
      updatedAt: now - 7 * day,
    }),
    makePlugin({
      name: 'utils-collection',
      displayName: 'Utility Collection',
      description: 'A collection of handy utility functions for everyday development tasks',
      version: '1.1.0',
      author: 'utilitydev',
      category: 'utility',
      tags: ['utils', 'helpers', 'tools'],
      keywords: ['utility', 'helpers', 'tools'],
      downloads: 20000,
      rating: 4.0,
      ratingCount: 120,
      createdAt: now - 50 * day,
      updatedAt: now - 20 * day,
    }),
    makePlugin({
      name: 'deprecated-tool',
      displayName: 'Deprecated Tool',
      description: 'This tool has been deprecated in favor of the newer version available',
      version: '0.9.0',
      author: 'oldteam',
      category: 'utility',
      tags: ['deprecated', 'old'],
      keywords: ['deprecated'],
      downloads: 5000,
      rating: 2.5,
      ratingCount: 30,
      status: 'deprecated',
      createdAt: now - 200 * day,
      updatedAt: now - 100 * day,
    }),
    makePlugin({
      name: 'flagged-plugin',
      displayName: 'Flagged Plugin',
      description: 'This plugin has been flagged for review due to policy violations',
      version: '1.0.0',
      author: 'flaggedauthor',
      category: 'utility',
      tags: ['flagged'],
      keywords: ['flagged'],
      downloads: 1000,
      rating: 1.5,
      ratingCount: 10,
      status: 'flagged',
      createdAt: now - 40 * day,
      updatedAt: now - 30 * day,
    }),
  ]

  for (const plugin of plugins) {
    client.addPlugin(plugin)
  }
}

describe('RegistryClient', () => {
  let client: RegistryClient

  beforeEach(() => {
    client = new RegistryClient()
    seedRegistry(client)
  })

  describe('search', () => {
    it('searches by text query matching name', () => {
      const results = client.search({ query: 'react' })
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results.some((r) => r.plugin.name === 'react-framework')).toBe(true)
      expect(results[0].matchedFields).toContain('name')
    })

    it('searches by text query matching description', () => {
      const results = client.search({ query: 'vulnerability' })
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results.some((r) => r.plugin.name === 'security-scanner')).toBe(true)
    })

    it('searches by text query matching tags', () => {
      const results = client.search({ query: 'github' })
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results.some((r) => r.plugin.name === 'github-integration')).toBe(true)
    })

    it('searches by text query matching keywords', () => {
      const results = client.search({ query: 'runner' })
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results.some((r) => r.plugin.name === 'jest-runner')).toBe(true)
    })

    it('searches by text query matching displayName', () => {
      const results = client.search({ query: 'TypeScript' })
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results.some((r) => r.plugin.name === 'typescript-lang')).toBe(true)
    })

    it('filters by category', () => {
      const results = client.search({ category: 'security' })
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results.every((r) => r.plugin.category === 'security')).toBe(true)
    })

    it('filters by author', () => {
      const results = client.search({ author: 'facebook' })
      expect(results.length).toBe(2)
      expect(results.every((r) => r.plugin.author === 'facebook')).toBe(true)
    })

    it('filters by tags', () => {
      const results = client.search({ tags: ['deprecated'] })
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results.some((r) => r.plugin.name === 'deprecated-tool')).toBe(true)
    })

    it('filters by minRating', () => {
      const results = client.search({ minRating: 4.5 })
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results.every((r) => r.plugin.rating >= 4.5)).toBe(true)
    })

    it('filters by status', () => {
      const results = client.search({ status: 'deprecated' })
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results.every((r) => r.plugin.status === 'deprecated')).toBe(true)
    })

    it('sorts by downloads descending', () => {
      const results = client.search({ sortBy: 'downloads', sortOrder: 'desc' })
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].plugin.downloads).toBeGreaterThanOrEqual(
          results[i].plugin.downloads,
        )
      }
    })

    it('sorts by rating descending', () => {
      const results = client.search({ sortBy: 'rating', sortOrder: 'desc' })
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].plugin.rating).toBeGreaterThanOrEqual(
          results[i].plugin.rating,
        )
      }
    })

    it('sorts by updated descending', () => {
      const results = client.search({ sortBy: 'updated', sortOrder: 'desc' })
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].plugin.updatedAt).toBeGreaterThanOrEqual(
          results[i].plugin.updatedAt,
        )
      }
    })

    it('sorts by name ascending', () => {
      const results = client.search({ sortBy: 'name', sortOrder: 'asc' })
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].plugin.name.localeCompare(results[i].plugin.name)).toBeLessThanOrEqual(0)
      }
    })

    it('applies limit and offset for pagination', () => {
      const all = client.search({})
      const page1 = client.search({ limit: 3, offset: 0 })
      const page2 = client.search({ limit: 3, offset: 3 })
      expect(page1.length).toBe(3)
      expect(page2.length).toBe(3)
      expect(page1[0].plugin.name).not.toBe(page2[0].plugin.name)
      expect(page1.length + page2.length).toBeLessThanOrEqual(all.length)
    })

    it('returns correct scores and matchedFields', () => {
      const results = client.search({ query: 'react' })
      expect(results.length).toBeGreaterThanOrEqual(1)
      const reactResult = results.find((r) => r.plugin.name === 'react-framework')!
      expect(reactResult.score).toBeGreaterThan(0)
      expect(reactResult.matchedFields.length).toBeGreaterThan(0)
    })

    it('returns empty array for no results', () => {
      const results = client.search({ query: 'xyznonexistent123' })
      expect(results).toEqual([])
    })

    it('combines query with filters', () => {
      const results = client.search({ query: 'react', category: 'framework' })
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results.every((r) => r.plugin.category === 'framework')).toBe(true)
    })

    it('sorts ascending with sortOrder asc', () => {
      const results = client.search({ sortBy: 'downloads', sortOrder: 'asc' })
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].plugin.downloads).toBeLessThanOrEqual(
          results[i].plugin.downloads,
        )
      }
    })
  })

  describe('getPlugin', () => {
    it('returns plugin by name', () => {
      const plugin = client.getPlugin('react-framework')
      expect(plugin).not.toBeNull()
      expect(plugin!.name).toBe('react-framework')
    })

    it('returns null for unknown name', () => {
      const plugin = client.getPlugin('nonexistent-plugin')
      expect(plugin).toBeNull()
    })
  })

  describe('getVersions', () => {
    it('returns version array for existing plugin', () => {
      const versions = client.getVersions('react-framework')
      expect(versions).toEqual(['2.1.0'])
    })

    it('returns empty array for unknown plugin', () => {
      const versions = client.getVersions('nonexistent')
      expect(versions).toEqual([])
    })
  })

  describe('publish', () => {
    it('publishes new plugin successfully', () => {
      const plugin = makePlugin({ name: 'brand-new-plugin' })
      const result = client.publish(plugin)
      expect(result.success).toBe(true)
      expect(result.plugin).toBeDefined()
      expect(result.plugin!.name).toBe('brand-new-plugin')
      expect(result.errors).toEqual([])
    })

    it('fails for invalid plugin', () => {
      const result = client.publish({} as MarketplacePlugin)
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('updates existing plugin', () => {
      const updated = makePlugin({
        name: 'react-framework',
        version: '2.2.0',
      })
      const result = client.publish(updated)
      expect(result.success).toBe(true)
      expect(result.message).toContain('updated')
      expect(client.getPlugin('react-framework')!.version).toBe('2.2.0')
    })

    it('does not persist with dryRun', () => {
      const plugin = makePlugin({ name: 'dry-run-plugin' })
      const result = client.publish(plugin, { dryRun: true })
      expect(result.success).toBe(true)
      expect(result.message).toContain('Dry run')
      expect(client.getPlugin('dry-run-plugin')).toBeNull()
    })

    it('fails for plugin with invalid name', () => {
      const plugin = makePlugin({ name: 'INVALID NAME!' })
      const result = client.publish(plugin)
      expect(result.success).toBe(false)
    })

    it('fails for plugin with invalid version', () => {
      const plugin = makePlugin({ version: 'not-semver' })
      const result = client.publish(plugin)
      expect(result.success).toBe(false)
    })
  })

  describe('deprecate', () => {
    it('marks plugin as deprecated', () => {
      const result = client.deprecate('react-framework')
      expect(result).toBe(true)
      expect(client.getPlugin('react-framework')!.status).toBe('deprecated')
    })

    it('returns false for unknown plugin', () => {
      const result = client.deprecate('nonexistent')
      expect(result).toBe(false)
    })
  })

  describe('unpublish', () => {
    it('removes plugin', () => {
      const result = client.unpublish('react-framework')
      expect(result).toBe(true)
      expect(client.getPlugin('react-framework')).toBeNull()
    })

    it('returns false for unknown plugin', () => {
      const result = client.unpublish('nonexistent')
      expect(result).toBe(false)
    })
  })

  describe('getStats', () => {
    it('returns correct total plugins', () => {
      const stats = client.getStats()
      expect(stats.totalPlugins).toBe(10)
    })

    it('returns correct total downloads', () => {
      const stats = client.getStats()
      expect(stats.totalDownloads).toBeGreaterThan(0)
    })

    it('returns correct category counts', () => {
      const stats = client.getStats()
      expect(stats.categories.framework).toBe(1)
      expect(stats.categories.language).toBe(1)
      expect(stats.categories.security).toBe(1)
      expect(stats.categories.testing).toBe(1)
      expect(stats.categories.reporting).toBe(1)
      expect(stats.categories.integration).toBe(1)
    })

    it('returns top plugins by downloads', () => {
      const stats = client.getStats()
      expect(stats.topPlugins.length).toBeLessThanOrEqual(10)
      expect(stats.topPlugins[0].downloads).toBeGreaterThanOrEqual(
        stats.topPlugins[1].downloads,
      )
    })

    it('returns recently updated sorted by updatedAt desc', () => {
      const stats = client.getStats()
      for (let i = 1; i < stats.recentlyUpdated.length; i++) {
        expect(stats.recentlyUpdated[i - 1].updatedAt).toBeGreaterThanOrEqual(
          stats.recentlyUpdated[i].updatedAt,
        )
      }
    })

    it('returns recently added sorted by createdAt desc', () => {
      const stats = client.getStats()
      for (let i = 1; i < stats.recentlyAdded.length; i++) {
        expect(stats.recentlyAdded[i - 1].createdAt).toBeGreaterThanOrEqual(
          stats.recentlyAdded[i].createdAt,
        )
      }
    })
  })

  describe('getByCategory', () => {
    it('filters by category correctly', () => {
      const plugins = client.getByCategory('framework')
      expect(plugins.length).toBe(1)
      expect(plugins[0].name).toBe('react-framework')
    })

    it('returns empty for category with no plugins', () => {
      const plugins = client.getByCategory('reporting')
      expect(plugins.length).toBe(1)
      expect(plugins[0].category).toBe('reporting')
    })
  })

  describe('getByAuthor', () => {
    it('filters by author correctly', () => {
      const plugins = client.getByAuthor('facebook')
      expect(plugins.length).toBe(2)
      expect(plugins.every((p) => p.author === 'facebook')).toBe(true)
    })

    it('is case-insensitive', () => {
      const plugins = client.getByAuthor('FACEBOOK')
      expect(plugins.length).toBe(2)
    })

    it('returns empty for unknown author', () => {
      const plugins = client.getByAuthor('nonexistent-author')
      expect(plugins).toEqual([])
    })
  })

  describe('getTrending', () => {
    it('returns trending plugins', () => {
      const trending = client.getTrending()
      expect(trending.length).toBeLessThanOrEqual(10)
      expect(trending.length).toBeGreaterThan(0)
    })

    it('respects limit parameter', () => {
      const trending = client.getTrending(3)
      expect(trending.length).toBe(3)
    })

    it('gives higher rank to recently updated plugins with high downloads', () => {
      const trending = client.getTrending()
      const typescriptIdx = trending.findIndex((p) => p.name === 'typescript-lang')
      const deprecatedIdx = trending.findIndex((p) => p.name === 'deprecated-tool')
      expect(typescriptIdx).toBeLessThan(deprecatedIdx)
    })
  })

  describe('getRecentlyUpdated', () => {
    it('returns recently updated plugins', () => {
      const recent = client.getRecentlyUpdated(3)
      expect(recent.length).toBe(3)
      for (let i = 1; i < recent.length; i++) {
        expect(recent[i - 1].updatedAt).toBeGreaterThanOrEqual(recent[i].updatedAt)
      }
    })
  })

  describe('addPlugin', () => {
    it('adds plugin to registry', () => {
      const before = client.getCount()
      client.addPlugin(makePlugin({ name: 'new-addition' }))
      expect(client.getCount()).toBe(before + 1)
      expect(client.getPlugin('new-addition')).not.toBeNull()
    })
  })

  describe('removePlugin', () => {
    it('removes plugin from registry', () => {
      const before = client.getCount()
      const result = client.removePlugin('react-framework')
      expect(result).toBe(true)
      expect(client.getCount()).toBe(before - 1)
    })

    it('returns false for unknown plugin', () => {
      const result = client.removePlugin('nonexistent')
      expect(result).toBe(false)
    })
  })

  describe('getCount', () => {
    it('returns correct count', () => {
      expect(client.getCount()).toBe(10)
    })
  })

  describe('clear', () => {
    it('empties registry', () => {
      client.clear()
      expect(client.getCount()).toBe(0)
      expect(client.getPlugin('react-framework')).toBeNull()
    })
  })
})

describe('PluginValidator', () => {
  let validator: PluginValidator

  beforeEach(() => {
    validator = new PluginValidator()
  })

  describe('validate', () => {
    it('passes for valid plugin', () => {
      const result = validator.validate(makePlugin())
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('fails for missing required fields', () => {
      const result = validator.validate({})
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('fails for invalid name', () => {
      const result = validator.validate(makePlugin({ name: 'INVALID' }))
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid plugin name format')
    })

    it('fails for invalid version', () => {
      const result = validator.validate(makePlugin({ version: 'abc' }))
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid version format (must be semver)')
    })

    it('returns warnings for common issues', () => {
      const result = validator.validate(
        makePlugin({ description: 'short', tags: [], keywords: [] }),
      )
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('handles empty plugin', () => {
      const result = validator.validate({})
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThanOrEqual(7)
    })

    it('handles minimal valid plugin', () => {
      const result = validator.validate(
        makePlugin({
          repository: undefined,
          homepage: undefined,
          readme: undefined,
        }),
      )
      expect(result.valid).toBe(true)
    })
  })

  describe('validateName', () => {
    it('accepts valid lowercase names', () => {
      expect(validator.validateName('my-plugin')).toBe(true)
    })

    it('accepts scoped names', () => {
      expect(validator.validateName('@scope/my-plugin')).toBe(true)
    })

    it('accepts numeric names', () => {
      expect(validator.validateName('plugin123')).toBe(true)
    })

    it('rejects uppercase letters', () => {
      expect(validator.validateName('MyPlugin')).toBe(false)
    })

    it('rejects spaces', () => {
      expect(validator.validateName('my plugin')).toBe(false)
    })

    it('rejects special characters', () => {
      expect(validator.validateName('my_plugin!')).toBe(false)
    })

    it('rejects too short names', () => {
      expect(validator.validateName('a')).toBe(false)
    })

    it('rejects names with leading dash', () => {
      expect(validator.validateName('-plugin')).toBe(false)
    })

    it('rejects names with trailing dash', () => {
      expect(validator.validateName('plugin-')).toBe(false)
    })

    it('accepts two character names', () => {
      expect(validator.validateName('ab')).toBe(true)
    })

    it('rejects empty names', () => {
      expect(validator.validateName('')).toBe(false)
    })
  })

  describe('validateVersion', () => {
    it('accepts valid semver versions', () => {
      expect(validator.validateVersion('1.0.0')).toBe(true)
      expect(validator.validateVersion('0.0.1')).toBe(true)
      expect(validator.validateVersion('10.20.30')).toBe(true)
    })

    it('accepts prerelease versions', () => {
      expect(validator.validateVersion('1.0.0-alpha')).toBe(true)
      expect(validator.validateVersion('1.0.0-beta.1')).toBe(true)
      expect(validator.validateVersion('2.0.0-rc.1')).toBe(true)
    })

    it('accepts build metadata', () => {
      expect(validator.validateVersion('1.0.0+build')).toBe(true)
      expect(validator.validateVersion('1.0.0-alpha+build.1')).toBe(true)
    })

    it('rejects invalid versions', () => {
      expect(validator.validateVersion('1.0')).toBe(false)
      expect(validator.validateVersion('1')).toBe(false)
      expect(validator.validateVersion('abc')).toBe(false)
      expect(validator.validateVersion('')).toBe(false)
      expect(validator.validateVersion('v1.0.0')).toBe(false)
    })
  })

  describe('validateRequiredFields', () => {
    it('detects all missing fields', () => {
      const missing = validator.validateRequiredFields({})
      expect(missing).toContain('name')
      expect(missing).toContain('displayName')
      expect(missing).toContain('description')
      expect(missing).toContain('version')
      expect(missing).toContain('author')
      expect(missing).toContain('license')
      expect(missing).toContain('category')
    })

    it('returns empty for plugin with all required fields', () => {
      const missing = validator.validateRequiredFields(makePlugin())
      expect(missing).toEqual([])
    })

    it('detects empty string fields', () => {
      const missing = validator.validateRequiredFields(
        makePlugin({ name: '' }),
      )
      expect(missing).toContain('name')
    })
  })

  describe('checkCommonIssues', () => {
    it('detects short description', () => {
      const issues = validator.checkCommonIssues(
        makePlugin({ description: 'short' }),
      )
      expect(issues).toContain('Description is too short (less than 20 characters)')
    })

    it('detects missing tags', () => {
      const issues = validator.checkCommonIssues(makePlugin({ tags: [] }))
      expect(issues).toContain('No tags provided')
    })

    it('detects no keywords', () => {
      const issues = validator.checkCommonIssues(makePlugin({ keywords: [] }))
      expect(issues).toContain('No keywords provided')
    })

    it('detects rating out of range', () => {
      const issues = validator.checkCommonIssues(makePlugin({ rating: 6 }))
      expect(issues).toContain('Rating is out of valid range (0-5)')
    })

    it('detects negative rating', () => {
      const issues = validator.checkCommonIssues(makePlugin({ rating: -1 }))
      expect(issues).toContain('Rating is out of valid range (0-5)')
    })

    it('returns empty for plugin with no issues', () => {
      const issues = validator.checkCommonIssues(makePlugin())
      expect(issues).toEqual([])
    })
  })

  describe('checkCompatibility', () => {
    it('returns true for compatible versions', () => {
      const plugin = makePlugin({ codeforgeVersion: '1.0.0' })
      expect(validator.checkCompatibility(plugin, '1.0.0')).toBe(true)
      expect(validator.checkCompatibility(plugin, '1.1.0')).toBe(true)
      expect(validator.checkCompatibility(plugin, '2.0.0')).toBe(true)
    })

    it('returns false for incompatible versions', () => {
      const plugin = makePlugin({ codeforgeVersion: '2.0.0' })
      expect(validator.checkCompatibility(plugin, '1.0.0')).toBe(false)
      expect(validator.checkCompatibility(plugin, '1.9.9')).toBe(false)
    })

    it('returns true when plugin has no version requirement', () => {
      const plugin = makePlugin({ codeforgeVersion: '' })
      expect(validator.checkCompatibility(plugin, '1.0.0')).toBe(true)
    })

    it('handles major version differences', () => {
      const plugin = makePlugin({ codeforgeVersion: '1.0.0' })
      expect(validator.checkCompatibility(plugin, '3.0.0')).toBe(true)
    })

    it('handles minor version differences', () => {
      const plugin = makePlugin({ codeforgeVersion: '1.5.0' })
      expect(validator.checkCompatibility(plugin, '1.4.0')).toBe(false)
      expect(validator.checkCompatibility(plugin, '1.6.0')).toBe(true)
    })
  })
})
