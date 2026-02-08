const { HttpError } = require("../utils/httpError");
const { signToken } = require("../utils/jwt");
const { User } = require("../models/User");

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) throw new HttpError(400, "Missing email or password");

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user) throw new HttpError(401, "Invalid credentials");

  const ok = await user.verifyPassword(String(password));
  if (!ok) throw new HttpError(401, "Invalid credentials");

  const token = signToken({ userId: user._id.toString(), role: user.role });
  res.json({
    token,
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      wallet: user.walletBalance || 0,
      createdAt: user.createdAt
    }
  });
}

async function register(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) throw new HttpError(400, "Missing email or password");

  const normalizedEmail = String(email).toLowerCase().trim();
  const exists = await User.findOne({ email: normalizedEmail }).lean();
  if (exists) throw new HttpError(409, "Email already exists");

  const passwordHash = await User.hashPassword(String(password));
  const seller = await User.create({ email: normalizedEmail, passwordHash, role: "seller" });

  const token = signToken({ userId: seller._id.toString(), role: seller.role });

  res.status(201).json({
    token,
    user: {
      _id: seller._id,
      email: seller.email,
      role: seller.role,
      wallet: seller.walletBalance || 0,
      createdAt: seller.createdAt
    }
  });
}

async function me(req, res) {
  const user = await User.findById(req.user._id);
  if (!user) throw new HttpError(404, "User not found");
  res.json({
    _id: user._id,
    email: user.email,
    role: user.role,
    wallet: user.walletBalance || 0,
    createdAt: user.createdAt
  });
}

module.exports = { login, register, me };


