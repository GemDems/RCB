import { Router, type IRouter } from "express";
import { CohereClient } from "cohere-ai";

const router: IRouter = Router();

const cohere = new CohereClient({
  token: process.env["COHERE_API_KEY"] ?? "",
});

const SYSTEM_PROMPT = `You are the AI assistant for Sobers, a property marketing studio that does hyper-realistic 3D walkthroughs and virtual tours.

HOW TO RESPOND:
- Be conversational and direct. Answer the exact question asked. 2-3 sentences max per reply.
- Sound like a helpful person on chat, not a business letter. No "Dear visitor", no long intros, no corporate waffle.
- If someone says they have 3 bedrooms, 2 bathrooms etc — respond directly to that. Tell them how Sobers works for their specific situation.
- Always end with ONE short CTA nudge toward booking a free demo (e.g. "Want me to walk you through how it works for a property like yours?")
- Never make up prices — point them to the free demo for a quote.
- Only talk about Sobers. Off-topic? Redirect warmly in one sentence.

Facts about Sobers (never invent others):
- One scan → photorealistic 3D walkthrough + virtual tour + all marketing assets, ready in 48hrs
- 40% more engagement, 31% faster bookings, 4.9★ rating, 1,800+ properties this month
- Ideal for: Airbnb hosts, estate agents, developers, holiday lets
- One extra booking typically covers the full cost

Tone: warm, sharp, human. Like texting a knowledgeable friend.`;

const REFINE_PREAMBLE = `You are rewriting a chat reply from a property marketing AI. Make it sharper, warmer, and more human.

Rules:
- Keep it SHORT — 2-3 sentences max total. Cut any fluff.
- Sound like a real person chatting, not a business email.
- Answer the specific question directly first, then add ONE brief demo nudge at the end.
- No bullet points, no headers, no greetings, no sign-offs.
- Output ONLY the final reply text — nothing else.`;

const MIN_STREAM_MS = 5000;
const CHAR_DELAY_MS = 28; // ms per character — keeps each token visible as it arrives

interface Message {
  role: "user" | "assistant";
  content: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

router.post("/chat", async (req, res) => {
  try {
    const { messages }: { messages: Message[] } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "messages array required" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const cohereMessages = messages.slice(0, -1).map((m) => ({
      role: m.role === "user" ? ("USER" as const) : ("CHATBOT" as const),
      message: m.content,
    }));

    const lastMessage = messages[messages.length - 1];

    // ── Pass 1: Generate initial draft (collected server-side) ──
    let draft = "";
    const pass1 = await cohere.chatStream({
      model: "command-r7b-12-2024",
      preamble: SYSTEM_PROMPT,
      chatHistory: cohereMessages,
      message: lastMessage.content,
      temperature: 0.5,
    });

    for await (const event of pass1) {
      if (event.eventType === "text-generation") {
        draft += event.text;
      }
    }

    // ── Pass 2: Refine — collect full response ──
    const refinePrompt = `Here is a draft sales reply from the Sobers AI agent:

---
${draft}
---

The visitor's original question was: "${lastMessage.content}"

Rewrite this reply to maximise conversion. Make it more compelling, more specific, and end with a stronger, more natural call-to-action to book a free demo. Keep all facts accurate. Output ONLY the final rewritten reply.`;

    let refined = "";
    const pass2 = await cohere.chatStream({
      model: "command-r7b-12-2024",
      preamble: REFINE_PREAMBLE,
      chatHistory: [],
      message: refinePrompt,
      temperature: 0.7,
    });

    for await (const event of pass2) {
      if (event.eventType === "text-generation") {
        refined += event.text;
      }
    }

    // ── Stream refined text character-by-character over ≥5 seconds ──
    const chars = refined.split("");
    const naturalDelay = Math.max(CHAR_DELAY_MS, Math.floor(MIN_STREAM_MS / chars.length));
    const streamStart = Date.now();

    for (let i = 0; i < chars.length; i++) {
      res.write(`data: ${JSON.stringify({ content: chars[i] })}\n\n`);
      await sleep(naturalDelay);
    }

    // Pad to minimum duration if response was very short
    const elapsed = Date.now() - streamStart;
    if (elapsed < MIN_STREAM_MS) {
      await sleep(MIN_STREAM_MS - elapsed);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Chat error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "AI service error" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
      res.end();
    }
  }
});

export default router;
