type Document = { id: string; tokens: Set<string>; signature: number[] };
type QueryResult = { id: string; similarity: number };

function hashWithSeed(value: string, seed: number): number {
  let h = seed ^ value.length;
  for (let i = 0; i < value.length; i++) {
    h = Math.imul(h ^ value.charCodeAt(i), 2654435761);
    h = ((h ^ (h >>> 16)) * 2246822507) >>> 0;
    h = ((h ^ (h >>> 13)) * 3266489909) >>> 0;
  }
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function tokenize(text: string): string[] {
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  const ngrams: string[] = [];
  const n = 3;

  for (const word of words) {
    for (let i = 0; i <= word.length - n; i++) {
      ngrams.push(word.slice(i, i + n));
    }
    if (word.length > 0) ngrams.push(word);
  }

  return ngrams;
}

function computeSignature(tokens: Set<string>, numHashes: number): number[] {
  const signature: number[] = [];
  for (let i = 0; i < numHashes; i++) {
    let minHash = 1;
    for (const token of tokens) {
      const hash = hashWithSeed(token, i);
      if (hash < minHash) {
        minHash = hash;
      }
    }
    signature.push(minHash);
  }
  return signature;
}

function estimateSimilarity(sig1: number[], sig2: number[]): number {
  let matches = 0;
  for (let i = 0; i < sig1.length; i++) {
    if (sig1[i] === sig2[i]) {
      matches++;
    }
  }
  return matches / sig1.length;
}

export class SimilaritySearch {
  private documents: Map<string, Document>;
  private numHashes: number;

  constructor(numHashes: number = 100) {
    if (numHashes < 1) {
      throw new Error('numHashes must be at least 1');
    }
    this.documents = new Map();
    this.numHashes = numHashes;
  }

  add(id: string, text: string): void {
    const tokens = new Set(tokenize(text));
    if (tokens.size === 0) {
      throw new Error('Text must contain at least one token');
    }
    const signature = computeSignature(tokens, this.numHashes);
    this.documents.set(id, { id, tokens, signature });
  }

  query(text: string, threshold: number = 0): QueryResult[] {
    const tokens = new Set(tokenize(text));
    if (tokens.size === 0) {
      throw new Error('Text must contain at least one token');
    }
    const signature = computeSignature(tokens, this.numHashes);

    const results: QueryResult[] = [];
    for (const doc of this.documents.values()) {
      const similarity = estimateSimilarity(signature, doc.signature);
      if (similarity > threshold) {
        results.push({ id: doc.id, similarity });
      }
    }

    return results.sort((a, b) => b.similarity - a.similarity);
  }

  static jaccardSimilarity(text1: string, text2: string): number {
    const tokens1 = new Set(tokenize(text1));
    const tokens2 = new Set(tokenize(text2));

    if (tokens1.size === 0 && tokens2.size === 0) {
      return 1;
    }

    const intersection = new Set<string>();
    for (const token of tokens1) {
      if (tokens2.has(token)) {
        intersection.add(token);
      }
    }

    const union = new Set([...tokens1, ...tokens2]);
    return intersection.size / union.size;
  }

  get size(): number {
    return this.documents.size;
  }

  isEmpty(): boolean {
    return this.documents.size === 0;
  }

  clear(): void {
    this.documents.clear();
  }

  toString(): string {
    return `SimilaritySearch({ size: ${this.size} })`
  }
}

export { tokenize, computeSignature, estimateSimilarity };
export type { Document, QueryResult };
