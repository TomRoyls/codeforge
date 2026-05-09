export type PersistentRopeNode =
  | { kind: 'leaf'; text: string }
  | { kind: 'internal'; left: PersistentRopeNode; right: PersistentRopeNode; length: number }

export const DEFAULT_LEAF_SIZE = 8
