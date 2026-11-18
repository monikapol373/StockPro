import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "./models.js";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "stockpro-dev-secret-change-in-production";
const JWT_EXPIRY = "7d";

export function buildAuthRoutes(readBody, send, HttpError) {

  async function handleRegister(req, res) {
    const raw = await readBody(req);
    let body;
    try { body = JSON.parse(raw); } catch {
      throw new HttpError(400, "Body must be valid JSON.");
    }
    const { name, email, password } = body || {};
    if (!name || !email || !password)
      throw new HttpError(400, "name, email and password are required.");
    if (password.length < 6)
      throw new HttpError(400, "Password must be at least 6 characters.");

    const mail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: mail });
    if (existing) throw new HttpError(409, "This email is already registered.");

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await User.create({ name: name.trim(), email: mail, passwordHash });

    const token = jwt.sign({ email: mail, name: name.trim() }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    return send(res, 201, { ok: true, token, name: name.trim(), email: mail });
  }

  async function handleLogin(req, res) {
    const raw = await readBody(req);
    let body;
    try { body = JSON.parse(raw); } catch {
      throw new HttpError(400, "Body must be valid JSON.");
    }
    const { email, password } = body || {};
    if (!email || !password)
      throw new HttpError(400, "email and password are required.");

    const mail = email.trim().toLowerCase();
    const user = await User.findOne({ email: mail });
    if (!user) throw new HttpError(401, "No account found with this email.");

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) throw new HttpError(401, "Wrong password.");

    const token = jwt.sign({ email: mail, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    return send(res, 200, { ok: true, token, name: user.name, email: mail });
  }

  return { handleRegister, handleLogin };
}

export function verifyToken(req) {
  const header = req.headers["authorization"] || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new Error("No token");
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw new Error("Invalid token");
  }
}