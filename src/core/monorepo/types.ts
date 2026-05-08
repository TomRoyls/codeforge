export interface WorkspacePackage {
  name: string
  path: string
  version: string
  dependencies: string[]
  devDependencies: string[]
  peerDependencies: string[]
  scripts: Record<string, string>
  private: boolean
}

export type WorkspaceType =
  | 'npm'
  | 'yarn'
  | 'pnpm'
  | 'lerna'
  | 'rush'
  | 'turborepo'
  | 'nx'
  | 'unknown'

export interface WorkspaceConfig {
  type: WorkspaceType
  rootPath: string
  packages: string[]
}

export interface PackageEdge {
  from: string
  to: string
  type: 'dependency' | 'devDependency' | 'peerDependency'
  version: string
}

export interface DependencyGraph {
  packages: Map<string, WorkspacePackage>
  edges: PackageEdge[]
  circular: string[][]
}

export interface PackageRank {
  name: string
  dependents: number
}

export interface VersionMismatch {
  dependency: string
  versions: Map<string, string[]>
}

export interface MonorepoHealth {
  totalPackages: number
  outdatedDeps: number
  circularDeps: number
  privatePackages: number
  publicPackages: number
  avgDepsPerPackage: number
  topDepended: PackageRank[]
  inconsistentVersions: VersionMismatch[]
}

export interface PackageHealth {
  packageName: string
  dependencyCount: number
  dependentCount: number
  hasCircular: boolean
  outdatedCount: number
  score: number
}

export interface MonorepoReport {
  workspace: WorkspaceConfig
  packages: WorkspacePackage[]
  graph: DependencyGraph
  health: MonorepoHealth
}
