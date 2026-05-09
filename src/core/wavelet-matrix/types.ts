export interface BitVectorData {
  bits: Uint32Array;
  blocks: Uint32Array;
  length: number;
}

export interface WaveletMatrixLevel {
  bitVector: BitVectorData;
  zeroCount: number;
}

export interface RangeResult {
  value: number;
  count: number;
  positions: number[];
}
