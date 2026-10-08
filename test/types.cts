import bro = require("@deployanyway/bro-say");
bro.brosay("Hello", { character: "husky" });
// @ts-expect-error invalid mood
bro.brothink("Hello", { mood: "unknown" });
