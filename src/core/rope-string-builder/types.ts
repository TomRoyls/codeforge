export interface RopeStringBuilderOptions {
  leafSize: number
}

export const DEFAULT_LEAF_SIZE = 64

export interface RopeStringBuilderStats {
  length: number
  nodeCount: number
  leafCount: number
  depth: number
}

type BuilderNode =
  | { kind: 'leaf'; text: string }
  | { kind: 'internal'; left: BuilderNode; right: BuilderNode; length: number }

export type { BuilderNode }
