export interface PackageVersion {
  major: number
  minor: number
  patch: number
  prerelease: string[]
  build: string[]
  raw: string
}

export interface VersionRange {
  raw: string
  minVersion: PackageVersion | null
  maxVersion: PackageVersion | null
  includesMin: boolean
  includesMax: boolean
}

export interface DependencyInfo {
  name: string
  currentVersion: string
  latestVersion: string
  wantedVersion: string
  type: 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies'
  isOutdated: boolean
  isDeprecated: boolean
  isVulnerable: boolean
  releaseDate?: string
}

export interface UpdatePlan {
  updates: UpdateEntry[]
  conflicts: UpdateConflict[]
  totalUpdates: number
  breakingChanges: number
}

export interface UpdateEntry {
  dependency: DependencyInfo
  updateType: 'major' | 'minor' | 'patch' | 'prerelease'
  isBreaking: boolean
  riskLevel: 'low' | 'medium' | 'high'
  changelogUrl?: string
}

export interface UpdateConflict {
  dependency: string
  conflictingVersions: string[]
  resolution?: string
}

export interface LockfileEntry {
  name: string
  version: string
  resolved: string
  integrity: string
  dependencies: Map<string, string>
}

export interface LockfileAnalysis {
  totalPackages: number
  directDependencies: number
  transitiveDependencies: number
  duplicates: Map<string, string[]>
  outdated: DependencyInfo[]
  size: number
}
