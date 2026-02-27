const mongoose = require("mongoose");

const resetRequestSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    requestedBy: {
      type: String, // Email của seller
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    processedAt: {
      type: Date,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Index để tìm requests dễ dàng
resetRequestSchema.index({ sellerId: 1, status: 1 });
resetRequestSchema.index({ orderId: 1 });

const ResetRequest = mongoose.model("ResetRequest", resetRequestSchema);
module.exports = { ResetRequest };

