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
  if (options.box !== undefined && typeof options.box !== "boolean")
    throw new TypeError("box must be a boolean.");
  const mood = options.mood ?? "classic";
  if (typeof mood !== "string") throw new TypeError("Mood must be a string.");
  const key = mood.trim().toLowerCase();
  if (!Object.hasOwn(intros, key))
    throw new RangeError(
      `Unknown mood: ${mood}. Choose: ${moods().join(", ")}.`,
    );
  const output = `${intros[key]}\n\n${message.trim()}`;
  if (!options.box) return output;
  const lines = output.split(/\r?\n/);
  const width = Math.max(...lines.map((line) => Array.from(line).length));
  if (width > 200 || lines.length > 100)
    throw new RangeError(
      "Boxed output is limited to 200 code points per line and 100 lines.",
    );
  const border = "+" + "-".repeat(width + 2) + "+";
  return [
    border,
    ...lines.map(
      (line) =>
        "| " + line + " ".repeat(width - Array.from(line).length) + " |",
    ),
    border,
  ].join("\n");
}
