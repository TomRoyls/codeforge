export interface SkipNode<T> {
  key: number
  value: T
  forward: (SkipNode<T> | null)[]
}
