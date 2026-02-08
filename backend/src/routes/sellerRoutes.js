const express = require("express");
const { requireRole } = require("../middleware/auth");
const { 
  topupWallet, 
  purchase, 
  listOrders, 
  getProducts, 
  getTopupHistory,
  getPayments,
  getPaymentDetail,
  deletePayment,
  createResetRequest,
  getResetRequests,
  listHacks,
  getHackDetail,
} = require("../controllers/sellerController");

const router = express.Router();

// Note: /exchange-rate is now handled as a public route in server.js
// All routes below require authentication (via requireAuth middleware in server.js)

router.post("/wallet/topup", requireRole("seller"), topupWallet);
router.get("/wallet/topup-history", requireRole("seller"), getTopupHistory);
router.post("/purchase", requireRole("seller"), purchase);
router.get("/orders", requireRole("seller"), listOrders);
router.get("/products", requireRole("seller"), getProducts);

// Payment routes
router.get("/payments", requireRole("seller"), getPayments);
router.get("/payments/:id", requireRole("seller"), getPaymentDetail);
router.delete("/payments/:id", requireRole("seller"), deletePayment);

// Reset requests
router.post("/reset-request", requireRole("seller"), createResetRequest);
router.get("/reset-requests", requireRole("seller"), getResetRequests);

// Hacks (status hack)
router.get("/hacks", requireRole("seller"), listHacks);
router.get("/hacks/:id", requireRole("seller"), getHackDetail);

module.exports = { sellerRouter: router };


