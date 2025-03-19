import { initializeDailyPayload } from './initializeDailyPayload.js';

// Test data
const EMPTY_DAILY_PAYLOAD = {
  bodyPayload: [],
  headerPayload: [],
  summaryHeaderStylePayload: [],
  summaryGridStyles: [],
  footerPayload: [],
};

describe('initializeDailyPayload', () => {
  // Basic Functionality Tests
  describe('Basic Functionality', () => {
    it('should return an object with empty arrays for payload segments', () => {
      const payload = initializeDailyPayload();
      expect(payload).toEqual(EMPTY_DAILY_PAYLOAD);
    });

    it('should return a new object instance each time', () => {
      const payload1 = initializeDailyPayload();
      const payload2 = initializeDailyPayload();
      expect(payload1).not.toBe(payload2);
    });
  });

  // Structure Tests
  describe('Payload Structure', () => {
    it('should have all required arrays initialized as empty', () => {
      const payload = initializeDailyPayload();
      expect(Array.isArray(payload.bodyPayload)).toBe(true);
      expect(Array.isArray(payload.headerPayload)).toBe(true);
      expect(Array.isArray(payload.summaryHeaderStylePayload)).toBe(true);
      expect(Array.isArray(payload.summaryGridStyles)).toBe(true);
      expect(Array.isArray(payload.footerPayload)).toBe(true);
      expect(payload.bodyPayload.length).toBe(0);
      expect(payload.headerPayload.length).toBe(0);
      expect(payload.summaryHeaderStylePayload.length).toBe(0);
      expect(payload.summaryGridStyles.length).toBe(0);
      expect(payload.footerPayload.length).toBe(0);
    });
  });

  // Mutability Tests
  describe('Mutability', () => {
    it('should allow modification of the returned object', () => {
      const payload = initializeDailyPayload();

      // Verify that arrays can be modified
      expect(() => {
        payload.bodyPayload.push({ test: 'test' });
      }).not.toThrow();
      expect(() => {
        payload.headerPayload.push({ test: 'test' });
      }).not.toThrow();
      expect(() => {
        payload.summaryHeaderStylePayload.push({ test: 'test' });
      }).not.toThrow();
      expect(() => {
        payload.summaryGridStyles.push({ test: 'test' });
      }).not.toThrow();
      expect(() => {
        payload.footerPayload.push({ test: 'test' });
      }).not.toThrow();

      // Verify that the arrays were actually modified
      expect(payload.bodyPayload).toHaveLength(1);
      expect(payload.headerPayload).toHaveLength(1);
      expect(payload.summaryHeaderStylePayload).toHaveLength(1);
      expect(payload.summaryGridStyles).toHaveLength(1);
      expect(payload.footerPayload).toHaveLength(1);
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should initialize payload quickly', () => {
      const iterations = 1000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        initializeDailyPayload();
      }

      const endTime = performance.now();
      const averageTime = (endTime - startTime) / iterations;

      expect(averageTime).toBeLessThan(1); // Should take less than 1ms per initialization
    });
  });
});
