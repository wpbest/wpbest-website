import { initializeApp } from "firebase-admin/app";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

initializeApp();

const geminiApiKey = defineSecret("GEMINI_API_KEY");

export const invokeLLM = onRequest(
  {
    timeoutSeconds: 300,
    cors: true,             // Allow all origins (your current goal)
    secrets: [geminiApiKey] // Load API key securely
  },
  async (req, res) => {
    try {
      const text = req.body?.data?.text;
      if (!text) {
        res.status(400).json({ error: "Missing text in request body." });
        return;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiApiKey.value()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text }] }]
          })
        }
      );

      res.status(200).json(await response.json());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("LLM error:", message);
      res.status(500).json({ error: message });
    }
  }
);
