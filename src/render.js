import { characters } from "./characters/index.js";
import { personas } from "./personas.js";
import { themes } from "./themes.js";
import { safeText, displayWidth, wrapText } from "./text.js";
import { choose } from "./random.js";
import { brosay as legacySay } from "./legacy.js";
export { displayWidth };
export const listCharacters = () => Object.keys(characters);
export const moods = () => Object.keys(personas);
export const listThemes = () => Object.keys(themes);
function name(value, catalog, fallback, kind) {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== "string")
    throw new TypeError(`${kind} must be a string.`);
  const key = value.trim().toLowerCase();
  if (!Object.hasOwn(catalog, key))
    throw new RangeError(
      `Unknown ${kind}: ${value}. Choose: ${Object.keys(catalog).join(", ")}.`,
    );
  return key;
}
function characterData(value) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    typeof value.name !== "string" ||
    !/^[a-z0-9-]{1,40}$/.test(value.name) ||
    !Array.isArray(value.art) ||
    value.art.length < 1 ||
    value.art.length > 20 ||
    !value.art.every(
      (line) =>
        typeof line === "string" &&
        line.length <= 64 &&
        /^[\x20-\x7e]*$/.test(line),
    )
  )
    throw new TypeError(
      "Custom character needs a slug name and 1–20 printable ASCII lines of at most 64 characters.",
    );
  return { name: value.name, art: [...value.art] };
}
export function renderBro(options) {
  if (!options || typeof options !== "object" || Array.isArray(options))
    throw new TypeError("Provide a render options object.");
  const { text } = options;
  if (typeof text !== "string" || !text.trim())
    throw new TypeError("Message must be a nonempty string.");
  if (text.length > 262144)
    throw new RangeError("Message exceeds 262144 UTF-16 code units.");
  for (const key of ["random", "color", "wrap", "think", "box"])
    if (options[key] !== undefined && typeof options[key] !== "boolean")
      throw new TypeError(`${key} must be a boolean.`);
  if (
    options.seed !== undefined &&
    typeof options.seed !== "string" &&
    !(typeof options.seed === "number" && Number.isFinite(options.seed))
  )
    throw new TypeError("seed must be a string or finite number.");
  if (options.seed !== undefined && !options.random)
    throw new TypeError("seed requires random: true.");
  const width = options.width ?? 48;
  if (!Number.isSafeInteger(width) || width < 8 || width > 200)
    throw new RangeError(
      "width must be an integer from 8 to 200 (content columns).",
    );
  const mode = name(
    options.mode,
    { say: 1, think: 1 },
    options.think ? "think" : "say",
    "mode",
  );
  const theme = name(
    options.theme,
    themes,
    options.random ? choose(listThemes(), options.seed, "theme") : "classic",
    "theme",
  );
  const mood = name(
    options.mood,
    personas,
    options.random ? choose(moods(), options.seed, "mood") : "classic",
    "mood",
  );
  const custom =
    typeof options.character === "object" && options.character !== null;
  const character = custom
    ? characterData(options.character)
    : characters[
        name(
          options.character,
          characters,
          options.random
            ? choose(listCharacters(), options.seed, "character")
            : "husky",
          "character",
        )
      ];
  const layout = name(
    options.layout,
    { bubble: 1, plain: 1 },
    "bubble",
    "layout",
  );
  const message = safeText(text, options.color ?? false).trim();
  if (!message) throw new TypeError("Message contains no printable content.");
  const persona = personas[mood];
  let rendered;
  if (layout === "plain" || options.box) {
    const legacy = legacySay(message, {
      mood: Object.hasOwn(legacyIntros, mood) ? mood : "classic",
      box: false,
    });
    const lines = legacy.split("\n");
    if (
      options.box &&
      (lines.length > 100 || Math.max(...lines.map(displayWidth)) > 200)
    )
      throw new RangeError("Legacy box exceeds 200 columns or 100 lines.");
    rendered = options.box ? bubble(lines, themes.classic, false) : legacy;
  } else {
    const contents = [
      persona.intro,
      ...(persona.label ? ["", persona.label] : []),
      "",
      message,
      ...(persona.outro ? ["", persona.outro] : []),
    ].join("\n");
    const lines = wrapText(contents, width, options.wrap ?? true);
    if (lines.length > 4096)
      throw new RangeError(
        "Rendered output exceeds 4096 lines. Increase width or shorten input.",
      );
    const connector = mode === "think" ? "   o\n    o" : "   \\\n    \\";
    rendered =
      bubble(lines, themes[theme], options.color ?? false) +
      "\n" +
      connector +
      "\n" +
      character.art.map((line) => "     " + line).join("\n");
  }
  return {
    text: message,
    character: character.name,
    mood,
    theme,
    mode,
    width,
    rendered,
  };
}
const legacyIntros = {
  classic: 1,
  hype: 1,
  chill: 1,
  panic: 1,
  corporate: 1,
  coach: 1,
};
function bubble(lines, theme, color) {
  const columns = Math.max(...lines.map(displayWidth));
  const border = (parts) => parts[0] + parts[1].repeat(columns + 2) + parts[2];
  const body = lines.map(
    (line) =>
      `${theme.side} ${line}${color ? "\x1b[0m" : ""}${" ".repeat(columns - displayWidth(line))} ${theme.side}`,
  );
  const result = [border(theme.top), ...body, border(theme.bottom)].join("\n");
  return color ? `\x1b[${theme.color}m${result}\x1b[0m` : result;
}
export function brosay(text, options = {}) {
  if (!options || typeof options !== "object" || Array.isArray(options))
    throw new TypeError("Options must be an object.");
  return renderBro({ ...options, text }).rendered;
}
export function brothink(text, options = {}) {
  if (!options || typeof options !== "object" || Array.isArray(options))
    throw new TypeError("Options must be an object.");
  return renderBro({ ...options, text, mode: "think" }).rendered;
}
