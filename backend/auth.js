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
    const { name, email, password, role } = body || {};
    if (!name || !email || !password)
      throw new HttpError(400, "name, email and password are required.");
    if (password.length < 6)
      throw new HttpError(400, "Password must be at least 6 characters.");

    const mail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: mail });
    if (existing) throw new HttpError(409, "This email is already registered.");

    // Pehla user admin hoil automatically
    const userCount = await User.countDocuments();
    const assignedRole = userCount === 0 ? "admin" : (role || "staff");

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ 
      name: name.trim(), 
      email: mail, 
      passwordHash,
      role: assignedRole
    });

    const token = jwt.sign(
      { email: mail, name: name.trim(), role: assignedRole, id: user._id }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRY }
    );
    return send(res, 201, { ok: true, token, name: name.trim(), email: mail, role: assignedRole });
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
    if (!user.isActive) throw new HttpError(403, "Your account has been deactivated. Contact admin.");

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) throw new HttpError(401, "Wrong password.");

    const token = jwt.sign(
      { email: mail, name: user.name, role: user.role, id: user._id }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRY }
    );
    return send(res, 200, { ok: true, token, name: user.name, email: mail, role: user.role });
  }

  // Admin: sagale users bagha
  async function handleGetUsers(req, res) {
    const users = await User.find({}, { passwordHash: 0 });
    return send(res, 200, { users });
  }

  // Admin: user cha role badla
  async function handleUpdateUser(req, res, userId) {
    const raw = await readBody(req);
    let body;
    try { body = JSON.parse(raw); } catch {
      throw new HttpError(400, "Body must be valid JSON.");
    }
    const { role, isActive } = body || {};
    const update = {};
    if (role) update.role = role;
    if (typeof isActive === "boolean") update.isActive = isActive;
    
    const user = await User.findByIdAndUpdate(userId, update, { new: true, select: "-passwordHash" });
    if (!user) throw new HttpError(404, "User not found.");
    return send(res, 200, { ok: true, user });
  }

  return { handleRegister, handleLogin, handleGetUsers, handleUpdateUser };
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

export function requireRole(...roles) {
  return (decoded) => {
    if (!roles.includes(decoded.role)) {
      throw new Error("Insufficient permissions");
    }
  };
}