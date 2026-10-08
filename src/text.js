import stringWidth from "string-width";
import wrapAnsi from "wrap-ansi";

const sgr = /(\x1b\[[0-9;:]*m)/g;
/** Keep only SGR color/style sequences; remove cursor/OSC/other terminal controls. */
export function safeText(text, color = false) {
  return text
    .split(sgr)
    .map((value, index) => {
      if (index % 2) return color ? value : "";
      return value
        .replace(/\x1b\][\s\S]*?(?:\x07|\x1b\\)/g, "")
        .replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "")
        .replace(/\x1b[^\n]?/g, "")
        .replace(/\r\n?/g, "\n")
        .replace(/\t/g, "    ")
        .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/g, "");
    })
    .join("");
}
export function displayWidth(text) {
  return stringWidth(text);
}
export function wrapText(text, width, wrap = true) {
  if (!wrap) return text.split("\n");
  return wrapAnsi(text, width, { hard: true, trim: false }).split("\n");
}
