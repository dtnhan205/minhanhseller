const mongoose = require("mongoose");

const sellerProductPriceSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Mỗi seller chỉ có tối đa 1 giá riêng cho mỗi product
sellerProductPriceSchema.index({ sellerId: 1, productId: 1 }, { unique: true });

const SellerProductPrice = mongoose.model("SellerProductPrice", sellerProductPriceSchema);

module.exports = { SellerProductPrice };



