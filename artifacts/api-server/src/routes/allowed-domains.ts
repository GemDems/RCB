import { Router } from "express";
import { ALLOWED_DOMAINS } from "../lib/allowed-domains-list";

const router = Router();

/**
 * GET /api/allowed-domains
 * Returns the list of allowed property listing domains.
 * Served from the hardcoded seed list. Extend ALLOWED_DOMAINS in
 * src/lib/allowed-domains-list.ts or manage via the allowed_domains DB table.
 */
router.get("/allowed-domains", (_req, res) => {
  res.json({ domains: ALLOWED_DOMAINS });
});

export default router;
