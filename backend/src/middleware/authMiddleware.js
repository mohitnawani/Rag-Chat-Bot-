const jwt = require("jsonwebtoken");
const redis = require("../config/redis");

const authMiddleware = async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    if (redis) {
      const blacklisted = await redis.get(`blacklist:${token}`);
      if (blacklisted) {
        return res.status(401).json({ message: "Token has been revoked" });
      }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.token = token;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
