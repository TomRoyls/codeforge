import type { ShowcasePlugin, ShowcaseCollection, ShowcaseConfig, ShowcaseStatus } from './types.js'
import { DEFAULT_SHOWCASE_CONFIG } from './types.js'

export class ShowcaseManager {
  private plugins: Map<string, ShowcasePlugin>
  private collections: Map<string, ShowcaseCollection>
  private config: ShowcaseConfig

  constructor(config?: Partial<ShowcaseConfig>) {
    this.plugins = new Map()
    this.collections = new Map()
    this.config = { ...DEFAULT_SHOWCASE_CONFIG, ...config }
  }

  addPlugin(plugin: ShowcasePlugin): void {
    this.plugins.set(plugin.name, { ...plugin, showcaseStatus: [...plugin.showcaseStatus] })
  }

  removePlugin(name: string): boolean {
    return this.plugins.delete(name)
  }

  getPlugin(name: string): ShowcasePlugin | null {
    return this.plugins.get(name) ?? null
  }

  getFeatured(): ShowcasePlugin[] {
    return [...this.plugins.values()]
      .filter((p) => p.showcaseStatus.includes('featured'))
      .sort((a, b) => {
        if (b.reviewScore !== a.reviewScore) return b.reviewScore - a.reviewScore
        return b.downloads - a.downloads
      })
      .slice(0, this.config.maxFeatured)
  }

  getStaffPicks(): ShowcasePlugin[] {
    return [...this.plugins.values()]
      .filter((p) => p.showcaseStatus.includes('staff-pick'))
      .sort((a, b) => {
        const aHasReason = a.staffPickReason ? 1 : 0
        const bHasReason = b.staffPickReason ? 1 : 0
        if (bHasReason !== aHasReason) return bHasReason - aHasReason
        return b.reviewScore - a.reviewScore
      })
      .slice(0, this.config.maxStaffPicks)
  }

  getTrending(): ShowcasePlugin[] {
    return [...this.plugins.values()]
      .filter((p) => p.showcaseStatus.includes('trending'))
      .sort((a, b) => {
        const scoreA = a.downloads * 0.3 + a.reviewScore * 0.7
        const scoreB = b.downloads * 0.3 + b.reviewScore * 0.7
        return scoreB - scoreA
      })
      .slice(0, this.config.maxTrending)
  }

  getVerified(): ShowcasePlugin[] {
    return [...this.plugins.values()].filter((p) => p.showcaseStatus.includes('verified'))
  }

  getByStatus(status: ShowcaseStatus): ShowcasePlugin[] {
    return [...this.plugins.values()].filter((p) => p.showcaseStatus.includes(status))
  }

  featurePlugin(name: string, reason?: string): boolean {
    const plugin = this.plugins.get(name)
    if (!plugin) return false
    if (!plugin.showcaseStatus.includes('featured')) {
      plugin.showcaseStatus.push('featured')
    }
    plugin.featuredAt = Date.now()
    if (reason !== undefined) {
      plugin.staffPickReason = reason
    }
    return true
  }

  unfeaturePlugin(name: string): boolean {
    const plugin = this.plugins.get(name)
    if (!plugin) return false
    plugin.showcaseStatus = plugin.showcaseStatus.filter((s) => s !== 'featured')
    plugin.featuredAt = undefined
    return true
  }

  verifyPlugin(name: string): boolean {
    const plugin = this.plugins.get(name)
    if (!plugin) return false
    if (!plugin.showcaseStatus.includes('verified')) {
      plugin.showcaseStatus.push('verified')
    }
    plugin.verifiedAt = Date.now()
    return true
  }

  staffPick(name: string, reason: string): boolean {
    const plugin = this.plugins.get(name)
    if (!plugin) return false
    if (!plugin.showcaseStatus.includes('staff-pick')) {
      plugin.showcaseStatus.push('staff-pick')
    }
    plugin.staffPickReason = reason
    return true
  }

  createCollection(collection: ShowcaseCollection): void {
    this.collections.set(collection.id, { ...collection, plugins: [...collection.plugins] })
  }

  getCollection(id: string): ShowcaseCollection | null {
    return this.collections.get(id) ?? null
  }

  getCollections(): ShowcaseCollection[] {
    return [...this.collections.values()]
  }

  getFeaturedCollections(): ShowcaseCollection[] {
    return [...this.collections.values()].filter((c) => c.featured)
  }

  addToCollection(collectionId: string, pluginName: string): boolean {
    const collection = this.collections.get(collectionId)
    if (!collection) return false
    if (!collection.plugins.includes(pluginName)) {
      collection.plugins.push(pluginName)
      collection.updatedAt = Date.now()
    }
    return true
  }

  removeFromCollection(collectionId: string, pluginName: string): boolean {
    const collection = this.collections.get(collectionId)
    if (!collection) return false
    const idx = collection.plugins.indexOf(pluginName)
    if (idx === -1) return false
    collection.plugins.splice(idx, 1)
    collection.updatedAt = Date.now()
    return true
  }

  formatShowcase(): string {
    const lines: string[] = []

    const featured = this.getFeatured()
    if (featured.length > 0) {
      lines.push('=== Featured Plugins ===')
      for (const p of featured) {
        lines.push(`  ${p.name} - ${p.description}`)
        lines.push(`    Rating: ${p.reviewScore.toFixed(1)} | Downloads: ${p.downloads}`)
      }
      lines.push('')
    }

    const staffPicks = this.getStaffPicks()
    if (staffPicks.length > 0) {
      lines.push('=== Staff Picks ===')
      for (const p of staffPicks) {
        lines.push(`  ${p.name} - ${p.description}`)
        if (p.staffPickReason) {
          lines.push(`    Reason: ${p.staffPickReason}`)
        }
        lines.push(`    Rating: ${p.reviewScore.toFixed(1)} | Downloads: ${p.downloads}`)
      }
      lines.push('')
    }

    const trending = this.getTrending()
    if (trending.length > 0) {
      lines.push('=== Trending ===')
      for (const p of trending) {
        lines.push(`  ${p.name} - ${p.description}`)
        lines.push(`    Rating: ${p.reviewScore.toFixed(1)} | Downloads: ${p.downloads}`)
      }
      lines.push('')
    }

    const featuredCollections = this.getFeaturedCollections()
    if (featuredCollections.length > 0) {
      lines.push('=== Collections ===')
      for (const c of featuredCollections) {
        lines.push(`  ${c.name} - ${c.description}`)
        lines.push(`    Plugins: ${c.plugins.length}`)
      }
      lines.push('')
    }

    if (lines.length === 0) {
      return 'No showcase content available.'
    }

    return lines.join('\n').trimEnd()
  }

  getCount(): number {
    return this.plugins.size
  }

  clear(): void {
    this.plugins.clear()
    this.collections.clear()
  }
}
