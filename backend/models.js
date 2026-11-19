import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, enum: ["admin", "manager", "staff"], default: "staff" },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

const kvSchema = new Schema({
  key:       { type: String, required: true, unique: true },
  value:     { type: Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: false });

export const User = model("User", userSchema);
export const KV   = model("KV", kvSchema);