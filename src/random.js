/** Stateless deterministic choices; type tagging distinguishes 42 from '42'. */
export function choose(names, seed, salt) {
  if (seed === undefined)
    return names[Math.floor(Math.random() * names.length)];
  const value = `${salt}:${typeof seed}:${seed}`;
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return names[hash % names.length];
}
