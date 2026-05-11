export type { SnapArray } from './index.js'

export type SnapArrayOptions<T> = {
  initial?: T[]
}

export type Snapshot<T> = {
  readonly data: readonly T[]
}
