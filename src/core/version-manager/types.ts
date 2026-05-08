export interface SemVer {
  major: number
  minor: number
  patch: number
  prerelease: string[]
  build: string[]
}

export type BumpType =
  | 'major'
  | 'minor'
  | 'patch'
  | 'premajor'
  | 'preminor'
  | 'prepatch'
  | 'prerelease'

export interface VersionConstraint {
  operator: '=' | '>' | '>=' | '<' | '<=' | '^' | '~' | 'x'
  version: SemVer
}

export interface VersionRange {
  min: SemVer | null
  max: SemVer | null
  minInclusive: boolean
  maxInclusive: boolean
}
