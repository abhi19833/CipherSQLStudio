import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    userId: { type: String, default: "anonymous" },
    assignmentId: { type: Number, required: true },
    query: { type: String, required: true },
    status: { type: String, enum: ["success", "error"], required: true },
    error: { type: String }
  },
  { timestamps: true }
);

export const Attempt = mongoose.model("Attempt", attemptSchema);
