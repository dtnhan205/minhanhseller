const mongoose = require("mongoose");

const exchangeRateSchema = new mongoose.Schema(
  {
    usdToVnd: {
      type: Number,
      required: true,
      min: 1,
      default: 25000, // Default: 1 USD = 25,000 VNĐ
    },
  },
  { timestamps: true }
);

// Chỉ lưu 1 document duy nhất
exchangeRateSchema.statics.getRate = async function() {
  let rate = await this.findOne();
  if (!rate) {
    rate = await this.create({ usdToVnd: 25000 });
  }
  return rate;
};

exchangeRateSchema.statics.setRate = async function(usdToVnd) {
  let rate = await this.findOne();
  if (rate) {
    rate.usdToVnd = usdToVnd;
    await rate.save();
  } else {
    rate = await this.create({ usdToVnd });
  }
  return rate;
};

const ExchangeRate = mongoose.model("ExchangeRate", exchangeRateSchema);
module.exports = { ExchangeRate };

