import { GoogleGenAI, Modality } from "@google/genai";

// Cache for generated audio to save API calls and bandwidth
const audioCache = new Map<string, AudioBuffer>();
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000
    });
  }
  return audioContext;
};

// Base64 decoding helper
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Audio decoding helper
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000
): Promise<AudioBuffer> {
    // Note: If the API returns raw PCM, we need manual decoding. 
    // However, Gemini TTS usually returns a format needing context decoding or raw PCM.
    // For standard Web Speech fallback, we use speechSynthesis.
    // For Gemini TTS, we will assume it returns standard encoded audio or we handle the PCM if using Modality.AUDIO
    
    // For the specific gemini-2.5-flash-preview-tts model, it typically returns raw PCM or similar if specified.
    // Let's assume standard PCM flow if following the "Generate Speech" guide strictly.
    
  const numChannels = 1;
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}


export const playTextToSpeech = async (text: string, type: 'instruction' | 'content' = 'content'): Promise<void> => {
  const ctx = getAudioContext();
  
  // 1. Check Cache
  if (audioCache.has(text)) {
    const buffer = audioCache.get(text);
    if (buffer) {
        playBuffer(ctx, buffer);
        return;
    }
  }

  const apiKey = process.env.API_KEY;

  // 2. Fallback to Browser Native TTS if no API key is present
  if (!apiKey) {
    console.warn("No API_KEY found, falling back to browser SpeechSynthesis");
    return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = type === 'content' ? 1.2 : 1.1; // Higher pitch for kids
        utterance.onend = () => resolve();
        window.speechSynthesis.speak(utterance);
    });
  }

  // 3. Use Gemini TTS
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Use a friendly voice
    const voiceName = type === 'content' ? 'Puck' : 'Kore'; 
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
        throw new Error("No audio data returned from Gemini");
    }

    const audioBytes = decode(base64Audio);
    const audioBuffer = await decodeAudioData(audioBytes, ctx);
    
    // Cache it
    audioCache.set(text, audioBuffer);
    
    playBuffer(ctx, audioBuffer);

  } catch (error) {
    console.error("Gemini TTS Error:", error);
    // Fallback on error
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }
};

function playBuffer(ctx: AudioContext, buffer: AudioBuffer) {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
}
