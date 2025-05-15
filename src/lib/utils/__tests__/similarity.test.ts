import { calculateCosineSimilarity } from '../similarity';

describe('calculateCosineSimilarity', () => {
  it('should return 1 for identical vectors', () => {
    const vecA = [1, 2, 3];
    const vecB = [1, 2, 3];
    expect(calculateCosineSimilarity(vecA, vecB)).toBeCloseTo(1);
  });

  it('should return 0 for orthogonal vectors', () => {
    const vecA = [1, 0];
    const vecB = [0, 1];
    expect(calculateCosineSimilarity(vecA, vecB)).toBeCloseTo(0);
  });

  it('should return -1 for diametrically opposed vectors', () => {
    const vecA = [1, 2, 3];
    const vecB = [-1, -2, -3];
    expect(calculateCosineSimilarity(vecA, vecB)).toBeCloseTo(-1);
  });

  it('should handle vectors with different magnitudes correctly', () => {
    const vecA = [1, 1];
    const vecB = [5, 5];
    expect(calculateCosineSimilarity(vecA, vecB)).toBeCloseTo(1);
  });

  it('should return a value between -1 and 1 for other vectors', () => {
    const vecA = [1, 2, 0];
    const vecB = [0, 3, 4];
    const similarity = calculateCosineSimilarity(vecA, vecB);
    expect(similarity).toBeGreaterThanOrEqual(-1);
    expect(similarity).toBeLessThanOrEqual(1);
    // Specific value for [1,2,0] and [0,3,4] (normalized):
    // normA = [1/sqrt(5), 2/sqrt(5), 0] = [0.4472, 0.8944, 0]
    // normB = [0, 3/5, 4/5] = [0, 0.6, 0.8]
    // dotProduct(normA, normB) = 0.4472*0 + 0.8944*0.6 + 0*0.8 = 0.53664
    expect(similarity).toBeCloseTo(0.536656);
  });

  it('should return 0 for empty vectors', () => {
    expect(calculateCosineSimilarity([], [])).toBe(0);
    expect(calculateCosineSimilarity([1, 2], [])).toBe(0);
    expect(calculateCosineSimilarity([], [1, 2])).toBe(0);
  });

  it('should return 0 for vectors of different lengths and log a warning', () => {
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const vecA = [1, 2, 3];
    const vecB = [1, 2];
    expect(calculateCosineSimilarity(vecA, vecB)).toBe(0);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Cosine similarity called with vectors of different lengths.',
    );
    consoleWarnSpy.mockRestore();
  });

  it('should handle zero vectors correctly', () => {
    const vecA = [0, 0, 0];
    const vecB = [1, 2, 3];
    // Cosine similarity is undefined for zero vectors if not handled.
    // Current implementation normalizeVector returns [0,0,0] for zero vector,
    // so dot product will be 0.
    expect(calculateCosineSimilarity(vecA, vecB)).toBeCloseTo(0);
    expect(calculateCosineSimilarity(vecA, vecA)).toBeCloseTo(0); // Dot product of two zero vectors is 0
  });
});
