export function expandSkillPhrases(phrases) {
  const expanded = new Set();

  phrases.forEach((phrase) => {
    phrase
      .split(" ")
      .map((word) => word.trim())
      .filter(Boolean)
      .forEach((word) => expanded.add(word));
  });

  return expanded;
}
