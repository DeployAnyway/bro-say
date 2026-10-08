import { build } from "esbuild";
import { format as formatSource } from "prettier";
import { mkdir, writeFile, readdir, readFile } from "node:fs/promises";
await mkdir("dist", { recursive: true });
const files = (await readdir("src/characters"))
  .filter((f) => f.endsWith(".json"))
  .sort();
const imports = files
  .map(
    (file, index) => `import c${index} from "./${file}" with { type: "json" };`,
  )
  .join("\n");
await writeFile(
  "src/characters/index.js",
  await formatSource(
    imports +
      "\nexport const characters = Object.fromEntries([" +
      files.map((_, i) => "c" + i).join(", ") +
      "].map(c => [c.name, c]));\n",
    { parser: "babel" },
  ),
);
const formats = [
  ["esm", "index.js"],
  ["cjs", "index.cjs"],
];
for (const [format, file] of formats)
  await build({
    entryPoints: ["src/index.js"],
    outfile: "dist/" + file,
    bundle: true,
    packages: format === "esm" ? "external" : undefined,
    format,
    platform: "node",
    target: "node22",
    sourcemap: true,
  });
await build({
  entryPoints: ["src/index.js"],
  outfile: "dist/browser.js",
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "esnext",
});
// Browser bundle contains MIT third-party code; preserve attribution with it.
let notices = "Third-party MIT licenses bundled into dist/browser.js\n\n";
for (const name of [
  "string-width",
  "wrap-ansi",
  "strip-ansi",
  "ansi-regex",
  "ansi-styles",
  "get-east-asian-width",
]) {
  const files = await readdir("node_modules/" + name);
  const license = files.find((file) => /^license(?:\.md|\.txt)?$/i.test(file));
  if (license)
    notices +=
      name +
      "\n" +
      (await readFile("node_modules/" + name + "/" + license, "utf8")) +
      "\n";
}
await writeFile("dist/THIRD-PARTY-LICENSES.txt", notices);
await writeFile("index.d.cts", await readFile("index.d.ts"));
