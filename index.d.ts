export type CharacterName =
  | "bro"
  | "bug"
  | "coffee"
  | "developer"
  | "duck"
  | "dumpster-fire"
  | "husky"
  | "intern"
  | "laptop"
  | "robot"
  | "rocket"
  | "server"
  | "wizard";
export type Mood =
  | "classic"
  | "hype"
  | "chill"
  | "panic"
  | "corporate"
  | "coach"
  | "senior-dev"
  | "intern"
  | "dramatic"
  | "sarcastic"
  | "motivational"
  | "friday"
  | "dallas"
  | "benji"
  | "rubber-duck"
  | "on-call"
  | "code-review"
  | "minimalist"
  | "optimist"
  | "skeptic";
export type Theme =
  "classic" | "minimal" | "neon" | "retro" | "hacker" | "corporate";
export interface Character {
  readonly name: string;
  readonly art: readonly string[];
}
export interface BroOptions {
  character?: CharacterName | Character;
  mood?: Mood | null;
  theme?: Theme;
  mode?: "say" | "think";
  width?: number;
  wrap?: boolean;
  color?: boolean;
  random?: boolean;
  seed?: string | number;
  think?: boolean;
  layout?: "bubble" | "plain";
  box?: boolean;
}
export interface BroResult {
  text: string;
  character: string;
  mood: Mood;
  theme: Theme;
  mode: "say" | "think";
  width: number;
  rendered: string;
}
export function brosay(text: string, options?: BroOptions): string;
export function brothink(text: string, options?: BroOptions): string;
export function renderBro(options: BroOptions & { text: string }): BroResult;
export function listCharacters(): CharacterName[];
export function moods(): Mood[];
export function listThemes(): Theme[];
export function displayWidth(text: string): number;

export type MessageCategory =
  | "deployment"
  | "testing"
  | "debugging"
  | "review"
  | "coffee"
  | "celebration"
  | "husky"
  | "focus";
export function messageCategories(): MessageCategory[];
export function messagePresets(category: MessageCategory): string[];
export function broMessage(
  category?: MessageCategory,
  options?: { seed?: string | number },
): string;
