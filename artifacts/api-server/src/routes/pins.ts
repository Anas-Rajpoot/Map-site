import { Router, type IRouter } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router: IRouter = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Bundled into dist/index.mjs → __dirname is .../api-server/dist/
// Go up one level to reach .../api-server/, then into data/
const DATA_FILE = path.resolve(__dirname, "../data/pins.json");

function readPins(): object | null {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return null;
  } catch {
    return null;
  }
}

function writePins(data: unknown): void {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

router.get("/pins", (_req, res) => {
  const pins = readPins();
  if (pins) {
    res.json({ data: pins });
  } else {
    res.json({ data: null });
  }
});

router.post("/pins", (req, res) => {
  const { members } = req.body as { members: unknown };
  if (!Array.isArray(members)) {
    res.status(400).json({ error: "members must be an array" });
    return;
  }
  writePins(members);
  res.json({ ok: true });
});

export default router;
