const Redis = require("ioredis");

let redis = null;

if (process.env.REDIS_URL && process.env.REDIS_URL !== "rediss://default:password@host:port") {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
  });

  redis.on("error", (err) => {
    console.error("Redis error:", err.message);
  });
} else {
  console.log("Redis not configured — token blacklist disabled");
}

module.exports = redis;
