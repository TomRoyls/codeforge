import type { GeoCoord } from './types.js';

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

export class Geohash {
  static encode(coord: GeoCoord, precision: number = 12): string {
    let latMin = -90.0;
    let latMax = 90.0;
    let lonMin = -180.0;
    let lonMax = 180.0;
    let bit = 0;
    let geohash = '';
    let evenBit = true;
    let charIndex = 0;

    while (geohash.length < precision) {
      if (evenBit) {
        const mid = (lonMin + lonMax) / 2;
        if (coord.lon >= mid) {
          bit = (bit << 1) | 1;
          lonMin = mid;
        } else {
          bit = bit << 1;
          lonMax = mid;
        }
      } else {
        const mid = (latMin + latMax) / 2;
        if (coord.lat >= mid) {
          bit = (bit << 1) | 1;
          latMin = mid;
        } else {
          bit = bit << 1;
          latMax = mid;
        }
      }

      evenBit = !evenBit;

      if (++charIndex === 5) {
        geohash += BASE32[bit]!;
        charIndex = 0;
        bit = 0;
      }
    }

    return geohash;
  }

  static decode(hash: string): GeoCoord {
    let latMin = -90.0;
    let latMax = 90.0;
    let lonMin = -180.0;
    let lonMax = 180.0;
    let evenBit = true;

    const lowerHash = hash.toLowerCase();
    for (let i = 0; i < lowerHash.length; i++) {
      const chr = lowerHash[i];
      const idx = BASE32.indexOf(chr!);
      if (idx === -1) {
        throw new Error(`Invalid geohash character '${chr}' at position ${i}`);
      }

      for (let j = 4; j >= 0; j--) {
        const bit = (idx >> j) & 1;

        if (evenBit) {
          const mid = (lonMin + lonMax) / 2;
          if (bit === 1) {
            lonMin = mid;
          } else {
            lonMax = mid;
          }
        } else {
          const mid = (latMin + latMax) / 2;
          if (bit === 1) {
            latMin = mid;
          } else {
            latMax = mid;
          }
        }

        evenBit = !evenBit;
      }
    }

    return {
      lat: (latMin + latMax) / 2,
      lon: (lonMin + lonMax) / 2
    };
  }

  static neighbor(hash: string, direction: 'n' | 's' | 'e' | 'w'): string {
    const precision = hash.length;
    const { minLat, maxLat, minLon, maxLon } = this.bbox(hash);
    let lat: number;
    let lon: number;

    const latDelta = (maxLat - minLat) / 2;
    const lonDelta = (maxLon - minLon) / 2;

    switch (direction) {
      case 'n':
        lat = maxLat + latDelta;
        lon = (minLon + maxLon) / 2;
        break;
      case 's':
        lat = minLat - latDelta;
        lon = (minLon + maxLon) / 2;
        break;
      case 'e':
        lat = (minLat + maxLat) / 2;
        lon = maxLon + lonDelta;
        break;
      case 'w':
        lat = (minLat + maxLat) / 2;
        lon = minLon - lonDelta;
        break;
    }

    lat = Math.max(-90, Math.min(90, lat));
    lon = Math.max(-180, Math.min(180, lon));

    return this.encode({ lat, lon }, precision);
  }

  static bbox(hash: string): { minLat: number; maxLat: number; minLon: number; maxLon: number } {
    let latMin = -90.0;
    let latMax = 90.0;
    let lonMin = -180.0;
    let lonMax = 180.0;
    let evenBit = true;

    const lowerHash = hash.toLowerCase();
    for (let i = 0; i < lowerHash.length; i++) {
      const chr = lowerHash[i];
      const idx = BASE32.indexOf(chr!);
      if (idx === -1) {
        throw new Error(`Invalid geohash character '${chr}' at position ${i}`);
      }

      for (let j = 4; j >= 0; j--) {
        const bit = (idx >> j) & 1;

        if (evenBit) {
          const mid = (lonMin + lonMax) / 2;
          if (bit === 1) {
            lonMin = mid;
          } else {
            lonMax = mid;
          }
        } else {
          const mid = (latMin + latMax) / 2;
          if (bit === 1) {
            latMin = mid;
          } else {
            latMax = mid;
          }
        }

        evenBit = !evenBit;
      }
    }

    return { minLat: latMin, maxLat: latMax, minLon: lonMin, maxLon: lonMax };
  }

  static isValid(hash: string): boolean {
    if (!hash || hash.length === 0) {
      return false;
    }

    const BASE32_UPPER = BASE32.toUpperCase();

    for (let i = 0; i < hash.length; i++) {
      const chr = hash[i]!;
      const lowerChr = chr.toLowerCase();
      const upperChr = chr.toUpperCase();
      if (BASE32.indexOf(lowerChr) === -1 && BASE32_UPPER.indexOf(upperChr) === -1) {
        return false;
      }
    }

    return true;
  }

  toString(): string {
    return `Geohash()`
  }
}
