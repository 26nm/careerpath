export function getNGrams(text, n = [1, 2, 3]) {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  const ngrams = new Set();

  for (let size of n) {
    for (let i = 0; i <= words.length - size; i++) {
      const gram = words.slice(i, i + size).join(" ");
      ngrams.add(gram);
    }
  }

  return Array.from(ngrams);
}
