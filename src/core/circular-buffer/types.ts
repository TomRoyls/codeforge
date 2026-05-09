export interface CircularBufferOptions {
  capacity: number
  overwrite: boolean
}

export const DEFAULT_CIRCULAR_BUFFER_OPTIONS: CircularBufferOptions = {
  capacity: 8,
  overwrite: true,
}
