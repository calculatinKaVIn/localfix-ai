import { describe, it, expect } from "vitest";
import {
  calculateDistance,
  isWithinRadius,
  filterByRadius,
  formatDistance,
  RADIUS_PRESETS,
  DEFAULT_RADIUS,
  type Location,
} from "./geofencing";

describe("Geofencing Utilities", () => {
  const sanFrancisco: Location = { lat: 37.7749, lng: -122.4194 };
  const oaklandCA: Location = { lat: 37.8044, lng: -122.2712 };
  const losAngeles: Location = { lat: 34.0522, lng: -118.2437 };

  describe("calculateDistance", () => {
    it("should calculate distance between two coordinates", () => {
      const distance = calculateDistance(sanFrancisco, oaklandCA);
      // San Francisco to Oakland is approximately 13 km
      expect(distance).toBeGreaterThan(12);
      expect(distance).toBeLessThan(14);
    });

    it("should return 0 for same location", () => {
      const distance = calculateDistance(sanFrancisco, sanFrancisco);
      expect(distance).toBe(0);
    });

    it("should calculate longer distance correctly", () => {
      const distance = calculateDistance(sanFrancisco, losAngeles);
      // San Francisco to Los Angeles is approximately 559 km
      expect(distance).toBeGreaterThan(550);
      expect(distance).toBeLessThan(570);
    });

    it("should handle negative coordinates", () => {
      const loc1: Location = { lat: -33.8688, lng: 151.2093 }; // Sydney
      const loc2: Location = { lat: -37.8136, lng: 144.9631 }; // Melbourne
      const distance = calculateDistance(loc1, loc2);
      // Sydney to Melbourne is approximately 714 km
      expect(distance).toBeGreaterThan(700);
      expect(distance).toBeLessThan(730);
    });
  });

  describe("isWithinRadius", () => {
    it("should return true if point is within radius", () => {
      const result = isWithinRadius(sanFrancisco, oaklandCA, 20);
      expect(result).toBe(true);
    });

    it("should return false if point is outside radius", () => {
      const result = isWithinRadius(sanFrancisco, losAngeles, 100);
      expect(result).toBe(false);
    });

    it("should return true for exact radius boundary", () => {
      const distance = calculateDistance(sanFrancisco, oaklandCA);
      const result = isWithinRadius(sanFrancisco, oaklandCA, distance);
      expect(result).toBe(true);
    });

    it("should return true for same location with any radius", () => {
      const result = isWithinRadius(sanFrancisco, sanFrancisco, 0.1);
      expect(result).toBe(true);
    });
  });

  describe("filterByRadius", () => {
    const locations = [
      { lat: 37.7749, lng: -122.4194, name: "SF" },
      { lat: 37.8044, lng: -122.2712, name: "Oakland" },
      { lat: 34.0522, lng: -118.2437, name: "LA" },
    ];

    it("should filter locations within radius", () => {
      const result = filterByRadius(sanFrancisco, locations, 20);
      expect(result).toHaveLength(2); // SF and Oakland
      expect(result[0].name).toBe("SF"); // Closest first
      expect(result[1].name).toBe("Oakland");
    });

    it("should return empty array if no locations within radius", () => {
      const result = filterByRadius(sanFrancisco, locations, 5);
      expect(result).toHaveLength(0);
    });

    it("should sort by distance ascending", () => {
      const result = filterByRadius(sanFrancisco, locations, 600);
      expect(result.length).toBeGreaterThan(0);
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].distance).toBeLessThanOrEqual(result[i + 1].distance);
      }
    });

    it("should include distance property", () => {
      const result = filterByRadius(sanFrancisco, locations, 20);
      result.forEach(item => {
        expect(item).toHaveProperty("distance");
        expect(typeof item.distance).toBe("number");
        expect(item.distance).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("formatDistance", () => {
    it("should format distance less than 1km in meters", () => {
      expect(formatDistance(0.5)).toBe("500m");
      expect(formatDistance(0.1)).toBe("100m");
    });

    it("should format distance 1km or more in kilometers", () => {
      expect(formatDistance(1)).toBe("1.0km");
      expect(formatDistance(5.5)).toBe("5.5km");
      expect(formatDistance(10.25)).toBe("10.2km");
    });

    it("should round meters to nearest integer", () => {
      expect(formatDistance(0.123)).toBe("123m");
      expect(formatDistance(0.999)).toBe("999m");
    });

    it("should format zero distance", () => {
      expect(formatDistance(0)).toBe("0m");
    });
  });

  describe("Constants", () => {
    it("should have valid radius presets", () => {
      expect(RADIUS_PRESETS).toHaveLength(4);
      expect(RADIUS_PRESETS[0].value).toBe(1);
      expect(RADIUS_PRESETS[1].value).toBe(5);
      expect(RADIUS_PRESETS[2].value).toBe(10);
      expect(RADIUS_PRESETS[3].value).toBe(25);
    });

    it("should have default radius of 5km", () => {
      expect(DEFAULT_RADIUS).toBe(5);
    });

    it("should have preset labels", () => {
      RADIUS_PRESETS.forEach(preset => {
        expect(preset.label).toBeDefined();
        expect(preset.label.length).toBeGreaterThan(0);
      });
    });
  });
});
