export function bwtEncode(input: string): { transformed: string; originalIndex: number } {
  if (input === "") {
    return { transformed: "", originalIndex: 0 };
  }

  const n = input.length;
  const rotations: string[] = [];

  for (let i = 0; i < n; i++) {
    let rotation = "";
    for (let j = 0; j < n; j++) {
      rotation += input[(i + j) % n];
    }
    rotations.push(rotation);
  }

  const sorted = [...rotations];
  sorted.sort();

  const originalIndex = sorted.indexOf(rotations[0]);
  const transformed = sorted.map((s) => s[s.length - 1]).join("");

  return { transformed, originalIndex };
}

export function bwtDecode(transformed: string, originalIndex: number): string {
  if (transformed === "") {
    return "";
  }

  const length = transformed.length;
  const table: string[] = Array(length).fill("");

  for (let i = 0; i < length; i++) {
    for (let j = 0; j < length; j++) {
      table[j] = transformed[j] + table[j]!;
    }
    table.sort();
  }

  return table[originalIndex]!.slice(0, -1);
}

export class BurrowsWheeler {
  static encode(input: string): { transformed: string; originalIndex: number } {
    return bwtEncode(input);
  }

  static decode(transformed: string, originalIndex: number): string {
    return bwtDecode(transformed, originalIndex);
  }

  static getTransforms(input: string): string[] {
    return getTransforms(input);
  }
}

function getTransforms(input: string): string[] {
  const length = input.length;
  const transforms: string[] = [];

  for (let i = 0; i < length; i++) {
    transforms.push(input.slice(i) + input.slice(0, i));
  }

  return transforms;
}
