import { intros } from "./moods.js";

/** Return available mood names as a fresh array. */
export function moods() {
  return Object.keys(intros);
}

/**
 * Format a message without printing, changing its punctuation, or exiting.
 * @param {string} message Nonempty message; surrounding whitespace is trimmed.
 * @param {{mood?: string}} [options] Mood name (case insensitive).
 * @returns {string} Intro, blank line, and message.
 */
export function brosay(message, options = {}) {
  if (typeof message !== "string" || !message.trim())
    throw new TypeError("Message must be a nonempty string.");
  if (!options || typeof options !== "object" || Array.isArray(options))
    throw new TypeError("Options must be an object.");
  const mood = options.mood ?? "classic";
  if (typeof mood !== "string") throw new TypeError("Mood must be a string.");
  const key = mood.trim().toLowerCase();
  if (!Object.hasOwn(intros, key))
    throw new RangeError(
      `Unknown mood: ${mood}. Choose: ${moods().join(", ")}.`,
    );
  return `${intros[key]}\n\n${message.trim()}`;
}
