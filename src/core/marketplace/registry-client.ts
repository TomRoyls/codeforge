import type {
  MarketplaceConfig,
  MarketplacePlugin,
  PluginCategory,
  PublishOptions,
  PublishResult,
  RegistryStats,
  SearchOptions,
  SearchResult,
} from './types.js'
import { DEFAULT_MARKETPLACE_CONFIG } from './types.js'
import { PluginValidator } from './plugin-validator.js'
import { sortedByDesc } from '../../utils/array-helpers.js'

const FIELD_WEIGHTS: Record<string, number> = {
  name: 10,
  displayName: 8,
  description: 5,
  tags: 7,
  keywords: 6,
}

export class RegistryClient {
  private plugins: Map<string, MarketplacePlugin>
  private config: MarketplaceConfig
  private validator: PluginValidator

  constructor(config?: Partial<MarketplaceConfig>) {
    this.plugins = new Map()
    this.config = { ...DEFAULT_MARKETPLACE_CONFIG, ...config }
    this.validator = new PluginValidator()
  }

  search(options: SearchOptions): SearchResult[] {
    let candidates = Array.from(this.plugins.values())

    if (options.status !== undefined) {
      candidates = candidates.filter((p) => p.status === options.status)
    }

    if (options.category !== undefined) {
      candidates = candidates.filter((p) => p.category === options.category)
    }

    if (options.author !== undefined) {
      candidates = candidates.filter(
        (p) => p.author.toLowerCase() === options.author!.toLowerCase(),
      )
    }

    if (options.tags !== undefined && options.tags.length > 0) {
      candidates = candidates.filter((p) =>
        options.tags!.some((t) =>
          p.tags.some((pt) => pt.toLowerCase() === t.toLowerCase()),
        ),
      )
    }

    if (options.minRating !== undefined) {
      candidates = candidates.filter((p) => p.rating >= options.minRating!)
    }

    let results: SearchResult[]

    if (options.query !== undefined && options.query.length > 0) {
      const query = options.query.toLowerCase()
      results = []

      for (const plugin of candidates) {
        let score = 0
        const matchedFields: string[] = []

        const fieldValues: Record<string, string | string[]> = {
          name: plugin.name,
          displayName: plugin.displayName,
          description: plugin.description,
          tags: plugin.tags,
          keywords: plugin.keywords,
        }

        for (const [field, value] of Object.entries(fieldValues)) {
          const weight = FIELD_WEIGHTS[field] ?? 1
          if (Array.isArray(value)) {
            const matched = value.some(
              (v) => v.toLowerCase().includes(query),
            )
            if (matched) {
              score += weight
              matchedFields.push(field)
            }
          } else {
            if (value.toLowerCase().includes(query)) {
              score += weight
              matchedFields.push(field)
            }
          }
        }

        if (score > 0) {
          results.push({ plugin, score, matchedFields })
        }
      }
    } else {
      results = candidates.map((plugin) => ({
        plugin,
        score: 0,
        matchedFields: [],
      }))
    }

    const sortBy = options.sortBy ?? 'downloads'
    const sortOrder = options.sortOrder ?? 'desc'

    results.sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'downloads':
          cmp = a.plugin.downloads - b.plugin.downloads
          break
        case 'rating':
          cmp = a.plugin.rating - b.plugin.rating
          break
        case 'updated':
          cmp = a.plugin.updatedAt - b.plugin.updatedAt
          break
        case 'name':
          cmp = a.plugin.name.localeCompare(b.plugin.name)
          break
      }
      return sortOrder === 'desc' ? -cmp : cmp
    })

    const offset = options.offset ?? 0
    const limit = options.limit ?? this.config.maxResults

    return results.slice(offset, offset + limit)
  }

  getPlugin(name: string): MarketplacePlugin | null {
    return this.plugins.get(name) ?? null
  }

  getVersions(name: string): string[] {
    const plugin = this.plugins.get(name)
    if (!plugin) return []
    return [plugin.version]
  }

  publish(
    plugin: MarketplacePlugin,
    options?: PublishOptions,
  ): PublishResult {
    const validation = this.validator.validate(plugin)

    if (!validation.valid) {
      return {
        success: false,
        message: 'Plugin validation failed',
        warnings: validation.warnings,
        errors: validation.errors,
      }
    }

    if (options?.dryRun) {
      return {
        success: true,
        message: 'Dry run: plugin would be published successfully',
        plugin,
        warnings: validation.warnings,
        errors: [],
      }
    }

    const existing = this.plugins.get(plugin.name)
    if (existing) {
      const updated = { ...plugin, updatedAt: Date.now() }
      this.plugins.set(plugin.name, updated)
      return {
        success: true,
        message: `Plugin ${plugin.name} updated to version ${plugin.version}`,
        plugin: updated,
        warnings: validation.warnings,
        errors: [],
      }
    }

    const now = Date.now()
    const newPlugin = {
      ...plugin,
      createdAt: plugin.createdAt || now,
      updatedAt: now,
    }
    this.plugins.set(plugin.name, newPlugin)

    return {
      success: true,
      message: `Plugin ${plugin.name} published successfully`,
      plugin: newPlugin,
      warnings: validation.warnings,
      errors: [],
    }
  }

  deprecate(name: string, _message?: string): boolean {
    const plugin = this.plugins.get(name)
    if (!plugin) return false
    plugin.status = 'deprecated'
    plugin.updatedAt = Date.now()
    return true
  }

  unpublish(name: string): boolean {
    return this.plugins.delete(name)
  }

  getStats(): RegistryStats {
    const all = Array.from(this.plugins.values())
    const categories = {} as Record<PluginCategory, number>

    const categoryValues: PluginCategory[] = [
      'framework',
      'language',
      'security',
      'performance',
      'testing',
      'reporting',
      'integration',
      'utility',
    ]
    for (const cat of categoryValues) {
      categories[cat] = 0
    }

    let totalDownloads = 0
    for (const plugin of all) {
      totalDownloads += plugin.downloads
      categories[plugin.category] = (categories[plugin.category] ?? 0) + 1
    }

    const topPlugins = sortedByDesc(all, p => p.downloads)
      .slice(0, 10)

    const recentlyUpdated = sortedByDesc(all, p => p.updatedAt)
      .slice(0, 10)

    const recentlyAdded = sortedByDesc(all, p => p.createdAt)
      .slice(0, 10)

    return {
      totalPlugins: all.length,
      totalDownloads,
      categories,
      topPlugins,
      recentlyUpdated,
      recentlyAdded,
    }
  }

  getByCategory(category: PluginCategory): MarketplacePlugin[] {
    return Array.from(this.plugins.values()).filter(
      (p) => p.category === category,
    )
  }

  getByAuthor(author: string): MarketplacePlugin[] {
    return Array.from(this.plugins.values()).filter(
      (p) => p.author.toLowerCase() === author.toLowerCase(),
    )
  }

  getTrending(limit?: number): MarketplacePlugin[] {
    const now = Date.now()
    const thirtyDays = 30 * 24 * 60 * 60 * 1000

    const all = Array.from(this.plugins.values())

    const scored = all.map((plugin) => {
      const recencyBonus =
        plugin.updatedAt > now - thirtyDays
          ? 1 - (now - plugin.updatedAt) / thirtyDays
          : 0

      const score =
        plugin.downloads * 0.3 +
        plugin.rating * plugin.ratingCount * 0.4 +
        recencyBonus * 1000000 * 0.3

      return { plugin, score }
    })

    return sortedByDesc(scored, s => s.score)
      .slice(0, limit ?? 10)
      .map((s) => s.plugin)
  }

  getRecentlyUpdated(limit?: number): MarketplacePlugin[] {
    return sortedByDesc(Array.from(this.plugins.values()), p => p.updatedAt)
      .slice(0, limit ?? 10)
  }

  addPlugin(plugin: MarketplacePlugin): void {
    this.plugins.set(plugin.name, plugin)
  }

  removePlugin(name: string): boolean {
    return this.plugins.delete(name)
  }

  getCount(): number {
    return this.plugins.size
  }

  clear(): void {
    this.plugins.clear()
  }
}
