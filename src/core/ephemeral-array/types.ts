export type { EphemeralArray } from './index.js'

export type VersionId = number

export type VersionNode<T> = {
  readonly id: VersionId
  readonly parentId: VersionId | null
  readonly deltas: ReadonlyMap<number, T>
}

export type EphemeralArrayOptions<T> = {
  initial?: T[]
  size?: number
  defaultValue?: T
}
