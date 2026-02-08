const { verifyToken } = require("../utils/jwt");
const { HttpError } = require("../utils/httpError");
const { User } = require("../models/User");

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) throw new HttpError(401, "Missing token");

  const decoded = verifyToken(token);
  const user = await User.findById(decoded.userId).lean();
  if (!user) throw new HttpError(401, "Invalid token");

  req.user = user;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) throw new HttpError(401, "Unauthorized");
    if (!roles.includes(req.user.role)) throw new HttpError(403, "Forbidden");
    next();
  };
}

module.exports = { requireAuth, requireRole };


