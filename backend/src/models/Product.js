const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
  {
    value: { type: String, required: true, trim: true }, // key hoặc link
    qtyAvailable: { type: Number, required: true, min: 0 },
    qtySold: { type: Number, default: 0, min: 0 },
    soldToSellerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { _id: true, timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    totalQtyAvailable: { type: Number, default: 0, min: 0 },
    totalQtySold: { type: Number, default: 0, min: 0 },
    inventory: { type: [inventoryItemSchema], default: [] }
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = { Product };


