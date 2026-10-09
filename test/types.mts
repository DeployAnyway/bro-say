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
import { summarizeBuild, renderBuildSummary } from "@deployanyway/bro-say";
summarizeBuild({ exitCode: 0, tests: { passed: 4, failed: 0 } });
renderBuildSummary({ exitCode: null }, { format: "plain" });
// @ts-expect-error exit code must be numeric
summarizeBuild({ exitCode: "pass" });
