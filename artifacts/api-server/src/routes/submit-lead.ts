import { Router } from "express";
import { Resend } from "resend";

const router = Router();

router.post("/submit-lead", async (req, res) => {
  const { listingUrl, contact, name } = req.body as {
    listingUrl?: string;
    contact?: string;
    name?: string;
  };

  if (!listingUrl || !contact || !name) {
    return res.status(400).json({ error: "Missing required fields." });
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
      from: "leads@resend.dev",
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
              <td style="padding:8px 0;color:#9ca3af;font-size:14px;">Contact</td>
              <td style="padding:8px 0;font-weight:600;font-size:14px;">${contact}</td>
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
