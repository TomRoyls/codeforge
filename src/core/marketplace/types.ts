export type PluginStatus = 'active' | 'deprecated' | 'unpublished' | 'flagged'

export type PluginCategory =
  | 'framework'
  | 'language'
  | 'security'
  | 'performance'
  | 'testing'
  | 'reporting'
  | 'integration'
  | 'utility'

export interface MarketplacePlugin {
  name: string
  displayName: string
  description: string
  version: string
  author: string
  license: string
  repository?: string
  homepage?: string
  category: PluginCategory
  tags: string[]
  status: PluginStatus
  downloads: number
  rating: number
  ratingCount: number
  createdAt: number
  updatedAt: number
  codeforgeVersion: string
  dependencies: Record<string, string>
  keywords: string[]
  size: number
  readme?: string
}

export interface SearchResult {
  plugin: MarketplacePlugin
  score: number
  matchedFields: string[]
}

export interface SearchOptions {
  query?: string
  category?: PluginCategory
  tags?: string[]
  author?: string
  sortBy?: 'downloads' | 'rating' | 'updated' | 'name'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
  minRating?: number
  status?: PluginStatus
}

export interface PublishOptions {
  name: string
  version: string
  tarballPath?: string
  dryRun?: boolean
}

export interface PublishResult {
  success: boolean
  message: string
  plugin?: MarketplacePlugin
  warnings: string[]
  errors: string[]
}

export interface RegistryStats {
  totalPlugins: number
  totalDownloads: number
  categories: Record<PluginCategory, number>
  topPlugins: MarketplacePlugin[]
  recentlyUpdated: MarketplacePlugin[]
  recentlyAdded: MarketplacePlugin[]
}

export interface PluginValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface MarketplaceConfig {
  registryUrl: string
  cacheTtl: number
  maxResults: number
  verifySignatures: boolean
}

export const DEFAULT_MARKETPLACE_CONFIG: MarketplaceConfig = {
  registryUrl: 'https://registry.codeforge.dev',
  cacheTtl: 300000,
  maxResults: 50,
  verifySignatures: false,
}
