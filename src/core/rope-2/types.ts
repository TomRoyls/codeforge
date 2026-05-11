export const DEFAULT_LEAF_SIZE = 8

export interface Rope2Options {
  leafSize?: number
}

export type Rope2Node =
  | { readonly tag: 'leaf'; readonly text: string }
  | { readonly tag: 'node'; readonly left: Rope2Node; readonly right: Rope2Node; readonly len: number }
