export interface RunLengthMapOptions {
  mergeOnSet?: boolean
}

export interface Run<V> {
  start: number
  end: number
  value: V
}

export const DEFAULT_RUN_LENGTH_MAP_OPTIONS: Required<RunLengthMapOptions> = {
  mergeOnSet: true,
}
