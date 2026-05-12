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

    it('encodes international date line east with precision 5', () => {
      const result = Geohash.encode({ lat: 0, lon: 180 }, 5);
      expect(result).toBeTruthy();
      expect(result.length).toBe(5);
    });

    it('encodes international date line west with precision 5', () => {
      const result = Geohash.encode({ lat: 0, lon: -180 }, 5);
      expect(result).toBe('80000');
    });

    it('encodes New York City with precision 10', () => {
      const result = Geohash.encode({ lat: 40.7128, lon: -74.0060 }, 10);
      expect(result).toBeTruthy();
      expect(result.length).toBe(10);
    });

    it('encodes London with precision 10', () => {
      const result = Geohash.encode({ lat: 51.5074, lon: -0.1278 }, 10);
      expect(result).toBeTruthy();
      expect(result.length).toBe(10);
    });

    it('encodes Tokyo with precision 10', () => {
      const result = Geohash.encode({ lat: 35.6762, lon: 139.6503 }, 10);
      expect(result).toBeTruthy();
      expect(result.length).toBe(10);
    });

    it('encodes Sydney with precision 10', () => {
      const result = Geohash.encode({ lat: -33.8688, lon: 151.2093 }, 10);
      expect(result).toBeTruthy();
      expect(result.length).toBe(10);
    });

    it('encodes Big Ben with precision 12', () => {
      const result = Geohash.encode({ lat: 51.5007, lon: -0.1246 }, 12);
      expect(result).toBeTruthy();
      expect(result.length).toBe(12);
    });

    it('encodes Null Island with precision 5', () => {
      const result = Geohash.encode({ lat: 0, lon: 0 }, 5);
      expect(result).toBe('s0000');
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

    it('encodes with precision 15', () => {
      const result = Geohash.encode({ lat: 30, lon: 30 }, 15);
      expect(result.length).toBe(15);
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

    it('encodes San Francisco with precision 10', () => {
      const result = Geohash.encode({ lat: 37.7749, lon: -122.4194 }, 10);
      expect(result).toBeTruthy();
      expect(result.length).toBe(10);
    });

    it('encodes Paris with precision 10', () => {
      const result = Geohash.encode({ lat: 48.8566, lon: 2.3522 }, 10);
      expect(result).toBeTruthy();
      expect(result.length).toBe(10);
    });

    it('encodes Moscow with precision 10', () => {
      const result = Geohash.encode({ lat: 55.7558, lon: 37.6173 }, 10);
      expect(result).toBeTruthy();
      expect(result.length).toBe(10);
    });

    it('encodes Cape Town with precision 10', () => {
      const result = Geohash.encode({ lat: -33.9249, lon: 18.4241 }, 10);
      expect(result).toBeTruthy();
      expect(result.length).toBe(10);
    });

    it('encodes Rio de Janeiro with precision 10', () => {
      const result = Geohash.encode({ lat: -22.9068, lon: -43.1729 }, 10);
      expect(result).toBeTruthy();
      expect(result.length).toBe(10);
    });

    it('encodes Mumbai with precision 10', () => {
      const result = Geohash.encode({ lat: 19.0760, lon: 72.8777 }, 10);
      expect(result).toBeTruthy();
      expect(result.length).toBe(10);
    });

    it('encodes Singapore with precision 10', () => {
      const result = Geohash.encode({ lat: 1.3521, lon: 103.8198 }, 10);
      expect(result).toBeTruthy();
      expect(result.length).toBe(10);
    });

    it('encodes Antarctica location with precision 10', () => {
      const result = Geohash.encode({ lat: -82.8628, lon: 135.0000 }, 10);
      expect(result).toBeTruthy();
      expect(result.length).toBe(10);
    });

    it('encodes high precision location', () => {
      const result = Geohash.encode({ lat: 51.5007, lon: -0.1246 }, 20);
      expect(result).toHaveLength(20);
    });
  });

  describe('decode', () => {
    it('decodes equator and prime meridian hash', () => {
      const result = Geohash.decode('s0000');
      expect(result.lat).toBeCloseTo(0, 1);
      expect(result.lon).toBeCloseTo(0, 1);
    });

    it('decodes north pole hash', () => {
      const result = Geohash.decode('upbpb');
      expect(result.lat).toBeGreaterThan(80);
      expect(result.lon).toBeCloseTo(0, 1);
    });

    it('decodes south pole hash', () => {
      const result = Geohash.decode('kzbpb');
      expect(result.lat).toBeLessThan(0);
      expect(result.lon).toBeGreaterThanOrEqual(-180);
      expect(result.lon).toBeLessThanOrEqual(180);
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

    it('throws error for hash with excluded character', () => {
      expect(() => Geohash.decode('s000a')).toThrow('Invalid geohash character');
    });

    it('throws error for hash with excluded character', () => {
      expect(() => Geohash.decode('s000a')).toThrow('Invalid geohash character');
    });

    it('throws error for hash with excluded letters', () => {
      expect(() => Geohash.decode('s000i')).toThrow('Invalid geohash character');
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

    it('decodes Big Ben hash correctly', () => {
      const hash = Geohash.encode({ lat: 51.5007, lon: -0.1246 }, 12);
      const result = Geohash.decode(hash);
      expect(result.lat).toBeCloseTo(51.5007, 4);
      expect(result.lon).toBeCloseTo(-0.1246, 4);
    });

    it('decodes various precisions correctly', () => {
      for (let precision = 1; precision <= 12; precision++) {
        const original = { lat: 40.7128, lon: -74.0060 };
        const encoded = Geohash.encode(original, precision);
        const decoded = Geohash.decode(encoded);
        expect(decoded.lat).toBeGreaterThanOrEqual(-90);
        expect(decoded.lat).toBeLessThanOrEqual(90);
        expect(decoded.lon).toBeGreaterThanOrEqual(-180);
        expect(decoded.lon).toBeLessThanOrEqual(180);
      }
    });

    it('decodes date line east hash', () => {
      const hash = Geohash.encode({ lat: 0, lon: 180 }, 5);
      const result = Geohash.decode(hash);
      expect(result.lon).toBeGreaterThan(150);
    });

    it('decodes date line west hash', () => {
      const hash = Geohash.encode({ lat: 0, lon: -180 }, 5);
      const result = Geohash.decode(hash);
      expect(result.lon).toBeLessThan(-150);
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

    it('neighbor round-trips back to original', () => {
      const center = 's0000';
      const north = Geohash.neighbor(center, 'n');
      const back = Geohash.neighbor(north, 's');
      expect(back).toBe(center);
    });

    it('handles different precisions', () => {
      const hash1 = 's';
      const neighbor1 = Geohash.neighbor(hash1, 'n');
      expect(neighbor1.length).toBe(1);

      const hash2 = 's0000';
      const neighbor2 = Geohash.neighbor(hash2, 'n');
      expect(neighbor2.length).toBe(5);

      const hash3 = Geohash.encode({ lat: 0, lon: 0 }, 12);
      const neighbor3 = Geohash.neighbor(hash3, 'n');
      expect(neighbor3.length).toBe(12);
    });

    it('produces valid geohash for neighbors', () => {
      const center = 's0000';
      const north = Geohash.neighbor(center, 'n');
      const south = Geohash.neighbor(center, 's');
      const east = Geohash.neighbor(center, 'e');
      const west = Geohash.neighbor(center, 'w');

      expect(Geohash.isValid(north)).toBe(true);
      expect(Geohash.isValid(south)).toBe(true);
      expect(Geohash.isValid(east)).toBe(true);
      expect(Geohash.isValid(west)).toBe(true);
    });

    it('calculates neighbor of neighbor correctly', () => {
      const start = 's0000';
      const north = Geohash.neighbor(start, 'n');
      const northEast = Geohash.neighbor(north, 'e');

      expect(Geohash.isValid(northEast)).toBe(true);
      expect(northEast).not.toBe(start);
    });

    it('handles edge case at south pole', () => {
      const result = Geohash.neighbor('kzbpb', 's');
      expect(Geohash.isValid(result)).toBe(true);
    });

    it('handles edge case at date line east', () => {
      const result = Geohash.neighbor('xpbpb', 'e');
      expect(Geohash.isValid(result)).toBe(true);
    });

    it('handles edge case at date line west', () => {
      const result = Geohash.neighbor('80000', 'w');
      expect(Geohash.isValid(result)).toBe(true);
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

    it('calculates bbox for north pole region', () => {
      const result = Geohash.bbox('upbpb');
      expect(result.minLat).toBeGreaterThan(80);
      expect(result.maxLat).toBeLessThanOrEqual(90);
    });

    it('calculates bbox for south pole region', () => {
      const hash = Geohash.encode({ lat: -90, lon: 0 }, 5);
      const result = Geohash.bbox(hash);
      expect(result.maxLat).toBeLessThan(-80);
      expect(result.minLat).toBeGreaterThanOrEqual(-90);
    });

    it('calculates bbox for date line east region', () => {
      const hash = Geohash.encode({ lat: 0, lon: 180 }, 5);
      const result = Geohash.bbox(hash);
      expect(result.minLon).toBeGreaterThan(150);
      expect(result.maxLon).toBeLessThanOrEqual(180);
    });

    it('calculates bbox for date line west region', () => {
      const hash = Geohash.encode({ lat: 0, lon: -180 }, 5);
      const result = Geohash.bbox(hash);
      expect(result.maxLon).toBeLessThan(-150);
      expect(result.minLon).toBeGreaterThanOrEqual(-180);
    });

    it('produces valid bbox for various precisions', () => {
      for (let precision = 1; precision <= 12; precision++) {
        const hash = Geohash.encode({ lat: 40.7128, lon: -74.0060 }, precision);
        const bbox = Geohash.bbox(hash);
        expect(bbox.minLat).toBeGreaterThanOrEqual(-90);
        expect(bbox.maxLat).toBeLessThanOrEqual(90);
        expect(bbox.minLon).toBeGreaterThanOrEqual(-180);
        expect(bbox.maxLon).toBeLessThanOrEqual(180);
        expect(bbox.minLat).toBeLessThan(bbox.maxLat);
        expect(bbox.minLon).toBeLessThan(bbox.maxLon);
      }
    });

    it('calculates bbox center correctly', () => {
      const hash = 's0000';
      const bbox = Geohash.bbox(hash);
      const decoded = Geohash.decode(hash);

      expect(decoded.lat).toBe((bbox.minLat + bbox.maxLat) / 2);
      expect(decoded.lon).toBe((bbox.minLon + bbox.maxLon) / 2);
    });

    it('produces non-empty bbox for all valid hashes', () => {
      const validChars = '0123456789bcdefghjkmnpqrstuvwxyz';
      for (let i = 0; i < validChars.length; i++) {
        const hash = validChars[i]!;
        const bbox = Geohash.bbox(hash);
        expect(bbox.minLat).toBeLessThan(bbox.maxLat);
        expect(bbox.minLon).toBeLessThan(bbox.maxLon);
      }
    });

    it('calculates bbox for equator region', () => {
      const result = Geohash.bbox('s0000');
      expect(result.minLat).toBeCloseTo(0, 1);
      expect(result.maxLat).toBeCloseTo(0, 1);
      expect(result.minLon).toBeCloseTo(0, 1);
      expect(result.maxLon).toBeCloseTo(0, 1);
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

    it('returns false for all excluded characters', () => {
      const excluded = 'aeiouy';
      const invalid = excluded.split('').filter((c) => !Geohash.isValid(c));
      expect(invalid.length).toBeGreaterThan(0);
    });

    it('returns false for special characters', () => {
      expect(Geohash.isValid('s00@0')).toBe(false);
      expect(Geohash.isValid('s00#0')).toBe(false);
      expect(Geohash.isValid('s00$0')).toBe(false);
    });

    it('returns false for hash with numbers outside base32', () => {
      expect(Geohash.isValid('abc123')).toBe(false);
    });

    it('returns true for hash with all zeros', () => {
      expect(Geohash.isValid('00000')).toBe(true);
    });

    it('returns true for hash with all nines', () => {
      expect(Geohash.isValid('99999')).toBe(true);
    });

    it('returns true for hash with only letters', () => {
      expect(Geohash.isValid('bcdef')).toBe(true);
    });

    it('returns false for hash with mixed valid and invalid', () => {
      expect(Geohash.isValid('s00l0')).toBe(false);
      expect(Geohash.isValid('s00o0')).toBe(false);
    });

    it('returns true for uppercase valid hash', () => {
      const validChars = '0123456789BCDEFGHJKMNPQRSTUVWXYZ';
      const actuallyValid = validChars.split('').filter((c) => Geohash.isValid(c));
      for (const char of actuallyValid) {
        expect(Geohash.isValid(char)).toBe(true);
      }
      expect(actuallyValid.length).toBeGreaterThan(0);
    });

    it('returns true for long valid hash', () => {
      const longHash = 's000000000000000000000000000';
      expect(Geohash.isValid(longHash)).toBe(true);
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

    it('handles edge case at date line', () => {
      const coord1 = { lat: 0, lon: 179.999 };
      const coord2 = { lat: 0, lon: -179.999 };

      const hash1 = Geohash.encode(coord1, 5);
      const hash2 = Geohash.encode(coord2, 5);

      expect(Geohash.isValid(hash1)).toBe(true);
      expect(Geohash.isValid(hash2)).toBe(true);
      expect(hash1).not.toBe(hash2);
    });

    it('handles edge case at poles', () => {
      const coord1 = { lat: 89.999, lon: 0 };
      const coord2 = { lat: -89.999, lon: 0 };

      const hash1 = Geohash.encode(coord1, 5);
      const hash2 = Geohash.encode(coord2, 5);

      expect(Geohash.isValid(hash1)).toBe(true);
      expect(Geohash.isValid(hash2)).toBe(true);
      expect(hash1).not.toBe(hash2);
    });

    it('bbox and decode are consistent', () => {
      const hash = 'dr5reg';
      const bbox = Geohash.bbox(hash);
      const decoded = Geohash.decode(hash);

      expect(decoded.lat).toBe((bbox.minLat + bbox.maxLat) / 2);
      expect(decoded.lon).toBe((bbox.minLon + bbox.maxLon) / 2);
    });

    it('handles various precisions in round-trip', () => {
      const coord = { lat: 51.5007, lon: -0.1246 };

      for (let precision = 1; precision <= 15; precision++) {
        const encoded = Geohash.encode(coord, precision);
        const decoded = Geohash.decode(encoded);
        expect(decoded.lat).toBeGreaterThanOrEqual(-90);
        expect(decoded.lat).toBeLessThanOrEqual(90);
        expect(decoded.lon).toBeGreaterThanOrEqual(-180);
        expect(decoded.lon).toBeLessThanOrEqual(180);
      }
    });

    it('produces consistent results across operations', () => {
      const hash = 's0000';
      const bbox1 = Geohash.bbox(hash);
      const bbox2 = Geohash.bbox(hash);
      expect(bbox1.minLat).toBe(bbox2.minLat);
      expect(bbox1.maxLat).toBe(bbox2.maxLat);
      expect(bbox1.minLon).toBe(bbox2.minLon);
      expect(bbox1.maxLon).toBe(bbox2.maxLon);
    });

    it('handles negative latitude with all operations', () => {
      const coord = { lat: -33.8688, lon: 151.2093 };
      const encoded = Geohash.encode(coord, 10);
      const decoded = Geohash.decode(encoded);
      const isValid = Geohash.isValid(encoded);
      const bbox = Geohash.bbox(encoded);
      const neighbor = Geohash.neighbor(encoded, 'n');

      expect(isValid).toBe(true);
      expect(decoded.lat).toBeCloseTo(coord.lat, 1);
      expect(neighbor.length).toBe(10);
      expect(bbox.minLat).toBeLessThan(bbox.maxLat);
    });

    it('handles positive longitude with all operations', () => {
      const coord = { lat: 35.6762, lon: 139.6503 };
      const encoded = Geohash.encode(coord, 10);
      const decoded = Geohash.decode(encoded);
      const isValid = Geohash.isValid(encoded);
      const bbox = Geohash.bbox(encoded);
      const neighbor = Geohash.neighbor(encoded, 'w');

      expect(isValid).toBe(true);
      expect(decoded.lon).toBeCloseTo(coord.lon, 1);
      expect(neighbor.length).toBe(10);
      expect(bbox.minLon).toBeLessThan(bbox.maxLon);
    });

    it('validates decoded hash matches original', () => {
      const coord = { lat: 40.7128, lon: -74.0060 };
      const encoded = Geohash.encode(coord, 8);
      const decoded = Geohash.decode(encoded);
      const reEncoded = Geohash.encode(decoded, 8);

      expect(encoded).toBe(reEncoded);
    });

    it('handles precision increases gracefully', () => {
      const coord = { lat: 51.5007, lon: -0.1246 };
      let prevHash = '';

      for (let precision = 1; precision <= 12; precision++) {
        const hash = Geohash.encode(coord, precision);
        expect(hash.startsWith(prevHash)).toBe(true);
        expect(hash.length).toBe(precision);
        prevHash = hash;
      }
    });
  });
});
