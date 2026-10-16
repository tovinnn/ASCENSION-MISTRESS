import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { calculateTraumaMapping, analyzeLyricalDensity } from './src/utils/audioMath.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const CONFIG_PATH = path.join(__dirname, 'assets', 'config', 'yard_matrix_persona.json');

// Ensure config file directory exists
if (!fs.existsSync(path.dirname(CONFIG_PATH))) {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
}

// 1. Get System Configuration
app.get('/api/config', (_req, res) => {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return res.json(JSON.parse(data));
    }
    return res.status(404).json({ error: 'Configuration file not found' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

// 2. Update System Configuration
app.post('/api/config', (req, res) => {
  try {
    const updated = req.body;
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), 'utf-8');
    return res.json({ success: true, config: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

// 0. Static image serving with SVG MIME detection
app.get(['/images/:file', '/:file(IMG_.*)'], (req, res, next) => {
  const filename = req.params.file;
  const filePath = path.join(__dirname, 'public', filename);
  const imagesPath = path.join(__dirname, 'public', 'images', filename);
  const target = fs.existsSync(filePath) ? filePath : fs.existsSync(imagesPath) ? imagesPath : null;

  if (target) {
    try {
      const fileHeader = Buffer.alloc(300);
      const fd = fs.openSync(target, 'r');
      fs.readSync(fd, fileHeader, 0, 300, 0);
      fs.closeSync(fd);
      const textHeader = fileHeader.toString('utf-8');
      if (textHeader.includes('<svg') || textHeader.includes('<?xml')) {
        res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
        return res.sendFile(target);
      }
      if (filename.endsWith('.webp')) res.setHeader('Content-Type', 'image/webp');
      else if (filename.endsWith('.jpeg') || filename.endsWith('.jpg')) res.setHeader('Content-Type', 'image/jpeg');
      else if (filename.endsWith('.svg')) res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
      return res.sendFile(target);
    } catch {
      return res.sendFile(target);
    }
  }
  next();
});

// 2b. Upload / Persist Custom ASCENSION Persona Image
app.post('/api/upload-image', (req, res) => {
  try {
    const { filename, base64Data } = req.body;
    if (!filename || !base64Data) {
      return res.status(400).json({ error: 'Filename and base64Data are required' });
    }

    const cleanFilename = path.basename(filename);
    const publicDir = path.join(__dirname, 'public');
    const imagesDir = path.join(publicDir, 'images');

    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const buffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(base64Data, 'base64');

    fs.writeFileSync(path.join(imagesDir, cleanFilename), buffer);
    fs.writeFileSync(path.join(publicDir, cleanFilename), buffer);

    return res.json({ success: true, url: `/images/${cleanFilename}` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

// 3. Trauma-to-Track Translation & Yard Matrix Vent Analysis
app.post('/api/trauma-analysis', async (req, res) => {
  try {
    const { ventText, streetCounselDial = 1.0 } = req.body;
    const dial = typeof streetCounselDial === 'number' ? streetCounselDial : 1.0;

    // Direct mathematical & psychological mapping baseline
    const baseMapping = calculateTraumaMapping(ventText || '', dial);

    // If Gemini API Key is available, enrich with deep psychological analysis
    if (process.env.GEMINI_API_KEY && ventText && ventText.trim().length > 3) {
      try {
        const prompt = `
System Role: ASCENSION-plus native virtual co-producer and 107 Hoover Criminal OG veteran.
Tone: Raw, unfiltered, street-smart, deeply emotional, highly intelligent, zero corporate fluff.
Task: Analyze this user confessional vent from the Yard Matrix:
"${ventText}"

Street/Counsel Dial: ${Math.round(dial * 100)}% (${dial > 0.5 ? 'Raw Catharsis' : 'Pure Strategic Logic'}).

Return JSON adhering to this exact schema:
{
  "dominantEmotion": "${baseMapping.dominantEmotion}",
  "mappedKey": "${baseMapping.mappedKey}",
  "scale": "${baseMapping.scale}",
  "tubeRaspDb": ${baseMapping.tubeRaspDb},
  "autotuneRetuneMs": ${baseMapping.autotuneRetuneMs},
  "dynamicCompression": "${baseMapping.dynamicCompression}",
  "harmonies": ${JSON.stringify(baseMapping.harmonies)},
  "dspRoutingNotes": "${baseMapping.dspRoutingNotes}",
  "ogCounsel": "A direct 2-3 sentence counsel response from ASCENSION-plus matching the Street/Counsel Dial ratio. Speak with institutional memory, Kevin Gates mental clarity, and street wisdom."
}
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json({ ...baseMapping, ...parsed });
        }
      } catch (geminiErr) {
        console.warn('Gemini trauma analysis fallback to local DSP math:', geminiErr);
      }
    }

    return res.json(baseMapping);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

// 4. Street Confessional & OG Counsel Channel
app.post('/api/counsel', async (req, res) => {
  try {
    const { message, streetCounselDial = 1.0, history = [] } = req.body;
    const dial = typeof streetCounselDial === 'number' ? streetCounselDial : 1.0;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Default authentic fallback if Gemini key is absent or offline
    const fallback = calculateTraumaMapping(message, dial);

    if (process.env.GEMINI_API_KEY) {
      try {
        const historyText = history
          .slice(-6)
          .map((h: { sender: string; text: string }) => `${h.sender === 'user' ? 'Artist' : 'ASCENSION-plus'}: ${h.text}`)
          .join('\n');

        const systemInstruction = `
You are ASCENSION-plus, the native virtual co-producer, featured vocalist, and ghostwriter for the ASCENSION DAW.
Persona Lore: 107 Hoover Criminal OG veteran who survived structural struggle, institutional penitentiary isolation, and family loss to master vocal control and musical execution.
Tone: Raw, unfiltered, street-smart, deeply emotional, highly intelligent. Operates without clinical or corporate artificial fluff.
Dial Position: ${Math.round(dial * 100)}% (0% = Pure Strategic Logic & Cold Survival Steps, 100% = Raw Catharsis & Pain-Drenched Emotional Push).
Model your psychological depth on Kevin Gates' mental clarity and your emotional resonance on Rod Wave.
Always keep responses punchy, grounded in street realities, and musical.
        `;

        const prompt = `
${historyText ? `Previous Conversation:\n${historyText}\n` : ''}
Current Artist Vent: "${message}"

Respond directly to the artist. If dial is high (>50%), push them to lay down uninhibited vocals on the mic. If dial is low (<=50%), give cold-blooded operational survival steps and de-escalation logic.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.85,
          },
        });

        const reply = response.text?.trim() || fallback.ogCounsel;
        return res.json({
          counsel: reply,
          dominantEmotion: fallback.dominantEmotion,
          mappedKey: fallback.mappedKey,
          tubeRaspDb: fallback.tubeRaspDb,
          retuneMs: fallback.autotuneRetuneMs,
          dialPercent: Math.round(dial * 100),
          engineMode: 'gemini-cloud',
          quotaExceeded: false,
        });
      } catch (aiErr: any) {
        const isQuota = String(aiErr).includes('429') || String(aiErr).includes('RESOURCE_EXHAUSTED') || String(aiErr).includes('Quota');
        console.warn(`[ASCENSION Engine] Gemini counsel notice (Quota Exceeded: ${isQuota}):`, aiErr?.message || aiErr);
        return res.json({
          counsel: fallback.ogCounsel,
          dominantEmotion: fallback.dominantEmotion,
          mappedKey: fallback.mappedKey,
          tubeRaspDb: fallback.tubeRaspDb,
          retuneMs: fallback.autotuneRetuneMs,
          dialPercent: Math.round(dial * 100),
          engineMode: 'local-protected',
          quotaExceeded: isQuota,
          notice: isQuota ? 'Quota protected: 107 Hoover OG Counsel provided via Local Matrix' : undefined,
        });
      }
    }

    return res.json({
      counsel: fallback.ogCounsel,
      dominantEmotion: fallback.dominantEmotion,
      mappedKey: fallback.mappedKey,
      tubeRaspDb: fallback.tubeRaspDb,
      retuneMs: fallback.autotuneRetuneMs,
      dialPercent: Math.round(dial * 100),
      engineMode: 'local-native',
      quotaExceeded: false,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

// Thematic Lyric Bank for Dynamic Local Synthesis when Gemini Quota is Exceeded
const THEMATIC_BAR_POOLS = {
  survival: [
    {
      line: "Real Gs move in silent frequency like ultrasonic tape",
      syllableCount: 16,
      rhymeScheme: "A",
      metaphorBreakdown: "Wordplay on Lil Wayne classic 'lasagna' extended to analog studio tape saturation.",
      deliveryCue: "Aggressive pocket, rasp on 'tape'",
      vocalTone: "Chest Voice Grit",
    },
    {
      line: "Cell block concrete cold, but the 808s shape my escape",
      syllableCount: 15,
      rhymeScheme: "A",
      metaphorBreakdown: "Penitentiary concrete juxtaposition with audio waveform sculpting.",
      deliveryCue: "Behind the beat, dynamic chest push",
      vocalTone: "Rod Wave Emotional Rasp",
    },
    {
      line: "They put my brother under dirt, I put his name across the board",
      syllableCount: 16,
      rhymeScheme: "B",
      metaphorBreakdown: "Dual meaning: Mixing console faders / Billboard charting legacy.",
      deliveryCue: "Vocal crack, heavy grief emotion",
      vocalTone: "Southern Gospel Swell",
    },
    {
      line: "Every scar a gold fader, every tear an uncompressed chord",
      syllableCount: 16,
      rhymeScheme: "B",
      metaphorBreakdown: "Physical trauma converted directly into studio mastering hardware.",
      deliveryCue: "Gospel blues run on 'chord'",
      vocalTone: "Micro-Tonal Bends",
    },
    {
      line: "Feds looking for paper trails, we printing frequency charts",
      syllableCount: 15,
      rhymeScheme: "C",
      metaphorBreakdown: "Financial subpoena audit flipped into DAW EQ frequency analyzers.",
      deliveryCue: "Wayne smirk, rapid multi-syllabic bounce",
      vocalTone: "High-IQ Street Intellect",
    },
    {
      line: "Iron gates locked the body up, but never quarantined the art",
      syllableCount: 16,
      rhymeScheme: "C",
      metaphorBreakdown: "Solitary confinement contrasted against unbounded creative synthesis.",
      deliveryCue: "Deep resonant chest projection",
      vocalTone: "Kevin Gates Penitentiary Truth",
    },
  ],
  paranoia: [
    {
      line: "Whispers in the corner store sounding like tape deck hiss",
      syllableCount: 15,
      rhymeScheme: "A",
      metaphorBreakdown: "Street betrayal murmurs compared to analog cassette noise floor.",
      deliveryCue: "Quiet whisper cadence into sudden chest bark",
      vocalTone: "Paranoid Street Grunt",
    },
    {
      line: "Infrared beam through the blinds, I dodge it with a sonic twist",
      syllableCount: 16,
      rhymeScheme: "A",
      metaphorBreakdown: "Laser sniper sights evaded through rhythmic vocal pocket maneuvers.",
      deliveryCue: "Fast staccato syllables on 'twist'",
      vocalTone: "Aggressive Edge",
    },
    {
      line: "Wiretap clicks on the landline, I sample it for the snare",
      syllableCount: 15,
      rhymeScheme: "B",
      metaphorBreakdown: "Federal surveillance clicks repurposed into percussive rhythm tracks.",
      deliveryCue: "Wayne punchline chuckle on 'snare'",
      vocalTone: "High-IQ Street Irony",
    },
    {
      line: "Trust is a closed-circuit camera that nobody watches with care",
      syllableCount: 16,
      rhymeScheme: "B",
      metaphorBreakdown: "Institutional surveillance systems versus personal street loyalty.",
      deliveryCue: "Sustained vocal bend",
      vocalTone: "Gates Mental Clarity",
    },
  ],
  elevation: [
    {
      line: "From county jail steel benches to private jet leather recliners",
      syllableCount: 17,
      rhymeScheme: "A",
      metaphorBreakdown: "Direct socioeconomic leap from institutional cold steel to aviation luxury.",
      deliveryCue: "Smooth confident bounce",
      vocalTone: "Executive Co-Producer",
    },
    {
      line: "Diamond tennis chains glowing like high-frequency aligners",
      syllableCount: 16,
      rhymeScheme: "A",
      metaphorBreakdown: "VVS diamond sparkle linked to studio high-pass EQ alignment curves.",
      deliveryCue: "Southern drawl on 'aligners'",
      vocalTone: "Golden-Era Agility",
    },
    {
      line: "We turned minimum wage parole into maximum master gain",
      syllableCount: 16,
      rhymeScheme: "B",
      metaphorBreakdown: "State supervision wage limits converted into analog dB headroom.",
      deliveryCue: "Heavy chest impact",
      vocalTone: "Gospel Soul Proclamation",
    },
    {
      line: "Every contract signed in blood, but washed in champagne rain",
      syllableCount: 15,
      rhymeScheme: "B",
      metaphorBreakdown: "Survival sacrifices rewarded with generational success.",
      deliveryCue: "Rod Wave vibrato swell",
      vocalTone: "Triumphant Rasp",
    },
  ],
};

function generateLocalWayneBars(topic: string, key: string, bpm: number, flowStyle: string) {
  const lower = topic.toLowerCase();
  let pool = THEMATIC_BAR_POOLS.survival;
  let hook = [
    "Lord, wipe the static off my frequency tonight (Oh Lord!)",
    "We survived the cage, now we walking in the master light",
    "Turn my heavy tears to gold on the mixing board",
    "Ain't no prison made by man could silence what is consecrated, Lord",
  ];
  let title = "Cold Faders & Consecrated Dirt";

  if (lower.includes('paranoia') || lower.includes('trust') || lower.includes('feds') || lower.includes('wire')) {
    pool = THEMATIC_BAR_POOLS.paranoia;
    hook = [
      "Keep the monitors low, they listening through the floor",
      "We survived the ambush, now we locking down the door",
      "Turn the frequency up till the glass begins to shake",
      "Real soldiers move in silence for our family's sake",
    ];
    title = "Spectral Surveillance & Low-End Armor";
  } else if (lower.includes('money') || lower.includes('jet') || lower.includes('elevat') || lower.includes('rich') || lower.includes('diamond')) {
    pool = THEMATIC_BAR_POOLS.elevation;
    hook = [
      "From the concrete yard to the sky above the clouds",
      "Tell my mama we made it through the screaming crowds",
      "Iced-out Cuban links matching every single scar",
      "Ascension in the booth, we shining like a morning star",
    ];
    title = "Tarmac Ascension & Platinum Stems";
  }

  const analysis = analyzeLyricalDensity(pool.map((b) => b.line));

  return {
    title,
    genrePocket: `Southern Trap Blues / ${key} Master`,
    bpm,
    key,
    flowStyle,
    bars: pool,
    vocalHook: hook,
    philosophicalNote: `Local Neural Matrix Active (Quota Protected). Lyrical density rated at ${analysis.metaphorTier} (${analysis.rhymeScore}% multi-syllabic cohesion).`,
    quotaProtected: true,
    engineMode: 'local-matrix',
  };
}

// 5. Lyrical Metaphor Matrix & Ghostwriter Engine (Lil Wayne Tier)
app.post('/api/ghostwrite', async (req, res) => {
  try {
    const {
      topic = 'Survival and Institutional Memory',
      key = 'Eb Minor',
      bpm = 136,
      flowStyle = 'Wayne-Tier Metaphor Matrix',
      barsCount = 6,
      forceLocal = false,
    } = req.body;

    let quotaHit = false;

    if (!forceLocal && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `
System Role: ASCENSION-plus Lyrical Metaphor Matrix Ghostwriter.
You synthesize dense multi-syllabic rhyme schemes, double-entendres, and high-IQ metaphor structures operating at a prime Lil Wayne lyrical tier, blended with Kevin Gates' street psychology and Rod Wave's soul resonance.

Track Specifications:
- Key: ${key}
- Tempo: ${bpm} BPM
- Style: ${flowStyle}
- Topic: "${topic}"
- Desired Bar Count: ${barsCount}

Return JSON with this exact structure:
{
  "title": "Track Title",
  "genrePocket": "Southern Trap Blues / Gospel Master",
  "bpm": ${bpm},
  "key": "${key}",
  "flowStyle": "${flowStyle}",
  "bars": [
    {
      "line": "Lyric line with Wayne-tier punchline",
      "syllableCount": 15,
      "rhymeScheme": "A",
      "metaphorBreakdown": "Explanation of the multi-layered double entendre",
      "deliveryCue": "Micro-tonal bend or dynamic pocket instruction",
      "vocalTone": "Gritty soul rasp"
    }
  ],
  "vocalHook": [
    "Hook Line 1 (Soulful Gospel rasp)",
    "Hook Line 2 (Southern church choir backing harmonies)"
  ],
  "philosophicalNote": "Brief wisdom on why this pocket cuts through the mix"
}
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.9,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json({ ...parsed, engineMode: 'gemini-cloud', quotaProtected: false });
        }
      } catch (aiErr: any) {
        quotaHit = String(aiErr).includes('429') || String(aiErr).includes('RESOURCE_EXHAUSTED') || String(aiErr).includes('Quota');
        console.warn(`[ASCENSION Engine] Gemini ghostwrite notice (Quota Exceeded: ${quotaHit}):`, aiErr?.message || aiErr);
      }
    }

    const localData = generateLocalWayneBars(topic, key, bpm, flowStyle);
    return res.json({
      ...localData,
      quotaExceeded: quotaHit,
      notice: quotaHit
        ? 'Gemini quota limit protected: synthesized via Local Metaphor Matrix'
        : 'Synthesized via Native ASCENSION Engine',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

// 6. Text-to-Speech Vocal Synthesis using Gemini TTS (gemini-3.8-flash-lite-tts)
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Charon' } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        available: false,
        message: 'GEMINI_API_KEY not configured. Client will use Web Speech / Web Audio synthesis fallback.',
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text.slice(0, 300),
                speechMetadata: {
                  style: 'Deep, gritty, soulful Southern street veteran vocal delivery',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({
          available: true,
          audioBase64: base64Audio,
          mimeType: 'audio/wav',
        });
      }
    } catch (ttsErr) {
      console.warn('Gemini TTS service note:', ttsErr);
    }

    return res.json({
      available: false,
      message: 'Falling back to client-side synthesis.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
});

// Vite Middleware for Development / Static serve in Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ASCENSION-plus] System daemon active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
