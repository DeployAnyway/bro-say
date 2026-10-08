import {
  renderBro,
  listCharacters,
  moods,
  listThemes,
} from "../dist/browser.js";

const element = (id) => document.getElementById(id);
for (const [id, names, selected] of [
  ["character", listCharacters(), "husky"],
  ["mood", moods(), "sarcastic"],
  ["theme", listThemes(), "classic"],
]) {
  for (const name of names) {
    const option = document.createElement("option");
    option.value = option.textContent = name;
    option.selected = name === selected;
    element(id).append(option);
  }
}
function render() {
  try {
    element("output").textContent = renderBro({
      text: element("message").value,
      character: element("character").value,
      mood: element("mood").value,
      theme: element("theme").value,
      mode: element("mode").value,
      width: Number(element("width").value),
    }).rendered;
    element("status").textContent = "";
    element("copy").disabled = false;
  } catch (error) {
    element("status").textContent = error.message;
    element("output").textContent = "";
    element("copy").disabled = true;
  }
}
element("controls").addEventListener("input", render);
element("controls").addEventListener("submit", (event) =>
  event.preventDefault(),
);
element("copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(element("output").textContent);
    element("status").textContent = "Copied. Ship the message responsibly.";
  } catch {
    element("status").textContent =
      "Clipboard unavailable. Select and copy the output manually.";
  }
});
render();
