export const BUFFER_SIZE = 8

export type CatenableDequeNode<T> =
  | { readonly tag: 'leaf'; readonly front: number; readonly back: number; readonly buffer: readonly (T | undefined)[] }
  | { readonly tag: 'deep'; readonly frontBuffer: readonly (T | undefined)[]; readonly frontLen: number; readonly spine: CatenableDequeNode<T>; readonly backBuffer: readonly (T | undefined)[]; readonly backLen: number; readonly size: number }
  | { readonly tag: 'single'; readonly value: T }
  | { readonly tag: 'empty' }

export interface CatenableDequeStats {
  size: number
  depth: number
  leafCount: number
  nodeCount: number
}
