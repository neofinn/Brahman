// Builds the single-file beta (dist-beta/index.html): the whole browser app in one page, no server needed.
import { build } from "esbuild";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));

const aliases = {
  name: "aliases",
  setup(b) {
    b.onResolve({ filter: /^next\/link$/ }, () => ({ path: path.join(root, "beta/shims/next-link.tsx") }));
    b.onResolve({ filter: /^next\/navigation$/ }, () => ({ path: path.join(root, "beta/shims/next-navigation.ts") }));
    b.onResolve({ filter: /^next(\/.*)?$/ }, (args) => ({ errors: [{ text: `next import not available in the beta: ${args.path}` }] }));
  },
};

const result = await build({
  entryPoints: [path.join(root, "beta/main.tsx")],
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  jsx: "automatic",
  write: false,
  plugins: [aliases],
  alias: { "@": root },
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
});
const js = result.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const css = (await readFile(path.join(root, "app/globals.css"), "utf8")).replace(/<\/style/gi, "");

// Recorded mantras and kathas (npm run build:voice / build:voice:offline) are copied next to the page as voice/*.mp3,
// published with it as supporting files, so the beta speaks in the recorded human-like voice with no server.
let voice = "";
let voiceFiles = 0;
try {
  const manifest = JSON.parse(await readFile(path.join(root, "public/voice/manifest.json"), "utf8"));
  await mkdir(path.join(root, "dist-beta/voice"), { recursive: true });
  const urls = {};
  for (const [text, file] of Object.entries(manifest)) {
    await copyFile(path.join(root, "public/voice", file), path.join(root, "dist-beta/voice", file));
    urls[text] = `voice/${file}`;
    voiceFiles++;
  }
  voice = `<script>window.__BRAHMAN_VOICE__=${JSON.stringify(urls).replace(/<\//g, "<\\/")};</script>`;
} catch {}

const html = `<title>Brahman</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Brahman ${pkg.version} — your Sanatan Dharma purohit: puja and hawan guides, kathas, kundli, panchang and prayers.">
<style>
${css}
html, body { background: var(--bg); color: var(--text); }
.site-header { top: env(safe-area-inset-top, 0px); }
body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--bg); }
</style>
<div id="brahman-root"><main><div class="container"><p style="padding:40px 0;text-align:center">ॐ Loading Brahman…</p></div></main></div>
${voice}<script>${js}</script>
`;
await mkdir(path.join(root, "dist-beta"), { recursive: true });
if (!voice) await rm(path.join(root, "dist-beta/voice"), { recursive: true, force: true });
await writeFile(path.join(root, "dist-beta/index.html"), html);
console.log(`dist-beta/index.html — ${(html.length / 1024).toFixed(0)} KB (Brahman ${pkg.version})${voice ? `, with ${voiceFiles} recordings in dist-beta/voice/` : ""}`);
