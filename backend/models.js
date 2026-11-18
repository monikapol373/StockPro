import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Users
const userSchema = new Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

// Key-Value store
const kvSchema = new Schema({
  key:       { type: String, required: true, unique: true },
  value:     { type: Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: false });

export const User = model("User", userSchema);
export const KV   = model("KV", kvSchema);