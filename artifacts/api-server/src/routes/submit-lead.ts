import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { Resend } from "resend";
import { ALLOWED_DOMAINS } from "../lib/allowed-domains-list";

const router = Router();

// Rate-limit: 5 submissions per IP per 15 minutes to prevent email/cost abuse
const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests — please wait a moment and try again." },
});

function isAllowedListingDomain(url: string): boolean {
  try {
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const hostname = new URL(normalized).hostname.toLowerCase().replace(/^www\./, "");
    return ALLOWED_DOMAINS.some((d) => {
      const domain = d.toLowerCase().replace(/^www\./, "");
      return hostname === domain || hostname.endsWith(`.${domain}`);
    });
  } catch {
    return false;
  }
}

function isSpecificListing(url: string): boolean {
  try {
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const { pathname } = new URL(normalized);
    const segments = pathname.split("/").filter((s) => s.length >= 3);
    return segments.length >= 1;
  } catch {
    return false;
  }
}

// Basic email format check (RFC-compliant libraries are overkill here)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/submit-lead", leadLimiter, async (req, res) => {
  const raw = req.body as Record<string, unknown>;

  // Runtime type guard — reject any non-string field before touching .length
  if (
    typeof raw["name"] !== "string" ||
    typeof raw["email"] !== "string" ||
    typeof raw["phone"] !== "string" ||
    typeof raw["listingUrl"] !== "string"
  ) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // Trim so whitespace-only values are caught by the non-empty checks below
  const name = raw["name"].trim();
  const email = raw["email"].trim();
  const phone = raw["phone"].trim();
  const listingUrl = raw["listingUrl"].trim();

  if (!name || !email || !phone || !listingUrl) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // Length bounds to prevent oversized payloads reaching downstream services
  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ error: "Please enter your full name." });
  }
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }
  if (phone.length < 7 || phone.length > 30) {
    return res.status(400).json({ error: "Please enter a valid phone number." });
  }
  if (listingUrl.length > 2048) {
    return res.status(400).json({ error: "Listing URL is too long." });
  }

  if (!isAllowedListingDomain(listingUrl)) {
    return res.status(400).json({ error: "Listing URL must be from a recognised property listing site." });
  }

  if (!isSpecificListing(listingUrl)) {
    return res.status(400).json({ error: "Please paste the full link to a specific listing, not just the site homepage." });
  }

  const notifyEmail = process.env.NOTIFY_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;

  if (!resendKey || !notifyEmail) {
    // Log locally and still return success to the user — don't fail their UX
    console.error("RESEND_API_KEY or NOTIFY_EMAIL not set; lead not emailed.");
    return res.json({ success: true, emailed: false });
  }

  try {
    const resend = new Resend(resendKey);

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: notifyEmail,
      subject: `🏠 New 3D Demo Request from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0d0d0d;color:#f0f0f0;border-radius:12px;">
          <h2 style="color:#a78bfa;margin-bottom:4px;">New Demo Request</h2>
          <p style="color:#9ca3af;margin-top:0;font-size:14px;">Someone just requested a free 3D walkthrough demo.</p>
          <hr style="border:none;border-top:1px solid #2a2a2a;margin:20px 0;" />
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#9ca3af;font-size:14px;width:120px;">Name</td>
              <td style="padding:8px 0;font-weight:600;font-size:14px;">${name}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#9ca3af;font-size:14px;">Email</td>
              <td style="padding:8px 0;font-weight:600;font-size:14px;">${email}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#9ca3af;font-size:14px;">Phone</td>
              <td style="padding:8px 0;font-weight:600;font-size:14px;">${phone}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#9ca3af;font-size:14px;">Listing URL</td>
              <td style="padding:8px 0;font-size:14px;"><a href="${listingUrl}" style="color:#a78bfa;">${listingUrl}</a></td>
            </tr>
          </table>
          <hr style="border:none;border-top:1px solid #2a2a2a;margin:20px 0;" />
          <p style="font-size:12px;color:#6b7280;margin:0;">Sent from your 3D demo landing page</p>
        </div>
      `,
    });

    return res.json({ success: true, emailed: true });
  } catch (err) {
    console.error("Resend error:", err);
    // Don't surface email errors to the user — their submission still succeeded
    return res.json({ success: true, emailed: false });
  }
});

export default router;
