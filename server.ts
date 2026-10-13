import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Google GenAI client (lazy or guarded)
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  if (!aiClient && apiKey) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 5000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "VIBEX AI Backend" });
  });

  // AI Mentor Advice & Performance Diagnosis
  app.post("/api/ai/mentor-advice", async (req, res) => {
    try {
      const {
        instrument,
        experienceLevel,
        skillMastery,
        currentExercise,
        audioAccuracy,
        rhythmAccuracy,
        visionMistakes,
        recentNotes,
      } = req.body;

      const ai = getAI();
      if (!ai) {
        // Fallback pedagogical response if no API key is provided
        return res.json({
          advice: `Great effort on ${instrument}! Your note pitch accuracy is ${audioAccuracy || 80}%, and timing is ${rhythmAccuracy || 75}%. Focus on keeping relaxed hands and maintaining steady tempo with the metronome.`,
          praises: [
            `Solid commitment to ${instrument} practice`,
            `Consistent pitch detection on fundamental notes`,
          ],
          areasToImprove: [
            rhythmAccuracy < 80 ? "Rhythm precision on transitions" : "Finger arch clearance",
            visionMistakes?.length ? visionMistakes[0] : "Relaxing wrist tension",
          ],
          recommendation: {
            title: `Micro-practice for ${instrument}`,
            action: "Slow down tempo by 20% and repeat the last 4 bars twice.",
          },
        });
      }

      const prompt = `You are VIBEX AI Maestro, a supportive, elite music teacher and pedagogical mentor.
Analyze the following student performance telemetry:
Instrument: ${instrument}
Experience Level: ${experienceLevel}
Current Skill/Exercise: ${JSON.stringify(currentExercise || "Fundamental notes")}
Audio Pitch Accuracy: ${audioAccuracy}%
Rhythm/Timing Accuracy: ${rhythmAccuracy}%
Computer Vision Posture Notes: ${JSON.stringify(visionMistakes || [])}
Recent Notes Played: ${JSON.stringify(recentNotes || [])}
Skill Mastery Overview: ${JSON.stringify(skillMastery || {})}

Provide concise, friendly, beginner-accessible pedagogical feedback.
Format your response as a valid JSON object with the following schema:
{
  "advice": "1-2 warm, encouraging sentences addressing their main bottleneck and celebration",
  "praises": ["praise point 1", "praise point 2"],
  "areasToImprove": ["specific adjustment 1", "specific adjustment 2"],
  "specificCorrection": "Clear actionable correction for posture or technique (e.g. thumb position, bow angle, hole coverage, wrist)",
  "recommendation": {
    "title": "Recommended next step",
    "action": "Immediate concise action (e.g. Try slow tempo practice, Repeat finger transition 3x)"
  },
  "motivationalQuote": "A brief uplifting music quote"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction:
            "You are VIBEX, an expert AI music teacher specializing in Keyboard, Guitar, Violin, and Bansuri. Be encouraging, concise, and focused on technique, posture, pitch, and rhythm.",
        },
      });

      const responseText = response.text || "{}";
      const parsed = JSON.parse(responseText);
      return res.json(parsed);
    } catch (error: any) {
      console.error("AI Mentor error:", error);
      res.status(500).json({
        error: "Failed to generate AI advice",
        fallbackAdvice: "Keep practicing steady tone production and regular rhythmic pacing.",
      });
    }
  });

  // AI Interactive Mentor Chat & Q&A
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, instrument, userContext } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.json({
          reply: `As your ${instrument} mentor, I recommend focusing on clean finger placement and practicing with a steady pulse. How else can I help you improve your playing?`,
        });
      }

      const systemPrompt = `You are VIBEX AI Music Mentor, an expert tutor for ${instrument || "music"}. 
The student is currently learning ${instrument}. 
Context: ${JSON.stringify(userContext || {})}.
Answer their question warmly, concisely (under 3 paragraphs), with actionable advice, practical fingerings, rhythm tips, or posture cues. 
If discussing Bansuri, reference Indian swaras (Sa, Re, Ga, Ma, Pa, Dha, Ni) and Western equivalents (C, D, E, F, G, A, B).
If discussing Guitar or Violin, reference proper posture, finger numbers (1-4), and bow/strum mechanics.
If discussing Keyboard, reference hand posture, finger numbers (1-5), and keyboard geography.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: message,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      res.json({ reply: response.text || "Keep practicing your daily fundamentals!" });
    } catch (error: any) {
      console.error("AI Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // AI Dynamic Micro-Exercise Generator
  app.post("/api/ai/generate-exercise", async (req, res) => {
    try {
      const { instrument, weakSkill, level } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.json({
          exercise: {
            title: `Targeted ${weakSkill || "Technique"} Booster`,
            description: `A focused 4-note repetition to solidify your ${weakSkill || "technique"}.`,
            targetNotes: [
              { note: "C4", duration: 1, fingerNumber: 1 },
              { note: "D4", duration: 1, fingerNumber: 2 },
              { note: "E4", duration: 1, fingerNumber: 3 },
              { note: "C4", duration: 2, fingerNumber: 1 },
            ],
            tempo: 60,
            focusTip: "Focus on relaxed movement and clean pitch.",
          },
        });
      }

      const prompt = `Generate a structured, micro-learning exercise for a ${level || "beginner"} student learning ${instrument}.
Their struggling skill is: ${weakSkill || "Note transitions"}.
Return a valid JSON object matching:
{
  "title": "Short title",
  "description": "1 sentence goal",
  "focusTip": "Specific posture or finger tip",
  "tempo": 60,
  "targetNotes": [
    { "note": "C4", "duration": 1, "fingerNumber": 1, "fret": 0, "string": 2 },
    { "note": "D4", "duration": 1, "fingerNumber": 2, "fret": 0, "string": 1 }
  ]
}
Ensure note names are valid (e.g. C4, D4, E4, G3 or Indian swaras Sa, Re, Ga with octave 4) suitable for ${instrument}.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are a music curriculum specialist.",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ exercise: parsed });
    } catch (error: any) {
      console.error("AI Exercise generator error:", error);
      res.status(500).json({ error: "Failed to generate exercise" });
    }
  });

  const httpServer = http.createServer(app);

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`VIBEX Server running on http://localhost:${PORT}`);
  });
}

startServer();
