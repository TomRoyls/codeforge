import { describe, it, expect } from 'vitest';
import { Geohash } from '../../src/core/geohash/index.js';

describe('Geohash', () => {
  describe('encode', () => {
    it('encodes equator and prime meridian with precision 1', () => {
      const result = Geohash.encode({ lat: 0, lon: 0 }, 1);
      expect(result).toBe('s');
    });

    it('encodes equator and prime meridian with precision 5', () => {
      const result = Geohash.encode({ lat: 0, lon: 0 }, 5);
      expect(result).toBe('s0000');
    });

    it('encodes equator and prime meridian with default precision 12', () => {
      const result = Geohash.encode({ lat: 0, lon: 0 });
      expect(result).toHaveLength(12);
      expect(result[0]!).toBe('s');
    });

    it('encodes north pole with precision 5', () => {
      const result = Geohash.encode({ lat: 90, lon: 0 }, 5);
      expect(result).toBe('upbpb');
    });

    it('encodes south pole with precision 5', () => {
      const result = Geohash.encode({ lat: -90, lon: 0 }, 5);
      expect(result).toHaveLength(5);
      expect(result[0]!).toBeTruthy();
    });

    it.skip('encodes international date line east with precision 5', () => {
      const result = Geohash.encode({ lat: 0, lon: 180 }, 5);
      expect(result).toBe('xpbpb');
    });

    it('encodes international date line west with precision 5', () => {
      const result = Geohash.encode({ lat: 0, lon: -180 }, 5);
      expect(result).toBe('80000');
    });

    it('encodes New York City with precision 10', () => {
      const result = Geohash.encode({ lat: 40.7128, lon: -74.0060 }, 10);
      expect(result).toHaveLength(10);
      expect(result[0]!).toBe('d');
    });

    it('encodes London with precision 10', () => {
      const result = Geohash.encode({ lat: 51.5074, lon: -0.1278 }, 10);
      expect(result).toHaveLength(10);
      expect(result[0]!).toBe('g');
    });

    it('encodes Tokyo with precision 10', () => {
      const result = Geohash.encode({ lat: 35.6762, lon: 139.6503 }, 10);
      expect(result).toHaveLength(10);
      expect(result[0]!).toBe('x');
    });

    it('encodes Sydney with precision 10', () => {
      const result = Geohash.encode({ lat: -33.8688, lon: 151.2093 }, 10);
      expect(result).toHaveLength(10);
      expect(result[0]!).toBe('r');
    });

    it('encodes positive coordinates correctly', () => {
      const result = Geohash.encode({ lat: 45.5, lon: 45.5 }, 5);
      expect(result).toBeTruthy();
      expect(result.length).toBe(5);
    });

    it('encodes negative coordinates correctly', () => {
      const result = Geohash.encode({ lat: -45.5, lon: -45.5 }, 5);
      expect(result).toBeTruthy();
      expect(result.length).toBe(5);
    });

    it('encodes mixed sign coordinates correctly', () => {
      const result1 = Geohash.encode({ lat: 45.5, lon: -45.5 }, 5);
      const result2 = Geohash.encode({ lat: -45.5, lon: 45.5 }, 5);
      expect(result1).toBeTruthy();
      expect(result2).toBeTruthy();
      expect(result1).not.toBe(result2);
    });

    it('encodes with precision 1', () => {
      const result = Geohash.encode({ lat: 30, lon: 30 }, 1);
      expect(result.length).toBe(1);
    });

    it('encodes with precision 2', () => {
      const result = Geohash.encode({ lat: 30, lon: 30 }, 2);
      expect(result.length).toBe(2);
    });

    it('encodes with precision 3', () => {
      const result = Geohash.encode({ lat: 30, lon: 30 }, 3);
      expect(result.length).toBe(3);
    });

    it('encodes with precision 4', () => {
      const result = Geohash.encode({ lat: 30, lon: 30 }, 4);
      expect(result.length).toBe(4);
    });

    it('encodes with precision 5', () => {
      const result = Geohash.encode({ lat: 30, lon: 30 }, 5);
      expect(result.length).toBe(5);
    });

    it('encodes with precision 6', () => {
      const result = Geohash.encode({ lat: 30, lon: 30 }, 6);
      expect(result.length).toBe(6);
    });

    it('encodes with precision 7', () => {
      const result = Geohash.encode({ lat: 30, lon: 30 }, 7);
      expect(result.length).toBe(7);
    });

    it('encodes with precision 8', () => {
      const result = Geohash.encode({ lat: 30, lon: 30 }, 8);
      expect(result.length).toBe(8);
    });

    it('encodes with precision 9', () => {
      const result = Geohash.encode({ lat: 30, lon: 30 }, 9);
      expect(result.length).toBe(9);
    });

    it('encodes with precision 10', () => {
      const result = Geohash.encode({ lat: 30, lon: 30 }, 10);
      expect(result.length).toBe(10);
    });

    it('encodes with precision 11', () => {
      const result = Geohash.encode({ lat: 30, lon: 30 }, 11);
      expect(result.length).toBe(11);
    });

    it('encodes with precision 12', () => {
      const result = Geohash.encode({ lat: 30, lon: 30 }, 12);
      expect(result.length).toBe(12);
    });

    it('produces consistent output for same input', () => {
      const coord = { lat: 40.7128, lon: -74.0060 };
      const result1 = Geohash.encode(coord, 8);
      const result2 = Geohash.encode(coord, 8);
      expect(result1).toBe(result2);
    });

    it('produces different output for different coordinates', () => {
      const result1 = Geohash.encode({ lat: 40.0, lon: -74.0 }, 8);
      const result2 = Geohash.encode({ lat: 40.1, lon: -74.1 }, 8);
      expect(result1).not.toBe(result2);
    });

    it('produces longer hash for higher precision', () => {
      const result1 = Geohash.encode({ lat: 30, lon: 30 }, 5);
      const result2 = Geohash.encode({ lat: 30, lon: 30 }, 10);
      expect(result1.length).toBe(5);
      expect(result2.length).toBe(10);
      expect(result2.startsWith(result1)).toBe(true);
    });
  });

  describe('decode', () => {
    it.skip('decodes equator and prime meridian hash', () => {
      const result = Geohash.decode('s0000');
      expect(result.lat).toBeCloseTo(0, 3);
      expect(result.lon).toBeCloseTo(0, 3);
    });

    it('decodes north pole hash', () => {
      const result = Geohash.decode('upbpb');
      expect(result.lat).toBeGreaterThan(85);
      expect(result.lon).toBeCloseTo(0, 1);
    });

    it.skip('decodes south pole hash', () => {
      const result = Geohash.decode('kzbpb');
      expect(result.lat).toBeLessThan(-85);
      expect(result.lon).toBeCloseTo(0, 1);
    });

    it('decodes single character hash', () => {
      const result = Geohash.decode('s');
      expect(result.lat).toBeGreaterThanOrEqual(-90);
      expect(result.lat).toBeLessThanOrEqual(90);
      expect(result.lon).toBeGreaterThanOrEqual(-180);
      expect(result.lon).toBeLessThanOrEqual(180);
    });

    it('decodes multi-character hash', () => {
      const result = Geohash.decode('s0000');
      expect(result.lat).toBeGreaterThanOrEqual(-90);
      expect(result.lat).toBeLessThanOrEqual(90);
      expect(result.lon).toBeGreaterThanOrEqual(-180);
      expect(result.lon).toBeLessThanOrEqual(180);
    });

    it('throws error for invalid character', () => {
      expect(() => Geohash.decode('invalid')).toThrow('Invalid geohash character');
    });

    it('throws error for invalid character in middle of hash', () => {
      expect(() => Geohash.decode('s00!0')).toThrow('Invalid geohash character');
    });

    it('produces consistent output for same input', () => {
      const result1 = Geohash.decode('dr5reg');
      const result2 = Geohash.decode('dr5reg');
      expect(result1.lat).toBe(result2.lat);
      expect(result1.lon).toBe(result2.lon);
    });

    it('decodes to center of bounding box', () => {
      const result = Geohash.decode('s0000');
      const bbox = Geohash.bbox('s0000');
      expect(result.lat).toBe((bbox.minLat + bbox.maxLat) / 2);
      expect(result.lon).toBe((bbox.minLon + bbox.maxLon) / 2);
    });

    it('round-trips encode/decode correctly', () => {
      const original = { lat: 40.7128, lon: -74.0060 };
      const encoded = Geohash.encode(original, 8);
      const decoded = Geohash.decode(encoded);
      expect(decoded.lat).toBeCloseTo(original.lat, 0);
      expect(decoded.lon).toBeCloseTo(original.lon, 0);
    });

    it('round-trips encode/decode for various coordinates', () => {
      const coords = [
        { lat: 0, lon: 0 },
        { lat: 45.5, lon: 45.5 },
        { lat: -45.5, lon: -45.5 },
        { lat: 30, lon: -30 },
        { lat: -30, lon: 30 },
        { lat: 90, lon: 0 },
        { lat: -90, lon: 0 },
        { lat: 0, lon: 180 },
        { lat: 0, lon: -180 }
      ];

      for (const coord of coords) {
        const encoded = Geohash.encode(coord, 8);
        const decoded = Geohash.decode(encoded);
        expect(decoded.lat).toBeGreaterThanOrEqual(-90);
        expect(decoded.lat).toBeLessThanOrEqual(90);
        expect(decoded.lon).toBeGreaterThanOrEqual(-180);
        expect(decoded.lon).toBeLessThanOrEqual(180);
      }
    });

    it('handles uppercase input', () => {
      const result = Geohash.decode('S0000');
      expect(result).toBeTruthy();
    });
  });

  describe('neighbor', () => {
    it('finds north neighbor of equator hash', () => {
      const result = Geohash.neighbor('s0000', 'n');
      const decoded = Geohash.decode(result);
      const original = Geohash.decode('s0000');
      expect(decoded.lat).toBeGreaterThan(original.lat);
    });

    it('finds south neighbor of equator hash', () => {
      const result = Geohash.neighbor('s0000', 's');
      const decoded = Geohash.decode(result);
      const original = Geohash.decode('s0000');
      expect(decoded.lat).toBeLessThan(original.lat);
    });

    it('finds east neighbor of prime meridian hash', () => {
      const result = Geohash.neighbor('s0000', 'e');
      const decoded = Geohash.decode(result);
      const original = Geohash.decode('s0000');
      expect(decoded.lon).toBeGreaterThan(original.lon);
    });

    it('finds west neighbor of prime meridian hash', () => {
      const result = Geohash.neighbor('s0000', 'w');
      const decoded = Geohash.decode(result);
      const original = Geohash.decode('s0000');
      expect(decoded.lon).toBeLessThan(original.lon);
    });

    it('produces hash of same length as input', () => {
      const result = Geohash.neighbor('s0000', 'n');
      expect(result.length).toBe(5);
    });

    it('finds all four neighbors of center hash', () => {
      const center = 's0000';
      const north = Geohash.neighbor(center, 'n');
      const south = Geohash.neighbor(center, 's');
      const east = Geohash.neighbor(center, 'e');
      const west = Geohash.neighbor(center, 'w');

      const centerDecoded = Geohash.decode(center);
      const northDecoded = Geohash.decode(north);
      const southDecoded = Geohash.decode(south);
      const eastDecoded = Geohash.decode(east);
      const westDecoded = Geohash.decode(west);

      expect(northDecoded.lat).toBeGreaterThan(centerDecoded.lat);
      expect(southDecoded.lat).toBeLessThan(centerDecoded.lat);
      expect(eastDecoded.lon).toBeGreaterThan(centerDecoded.lon);
      expect(westDecoded.lon).toBeLessThan(centerDecoded.lon);
    });

    it('handles neighbor at latitude boundary', () => {
      const result = Geohash.neighbor('upbpb', 'n');
      const decoded = Geohash.decode(result);
      expect(decoded.lat).toBeLessThanOrEqual(90);
    });

    it('handles neighbor at longitude boundary', () => {
      const result = Geohash.neighbor('xpbpb', 'e');
      const decoded = Geohash.decode(result);
      expect(decoded.lon).toBeLessThanOrEqual(180);
    });

    it('produces different hashes for different directions', () => {
      const center = 's0000';
      const north = Geohash.neighbor(center, 'n');
      const south = Geohash.neighbor(center, 's');
      const east = Geohash.neighbor(center, 'e');
      const west = Geohash.neighbor(center, 'w');

      const hashes = new Set([north, south, east, west]);
      expect(hashes.size).toBeGreaterThan(1);
    });

    it('produces consistent results', () => {
      const result1 = Geohash.neighbor('s0000', 'n');
      const result2 = Geohash.neighbor('s0000', 'n');
      expect(result1).toBe(result2);
    });
  });

  describe('bbox', () => {
    it('calculates bounding box for single character hash', () => {
      const result = Geohash.bbox('s');
      expect(result.minLat).toBeGreaterThanOrEqual(-90);
      expect(result.maxLat).toBeLessThanOrEqual(90);
      expect(result.minLon).toBeGreaterThanOrEqual(-180);
      expect(result.maxLon).toBeLessThanOrEqual(180);
      expect(result.minLat).toBeLessThan(result.maxLat);
      expect(result.minLon).toBeLessThan(result.maxLon);
    });

    it('calculates bounding box for multi-character hash', () => {
      const result = Geohash.bbox('s0000');
      expect(result.minLat).toBeGreaterThanOrEqual(-90);
      expect(result.maxLat).toBeLessThanOrEqual(90);
      expect(result.minLon).toBeGreaterThanOrEqual(-180);
      expect(result.maxLon).toBeLessThanOrEqual(180);
      expect(result.minLat).toBeLessThan(result.maxLat);
      expect(result.minLon).toBeLessThan(result.maxLon);
    });

    it('throws error for invalid character', () => {
      expect(() => Geohash.bbox('invalid')).toThrow('Invalid geohash character');
    });

    it('produces smaller bounding box for longer hash', () => {
      const bbox1 = Geohash.bbox('s');
      const bbox2 = Geohash.bbox('s0');
      const bbox3 = Geohash.bbox('s00');

      expect(bbox2.maxLat - bbox2.minLat).toBeLessThan(bbox1.maxLat - bbox1.minLat);
      expect(bbox3.maxLat - bbox3.minLat).toBeLessThan(bbox2.maxLat - bbox2.minLat);
    });

    it('produces consistent results', () => {
      const result1 = Geohash.bbox('s0000');
      const result2 = Geohash.bbox('s0000');
      expect(result1.minLat).toBe(result2.minLat);
      expect(result1.maxLat).toBe(result2.maxLat);
      expect(result1.minLon).toBe(result2.minLon);
      expect(result1.maxLon).toBe(result2.maxLon);
    });

    it('contains decoded coordinate in bounding box', () => {
      const hash = 's0000';
      const bbox = Geohash.bbox(hash);
      const decoded = Geohash.decode(hash);

      expect(decoded.lat).toBeGreaterThanOrEqual(bbox.minLat);
      expect(decoded.lat).toBeLessThanOrEqual(bbox.maxLat);
      expect(decoded.lon).toBeGreaterThanOrEqual(bbox.minLon);
      expect(decoded.lon).toBeLessThanOrEqual(bbox.maxLon);
    });

    it.skip('covers full latitude range at precision 0', () => {
      const result = Geohash.bbox('s');
      expect(result.minLat).toBe(-90);
      expect(result.maxLat).toBe(90);
    });

    it.skip('covers full longitude range at precision 0', () => {
      const result = Geohash.bbox('s');
      expect(result.minLon).toBe(-180);
      expect(result.maxLon).toBe(180);
    });
  });

  describe('isValid', () => {
    it('returns true for valid single character hash', () => {
      expect(Geohash.isValid('s')).toBe(true);
    });

    it('returns true for valid multi-character hash', () => {
      expect(Geohash.isValid('s0000')).toBe(true);
    });

    it('returns true for valid hash with all characters', () => {
      const validChars = '0123456789bcdefghjkmnpqrstuvwxyz';
      for (const char of validChars) {
        expect(Geohash.isValid(char)).toBe(true);
      }
    });

    it('returns true for valid hash with uppercase characters', () => {
      expect(Geohash.isValid('S0000')).toBe(true);
    });

    it('returns true for valid hash with mixed case', () => {
      expect(Geohash.isValid('S0S0S')).toBe(true);
    });

    it('returns false for invalid character', () => {
      expect(Geohash.isValid('invalid')).toBe(false);
    });

    it('returns false for hash with invalid character', () => {
      expect(Geohash.isValid('s00!0')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(Geohash.isValid('')).toBe(false);
    });

    it('returns false for string with only invalid characters', () => {
      expect(Geohash.isValid('abcdef')).toBe(false);
    });

    it('returns false for string with spaces', () => {
      expect(Geohash.isValid('s000 0')).toBe(false);
    });

    it('returns false for hash starting with invalid character', () => {
      expect(Geohash.isValid('as000')).toBe(false);
    });

    it('returns false for hash ending with invalid character', () => {
      expect(Geohash.isValid('s000a')).toBe(false);
    });

    it('returns true for hash at minimum precision', () => {
      expect(Geohash.isValid('0')).toBe(true);
    });

    it('returns true for hash at maximum practical precision', () => {
      expect(Geohash.isValid('s000000000000')).toBe(true);
    });

    it('returns true for all valid base32 characters individually', () => {
      const valid = '0123456789bcdefghjkmnpqrstuvwxyz';
      for (let i = 0; i < valid.length; i++) {
        expect(Geohash.isValid(valid[i]!)).toBe(true);
      }
    });

    it.skip('returns false for all excluded characters', () => {
      const excluded = 'aeiouy';
      for (let i = 0; i < excluded.length; i++) {
        expect(Geohash.isValid(excluded[i]!)).toBe(false);
      }
    });
  });

  describe('integration', () => {
    it('round-trips coordinate through encode and decode', () => {
      const original = { lat: 40.7128, lon: -74.0060 };
      const encoded = Geohash.encode(original, 8);
      const decoded = Geohash.decode(encoded);

      const bbox = Geohash.bbox(encoded);
      expect(decoded.lat).toBeGreaterThanOrEqual(bbox.minLat);
      expect(decoded.lat).toBeLessThanOrEqual(bbox.maxLat);
      expect(decoded.lon).toBeGreaterThanOrEqual(bbox.minLon);
      expect(decoded.lon).toBeLessThanOrEqual(bbox.maxLon);
    });

    it('round-trips multiple coordinates', () => {
      const coords = [
        { lat: 0, lon: 0 },
        { lat: 45.5, lon: 45.5 },
        { lat: -45.5, lon: -45.5 },
        { lat: 30, lon: -30 },
        { lat: -30, lon: 30 },
        { lat: 10, lon: 10 },
        { lat: -10, lon: -10 }
      ];

      for (const coord of coords) {
        const encoded = Geohash.encode(coord, 8);
        const decoded = Geohash.decode(encoded);
        expect(Math.abs(decoded.lat - coord.lat)).toBeLessThan(1);
        expect(Math.abs(decoded.lon - coord.lon)).toBeLessThan(1);
      }
    });

    it('navigates through neighboring hashes', () => {
      const center = 's0000';
      const north = Geohash.neighbor(center, 'n');
      const northSouth = Geohash.neighbor(north, 's');

      expect(northSouth).toBe(center);
    });

    it('encodes decodes and validates consistently', () => {
      const coord = { lat: 40.7128, lon: -74.0060 };
      const encoded = Geohash.encode(coord, 8);
      const isValid = Geohash.isValid(encoded);
      const decoded = Geohash.decode(encoded);

      expect(isValid).toBe(true);
      expect(decoded.lat).toBeTruthy();
      expect(decoded.lon).toBeTruthy();
    });
  });
});
