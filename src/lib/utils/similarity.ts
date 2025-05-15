/**
 * Normalizes a vector (array of numbers) to have a magnitude of 1.
 * This is important for cosine similarity if features are on different scales,
 * though Spotify audio features are mostly 0-1 (except loudness, tempo, key, mode, duration).
 * For simplicity, we might initially use a subset of features that are already 0-1.
 * Or, apply min-max normalization if using features with different ranges.
 */
function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return vector; // Avoid division by zero
  return vector.map(val => val / magnitude);
}

/**
 * Calculates the dot product of two vectors.
 */
function dotProduct(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length for dot product.");
  }
  return vecA.reduce((sum, val, index) => sum + val * vecB[index], 0);
}

/**
 * Calculates the cosine similarity between two vectors (arrays of numbers).
 * Assumes vectors are of the same length.
 * Returns a value between -1 and 1 (or 0 and 1 if vectors are non-negative).
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length === 0 || vecB.length === 0) return 0;
  if (vecA.length !== vecB.length) {
    console.warn("Cosine similarity called with vectors of different lengths.");
    return 0;
  }

  // Normalization is crucial for cosine similarity to work as expected as a distance measure.
  // However, for Spotify audio features, they are largely on a 0-1 scale already for many relevant ones.
  // If we use features like loudness or tempo, proper scaling/normalization across the dataset is key.
  // For this initial version, we assume the input vectors are appropriately scaled or we use features
  // that don't require extensive dataset-wide normalization for a meaningful similarity score.

  const normVecA = normalizeVector(vecA);
  const normVecB = normalizeVector(vecB);

  const similarity = dotProduct(normVecA, normVecB);
  
  // Owing to floating point inaccuracies, similarity can sometimes be slightly outside [-1, 1]
  return Math.max(-1, Math.min(1, similarity));
}

/**
 * Prepares an audio features object from Spotify into a numerical vector for similarity calculation.
 * Selects a subset of features and defines their order.
 * Note: Normalization might be needed depending on the selected features.
 * For instance, tempo is in BPM, loudness in dB. Others are 0-1.
 */
export const SPOTIFY_FEATURE_VECTOR_KEYS: (keyof SpotifyApi.AudioFeaturesObject)[] = [
  'danceability',
  'energy',
  'valence',
  'acousticness',
  'instrumentalness',
  'liveness',
  'speechiness',
  // Consider adding normalized versions of these if used:
  // 'loudness', (e.g. map -60 to 0 dB to 0-1)
  // 'tempo', (e.g. map 50-200 BPM to 0-1)
  // 'key', 'mode', 'time_signature' are categorical/cyclical, harder to use directly in cosine similarity without transformation (e.g. one-hot encoding)
];

// Extended AudioFeaturesObject to include id, uri, etc. if we pass the whole object
export interface SpotifyAudioFeaturesObjectExtended extends SpotifyApi.AudioFeaturesObject {
  id: string;
  uri: string;
  // Potentially add track name, artists for easier reference if needed, but keep core for vector
}

export function audioFeaturesToVector(features: SpotifyApi.AudioFeaturesObject | SpotifyAudioFeaturesObjectExtended): number[] {
  return SPOTIFY_FEATURE_VECTOR_KEYS.map(key => features[key] as number); 
  // Casting to number as these specific keys should be numbers.
  // Add more robust error handling or default values if features can be missing.
}

// Example of a more robust normalization for a specific feature if its range is known
// export function normalizeLoudness(loudness: number): number {
//   const MIN_LOUDNESS = -60; // typical min
//   const MAX_LOUDNESS = 0;   // typical max
//   if (loudness < MIN_LOUDNESS) return 0;
//   if (loudness > MAX_LOUDNESS) return 1;
//   return (loudness - MIN_LOUDNESS) / (MAX_LOUDNESS - MIN_LOUDNESS);
// }

// export function normalizeTempo(tempo: number): number {
//   const MIN_TEMPO = 50;  // example min BPM
//   const MAX_TEMPO = 220; // example max BPM
//   if (tempo < MIN_TEMPO) return 0;
//   if (tempo > MAX_TEMPO) return 1;
//   return (tempo - MIN_TEMPO) / (MAX_TEMPO - MIN_TEMPO);
// } 