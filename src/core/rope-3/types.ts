export const DEFAULT_LEAF_SIZE = 64

export interface Rope3Options {
  leafSize?: number
}

export type RopeNode =
  | { readonly tag: 'leaf'; readonly text: string }
  | { readonly tag: 'node'; readonly left: RopeNode; readonly right: RopeNode; readonly len: number; readonly height: number }
