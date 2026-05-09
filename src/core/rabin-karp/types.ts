export interface RabinKarpOptions {
  base: number
  modulus: number
}

export const DEFAULT_RABIN_KARP_OPTIONS: RabinKarpOptions = {
  base: 256,
  modulus: 101,
}
