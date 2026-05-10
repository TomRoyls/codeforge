export interface TSTNode<T = unknown> {
  char: string
  value: T | undefined
  isEnd: boolean
  left: TSTNode<T> | null
  middle: TSTNode<T> | null
  right: TSTNode<T> | null
}
