const mongoose = require("mongoose");

const hackStatusSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    status: {
      type: String,
      enum: ["updating", "safe"],
      default: "safe",
    },
    downloadUrl: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

const HackStatus = mongoose.model("HackStatus", hackStatusSchema);

module.exports = { HackStatus };



