export interface GrowOnlySetOptions {
  id?: string;
}

export interface GrowOnlySetStatistics {
  adds: number;
  merges: number;
  size: number;
}

export const DEFAULT_GROW_ONLY_SET_OPTIONS: GrowOnlySetOptions = {
  id: undefined,
};
