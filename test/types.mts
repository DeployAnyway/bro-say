import {
  brosay,
  brothink,
  renderBro,
  listCharacters,
  type BroResult,
} from "@deployanyway/bro-say";
const result: BroResult = renderBro({
  text: "Hello",
  character: "husky",
  mood: "friday",
  theme: "neon",
  random: true,
  seed: 42,
});
brosay(result.text, { character: { name: "custom", art: ["[me]"] } });
brothink("why", { width: 30 });
listCharacters();
// @ts-expect-error unknown character
brosay("x", { character: "copied-cow" });
// @ts-expect-error width must be numeric
brosay("x", { width: "30" });
// @ts-expect-error message required
renderBro({ mood: "panic" });
import {
  broMessage,
  messagePresets,
  messageCategories,
} from "@deployanyway/bro-say";
broMessage("husky", { seed: "x" });
messagePresets("focus");
messageCategories();
