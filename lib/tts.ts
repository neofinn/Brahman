// Server-side neural text-to-speech: a natural Indian male voice for Brahman (Hindi/Sanskrit and Indian English).
// Uses Azure Speech (hi-IN-MadhurNeural / en-IN-PrabhatNeural) or Google Cloud Text-to-Speech, whichever is configured.

export type TtsLang = "hi" | "en";
/** "chant" recites mantras: slower, deeper and with longer pauses at each danda. */
export type TtsStyle = "speech" | "chant";

export interface TtsProvider {
  name: "azure" | "google";
  synthesize(text: string, lang: TtsLang, style?: TtsStyle): Promise<ArrayBuffer>;
}

const escapeXml = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

/** SSML for a calm pandit delivery: slightly slower and lower, with a pause at each danda. */
export function azureSsml(text: string, lang: TtsLang, style: TtsStyle = "speech"): string {
  const voice = lang === "hi" ? process.env.AZURE_TTS_VOICE_HI || "hi-IN-MadhurNeural" : process.env.AZURE_TTS_VOICE_EN || "en-IN-PrabhatNeural";
  const chant = style === "chant";
  const body = escapeXml(text).replace(/\s*[।॥]+\s*/g, `। <break time="${chant ? 700 : 350}ms"/> `);
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang === "hi" ? "hi-IN" : "en-IN"}"><voice name="${voice}"><prosody rate="${chant ? "-20%" : "-8%"}" pitch="${chant ? "-8%" : "-3%"}">${body}</prosody></voice></speak>`;
}

export function ttsProvider(env: Record<string, string | undefined> = process.env): TtsProvider | null {
  if (env.AZURE_SPEECH_KEY && env.AZURE_SPEECH_REGION) {
    const key = env.AZURE_SPEECH_KEY, region = env.AZURE_SPEECH_REGION;
    return {
      name: "azure",
      async synthesize(text, lang, style = "speech") {
        const res = await fetch(env.AZURE_TTS_ENDPOINT || `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": key,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
            "User-Agent": "brahman",
          },
          body: azureSsml(text, lang, style),
        });
        if (!res.ok) throw new Error(`Azure TTS ${res.status}`);
        return res.arrayBuffer();
      },
    };
  }
  if (env.GOOGLE_TTS_API_KEY) {
    const key = env.GOOGLE_TTS_API_KEY;
    return {
      name: "google",
      async synthesize(text, lang, style = "speech") {
        const res = await fetch(env.GOOGLE_TTS_ENDPOINT || `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(key)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: { text },
            voice: lang === "hi" ? { languageCode: "hi-IN", name: env.GOOGLE_TTS_VOICE_HI || "hi-IN-Neural2-B" } : { languageCode: "en-IN", name: env.GOOGLE_TTS_VOICE_EN || "en-IN-Neural2-B" },
            audioConfig: { audioEncoding: "MP3", speakingRate: style === "chant" ? 0.8 : 0.92, pitch: style === "chant" ? -4 : -2 },
          }),
        });
        if (!res.ok) throw new Error(`Google TTS ${res.status}`);
        const { audioContent } = (await res.json()) as { audioContent: string };
        const bytes = Buffer.from(audioContent, "base64");
        return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
      },
    };
  }
  return null;
}

