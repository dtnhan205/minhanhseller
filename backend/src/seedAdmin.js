require("dotenv").config();

const { connectDb } = require("./utils/db");
const { User } = require("./models/User");

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD");

  await connectDb();

  const normalizedEmail = String(email).toLowerCase().trim();
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) {
    // eslint-disable-next-line no-console
    console.log("Admin already exists:", normalizedEmail);
    return;
  }

  const passwordHash = await User.hashPassword(String(password));
  await User.create({ email: normalizedEmail, passwordHash, role: "admin" });
  // eslint-disable-next-line no-console
  console.log("Seeded admin:", normalizedEmail);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });


