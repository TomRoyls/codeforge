export interface MultiMapOptions {
  allowDuplicateValues?: boolean;
}

export interface MultiMapStatistics {
  keysAdded: number;
  keysRemoved: number;
  valuesAdded: number;
  valuesRemoved: number;
}

export const DEFAULT_MULTI_MAP_OPTIONS: MultiMapOptions = {
  allowDuplicateValues: false,
};
