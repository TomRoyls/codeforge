export interface Edge<V> {
  from: V
  to: V
  weight: number
}

export interface EdgeIndexed<V> extends Edge<V> {
  index: number
}

export interface MSTResult<V> {
  edges: Edge<V>[]
  totalWeight: number
  components: Map<V, V[]>
}

export interface RandomizedMSTOptions {
  seed?: number
}

export const DEFAULT_RANDOMIZED_MST_OPTIONS: RandomizedMSTOptions = {
  seed: undefined,
}
