export interface MultisetArrayOptions<T> {
  initialElements?: Iterable<T>
}

export const DEFAULT_MULTISET_ARRAY_OPTIONS: Required<MultisetArrayOptions<unknown>> = {
  initialElements: [] as unknown as Iterable<unknown>,
}
