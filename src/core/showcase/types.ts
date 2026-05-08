import type { MarketplacePlugin } from '../marketplace/types.js'

export type ShowcaseStatus = 'featured' | 'verified' | 'community' | 'staff-pick' | 'trending'

export interface ShowcasePlugin extends MarketplacePlugin {
  showcaseStatus: ShowcaseStatus[]
  featuredAt?: number
  verifiedAt?: number
  staffPickReason?: string
  reviewScore: number
  reviewCount: number
  installationCommand: string
  exampleUsage?: string
}

export interface ShowcaseCollection {
  id: string
  name: string
  description: string
  plugins: string[]
  tags: string[]
  curator: string
  createdAt: number
  updatedAt: number
  featured: boolean
}

export interface ShowcaseCategory {
  id: string
  name: string
  description: string
  icon?: string
  pluginCount: number
  subcategories: ShowcaseSubcategory[]
}

export interface ShowcaseSubcategory {
  id: string
  name: string
  pluginCount: number
}

export interface ShowcaseConfig {
  maxFeatured: number
  maxStaffPicks: number
  maxTrending: number
  minReviewScore: number
  minReviews: number
}

export const DEFAULT_SHOWCASE_CONFIG: ShowcaseConfig = {
  maxFeatured: 10,
  maxStaffPicks: 5,
  maxTrending: 10,
  minReviewScore: 4.0,
  minReviews: 5,
}

export const SHOWCASE_CATEGORIES: ShowcaseCategory[] = [
  { id: 'framework', name: 'Framework Integration', description: 'Plugins for popular frameworks', icon: '🔗', pluginCount: 0, subcategories: [] },
  { id: 'language', name: 'Language Support', description: 'Multi-language analysis plugins', icon: '🌐', pluginCount: 0, subcategories: [] },
  { id: 'security', name: 'Security', description: 'Security analysis and vulnerability detection', icon: '🔒', pluginCount: 0, subcategories: [] },
  { id: 'performance', name: 'Performance', description: 'Performance optimization and profiling', icon: '⚡', pluginCount: 0, subcategories: [] },
  { id: 'reporting', name: 'Reporting', description: 'Custom reporters and output formats', icon: '📊', pluginCount: 0, subcategories: [] },
  { id: 'testing', name: 'Testing', description: 'Test quality and coverage plugins', icon: '🧪', pluginCount: 0, subcategories: [] },
  { id: 'integration', name: 'CI/CD Integration', description: 'Continuous integration plugins', icon: '🔄', pluginCount: 0, subcategories: [] },
  { id: 'utility', name: 'Utility', description: 'General-purpose utility plugins', icon: '🔧', pluginCount: 0, subcategories: [] },
]
