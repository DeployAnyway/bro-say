# Static demo

Run npm ci and npm run build at the repository root. Serve the root with a static HTTP server, then open /demo/. Do not open as a file URL: browsers restrict module imports.

For GitHub Pages, copy demo/index.html, app.js and style.css to the site root, change the app import to ./dist/browser.js, and include dist/browser.js plus THIRD-PARTY-LICENSES.txt. No backend or package installation is needed by visitors. The candidate banner must remain until publication is approved.

The page uses semantic labels, keyboard-native controls, live errors and clipboard feedback. It scrolls wide terminal output rather than clipping it. Modern Intl.Segmenter and Unicode v-flag support are required.
