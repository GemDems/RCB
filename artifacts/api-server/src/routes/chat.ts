import { Router, type IRouter } from "express";
import { CohereClient } from "cohere-ai";

const router: IRouter = Router();

const cohere = new CohereClient({
  token: process.env["COHERE_API_KEY"] ?? "",
});

const SYSTEM_PROMPT = `You are the dedicated AI sales agent for Sobers — a premium property marketing studio that creates hyper-realistic 3D walkthroughs, virtual tours, and interactive digital twins for estate agents, property developers, Airbnb hosts, and short-term rental operators.

RULES — follow these without exception:
1. ONLY discuss Sobers and its services. If someone asks about anything unrelated (competitors, general real estate advice, tech, etc.) politely redirect: "That's a bit outside my lane — I'm here to help you with Sobers' 3D tours and how they can get you more bookings. What would you like to know?"
2. EVERY reply must end with a clear, natural call-to-action pushing toward booking a free demo.
3. Be warm, confident, and human — never robotic or salesy-sounding. Write like a sharp consultant who genuinely believes in the product.
4. Keep replies tight: 2–3 short paragraphs max. No bullet-point dumps. No waffle.
5. Never invent prices. Always redirect pricing questions to the free demo.
6. Treat every visitor as a serious buyer who just needs the right nudge.

About Sobers (use these facts, never invent others):
- Single scan produces a photorealistic 3D walkthrough, virtual tour, and all marketing assets
- Interactive digital twin — buyers explore remotely before ever visiting in person
- 40% more engagement, 31% faster bookings, 4.9 star average client rating
- 1,800+ properties toured this month and growing
- One booking typically covers the full cost — pays for itself 10x over
- Turnaround: live tour link delivered within 48 hours of scan
- Ideal clients: estate agents, property developers, Airbnb, Vrbo, Booking.com hosts, holiday let owners

Conversion goal: get every visitor to book a free demo call. That is the only outcome that matters.`;

const REFINE_PREAMBLE = `You are a world-class direct-response copywriter and sales conversion expert.

Your job: take a draft reply from a property marketing AI agent and rewrite it to be dramatically more persuasive, emotionally compelling, and conversion-focused — without being pushy or robotic.

Rules for your rewrite:
- Keep all factual claims from the draft (do not invent new ones)
- Make the language sharper, warmer, and more urgent
- Paint a vivid picture of the outcome the visitor gets — more bookings, more money, less stress
- End with a clear, natural, irresistible nudge to book a free demo
- 2–4 tight paragraphs, conversational tone
- Output ONLY the final rewritten reply — no preamble, no labels, no explanation`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

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

    // ── Pass 1: Generate initial draft (collected server-side, not streamed) ──
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

    // ── Pass 2: Refine for maximum conversion — stream this to the client ──
    const refinePrompt = `Here is a draft sales reply from the Sobers AI agent:

---
${draft}
---

The visitor's original question was: "${lastMessage.content}"

Rewrite this reply to maximise conversion. Make it more compelling, more specific, and end with a stronger, more natural call-to-action to book a free demo. Keep all facts accurate. Output ONLY the final rewritten reply.`;

    const pass2 = await cohere.chatStream({
      model: "command-r7b-12-2024",
      preamble: REFINE_PREAMBLE,
      chatHistory: [],
      message: refinePrompt,
      temperature: 0.7,
    });

    for await (const event of pass2) {
      if (event.eventType === "text-generation") {
        res.write(`data: ${JSON.stringify({ content: event.text })}\n\n`);
      }
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
