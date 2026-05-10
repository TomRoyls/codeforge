export interface WaveletQueueOptions<T = string | number> {
  alphabet?: T[]
  alphabetSize?: number
  rebuildThreshold?: number
}
