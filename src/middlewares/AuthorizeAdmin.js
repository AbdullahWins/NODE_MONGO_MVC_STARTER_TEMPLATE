//middleware to verify JWT
const jwt = require("jsonwebtoken");
const { adminsCollection } = require("../../config/database/db");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ message: "Unauthorized Access!" });
  }

  jwt.verify(token, process.env.JWT_TOKEN_SECRET_KEY, async (err, admin) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    const email = admin?.email;
    const adminDoc = await adminsCollection.findOne({
      email: email,
    });
    if (!adminDoc) {
      return res.status(401).json({ message: "Unauthorized Access!" });
    }
    console.log(adminDoc?.email, "is accessing the API!");
    req.admin = adminDoc;
    next();
  });
};

module.exports = { authenticateToken };
