export interface SemVer {
  major: number
  minor: number
  patch: number
  prerelease?: string
}

export interface VersionConstraint {
  min?: SemVer
  max?: SemVer
  range: string
}

export interface PluginManifest {
  name: string
  version: string
  codeforgeVersion: string
  description: string
  main: string
  dependencies: Record<string, string>
  peerDependencies?: Record<string, string>
  keywords?: string[]
  author?: string
  license?: string
}

export interface DependencyGraph {
  plugins: Map<string, PluginManifest>
  edges: Map<string, Set<string>>
}

export interface ResolutionResult {
  resolved: Map<string, PluginManifest>
  conflicts: Array<{ plugin: string; constraint1: string; constraint2: string }>
  missing: Array<{ plugin: string; requiredBy: string; constraint: string }>
  valid: boolean
}

export interface VersionCheckResult {
  compatible: boolean
  pluginVersion: SemVer
  constraint: VersionConstraint
  message: string
}
