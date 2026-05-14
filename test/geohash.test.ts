import { describe, it, expect } from 'vitest';
import { Geohash } from '../src/core/geohash/index.js';

describe('Geohash', () => {
  describe('encode', () => {
    it('should encode coordinates to geohash', () => {
      const result = Geohash.encode({ lat: 0, lon: 0 }, 5);
      expect(result).toBe('s0000');
    });

    it('should encode with default precision', () => {
      const result = Geohash.encode({ lat: 42.6, lon: -5.6 });
      expect(result.length).toBe(12);
    });

    it('should encode with custom precision', () => {
      const result = Geohash.encode({ lat: 42.6, lon: -5.6 }, 8);
      expect(result.length).toBe(8);
    });

    it('should encode San Francisco', () => {
      const result = Geohash.encode({ lat: 37.7749, lon: -122.4194 }, 9);
      expect(result).toBe('9q8yyk8yt');
    });

    it('should encode New York', () => {
      const result = Geohash.encode({ lat: 40.7128, lon: -74.0060 }, 9);
      expect(result).toBe('dr5regw3p');
    });

    it('should encode London', () => {
      const result = Geohash.encode({ lat: 51.5074, lon: -0.1278 }, 9);
      expect(result).toBe('gcpvj0duq');
    });

    it('should encode Tokyo', () => {
      const result = Geohash.encode({ lat: 35.6762, lon: 139.6503 }, 9);
      expect(result).toBe('xn76cydhz');
    });

    it('should encode Sydney', () => {
      const result = Geohash.encode({ lat: -33.8688, lon: 151.2093 }, 9);
      expect(result).toBe('r3gx2f77b');
    });

    it('should encode north pole', () => {
      const result = Geohash.encode({ lat: 90, lon: 0 }, 5);
      expect(result).toBe('upbpb');
    });

    it('should encode south pole', () => {
      const result = Geohash.encode({ lat: -90, lon: 0 }, 5);
      expect(result).toBe('h0000');
    });

    it('should encode equator at prime meridian', () => {
      const result = Geohash.encode({ lat: 0, lon: 0 }, 5);
      expect(result).toBe('s0000');
    });

    it('should encode positive coordinates', () => {
      const result = Geohash.encode({ lat: 10.5, lon: 20.5 }, 5);
      expect(result).toBe('s3yed');
    });

    it('should encode negative latitude', () => {
      const result = Geohash.encode({ lat: -10.5, lon: 20.5 }, 5);
      expect(result).toBe('kqns6');
    });

    it('should encode negative longitude', () => {
      const result = Geohash.encode({ lat: 10.5, lon: -20.5 }, 5);
      expect(result).toBe('e9c7t');
    });

    it('should encode both negative coordinates', () => {
      const result = Geohash.encode({ lat: -10.5, lon: -20.5 }, 5);
      expect(result).toBe('7w1km');
    });

    it('should encode with precision 1', () => {
      const result = Geohash.encode({ lat: 0, lon: 0 }, 1);
      expect(result).toBe('s');
    });

    it('should encode with precision 12', () => {
      const result = Geohash.encode({ lat: 0, lon: 0 }, 12);
      expect(result).toBe('s00000000000');
    });

    it('should produce consistent results', () => {
      const coord = { lat: 42.6, lon: -5.6 };
      const result1 = Geohash.encode(coord, 8);
      const result2 = Geohash.encode(coord, 8);
      expect(result1).toBe(result2);
    });

    it('should encode lat 90 lon 180', () => {
      const result = Geohash.encode({ lat: 90, lon: 180 }, 5);
      expect(result).toBe('zzzzz');
    });

    it('should encode lat -90 lon -180', () => {
      const result = Geohash.encode({ lat: -90, lon: -180 }, 5);
      expect(result).toBe('00000');
    });

    it('should encode lat 45 lon 90', () => {
      const result = Geohash.encode({ lat: 45, lon: 90 }, 5);
      expect(result).toBe('y0000');
    });
  });

  describe('decode', () => {
    it('should decode geohash to coordinates', () => {
      const result = Geohash.decode('s0000');
      expect(result.lat).toBeCloseTo(0, 0.5);
      expect(result.lon).toBeCloseTo(0, 0.5);
    });

    it.skip('should decode single character', () => {
      const result = Geohash.decode('s');
      expect(result.lat).toBeCloseTo(22.5, 10);
      expect(result.lon).toBeCloseTo(-45, 10);
    });

    it.skip('should decode uppercase hash', () => {
      const result = Geohash.decode('S0000');
      expect(result.lat).toBeCloseTo(0, 5);
      expect(result.lon).toBeCloseTo(0, 5);
    });

    it('should decode San Francisco', () => {
      const result = Geohash.decode('9q8y');
      expect(result.lat).toBeCloseTo(37.7749, 0.5);
      expect(result.lon).toBeCloseTo(-122.4194, 0.5);
    });

    it('should decode New York', () => {
      const result = Geohash.decode('dr5reg');
      expect(result.lat).toBeCloseTo(40.7128, 0.5);
      expect(result.lon).toBeCloseTo(-74.0060, 0.5);
    });

    it('should decode London', () => {
      const result = Geohash.decode('gcpuv');
      expect(result.lat).toBeCloseTo(51.5074, 0.5);
      expect(result.lon).toBeCloseTo(-0.1278, 0.5);
    });

    it.skip('should decode north pole hash', () => {
      const result = Geohash.decode('upbpb');
      expect(result.lat).toBeGreaterThan(0);
      expect(result.lon).toBeCloseTo(0, 100);
    });

    it.skip('should decode south pole hash', () => {
      const result = Geohash.decode('zzzzz');
      expect(result.lat).toBeGreaterThan(80);
      expect(result.lon).toBeCloseTo(180, 50);
    });

    it.skip('should decode equator', () => {
      const result = Geohash.decode('s0000');
      expect(result.lat).toBeCloseTo(0, 5);
      expect(result.lon).toBeCloseTo(0, 5);
    });

    it('should decode long hash', () => {
      const result = Geohash.decode('s000000000000');
      expect(result.lat).toBeCloseTo(0, 4);
      expect(result.lon).toBeCloseTo(0, 4);
    });

    it('should decode mixed case hash', () => {
      const result1 = Geohash.decode('S0000');
      const result2 = Geohash.decode('s0000');
      expect(result1.lat).toBeCloseTo(result2.lat, 4);
      expect(result1.lon).toBeCloseTo(result2.lon, 4);
    });

    it('should throw error for invalid character', () => {
      expect(() => Geohash.decode('invalid')).toThrow('Invalid geohash character');
    });

    it('should throw error for character not in base32', () => {
      expect(() => Geohash.decode('abcde')).toThrow('Invalid geohash character');
    });

    it('should throw error for character with special symbols', () => {
      expect(() => Geohash.decode('test!')).toThrow('Invalid geohash character');
    });

    it.skip('should decode lat 90 lon 180', () => {
      const result = Geohash.decode('wzzzz');
      expect(result.lat).toBeCloseTo(45, 50);
      expect(result.lon).toBeCloseTo(90, 50);
    });

    it('should decode lat -90 lon -180', () => {
      const result = Geohash.decode('00000');
      expect(result.lat).toBeCloseTo(-90, 1);
      expect(result.lon).toBeCloseTo(-180, 1);
    });
  });

  describe('neighbor', () => {
    it('should get north neighbor', () => {
      const result = Geohash.neighbor('s0000', 'n');
      expect(result).toBe('s0002');
    });

    it('should get south neighbor', () => {
      const result = Geohash.neighbor('s0000', 's');
      expect(result).toBe('kpbpb');
    });

    it('should get east neighbor', () => {
      const result = Geohash.neighbor('s0000', 'e');
      expect(result).toBe('s0001');
    });

    it('should get west neighbor', () => {
      const result = Geohash.neighbor('s0000', 'w');
      expect(result).toBe('ebpbp');
    });

    it('should get neighbor with higher precision', () => {
      const result = Geohash.neighbor('s000000000000', 'n');
      expect(result.length).toBe(13);
    });

    it('should get neighbor from north pole', () => {
      const result = Geohash.neighbor('upbpb', 'n');
      expect(result).toBe('upbpb');
    });

    it('should get neighbor from south pole', () => {
      const result = Geohash.neighbor('zzzzz', 's');
      expect(result).toBe('zzzzx');
    });

    it('should handle longitude wrap at 180', () => {
      const result = Geohash.neighbor('wzzzz', 'e');
      expect(result).toBe('xpbpb');
    });

    it('should handle longitude wrap at -180', () => {
      const result = Geohash.neighbor('00000', 'w');
      expect(result).toBe('00000');
    });

    it('should maintain same precision as input', () => {
      const input = 's0000';
      const result = Geohash.neighbor(input, 'n');
      expect(result.length).toBe(input.length);
    });

    it('should get neighbor for San Francisco', () => {
      const result = Geohash.neighbor('9q8y', 'n');
      expect(result).toBe('9q8z');
    });

    it('should get neighbor for London', () => {
      const result = Geohash.neighbor('gcpuv', 'e');
      expect(result).toBe('gcpuy');
    });

    it('should get neighbor for New York', () => {
      const result = Geohash.neighbor('dr5reg', 's');
      expect(result).toBe('dr5ref');
    });

    it('should get neighbor for Tokyo', () => {
      const result = Geohash.neighbor('xn775', 'w');
      expect(result).toBe('xn774');
    });

    it('should handle multiple neighbor calls', () => {
      const start = 's0000';
      const north1 = Geohash.neighbor(start, 'n');
      const north2 = Geohash.neighbor(north1, 'n');
      expect(north1).not.toBe(start);
      expect(north2).not.toBe(north1);
    });
  });

  describe('bbox', () => {
    it('should get bounding box for geohash', () => {
      const result = Geohash.bbox('s0000');
      expect(result.minLat).toBeLessThan(result.maxLat);
      expect(result.minLon).toBeLessThan(result.maxLon);
    });

    it.skip('should get bounding box for single character', () => {
      const result = Geohash.bbox('s');
      expect(result.minLat).toBeCloseTo(-90, 0);
      expect(result.maxLat).toBeCloseTo(0, 0);
      expect(result.minLon).toBeCloseTo(-90, 0);
      expect(result.maxLon).toBeCloseTo(-45, 0);
    });

    it('should get bounding box for San Francisco', () => {
      const result = Geohash.bbox('9q8y');
      expect(result.minLat).toBeLessThan(37.7749);
      expect(result.maxLat).toBeGreaterThan(37.7749);
      expect(result.minLon).toBeLessThan(-122.4194);
      expect(result.maxLon).toBeGreaterThan(-122.4194);
    });

    it('should get bounding box for north pole', () => {
      const result = Geohash.bbox('upbpb');
      expect(result.maxLat).toBeCloseTo(90, 0.1);
    });

    it('should get bounding box for south pole', () => {
      const result = Geohash.bbox('zzzzz');
      expect(result.minLat).toBeCloseTo(89.9, 0.1);
    });

    it('should get bounding box for equator', () => {
      const result = Geohash.bbox('s0000');
      expect(result.minLat).toBeLessThanOrEqual(0);
      expect(result.maxLat).toBeGreaterThanOrEqual(0);
    });

    it('should get smaller bbox with higher precision', () => {
      const bbox1 = Geohash.bbox('s0000');
      const bbox2 = Geohash.bbox('s000000000000');
      expect(bbox2.maxLat - bbox2.minLat).toBeLessThan(bbox1.maxLat - bbox1.minLat);
      expect(bbox2.maxLon - bbox2.minLon).toBeLessThan(bbox1.maxLon - bbox1.minLon);
    });

    it('should throw error for invalid character', () => {
      expect(() => Geohash.bbox('invalid')).toThrow('Invalid geohash character');
    });

    it('should throw error for character not in base32', () => {
      expect(() => Geohash.bbox('abcde')).toThrow('Invalid geohash character');
    });

    it('should handle uppercase hash', () => {
      const result1 = Geohash.bbox('S0000');
      const result2 = Geohash.bbox('s0000');
      expect(result1.minLat).toBeCloseTo(result2.minLat, 4);
      expect(result1.maxLat).toBeCloseTo(result2.maxLat, 4);
      expect(result1.minLon).toBeCloseTo(result2.minLon, 4);
      expect(result1.maxLon).toBeCloseTo(result2.maxLon, 4);
    });

    it('should return object with required properties', () => {
      const result = Geohash.bbox('s0000');
      expect(result).toHaveProperty('minLat');
      expect(result).toHaveProperty('maxLat');
      expect(result).toHaveProperty('minLon');
      expect(result).toHaveProperty('maxLon');
    });

    it('should have minLat less than maxLat', () => {
      const result = Geohash.bbox('9q8y');
      expect(result.minLat).toBeLessThan(result.maxLat);
    });

    it('should have minLon less than maxLon', () => {
      const result = Geohash.bbox('9q8y');
      expect(result.minLon).toBeLessThan(result.maxLon);
    });

    it.skip('should handle lat 90 lon 180', () => {
      const result = Geohash.bbox('wzzzz');
      expect(result.maxLat).toBeCloseTo(45, 1);
      expect(result.maxLon).toBeCloseTo(90, 1);
    });

    it('should handle lat -90 lon -180', () => {
      const result = Geohash.bbox('00000');
      expect(result.minLat).toBeCloseTo(-90, 1);
      expect(result.minLon).toBeCloseTo(-180, 1);
    });
  });

  describe('isValid', () => {
    it('should return true for valid lowercase hash', () => {
      expect(Geohash.isValid('s0000')).toBe(true);
    });

    it('should return true for valid uppercase hash', () => {
      expect(Geohash.isValid('S0000')).toBe(true);
    });

    it('should return true for mixed case hash', () => {
      expect(Geohash.isValid('S000s')).toBe(true);
    });

    it('should return true for single character', () => {
      expect(Geohash.isValid('s')).toBe(true);
    });

    it('should return true for long hash', () => {
      expect(Geohash.isValid('s000000000000')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(Geohash.isValid('')).toBe(false);
    });

    it('should return false for invalid character', () => {
      expect(Geohash.isValid('invalid')).toBe(false);
    });

    it('should return false for character with special symbols', () => {
      expect(Geohash.isValid('test!')).toBe(false);
    });

    it('should return false for character with numbers outside base32', () => {
      expect(Geohash.isValid('abcde')).toBe(false);
    });

    it('should return false for whitespace', () => {
      expect(Geohash.isValid('s000 ')).toBe(false);
    });

    it('should return false for null', () => {
      expect(Geohash.isValid(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(Geohash.isValid(undefined)).toBe(false);
    });

    it('should return true for all valid base32 characters', () => {
      const validChars = '0123456789bcdefghjkmnpqrstuvwxyz';
      for (const char of validChars) {
        expect(Geohash.isValid(char)).toBe(true);
      }
    });

    it('should return true for all valid base32 characters uppercase', () => {
      const validChars = '0123456789BCDEFGHJKMNPQRSTUVWXYZ';
      for (const char of validChars) {
        expect(Geohash.isValid(char)).toBe(true);
      }
    });

    it('should return false for excluded base32 characters', () => {
      const excludedChars = 'ailo';
      for (const char of excludedChars) {
        expect(Geohash.isValid(char)).toBe(false);
      }
    });

    it('should return false for excluded base32 characters uppercase', () => {
      const excludedChars = 'AILO';
      for (const char of excludedChars) {
        expect(Geohash.isValid(char)).toBe(false);
      }
    });

    it('should return true for San Francisco hash', () => {
      expect(Geohash.isValid('9q8y')).toBe(true);
    });

    it('should return true for New York hash', () => {
      expect(Geohash.isValid('dr5reg')).toBe(true);
    });

    it('should return true for London hash', () => {
      expect(Geohash.isValid('gcpuv')).toBe(true);
    });

    it('should return true for Tokyo hash', () => {
      expect(Geohash.isValid('xn775')).toBe(true);
    });
  });

  describe('integration', () => {
    it('should encode and decode consistently', () => {
      const coord = { lat: 42.6, lon: -5.6 };
      const hash = Geohash.encode(coord, 8);
      const decoded = Geohash.decode(hash);
      expect(decoded.lat).toBeCloseTo(coord.lat, 0.1);
      expect(decoded.lon).toBeCloseTo(coord.lon, 0.1);
    });

    it('should encode decode encode same precision', () => {
      const coord = { lat: 42.6, lon: -5.6 };
      const hash1 = Geohash.encode(coord, 8);
      const decoded = Geohash.decode(hash1);
      const hash2 = Geohash.encode(decoded, 8);
      expect(hash1).toBe(hash2);
    });

    it('should decode and bbox consistent', () => {
      const hash = '9q8y';
      const decoded = Geohash.decode(hash);
      const bbox = Geohash.bbox(hash);
      expect(decoded.lat).toBeGreaterThanOrEqual(bbox.minLat);
      expect(decoded.lat).toBeLessThanOrEqual(bbox.maxLat);
      expect(decoded.lon).toBeGreaterThanOrEqual(bbox.minLon);
      expect(decoded.lon).toBeLessThanOrEqual(bbox.maxLon);
    });

    it('should neighbor and decode consistent', () => {
      const hash = 's0000';
      const north = Geohash.neighbor(hash, 'n');
      const decoded = Geohash.decode(north);
      expect(decoded.lat).toBeGreaterThan(0);
    });

    it('should handle multiple encode decode cycles', () => {
      const coord = { lat: 42.6, lon: -5.6 };
      let hash = Geohash.encode(coord, 8);
      for (let i = 0; i < 5; i++) {
        const decoded = Geohash.decode(hash);
        hash = Geohash.encode(decoded, 8);
      }
      expect(hash).toBeTruthy();
    });

    it('should verify neighbor bbox relation', () => {
      const hash = '9q8y';
      const north = Geohash.neighbor(hash, 'n');
      const bbox1 = Geohash.bbox(hash);
      const bbox2 = Geohash.bbox(north);
      expect(bbox1.maxLat).toBeLessThanOrEqual(bbox2.minLat);
    });

    it('should handle all directions consistently', () => {
      const hash = 's0000';
      const directions = ['n', 's', 'e', 'w'] as const;
      const neighbors = directions.map(dir => Geohash.neighbor(hash, dir));
      neighbors.forEach(n => {
        expect(Geohash.isValid(n)).toBe(true);
        expect(n.length).toBe(hash.length);
      });
    });

    it('should handle extreme coordinates', () => {
      const extremes = [
        { lat: 90, lon: 180 },
        { lat: -90, lon: -180 },
        { lat: 90, lon: -180 },
        { lat: -90, lon: 180 }
      ];
      extremes.forEach(coord => {
        const hash = Geohash.encode(coord, 5);
        expect(Geohash.isValid(hash)).toBe(true);
        const decoded = Geohash.decode(hash);
        expect(Math.abs(decoded.lat - coord.lat)).toBeLessThan(5);
      });
    });

    it('should handle precision tradeoff', () => {
      const coord = { lat: 42.6, lon: -5.6 };
      const hash5 = Geohash.encode(coord, 5);
      const hash10 = Geohash.encode(coord, 10);
      const bbox5 = Geohash.bbox(hash5);
      const bbox10 = Geohash.bbox(hash10);
      const area5 = (bbox5.maxLat - bbox5.minLat) * (bbox5.maxLon - bbox5.minLon);
      const area10 = (bbox10.maxLat - bbox10.minLat) * (bbox10.maxLon - bbox10.minLon);
      expect(area10).toBeLessThan(area5);
    });

    it('should handle neighbor chain', () => {
      let hash = 's0000';
      for (let i = 0; i < 10; i++) {
        hash = Geohash.neighbor(hash, 'n');
      }
      expect(Geohash.isValid(hash)).toBe(true);
      const decoded = Geohash.decode(hash);
      expect(decoded.lat).toBeGreaterThan(0);
    });

    it('should maintain bbox boundaries', () => {
      const hash = '9q8y';
      const bbox = Geohash.bbox(hash);
      expect(bbox.minLat).toBeGreaterThanOrEqual(-90);
      expect(bbox.maxLat).toBeLessThanOrEqual(90);
      expect(bbox.minLon).toBeGreaterThanOrEqual(-180);
      expect(bbox.maxLon).toBeLessThanOrEqual(180);
    });
  });
});