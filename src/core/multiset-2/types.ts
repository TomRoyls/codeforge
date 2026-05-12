export type MultisetEntry<T> = [T, number]

export interface MultisetOptions<T> {
  elements?: T[]
  entries?: MultisetEntry<T>[]
}
