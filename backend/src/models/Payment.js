const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountUSD: {
      type: Number,
      min: 0,
    },
    amountVND: {
      type: Number,
      required: true,
      min: 0,
    },
    transferContent: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    bankAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankAccount",
      required: false, // Cho phép null cho manual topup
    },
    note: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "expired"],
      default: "pending",
    },
    completedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      // Tự động hết hạn sau 15 phút nếu chưa thanh toán
      default: function() {
        const date = new Date();
        date.setMinutes(date.getMinutes() + 15);
        return date;
      },
    },
  },
  { timestamps: true }
);

// Index để tìm payment pending dễ dàng
paymentSchema.index({ status: 1, expiresAt: 1 });

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = { Payment };

