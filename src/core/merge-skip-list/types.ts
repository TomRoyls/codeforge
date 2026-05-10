export interface MergeSkipListOptions {
  maxLevel?: number;
  probability?: number;
  comparator?: (a: number, b: number) => number;
}

export interface MergeSkipListStatistics {
  inserts: number;
  deletes: number;
  searches: number;
  merges: number;
  level: number;
}

export interface SkipNode {
  key: number;
  value: number | undefined;
  forward: (SkipNode | null)[];
}

export const DEFAULT_MERGE_SKIP_LIST_OPTIONS: Required<MergeSkipListOptions> = {
  maxLevel: 32,
  probability: 0.5,
  comparator: (a: number, b: number): number => a - b,
};
