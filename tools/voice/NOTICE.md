# Offline voice

- **Model:** [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) v1.0 (Apache-2.0), quantized ONNX from
  `onnx-community/Kokoro-82M-v1.0-ONNX`, installed from the `kokoro-q8-shards` npm package.
- **Voices:** `voices/hm_omega.bin` and `voices/hm_psi.bin` — Kokoro's Hindi male voice styles (Apache-2.0),
  copied from the `kokoro-js` npm package.
- **Vocabulary:** `vocab.json` — Kokoro's phoneme vocabulary (from its tokenizer config).
- **Phonemes:** eSpeak NG (GPL-3.0) compiled to WebAssembly (`espeak-ng` npm package), used only at build time to turn
  Devanagari into Hindi IPA. Nothing from eSpeak is shipped in the app.

Usage:

```bash
npm --prefix tools/voice install     # one time, ~600 MB (ONNX runtime)
npm run build:voice:offline          # writes public/voice/*.mp3 and public/voice/manifest.json (needs ffmpeg)
```
