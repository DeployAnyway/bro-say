import { choose } from "./random.js";
const presets = {
  deployment: [
    "The release has landed. Please keep your monitoring inside the vehicle.",
    "Shipped with confidence. Verified with health checks.",
    "Today we deploy code and a reasonable rollback plan.",
    "The canary is singing. Let us keep listening.",
    "A small release for the app. A large relief for the team.",
    "The deployment passed. The dashboard gets the final word.",
  ],
  testing: [
    "Red, green, refactor. Snacks are an optional fourth step.",
    "The test failed usefully. That is a good beginning.",
    "A passing test is a receipt, not a prophecy.",
    "Make the edge case boring enough to test.",
    "One regression test today saves a mystery tomorrow.",
    "The suite is green. Check what it actually covered.",
  ],
  debugging: [
    "Read the first error before collecting the entire stack trace.",
    "The rubber duck requests a smaller reproduction.",
    "Follow the value. It knows where it has been.",
    "A breakpoint is cheaper than a theory committee.",
    "The bug cannot hide from a clear input and a patient developer.",
    "One hypothesis. One experiment. One less guess.",
  ],
  review: [
    "Review the change, not the person who wrote it.",
    "A kind question can save a very loud incident.",
    "The clever line would appreciate a simple explanation.",
    "If future-you needs a map, leave a comment today.",
    "LGTM comes after understanding the diff.",
    "Small commits make excellent conversation starters.",
  ],
  coffee: [
    "The code is brewing. So is the coffee.",
    "A refill is not a retry policy, but it can improve the meeting.",
    "This mug contains the unofficial build coordinator.",
    "The coffee is hot. The take can wait.",
    "Hydrate between compilations. Your compiler does not need another cup.",
    "A short break is a legitimate debugging technique.",
  ],
  celebration: [
    "The fix worked. Give the test its share of the applause.",
    "Celebrate the boring release. It took good work to make it boring.",
    "One fewer alert. One more reason to take a walk.",
    "The team shipped a useful thing. That deserves a victory lap.",
    "Success has receipts and a very happy tail.",
    "Treat budget approved after verification.",
  ],
  husky: [
    "Dallas brings the zoomies. Benji brings the next idea.",
    "Two huskies, one keyboard, absolutely no quiet roadmap.",
    "Commit small. Run fast. Leave the socks out of production.",
    "Dallas heard deploy. Benji heard play. Both approve a smoke test.",
    "High energy is a feature. Good boundaries keep it useful.",
    "Our huskies believe every adventure deserves enthusiasm and a return route.",
  ],
  focus: [
    "Pick the next useful step. Finish that one.",
    "Reduce the scope until the problem fits in your afternoon.",
    "Your terminal can have personality. Your interfaces should have clarity.",
    "Small progress counts even without a dramatic soundtrack.",
    "A helpful tool should make the next action easier to see.",
    "Close one loop before opening six more tabs.",
  ],
};
export const messageCategories = () => Object.keys(presets);
export function messagePresets(category) {
  if (
    typeof category !== "string" ||
    !Object.hasOwn(presets, category.trim().toLowerCase())
  )
    throw new RangeError(
      "Choose a supported message category: " + messageCategories().join(", "),
    );
  return [...presets[category.trim().toLowerCase()]];
}
export function broMessage(category = "deployment", options = {}) {
  if (!options || typeof options !== "object" || Array.isArray(options))
    throw new TypeError("Options must be an object.");
  if (
    options.seed !== undefined &&
    typeof options.seed !== "string" &&
    !(typeof options.seed === "number" && Number.isFinite(options.seed))
  )
    throw new TypeError("seed must be a string or finite number.");
  return choose(
    messagePresets(category),
    options.seed,
    "message:" + category.trim().toLowerCase(),
  );
}
