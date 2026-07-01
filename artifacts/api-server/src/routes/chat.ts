import { Router, type IRouter } from "express";
import { CohereClient } from "cohere-ai";

const router: IRouter = Router();

const cohere = new CohereClient({
  token: process.env["COHERE_API_KEY"] ?? "",
});

const SYSTEM_PROMPT = `You are the AI sales agent for Sobers — a premium property marketing studio specialising in hyper-realistic 3D walkthroughs, virtual tours, and interactive digital twins.

Your mission: answer every question helpfully and persuasively, guiding each visitor toward booking a free demo. Be warm, confident, and conversion-focused — never pushy or robotic.

About Sobers:
• Creates photorealistic 3D walkthroughs and virtual tours from a single scan
• Interactive digital twins let buyers explore properties remotely before visiting  
• Clients see 40% more engagement, 31% faster bookings, average 4.9★ rating
• 1,800+ properties toured this month and growing
• One night's revenue from a property typically covers the full cost — it pays for itself 10× over
• Ideal for: estate agents, property developers, Airbnb & short-term rental hosts, holiday lets
• Process: 1) Book a free demo call, 2) we scan your property, 3) live tour link delivered within 48hrs

Pricing: bespoke per property — always invite them to book a free demo for a custom quote. Never invent specific prices.
Keep replies concise (2–4 short paragraphs max). Always end with a natural nudge toward booking a free demo.`;

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

    const stream = await cohere.chatStream({
      model: "command-r-plus",
      preamble: SYSTEM_PROMPT,
      chatHistory: cohereMessages,
      message: lastMessage.content,
    });

    for await (const event of stream) {
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
