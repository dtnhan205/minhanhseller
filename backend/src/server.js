require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { connectDb } = require("./utils/db");
const { errorHandler } = require("./utils/errorHandler");
const { authRouter } = require("./routes/authRoutes");
const { adminRouter } = require("./routes/adminRoutes");
const { sellerRouter } = require("./routes/sellerRoutes");
const { requireAuth } = require("./middleware/auth");
const { checkAndUpdatePayments } = require("./services/bankTransactionService");
const { getExchangeRate, listHacks, getHackDetail } = require("./controllers/sellerController");

const app = express();

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Serve static files from uploads directory
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Test routes - để kiểm tra API
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working!",
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    query: req.query,
    headers: {
      authorization: req.headers.authorization ? "Present" : "Not present",
      "content-type": req.headers["content-type"] || "Not set"
    }
  });
});

app.post("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "POST API is working!",
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    body: req.body,
    headers: {
      authorization: req.headers.authorization ? "Present" : "Not present",
      "content-type": req.headers["content-type"] || "Not set"
    }
  });
});

app.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Test endpoint is working!",
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path
  });
});

// Auth routes - không yêu cầu token (đăng ký trước requireAuth)
app.use("/api/auth", authRouter);
app.use("/auth", authRouter); // Keep for backward compatibility

// Public routes - không yêu cầu token
app.get("/api/exchange-rate", getExchangeRate);
app.get("/exchange-rate", getExchangeRate); // Keep for backward compatibility

// Public routes: Status Hack (không cần đăng nhập)
app.get("/api/hacks", listHacks);
app.get("/api/hacks/:id", getHackDetail);
// Keep for backward compatibility (non /api)
app.get("/hacks", listHacks);
app.get("/hacks/:id", getHackDetail);

// Tất cả các routes sau đây yêu cầu token
app.use(requireAuth);
app.use("/api/admin", adminRouter);
// Keep old routes for backward compatibility
app.use("/admin", adminRouter);

// Seller routes - phải đăng ký sau /api/admin để tránh conflict
app.use("/api", sellerRouter);
app.use("/", sellerRouter);

app.use(errorHandler);

const port = Number(process.env.PORT || 5000);
connectDb()
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend listening on http://localhost:${port}`);
      console.log("[Cron] Đang khởi động cron job kiểm tra thanh toán mỗi 15 giây...");
    });

    // Cron job: Check thanh toán mỗi 15 giây
    setInterval(async () => {
      try {
        const result = await checkAndUpdatePayments();
        if (result.checked > 0) {
          console.log(`[Cron] ✓ Đã kiểm tra ${result.checked} payment(s)`);
        }
        if (result.updated > 0) {
          console.log(`[Cron] ✓ Đã cập nhật ${result.updated} payment(s) thành công!`);
        }
        if (result.deleted > 0) {
          console.log(`[Cron] ✓ Đã xóa ${result.deleted} payment(s) đã hết hạn!`);
        }
        if (result.error) {
          console.error(`[Cron] ✗ Lỗi: ${result.error}`);
        }
      } catch (error) {
        console.error("[Cron] ✗ Lỗi khi check thanh toán:", error.message);
      }
    }, 15000); // 15 giây

    // Chạy ngay lần đầu sau 5 giây khi server start
    setTimeout(async () => {
      try {
        console.log("[Cron] Chạy kiểm tra thanh toán lần đầu...");
        const result = await checkAndUpdatePayments();
        console.log(`[Cron] ✓ Lần đầu: Đã kiểm tra ${result.checked} payment(s), cập nhật ${result.updated} payment(s).`);
      } catch (error) {
        console.error("[Cron] ✗ Lỗi khi check thanh toán lần đầu:", error.message);
      }
    }, 5000); // 5 giây
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start server:", err);
    process.exit(1);
  });


