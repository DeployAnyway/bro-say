import { intros } from "./moods.js";
export function brosay(message, { mood = "classic" } = {}) {
  return `${intros[mood]}\n\n${message.trim()}`;
}
