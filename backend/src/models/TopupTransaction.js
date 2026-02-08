const mongoose = require("mongoose");

const topupTransactionSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

const TopupTransaction = mongoose.model("TopupTransaction", topupTransactionSchema);
module.exports = { TopupTransaction };

