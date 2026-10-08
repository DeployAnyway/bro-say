import c0 from "./bro.json" with { type: "json" };
import c1 from "./bug.json" with { type: "json" };
import c2 from "./coffee.json" with { type: "json" };
import c3 from "./developer.json" with { type: "json" };
import c4 from "./duck.json" with { type: "json" };
import c5 from "./dumpster-fire.json" with { type: "json" };
import c6 from "./husky.json" with { type: "json" };
import c7 from "./intern.json" with { type: "json" };
import c8 from "./laptop.json" with { type: "json" };
import c9 from "./robot.json" with { type: "json" };
import c10 from "./rocket.json" with { type: "json" };
import c11 from "./server.json" with { type: "json" };
import c12 from "./wizard.json" with { type: "json" };
export const characters = Object.fromEntries(
  [c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12].map((c) => [
    c.name,
    c,
  ]),
);
