import cors from 'cors';
import { initializeApp } from 'firebase-admin/app';
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';
import { TextToSpeechClient } from "@google-cloud/text-to-speech";

initializeApp();

const geminiApiKey = defineSecret('GEMINI_API_KEY');
const googleTtsApiKey = defineSecret('GOOGLE_TEXT_TO_SPEECH_API_KEY');

const corsMiddleware = cors({ origin: true, credentials: true });

export const speak = onRequest(
  { secrets: [googleTtsApiKey] },
  (req, res) => {
    corsMiddleware(req, res, async () => {
      if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
      }

      const text = req.body.text;
      if (!text) {
        res.status(400).send("Bad Request: Missing 'text' in body.");
        return;
      }

      try {
        const ttsClient = new TextToSpeechClient({
            clientOptions: {
                apiKey: googleTtsApiKey.value()
            }
        });

        const request = {
          input: { text: text },
          voice: { languageCode: "en-US", ssmlGender: 'FEMALE', name: 'en-US-Neural2-F' },
          audioConfig: { audioEncoding: "MP3" as const },
        };

        const [response] = await ttsClient.synthesizeSpeech(request);
        const audioContent = response.audioContent;

        if (audioContent) {
          res.set("Content-Type", "audio/mpeg");
          res.status(200).send(audioContent);
        } else {
          res.status(500).send("Internal Server Error: Audio content is null.");
        }
      } catch (error) {
        console.error("ERROR:", error);
        res.status(500).send("Internal Server Error");
      }
    });
  }
);

export const invokeLLM = onRequest(
  {
    timeoutSeconds: 300,
    secrets: [geminiApiKey],
    // remove cors: true here to avoid platform-level conflicts with custom middleware
  },
  async (req, res) => {
    // run the CORS middleware first; it will handle OPTIONS preflight responses
    corsMiddleware(req, res, async () => {
      if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
      }

      try {
        const text = req.body?.data?.text;
        if (!text) {
          res.status(400).json({ error: 'Missing text in request body.' });
          return;
        }

        // await the secret value
        const key = await geminiApiKey.value();

        // ...existing code...
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text }] }],
            }),
          }
        );

        const data = await response.json();
        res.status(200).json(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('LLM error:', message);
        res.status(500).json({ error: message });
      }
    });
  }
);
