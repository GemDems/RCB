import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Trust Replit's reverse proxy so express-rate-limit can read X-Forwarded-For correctly
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Restrict CORS to known Replit origins. In production the frontend is served
// from the same domain, so cross-origin requests should only come from the
// Replit dev-preview domain during development.
const allowedOrigins = new Set<string>(
  [
    process.env["REPLIT_DEV_DOMAIN"]
      ? `https://${process.env["REPLIT_DEV_DOMAIN"]}`
      : null,
    ...(process.env["REPLIT_DOMAINS"]?.split(",").map((d) => `https://${d.trim()}`) ?? []),
  ].filter(Boolean) as string[],
);

app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin requests (no Origin header) and requests from the Vite
      // dev proxy (which also sends no Origin). Only block explicit cross-origin
      // requests from unknown hosts.
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin "${origin}" not allowed`));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
