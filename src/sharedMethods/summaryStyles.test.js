import { jest } from '@jest/globals';
import { solidBlackWidthTwo, solidBlackWidthOne } from './summaryStyles.js';

describe('Summary Styles', () => {
  describe('solidBlackWidthTwo', () => {
    it('should have the correct style properties', () => {
      expect(solidBlackWidthTwo).toEqual({
        style: 'SOLID',
        width: 2,
        color: {
          red: 0,
          green: 0,
          blue: 0,
          alpha: 1,
        },
      });
    });

    it('should have a solid style', () => {
      expect(solidBlackWidthTwo.style).toBe('SOLID');
    });

    it('should have a width of 2', () => {
      expect(solidBlackWidthTwo.width).toBe(2);
    });

    it('should have black color with full opacity', () => {
      expect(solidBlackWidthTwo.color).toEqual({
        red: 0,
        green: 0,
        blue: 0,
        alpha: 1,
      });
    });
  });

  describe('solidBlackWidthOne', () => {
    it('should have the correct style properties', () => {
      expect(solidBlackWidthOne).toEqual({
        style: 'SOLID',
        width: 1,
        color: {
          red: 0,
          green: 0,
          blue: 0,
          alpha: 1,
        },
      });
    });

    it('should have a solid style', () => {
      expect(solidBlackWidthOne.style).toBe('SOLID');
    });

    it('should have a width of 1', () => {
      expect(solidBlackWidthOne.width).toBe(1);
    });

    it('should have black color with full opacity', () => {
      expect(solidBlackWidthOne.color).toEqual({
        red: 0,
        green: 0,
        blue: 0,
        alpha: 1,
      });
    });
  });

  describe('Style Comparison', () => {
    it('should have the same color but different widths', () => {
      expect(solidBlackWidthTwo.color).toEqual(solidBlackWidthOne.color);
      expect(solidBlackWidthTwo.width).not.toBe(solidBlackWidthOne.width);
    });

    it('should have the same style type', () => {
      expect(solidBlackWidthTwo.style).toBe(solidBlackWidthOne.style);
    });
  });
});
