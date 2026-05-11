export type RopeNode = string | { left: RopeNode; right: RopeNode; length: number }

export interface RopeOptions {
  leafMaxSize: number
}

export interface RopeStats {
  nodeCount: number
  height: number
  isBalanced: boolean
  leafCount: number
}

export const DEFAULT_ROPE_OPTIONS: RopeOptions = {
  leafMaxSize: 8,
}
